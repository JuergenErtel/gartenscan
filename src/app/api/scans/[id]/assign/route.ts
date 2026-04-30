import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { attachScanToPlant } from '@/lib/services/plantRepository';

interface Body {
  plantId?: unknown;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: scanId } = await ctx.params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  const plantId = body && typeof body.plantId === 'string' ? body.plantId : null;
  if (!plantId) {
    return NextResponse.json({ error: 'invalid_plant_id' }, { status: 400 });
  }

  try {
    await attachScanToPlant(scanId, plantId, user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    if (msg.includes('plant not found')) {
      return NextResponse.json({ error: 'plant_not_found' }, { status: 404 });
    }
    if (msg.includes('not eligible')) {
      return NextResponse.json({ error: 'invalid_state' }, { status: 409 });
    }
    return NextResponse.json({ error: 'internal_error', detail: msg }, { status: 500 });
  }
}
