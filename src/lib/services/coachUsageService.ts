import 'server-only';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

/** UTC-Tag als YYYY-MM-DD — Schluessel fuer das Tages-Limit. */
export function currentDay(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function getCoachUsageToday(userId: string, now: Date = new Date()): Promise<number> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('coach_usage')
    .select('messages_used')
    .eq('user_id', userId)
    .eq('day', currentDay(now))
    .maybeSingle();
  if (error) throw new Error(`getCoachUsageToday: ${error.message}`);
  return data?.messages_used ?? 0;
}

export async function incrementCoachUsage(userId: string, now: Date = new Date()): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.rpc('increment_coach_usage', {
    p_user_id: userId,
    p_day: currentDay(now),
  });
  if (error) throw new Error(`increment_coach_usage failed: ${error.message}`);
}
