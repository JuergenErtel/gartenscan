import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateProfile, markOnboardingComplete } from '@/lib/services/profileRepository';
import type { GardenProfile } from '@/domain/types';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const body = (await req.json()) as { profile: Partial<GardenProfile> };
  await updateProfile(user.id, body.profile);
  await markOnboardingComplete(user.id);
  return NextResponse.json({ ok: true });
}
