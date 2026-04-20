"use client";

import { useEffect, useState } from "react";
import { OnboardingShell } from "@/components/features/onboarding/OnboardingShell";
import { OnboardingHeadline } from "@/components/features/onboarding/OnboardingHeadline";
import { ChipGroup } from "@/components/features/onboarding/ChipGroup";
import { SegmentedControl } from "@/components/features/onboarding/SegmentedControl";
import { YesNoToggle } from "@/components/features/onboarding/YesNoToggle";
import { useOnboarding } from "@/hooks/useOnboarding";
import {
  trackOnboardingStepViewed,
  trackProfileCompleted,
} from "@/domain/analytics/onboarding";
import type {
  GardenArea,
  SolutionStyle,
  ExperienceLevel,
} from "@/domain/types";

const AREA_OPTIONS: Array<{ value: GardenArea; label: string }> = [
  { value: "GARDEN", label: "Garten" },
  { value: "LAWN", label: "Rasen" },
  { value: "BED", label: "Beet" },
  { value: "BALCONY", label: "Balkon" },
  { value: "TERRACE", label: "Terrasse" },
  { value: "POTS", label: "Topfpflanzen" },
];

const STYLE_OPTIONS: Array<{ value: SolutionStyle; label: string }> = [
  { value: "ORGANIC", label: "Bio" },
  { value: "BALANCED", label: "Ausgewogen" },
  { value: "EFFECTIVE", label: "Schnell" },
];

const EXP_OPTIONS: Array<{ value: ExperienceLevel; label: string }> = [
  { value: "BEGINNER", label: "Anfänger" },
  { value: "INTERMEDIATE", label: "Fortgeschritten" },
];

export default function GardenPage() {
  const { advance, state } = useOnboarding();
  const [areas, setAreas] = useState<GardenArea[]>([]);
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [hasPets, setHasPets] = useState<boolean | null>(null);
  const [style, setStyle] = useState<SolutionStyle | null>(null);
  const [exp, setExp] = useState<ExperienceLevel | null>(null);
  const [showAreaError, setShowAreaError] = useState(false);

  useEffect(() => {
    trackOnboardingStepViewed("GARDEN");
  }, []);

  useEffect(() => {
    if (!state?.profile) return;
    const p = state.profile;
    if (p.areas) setAreas(p.areas);
    if (typeof p.hasChildren === "boolean") setHasChildren(p.hasChildren);
    if (typeof p.hasPets === "boolean") setHasPets(p.hasPets);
    if (p.solutionStyle) setStyle(p.solutionStyle);
    if (p.experience) setExp(p.experience);
  }, [state]);

  function toggleArea(v: GardenArea) {
    setAreas((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
    setShowAreaError(false);
  }

  function onSubmit() {
    if (areas.length === 0) {
      setShowAreaError(true);
      return;
    }
    const resolvedStyle: SolutionStyle = style ?? "BALANCED";
    const resolvedExp: ExperienceLevel = exp ?? "BEGINNER";
    const resolvedHasChildren = hasChildren ?? false;
    const resolvedHasPets = hasPets ?? false;

    trackProfileCompleted({
      areas,
      hasChildren: resolvedHasChildren,
      hasPets: resolvedHasPets,
      solutionStyle: resolvedStyle,
      experience: resolvedExp,
    });

    advance("GARDEN", {
      areas,
      hasChildren: resolvedHasChildren,
      hasPets: resolvedHasPets,
      pets: resolvedHasPets ? ["DOG"] : [],
      solutionStyle: resolvedStyle,
      experience: resolvedExp,
    });
  }

  return (
    <OnboardingShell step={3}>
      <div className="pt-6 flex-1 pb-6">
        <OnboardingHeadline
          title="Erzähl uns kurz von dir."
          subtitle="Damit unsere Empfehlungen zu dir passen."
        />

        <section className="mb-8">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink-muted mb-3">
            Dein Garten
          </h2>
          <div className="rounded-2xl bg-paper p-5 space-y-5 border border-sage-200/60">
            <div>
              <label className="block text-[13px] font-medium text-forest-900 mb-2">
                Bereich
              </label>
              <ChipGroup
                options={AREA_OPTIONS}
                selected={areas}
                onToggle={toggleArea}
              />
              {showAreaError && (
                <p className="mt-2 text-[12px] text-clay-600">
                  Wähle mindestens einen Bereich
                </p>
              )}
            </div>
            <Row label="Kinder im Haushalt">
              <YesNoToggle
                value={hasChildren}
                onChange={setHasChildren}
                ariaLabel="Kinder im Haushalt"
              />
            </Row>
            <Row label="Haustiere">
              <YesNoToggle
                value={hasPets}
                onChange={setHasPets}
                ariaLabel="Haustiere"
              />
            </Row>
          </div>
        </section>

        <section>
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink-muted mb-3">
            Deine Vorlieben
          </h2>
          <div className="rounded-2xl bg-paper p-5 space-y-5 border border-sage-200/60">
            <div>
              <label className="block text-[13px] font-medium text-forest-900 mb-2">
                Lösungsart
              </label>
              <SegmentedControl
                options={STYLE_OPTIONS}
                value={style}
                onChange={setStyle}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-forest-900 mb-2">
                Erfahrung
              </label>
              <SegmentedControl
                options={EXP_OPTIONS}
                value={exp}
                onChange={setExp}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onSubmit}
          className="flex w-full items-center justify-center rounded-full bg-clay-500 hover:bg-clay-600 text-paper text-[15px] font-semibold transition active:scale-[0.98]"
          style={{ height: 52 }}
        >
          Weiter
        </button>
      </div>
    </OnboardingShell>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[14px] font-medium text-forest-900">{label}</span>
      {children}
    </div>
  );
}
