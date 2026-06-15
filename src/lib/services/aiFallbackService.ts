import Anthropic from '@anthropic-ai/sdk';
import type { StoredScan, AiFallbackContent } from '@/domain/scan/ScanOutcome';
import { saveAiFallback } from '@/lib/services/scanRepository';
import {
  shouldGenerateFallback,
  buildFallbackSystemPrompt,
  buildFallbackUserPrompt,
  parseFallbackResponse,
} from '@/lib/scan/aiFallback';

const MODEL = 'claude-haiku-4-5-20251001';
const TIMEOUT_MS = 15000;

/**
 * Liefert KI-Ersatzinhalt für eine erkannte Art ohne kuratierten Eintrag.
 * Read-Through-Cache: bereits generierte Inhalte kommen aus scan.aiFallback.
 * Jeder Fehler endet in `null` — die Seite zeigt dann ihren Platzhalter.
 */
export async function getOrCreateAiFallback(
  scan: StoredScan,
  userId: string
): Promise<AiFallbackContent | null> {
  if (!shouldGenerateFallback(scan)) return null;
  if (scan.aiFallback) return scan.aiFallback;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const top = scan.outcome.candidates[0];
  const client = new Anthropic({ apiKey, timeout: TIMEOUT_MS });

  let text: string;
  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      system: buildFallbackSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: buildFallbackUserPrompt({
            scientificName: top.scientificName,
            commonNames: top.commonNames,
            triageCategory: scan.outcome.triage?.category,
          }),
        },
      ],
    });
    const block = msg.content.find((c: { type: string }) => c.type === 'text') as
      | { type: 'text'; text: string }
      | undefined;
    if (!block) return null;
    text = block.text;
  } catch {
    return null;
  }

  const parsed = parseFallbackResponse(text);
  if (!parsed) return null;

  const content: AiFallbackContent = {
    ...parsed,
    generatedAt: new Date().toISOString(),
    model: MODEL,
  };

  try {
    await saveAiFallback(scan.id, userId, content);
  } catch {
    // Persistenz-Fehler ignorieren — Inhalt trotzdem anzeigen.
  }

  return content;
}
