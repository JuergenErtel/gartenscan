import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getHistoryItem } from '@/lib/services/historyService';

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
