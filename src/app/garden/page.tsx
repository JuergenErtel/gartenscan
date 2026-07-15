import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PlantTile } from '@/components/features/garden/PlantTile';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { OnboardingGuard } from '@/components/features/onboarding/OnboardingGuard';
import { createClient } from '@/lib/supabase/server';
import { listPlantsForUser } from '@/lib/services/plantRepository';
import { createSignedReadUrl } from '@/lib/services/imageStorageService';

export default async function GardenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/app');

  const plants = await listPlantsForUser(user.id);

  const tiles = await Promise.all(
    plants.map(async (p) => ({
      id: p.id,
      nickname: p.nickname,
      species: p.species,
      latinName: p.latinName ?? undefined,
      photoUrl: await createSignedReadUrl(p.coverImagePath, 3600),
      addedAt: p.createdAt,
      zoneLabel: p.zoneLabel ?? '',
      lastScanAt: p.lastScanAt ?? undefined,
      scanCount: p.scanCount,
    }))
  );

  return (
    <OnboardingGuard>
      <AppShell>
        <div className="px-5 pt-8 safe-top">
          <p className="eyebrow text-ink-muted mb-2">
            Mein Garten
          </p>
          <h1 className="font-serif text-[32px] leading-tight tracking-tight text-bark-900 font-normal">
            {plants.length === 0
              ? 'Noch keine Pflanzen'
              : `${plants.length} ${plants.length === 1 ? 'Pflanze' : 'Pflanzen'}`}
          </h1>
        </div>

        {plants.length === 0 ? (
          <section className="px-5 pt-8">
            <EmptyState
              mark="seedling"
              title="Dein Garten ist noch leer"
              body="Scanne deine erste Pflanze, um sie hier zu sehen."
              ctaLabel="Erste Pflanze scannen"
              ctaHref="/scan/new"
            />
          </section>
        ) : (
          <>
            <section className="px-5 pt-8">
              <div className="grid grid-cols-2 gap-3">
                {tiles.map((p) => (
                  <PlantTile key={p.id} plant={p} />
                ))}
              </div>
            </section>

            <section className="px-5 pt-8">
              <Button
                href="/scan/new"
                variant="secondary"
                fullWidth
                size="lg"
                iconLeft={<Plus className="h-5 w-5" />}
              >
                Pflanze hinzufügen
              </Button>
            </section>
          </>
        )}
      </AppShell>
    </OnboardingGuard>
  );
}
