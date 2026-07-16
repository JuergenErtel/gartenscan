import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { GardenProfile } from '@/domain/types';

type ProfileRow = {
  id: string;
  created_at: string;
  is_anonymous: boolean;
  email: string | null;
  garden_type: string | null;
  experience: string | null;
  interests: string[];
  pets_children: string[];
  solution_preference: string | null;
  completed_onboarding_at: string | null;
  postal_code: string | null;
};

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(`getProfile: ${error.message}`);
  return (data ?? null) as ProfileRow | null;
}

// Map GardenProfile → ProfileRow columns.
// Felder, die GardenProfile kennt aber profiles-Row nicht hat (name etc.),
// werden ignoriert — können in späterer Migration ergänzt werden.
export function mapPatchToRow(patch: Partial<GardenProfile>): Partial<ProfileRow> {
  const row: Partial<ProfileRow> = {};
  if (patch.experience) row.experience = patch.experience;
  if (patch.solutionStyle) {
    row.solution_preference =
      patch.solutionStyle === 'ORGANIC' ? 'organic'
      : patch.solutionStyle === 'BALANCED' ? 'mixed'
      : 'fast_acting';
  }
  if (patch.useCases) row.interests = patch.useCases.map((u) => u.toLowerCase());
  if (patch.areas) row.garden_type = patch.areas[0]?.toLowerCase() ?? null;

  const pets: string[] = [];
  if (patch.hasChildren) pets.push('children');
  if (patch.hasPets) pets.push('pets');
  if (pets.length > 0 || patch.hasChildren === false || patch.hasPets === false) {
    row.pets_children = pets;
  }

  if (patch.onboardingCompletedAt) row.completed_onboarding_at = patch.onboardingCompletedAt.toISOString();
  if (patch.postalCode !== undefined) row.postal_code = patch.postalCode;
  return row;
}

export async function updateProfile(userId: string, patch: Partial<GardenProfile>): Promise<void> {
  const supabase = await createClient();
  const row = mapPatchToRow(patch);

  const { error } = await supabase.from('profiles').update(row).eq('id', userId);
  if (error) throw new Error(`updateProfile: ${error.message}`);
}

export async function markOnboardingComplete(userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ completed_onboarding_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw new Error(`markOnboardingComplete: ${error.message}`);
}
