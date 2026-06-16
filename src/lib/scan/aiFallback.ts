import type { StoredScan, AiFallbackContent } from '@/domain/scan/ScanOutcome';

export interface FallbackPromptInput {
  scientificName: string;
  commonNames: string[];
  triageCategory?: string;
}

export type ParsedFallback = Pick<AiFallbackContent, 'summary' | 'tips' | 'caution'>;

/** Fallback nur bei sicherer Erkennung ohne kuratierten Eintrag. */
export function shouldGenerateFallback(scan: StoredScan): boolean {
  if (scan.outcome.status !== 'ok') return false;
  const top = scan.outcome.candidates[0];
  if (!top) return false;
  if (!top.scientificName || !top.scientificName.trim()) return false;
  if (top.matchedContentId) return false;
  return true;
}

export function buildFallbackSystemPrompt(): string {
  return `Du bist ein deutschsprachiger Garten-Assistent. Der Nutzer hat eine
Pflanze/ein Unkraut fotografiert, das sicher bestimmt wurde, für das es aber
noch keinen redaktionell geprüften Eintrag gibt.

Liefere eine knappe, praktische Ersteinschätzung:
- "summary": 1–2 Sätze, was die Art ist und ob sie im Garten Probleme macht.
- "tips": 2 bis 4 konkrete, umsetzbare Maßnahmen. Bevorzuge mechanische,
  kulturelle und organische Methoden. Chemische Mittel nur generisch erwähnen
  (KEINE Produktnamen) und stets mit dem Hinweis, Etikett zu beachten oder
  Fachberatung einzuholen. Jeder Tipp: { "title": kurz, "text": 1–2 Sätze }.
- "caution": optional GENAU EIN Vorsichtshinweis (Giftigkeit, Hautreizung,
  Verwechslung). Weglassen, wenn nichts Relevantes.

Antworte NUR mit gültigem JSON, kein Fließtext davor/danach:
{ "summary": "...", "tips": [{ "title": "...", "text": "..." }], "caution": "..." }`;
}

export function buildFallbackUserPrompt(input: FallbackPromptInput): string {
  const common = input.commonNames.length
    ? input.commonNames.join(', ')
    : '(keine deutschen Namen bekannt)';
  const cat = input.triageCategory ? `\nKategorie: ${input.triageCategory}` : '';
  return `Art (wissenschaftlich): ${input.scientificName}
Deutsche Namen: ${common}${cat}

Gib die Ersteinschätzung als JSON zurück.`;
}

export function parseFallbackResponse(text: string): ParsedFallback | null {
  let raw: unknown;
  try {
    raw = JSON.parse(stripCodeFences(text));
  } catch {
    return null;
  }
  if (typeof raw !== 'object' || raw === null) return null;
  const obj = raw as Record<string, unknown>;

  const summary = typeof obj.summary === 'string' ? obj.summary.trim() : '';
  if (!summary) return null;

  const rawTips = Array.isArray(obj.tips) ? obj.tips : [];
  const tips = rawTips
    .map((t) => {
      if (typeof t !== 'object' || t === null) return null;
      const o = t as Record<string, unknown>;
      const title = typeof o.title === 'string' ? o.title.trim() : '';
      const tipText = typeof o.text === 'string' ? o.text.trim() : '';
      if (!title || !tipText) return null;
      return { title, text: tipText };
    })
    .filter((t): t is { title: string; text: string } => t !== null)
    .slice(0, 4);

  if (tips.length < 2) return null;

  const caution =
    typeof obj.caution === 'string' && obj.caution.trim()
      ? obj.caution.trim()
      : undefined;

  return { summary, tips, caution };
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  return match ? match[1].trim() : trimmed;
}
