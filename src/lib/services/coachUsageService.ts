import 'server-only';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

/** UTC-Tag als YYYY-MM-DD — Schluessel fuer das Tages-Limit. */
export function currentDay(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Signalisiert, dass das Tageslimit bereits erreicht war (nichts wurde gezaehlt). */
export const LIMIT_REACHED = -1;

/**
 * Bucht eine Coach-Nachricht und liefert den neuen Tagesstand zurueck —
 * pruefen und erhoehen passieren atomar in der DB, damit parallele Requests
 * das Limit nicht umgehen koennen. Gibt LIMIT_REACHED zurueck, wenn das
 * Kontingent schon aufgebraucht war.
 */
export async function claimCoachMessage(
  userId: string,
  limit: number,
  now: Date = new Date()
): Promise<number> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.rpc('increment_coach_usage', {
    p_user_id: userId,
    p_day: currentDay(now),
    p_limit: limit,
  });
  if (error) throw new Error(`claimCoachMessage failed: ${error.message}`);
  return data ?? LIMIT_REACHED;
}

/** Gibt ein gebuchtes Kontingent zurueck, wenn der Claude-Call fehlschlaegt. */
export async function releaseCoachMessage(
  userId: string,
  now: Date = new Date()
): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.rpc('release_coach_message', {
    p_user_id: userId,
    p_day: currentDay(now),
  });
  if (error) throw new Error(`releaseCoachMessage failed: ${error.message}`);
}
