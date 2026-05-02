import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { deletePlantCascade } from '@/lib/services/plantRepository';

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
    return NextResponse.json({ error: 'invalid_plant_id' }, { status: 400 });
  }

  try {
    await deletePlantCascade(id, user.id);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    if (msg.includes('plant not found')) {
      return NextResponse.json({ error: 'plant_not_found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'internal_error', detail: msg }, { status: 500 });
  }

  revalidatePath('/garden');
  return new NextResponse(null, { status: 204 });
}
