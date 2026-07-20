import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { buildEntitlements, FeatureGate } from '@/domain/entitlements/featureGate';
import {
  claimCoachMessage,
  releaseCoachMessage,
  LIMIT_REACHED,
} from '@/lib/services/coachUsageService';
import { getProfile } from '@/lib/services/profileRepository';
import { listHistory } from '@/lib/services/historyService';
import { getScanCaseSummary } from '@/lib/scan/caseSummary';
import { listPlantsForUser } from '@/lib/services/plantRepository';
import { fetchWeatherForPLZ } from '@/lib/weather/openmeteo';
import { buildContentScope, buildCoachSystemPrompt, type CoachContext } from '@/lib/coach/prompt';
import { parseCoachResponse } from '@/lib/coach/parse';
import type { CoachCitation } from '@/lib/types';

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 1000;
const TIMEOUT_MS = 20000;
const MAX_TURNS = 10;
const MAX_CONTENT_CHARS = 2000;

interface CoachRequestMessage {
  role: 'user' | 'assistant';
  content: string;
}

function validateMessages(body: unknown): CoachRequestMessage[] | null {
  if (typeof body !== 'object' || body === null) return null;
  const messages = (body as { messages?: unknown }).messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_TURNS) return null;
  const result: CoachRequestMessage[] = [];
  for (const m of messages) {
    if (
      typeof m !== 'object' || m === null ||
      ((m as CoachRequestMessage).role !== 'user' && (m as CoachRequestMessage).role !== 'assistant') ||
      typeof (m as CoachRequestMessage).content !== 'string' ||
      (m as CoachRequestMessage).content.length === 0 ||
      (m as CoachRequestMessage).content.length > MAX_CONTENT_CHARS
    ) {
      return null;
    }
    result.push({ role: (m as CoachRequestMessage).role, content: (m as CoachRequestMessage).content });
  }
  // Anthropic lehnt einen Verlauf ab, der mit 'assistant' beginnt — sonst wird
  // aus einem Client-Fehler ein undurchsichtiges 502.
  if (result[0].role !== 'user') return null;
  if (result[result.length - 1].role !== 'user') return null;
  return result;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }
  const messages = validateMessages(body);
  if (!messages) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  // API-Key zuerst pruefen: ohne ihn ist jede Grounding-Abfrage verschwendet.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'upstream_error' }, { status: 502 });
  }

  // Kontingent atomar buchen — pruefen und erhoehen in einem DB-Schritt, damit
  // parallele Requests das Limit nicht umgehen. Passiert VOR Grounding und
  // Claude-Call, damit gesperrte Anfragen nichts kosten.
  const limit = buildEntitlements({ tier: 'FREE' }).coachMessagesPerDay;
  let used: number;
  try {
    used = await claimCoachMessage(user.id, limit);
  } catch (err) {
    console.error('[coach] usage claim failed', err);
    return NextResponse.json({ error: 'upstream_error' }, { status: 502 });
  }
  if (used === LIMIT_REACHED) {
    return NextResponse.json(
      { error: 'limit_reached', used: limit, limit },
      { status: 402 }
    );
  }

  // Ab hier ist ein Kontingent gebucht: bei jedem Fehlerausgang zurueckgeben.
  const releaseQuota = async () => {
    try {
      await releaseCoachMessage(user.id);
    } catch (err) {
      console.error('[coach] usage release failed', err);
    }
  };

  // Grounding parallel laden; Einzel-Fehler degradieren still (Coach antwortet dann mit weniger Kontext).
  const [profile, history, plants] = await Promise.all([
    getProfile(user.id).catch(() => null),
    listHistory(user.id, 6).catch(() => []),
    listPlantsForUser(user.id).catch(() => []),
  ]);
  const weather = profile?.postal_code
    ? await fetchWeatherForPLZ(profile.postal_code).catch(() => null)
    : null;

  const cases = history
    .map((h) => ({
      summary: getScanCaseSummary(h.scan, h.matchedEntry, h.followUp),
      contentId: h.scan.matchedContentId,
    }))
    .filter((c) => c.summary.actionable);

  const referencedIds = [
    ...cases.map((c) => c.contentId),
    ...plants.map((p) => p.matchedContentId ?? undefined),
  ];
  const lastUserMessage = messages[messages.length - 1].content;
  const entries = buildContentScope(referencedIds, lastUserMessage);

  const context: CoachContext = {
    profile: {
      experience: profile?.experience ?? null,
      solutionPreference: profile?.solution_preference ?? null,
      hasChildren: profile?.pets_children?.includes('children') ?? false,
      hasPets: profile?.pets_children?.includes('pets') ?? false,
    },
    weather: weather
      ? {
          tempC: weather.tempC,
          condition: weather.condition,
          location: weather.location,
          alertMessage: weather.alert?.message,
        }
      : null,
    plants: plants.map((p) => ({ nickname: p.nickname, species: p.species })),
    cases: cases.map((c) => ({
      title: c.summary.title,
      subtitle: c.summary.subtitle,
      nextStep: c.summary.nextStep,
      urgency: c.summary.urgency,
    })),
    entries,
  };

  const anthropic = new Anthropic({ apiKey, timeout: TIMEOUT_MS });

  let msg;
  try {
    msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: buildCoachSystemPrompt(context),
      messages,
    });
  } catch (err) {
    await releaseQuota();
    const status = (err as { status?: number })?.status;
    if (status === 429) {
      return NextResponse.json({ error: 'rate_limit' }, { status: 429 });
    }
    console.error('[coach] anthropic call failed', err);
    return NextResponse.json({ error: 'upstream_error' }, { status: 502 });
  }

  const textBlock = msg.content.find((c) => c.type === 'text') as
    | { type: 'text'; text: string }
    | undefined;
  if (!textBlock) {
    await releaseQuota();
    return NextResponse.json({ error: 'upstream_error' }, { status: 502 });
  }

  const allowedIds = new Set(entries.map((e) => e.id));
  const parsed = parseCoachResponse(textBlock.text, allowedIds);

  const citations: CoachCitation[] = parsed.citations.map((id) => {
    const entry = entries.find((e) => e.id === id)!;
    return { id: entry.id, name: entry.name, category: entry.category };
  });

  return NextResponse.json({
    reply: parsed.reply,
    citations,
    usage: { used, limit },
  });
}
