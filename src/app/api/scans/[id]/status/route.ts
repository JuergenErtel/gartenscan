import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateScanStatus } from '@/lib/services/scanRepository';

type ConfirmAction = 'confirm' | 'reject';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const action = body?.action as ConfirmAction | undefined;
  if (action !== 'confirm' && action !== 'reject') {
    return NextResponse.json({ error: 'invalid action' }, { status: 400 });
  }

  const newStatus = action === 'confirm' ? 'ok' : 'no_match';
  const updated = await updateScanStatus(id, user.id, newStatus);

  if (!updated) {
    return NextResponse.json(
      { error: 'invalid_transition' },
      { status: 409 }
    );
  }

  return NextResponse.json({ scan: updated });
}
