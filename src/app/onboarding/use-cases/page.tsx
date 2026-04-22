"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bug,
  Leaf,
  Lightbulb,
  Sparkles,
  Sprout,
  Stethoscope,
} from "lucide-react";
import { OnboardingHeadline } from "@/components/features/onboarding/OnboardingHeadline";
import { OnboardingShell } from "@/components/features/onboarding/OnboardingShell";
import { SelectableCard } from "@/components/features/onboarding/SelectableCard";
import { useOnboarding } from "@/hooks/useOnboarding";
import {
  trackGoalsSelected,
  trackOnboardingStepViewed,
} from "@/domain/analytics/onboarding";
import type { UseCase } from "@/domain/types";

const OPTIONS: Array<{
  id: UseCase;
  label: string;
  icon: typeof Leaf;
  hint: string;
}> = [
  {
    id: "PLANTS",
    label: "Pflanzen erkennen",
    icon: Leaf,
    hint: "heute im Live-Scan am staerksten",
  },
  {
    id: "WEEDS",
    label: "Unkraut",
    icon: Sprout,
    hint: "gut fuer klare Einzelpflanzen",
  },
  {
    id: "PESTS",
    label: "Schaedlinge",
    icon: Bug,
    hint: "im Ausbau, noch nicht immer sauber im Live-Scan",
  },
  {
    id: "DISEASES",
    label: "Krankheiten",
    icon: Stethoscope,
    hint: "redaktionell da, live noch nicht durchgaengig stark",
  },
  {
    id: "IMPROVE",
    label: "Gartenideen",
    icon: Lightbulb,
    hint: "mehr Coach als Scanner",
  },
  {
    id: "ALL_OF_IT",
    label: "Alles davon",
    icon: Sparkles,
    hint: "du willst die volle Produktreise",
  },
] as const;

export default function UseCasesPage() {
  const { advance, state } = useOnboarding();
  const [selected, setSelected] = useState<UseCase[]>([]);

  useEffect(() => {
    trackOnboardingStepViewed("USE_CASES");
  }, []);

  useEffect(() => {
    if (state?.profile.useCases) {
      setSelected(state.profile.useCases);
    }
  }, [state]);

  function toggle(id: UseCase) {
    setSelected((previous) => {
      if (id === "ALL_OF_IT") {
        return previous.includes("ALL_OF_IT") ? [] : ["ALL_OF_IT"];
      }
      const withoutAll = previous.filter((item) => item !== "ALL_OF_IT");
      return withoutAll.includes(id)
        ? withoutAll.filter((item) => item !== id)
        : [...withoutAll, id];
    });
  }

  function onSubmit() {
    if (selected.length === 0) return;
    trackGoalsSelected(selected);
    advance("USE_CASES", { useCases: selected });
  }

  const enabled = selected.length > 0;

  return (
    <OnboardingShell step={2}>
      <div className="flex-1 pt-6">
        <OnboardingHeadline
          title="Wobei willst du wirklich Hilfe?"
          subtitle="Mehrfachauswahl ist moeglich. Wir setzen lieber klare Erwartungen, als dir eine zu breite Wunder-App zu verkaufen."
        />

        <div className="mt-5 rounded-[18px] border border-sage-200/70 bg-paper p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Ehrlicher Startpunkt
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-bark-900">
            Im Live-Scan sind wir heute am staerksten bei Pflanzen und klaren
            Einzelmotiven. Schaeden, Insekten und komplexe Problemfaelle bauen
            wir weiter aus.
          </p>
        </div>

        <motion.div
          className="mt-5 grid grid-cols-2 gap-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.06 } },
            hidden: {},
          }}
        >
          {OPTIONS.map((option) => (
            <motion.div
              key={option.id}
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className="space-y-2">
                <SelectableCard
                  icon={option.icon}
                  label={option.label}
                  selected={selected.includes(option.id)}
                  onToggle={() => toggle(option.id)}
                />
                <p className="px-1 text-[11px] leading-snug text-ink-muted">
                  {option.hint}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="pt-4">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!enabled}
          className={`flex w-full items-center justify-center rounded-full text-[15px] font-semibold transition ${
            enabled
              ? "bg-clay-500 hover:bg-clay-600 text-paper active:scale-[0.98]"
              : "bg-sage-200 text-forest-900/40 cursor-not-allowed"
          }`}
          style={{ height: 52 }}
        >
          Weiter
        </button>
      </div>
    </OnboardingShell>
  );
}
