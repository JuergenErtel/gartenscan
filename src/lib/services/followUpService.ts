import 'server-only';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import type { FollowUpStatus, ScanFollowUp } from '@/domain/scan/ScanOutcome';

export interface UpsertFollowUpInput {
  scanId: string;
  userId: string;
  status: FollowUpStatus;
  nextCheckAt?: Date | null;
}

export async function listFollowUpsByScanIds(
  userId: string,
  scanIds: string[]
): Promise<Map<string, ScanFollowUp>> {
  if (scanIds.length === 0) return new Map();

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('scan_followups')
    .select('*')
    .eq('user_id', userId)
    .in('scan_id', scanIds);

  if (error) {
    if (isMissingFollowUpsTable(error)) return new Map();
    throw new Error(`listFollowUpsByScanIds: ${error.message}`);
  }

  return new Map(
    (data ?? []).map((row) => [
      row.scan_id,
      {
        scanId: row.scan_id,
        userId: row.user_id,
        status: row.status as FollowUpStatus,
        nextCheckAt: row.next_check_at ? new Date(row.next_check_at) : undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      },
    ])
  );
}

export async function upsertFollowUp(
  input: UpsertFollowUpInput
): Promise<ScanFollowUp> {
  const supabase = createServiceRoleClient();
  const payload = {
    scan_id: input.scanId,
    user_id: input.userId,
    status: input.status,
    next_check_at: input.nextCheckAt?.toISOString() ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('scan_followups')
    .upsert(payload, { onConflict: 'scan_id' })
    .select('*')
    .single();

  if (error) throw new Error(`upsertFollowUp: ${error.message}`);

  return {
    scanId: data.scan_id,
    userId: data.user_id,
    status: data.status as FollowUpStatus,
    nextCheckAt: data.next_check_at ? new Date(data.next_check_at) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export function isMissingFollowUpsTable(error: { message?: string; code?: string }) {
  return error.code === '42P01' || error.message?.includes('scan_followups') === true;
}
