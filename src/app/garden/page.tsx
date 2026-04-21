import Link from "next/link";
import { Plus, MapPin } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PlantTile } from "@/components/features/garden/PlantTile";
import { MOCK_PLANTS } from "@/lib/mock/garden";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { OnboardingGuard } from "@/components/features/onboarding/OnboardingGuard";

export default function GardenPage() {
  const critical = MOCK_PLANTS.filter((p) => p.healthStatus === "CRITICAL");
  const attention = MOCK_PLANTS.filter((p) => p.healthStatus === "ATTENTION");
  const healthy = MOCK_PLANTS.filter(
    (p) => p.healthStatus === "HEALTHY" || p.healthStatus === "RECOVERING"
  );

  return (
    <OnboardingGuard>
      <AppShell>
      <div className="px-5 pt-8 safe-top">
        <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted mb-2">
          Mein Garten · München
        </p>
        <h1 className="font-serif text-[32px] leading-tight tracking-tight text-forest-900 font-normal">
          {MOCK_PLANTS.length} Pflanzen, 4 Zonen
        </h1>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-paper/70 border border-sage-200/60 backdrop-blur px-3 py-1.5">
          <MapPin className="h-3.5 w-3.5 text-moss-600" strokeWidth={1.75} />
          <span className="text-[12px] text-forest-800">
            Zone 8a · mittlere Feuchtigkeit
          </span>
        </div>
      </div>

      {MOCK_PLANTS.length === 0 ? (
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
          {critical.length > 0 && (
            <section className="px-5 pt-8">
              <h2 className="text-[11px] uppercase tracking-[0.12em] font-semibold text-berry-500 mb-3">
                Brauchen heute Hilfe · {critical.length}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {critical.map((p) => (
                  <PlantTile key={p.id} plant={p} />
                ))}
              </div>
            </section>
          )}

          {attention.length > 0 && (
            <section className="px-5 pt-8">
              <h2 className="text-[11px] uppercase tracking-[0.12em] font-semibold text-sun-500 mb-3">
                Beobachten · {attention.length}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {attention.map((p) => (
                  <PlantTile key={p.id} plant={p} />
                ))}
              </div>
            </section>
          )}

          <section className="px-5 pt-8">
            <h2 className="text-[11px] uppercase tracking-[0.12em] font-semibold text-moss-600 mb-3">
              Gesund · {healthy.length}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {healthy.map((p) => (
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
