import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listPlantsForAssignment } from '@/lib/services/plantRepository';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const url = new URL(req.url);
  const contentId = url.searchParams.get('contentId');

  const plants = await listPlantsForAssignment(user.id, contentId);
  return NextResponse.json({ plants });
}
