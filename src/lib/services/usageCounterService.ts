import 'server-only';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

export function currentYearMonth(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export async function incrementScanUsage(userId: string, now: Date = new Date()): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.rpc('increment_scan_usage' as never, {
    p_user_id: userId,
    p_year_month: currentYearMonth(now),
  });
  if (error) {
    throw new Error(`increment_scan_usage failed: ${error.message}`);
  }
}
