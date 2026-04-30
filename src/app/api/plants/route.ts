import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPlantFromScan } from '@/lib/services/plantRepository';

interface Body {
  scanId?: unknown;
  nickname?: unknown;
  zoneLabel?: unknown;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const scanId = typeof body.scanId === 'string' ? body.scanId : null;
  const rawNickname = typeof body.nickname === 'string' ? body.nickname.trim() : '';
  const rawZone = typeof body.zoneLabel === 'string' ? body.zoneLabel.trim() : '';

  if (!scanId) {
    return NextResponse.json({ error: 'invalid_scan_id' }, { status: 400 });
  }
  if (rawNickname.length < 1 || rawNickname.length > 80) {
    return NextResponse.json({ error: 'invalid_nickname' }, { status: 400 });
  }
  if (rawZone.length > 80) {
    return NextResponse.json({ error: 'invalid_zone' }, { status: 400 });
  }

  try {
    const plant = await createPlantFromScan({
      userId: user.id,
      scanId,
      nickname: rawNickname,
      zoneLabel: rawZone.length === 0 ? undefined : rawZone,
    });
    return NextResponse.json({ plantId: plant.id }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    if (msg.includes('scan not found')) {
      return NextResponse.json({ error: 'scan_not_found' }, { status: 404 });
    }
    if (msg.includes('status is not ok') || msg.includes('already has a plant')) {
      return NextResponse.json({ error: 'invalid_state' }, { status: 409 });
    }
    return NextResponse.json({ error: 'internal_error', detail: msg }, { status: 500 });
  }
}
