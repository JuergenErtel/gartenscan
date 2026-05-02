import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import type { FollowUpStatus } from '@/domain/scan/ScanOutcome';
import { createClient } from '@/lib/supabase/server';
import { isMissingFollowUpsTable, upsertFollowUp } from '@/lib/services/followUpService';
import { getHistoryItem } from '@/lib/services/historyService';
import { deleteScan } from '@/lib/services/scanRepository';

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const item = await getHistoryItem(user.id, id);
  if (!item) return NextResponse.json({ error: 'not found' }, { status: 404 });

  return NextResponse.json(item);
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const item = await getHistoryItem(user.id, id);
  if (!item) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const body = await req.json().catch(() => null);
  const status = body?.followUp?.status as FollowUpStatus | undefined;
  const nextCheckAtRaw = body?.followUp?.nextCheckAt as string | null | undefined;

  if (!status || !['OPEN', 'MONITORING', 'DONE', 'ESCALATED'].includes(status)) {
    return NextResponse.json({ error: 'invalid follow-up status' }, { status: 400 });
  }

  try {
    const followUp = await upsertFollowUp({
      scanId: id,
      userId: user.id,
      status,
      nextCheckAt: nextCheckAtRaw ? new Date(nextCheckAtRaw) : null,
    });

    return NextResponse.json({ followUp });
  } catch (error) {
    if (error instanceof Error && isMissingFollowUpsTable({ message: error.message })) {
      return NextResponse.json({ error: 'follow-up feature not ready' }, { status: 503 });
    }
    throw error;
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  if (typeof id !== 'string' || id.length === 0) {
    return NextResponse.json({ error: 'invalid_scan_id' }, { status: 400 });
  }

  try {
    await deleteScan(id, user.id);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    if (msg.includes('scan not found')) {
      return NextResponse.json({ error: 'scan_not_found' }, { status: 404 });
    }
    if (msg.startsWith('scan is plant cover:')) {
      const plantNickname = msg.slice('scan is plant cover:'.length);
      return NextResponse.json(
        { error: 'scan_is_plant_cover', plantNickname },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'internal_error', detail: msg }, { status: 500 });
  }

  revalidatePath('/history');
  return new NextResponse(null, { status: 204 });
}
