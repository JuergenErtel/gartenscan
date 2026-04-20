"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Home, Trees, Flower2, PocketKnife, Sprout, Sun } from "lucide-react";
import { OnboardingLayout } from "@/components/features/onboarding/OnboardingLayout";
import { OnboardingFooter } from "@/components/features/onboarding/OnboardingFooter";
import { onboardingStorage } from "@/lib/storage/profile";
import { track } from "@/domain/analytics/tracker";
import { EVENT } from "@/domain/analytics/events";
import type { GardenArea, PetType } from "@/domain/types";
import { cn } from "@/lib/utils";

const areas: { id: GardenArea; label: string; Icon: React.ElementType }[] = [
  { id: "GARDEN", label: "Garten", Icon: Trees },
  { id: "LAWN", label: "Rasen", Icon: Sprout },
  { id: "BED", label: "Beet", Icon: Flower2 },
  { id: "BALCONY", label: "Balkon", Icon: Home },
  { id: "TERRACE", label: "Terrasse", Icon: Sun },
  { id: "POTS", label: "Topfpflanzen", Icon: PocketKnife },
];

export default function GardenPage() {
  const router = useRouter();
  const [plz, setPlz] = useState("");
  const [areaSet, setAreaSet] = useState<Set<GardenArea>>(new Set());
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [pets, setPets] = useState<Set<PetType>>(new Set());

  const toggleArea = (a: GardenArea) => {
    const next = new Set(areaSet);
    next.has(a) ? next.delete(a) : next.add(a);
    setAreaSet(next);
  };

  const togglePet = (p: PetType) => {
    const next = new Set(pets);
    next.has(p) ? next.delete(p) : next.add(p);
    setPets(next);
  };

  const plzValid = /^\d{5}$/.test(plz);
  const canContinue = plzValid && hasChildren !== null;

  const onContinue = () => {
    if (!canContinue) return;
    const existing = onboardingStorage.get();
    onboardingStorage.set({
      currentStep: "STYLE",
      completedSteps: [...(existing?.completedSteps ?? []), "GARDEN"],
      profile: {
        ...(existing?.profile ?? {}),
        postalCode: plz,
        areas: Array.from(areaSet),
        hasChildren: !!hasChildren,
        pets: Array.from(pets),
      },
      startedAt: existing?.startedAt ?? new Date(),
    });

    track(EVENT.ONBOARDING_STEP_COMPLETED, {
      step: "garden",
      plz: plz,
      areas: areaSet.size,
      has_children: !!hasChildren,
      has_pets: pets.size > 0,
    });

    router.push("/onboarding/style");
  };

  return (
    <OnboardingLayout step={3} totalSteps={6}>
      <div className="px-5 pt-8">
        <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-muted mb-2">
          Schritt 2 von 5
        </p>
        <h1 className="font-serif text-[32px] leading-[1.1] tracking-tight text-forest-900 font-normal">
          Erzähl uns von deinem Garten
        </h1>
        <p className="mt-3 text-[14px] text-ink-muted leading-relaxed">
          Diese Infos verwenden wir ausschließlich, um dir passende Empfehlungen zu geben.
        </p>
      </div>

      {/* PLZ */}
      <section className="px-5 pt-8">
        <label className="block text-[11px] uppercase tracking-[0.12em] font-semibold text-forest-700 mb-2">
          Postleitzahl <span className="text-berry-500">*</span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          placeholder="z.B. 80331"
          value={plz}
          onChange={(e) => setPlz(e.target.value.replace(/\D/g, ""))}
          className="w-full h-14 px-4 rounded-[14px] bg-paper border-2 border-sage-200 focus:border-forest-700 focus:outline-none text-[18px] font-medium text-forest-900 placeholder:text-ink-soft tabular-nums tracking-wide"
        />
        <p className="text-[12px] text-ink-muted mt-2">
          Aktiviert sofort echtes Wetter + Klimazone-spezifische Tipps für deinen Standort.
        </p>
      </section>

      {/* Areas */}
      <section className="px-5 pt-8">
        <label className="block text-[11px] uppercase tracking-[0.12em] font-semibold text-forest-700 mb-3">
          Welche Bereiche hast du?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {areas.map((a) => {
            const active = areaSet.has(a.id);
            return (
              <button
                key={a.id}
                onClick={() => toggleArea(a.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-[14px] p-3.5 transition",
                  active
                    ? "bg-forest-700 text-paper"
                    : "bg-paper ring-1 ring-sage-200 text-forest-800 hover:ring-forest-700/40"
                )}
              >
                <a.Icon className="h-5 w-5" strokeWidth={1.75} />
                <span className="text-[12px] font-medium">{a.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Children */}
      <section className="px-5 pt-8">
        <label className="block text-[11px] uppercase tracking-[0.12em] font-semibold text-forest-700 mb-3">
          Kinder im Haushalt? <span className="text-berry-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: true, label: "Ja" },
            { v: false, label: "Nein" },
          ].map((o) => (
            <button
              key={String(o.v)}
              onClick={() => setHasChildren(o.v)}
              className={cn(
                "h-12 rounded-[14px] text-[14px] font-medium transition",
                hasChildren === o.v
                  ? "bg-forest-700 text-paper"
                  : "bg-paper ring-1 ring-sage-200 text-forest-800 hover:ring-forest-700/40"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-ink-muted mt-2">
          Wir warnen dich bei giftigen Pflanzen und ungeeigneten Mitteln.
        </p>
      </section>

      {/* Pets */}
      <section className="px-5 pt-8">
        <label className="block text-[11px] uppercase tracking-[0.12em] font-semibold text-forest-700 mb-3">
          Haustiere?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: "DOG" as PetType, label: "Hund" },
              { id: "CAT" as PetType, label: "Katze" },
              { id: "OTHER" as PetType, label: "Andere" },
            ] as const
          ).map((p) => {
            const active = pets.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => togglePet(p.id)}
                className={cn(
                  "h-12 rounded-[14px] text-[14px] font-medium transition",
                  active
                    ? "bg-forest-700 text-paper"
                    : "bg-paper ring-1 ring-sage-200 text-forest-800 hover:ring-forest-700/40"
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </section>

      <OnboardingFooter
        primaryDisabled={!canContinue}
        primaryOnClick={onContinue}
        hint={!plzValid ? "5-stellige PLZ für echte regionale Tipps" : undefined}
      />
    </OnboardingLayout>
  );
}
