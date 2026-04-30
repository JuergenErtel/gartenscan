import { redirect } from 'next/navigation';
import { Plus, MapPin } from 'lucide-react';
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
      healthStatus: 'HEALTHY' as const,
      lastScanAt: p.lastScanAt ?? undefined,
      scanCount: p.scanCount,
    }))
  );

  return (
    <OnboardingGuard>
      <AppShell>
        <div className="px-5 pt-8 safe-top">
          <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted mb-2">
            Mein Garten
          </p>
          <h1 className="font-serif text-[32px] leading-tight tracking-tight text-forest-900 font-normal">
            {plants.length === 0
              ? 'Noch keine Pflanzen'
              : `${plants.length} ${plants.length === 1 ? 'Pflanze' : 'Pflanzen'}`}
          </h1>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-paper/70 border border-sage-200/60 backdrop-blur px-3 py-1.5">
            <MapPin className="h-3.5 w-3.5 text-moss-600" strokeWidth={1.75} />
            <span className="text-[12px] text-forest-800">
              Zone 8a · mittlere Feuchtigkeit
            </span>
          </div>
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
