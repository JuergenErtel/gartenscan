export interface ParsedCoachResponse {
  reply: string;
  citations: string[];
}

/**
 * Parst die Claude-Antwort ({reply, citations}) und filtert Citations gegen
 * die Whitelist (Anti-Halluzination, gleiches Prinzip wie ClaudeMatchProvider).
 * Bei kaputtem JSON: Rohtext (ohne Fences) als reply, keine Citations.
 */
export function parseCoachResponse(
  raw: string,
  allowedIds: Set<string>
): ParsedCoachResponse {
  const stripped = stripCodeFences(raw);
  try {
    const parsed = JSON.parse(stripped) as { reply?: unknown; citations?: unknown };
    if (typeof parsed.reply !== 'string' || parsed.reply.trim() === '') {
      return { reply: stripped, citations: [] };
    }
    const citations: string[] = [];
    if (Array.isArray(parsed.citations)) {
      for (const id of parsed.citations) {
        if (typeof id === 'string' && allowedIds.has(id) && !citations.includes(id)) {
          citations.push(id);
          if (citations.length >= 3) break;
        }
      }
    }
    return { reply: parsed.reply, citations };
  } catch {
    return { reply: stripped, citations: [] };
  }
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  return match ? match[1].trim() : trimmed;
}
