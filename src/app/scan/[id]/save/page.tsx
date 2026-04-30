import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getScanById } from '@/lib/services/scanRepository';
import { listPlantsForAssignment } from '@/lib/services/plantRepository';
import { createSignedReadUrl } from '@/lib/services/imageStorageService';
import { SavePlantSheet } from '@/components/features/plant/SavePlantSheet';
import { OnboardingGuard } from '@/components/features/onboarding/OnboardingGuard';
import { getContentById } from '@/content';

export default async function SavePlantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/app');

  const scan = await getScanById(id, user.id);
  if (!scan) return notFound();
  if (scan.outcome.status !== 'ok' || scan.plantId) {
    redirect(`/scan/${id}`);
  }

  const top = scan.outcome.candidates[0];
  if (!top) return notFound();

  const matchedEntry = scan.matchedContentId
    ? getContentById(scan.matchedContentId)
    : null;
  const defaultNickname =
    matchedEntry?.name ?? top.commonNames[0] ?? top.scientificName;

  const candidatePlants = await listPlantsForAssignment(
    user.id,
    scan.matchedContentId ?? null
  );

  const signedCoverUrls: Record<string, string> = {};
  for (const p of candidatePlants) {
    signedCoverUrls[p.id] = await createSignedReadUrl(p.coverImagePath, 3600);
  }

  return (
    <OnboardingGuard>
      <SavePlantSheet
        scanId={id}
        defaultNickname={defaultNickname}
        candidatePlants={candidatePlants}
        signedCoverUrls={signedCoverUrls}
      />
    </OnboardingGuard>
  );
}
