import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { buildEntitlements, FeatureGate } from '@/domain/entitlements/featureGate';
import { getCoachUsageToday, incrementCoachUsage } from '@/lib/services/coachUsageService';
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

  // Tages-Limit VOR Grounding + Claude-Call (kein teurer Schritt fuer gesperrte Anfragen).
  const used = await getCoachUsageToday(user.id);
  const entitlements = buildEntitlements({ tier: 'FREE', coachMessagesUsedToday: used });
  const gate = new FeatureGate(entitlements);
  if (!gate.canCoachMessage().ok) {
    return NextResponse.json(
      { error: 'limit_reached', used, limit: entitlements.coachMessagesPerDay },
      { status: 402 }
    );
  }

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'upstream_error' }, { status: 502 });
  }
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
    return NextResponse.json({ error: 'upstream_error' }, { status: 502 });
  }

  const allowedIds = new Set(entries.map((e) => e.id));
  const parsed = parseCoachResponse(textBlock.text, allowedIds);

  const citations: CoachCitation[] = parsed.citations.map((id) => {
    const entry = entries.find((e) => e.id === id)!;
    return { id: entry.id, name: entry.name, category: entry.category };
  });

  // Erst nach erfolgreichem Call zaehlen — Fehler kosten kein Kontingent.
  try {
    await incrementCoachUsage(user.id);
  } catch (err) {
    console.error('[coach] usage increment failed', err);
  }

  return NextResponse.json({
    reply: parsed.reply,
    citations,
    usage: { used: used + 1, limit: entitlements.coachMessagesPerDay },
  });
}
