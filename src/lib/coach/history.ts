import type { CoachMessage } from '@/lib/types';

const MAX_TURNS = 10;

export interface CoachHistoryTurn {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Baut den Verlauf fuer POST /api/coach.
 *
 * Drei Dinge muessen stimmen, sonst lehnt Anthropic den Verlauf ab (400 -> 502):
 * - Begruessung und lokale Fehlermeldungen sind keine echten Turns und fliegen raus.
 * - Es gehen hoechstens MAX_TURNS Nachrichten mit.
 * - Der Verlauf muss mit 'user' beginnen; nach dem Zuschneiden kann sonst eine
 *   Assistant-Antwort vorne stehen.
 */
export function buildHistory(messages: CoachMessage[]): CoachHistoryTurn[] {
  const turns = messages
    .filter((m) => m.id !== 'greeting' && !m.id.startsWith('error-'))
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content }));

  while (turns.length > 0 && turns[0].role !== 'user') {
    turns.shift();
  }
  return turns;
}
