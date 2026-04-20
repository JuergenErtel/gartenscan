"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Leaf,
  Sprout,
  Bug,
  Stethoscope,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { OnboardingShell } from "@/components/features/onboarding/OnboardingShell";
import { OnboardingHeadline } from "@/components/features/onboarding/OnboardingHeadline";
import { SelectableCard } from "@/components/features/onboarding/SelectableCard";
import { useOnboarding } from "@/hooks/useOnboarding";
import {
  trackOnboardingStepViewed,
  trackGoalsSelected,
} from "@/domain/analytics/onboarding";
import type { UseCase } from "@/domain/types";

const OPTIONS: Array<{ id: UseCase; label: string; icon: typeof Leaf }> = [
  { id: "PLANTS", label: "Pflanzen erkennen", icon: Leaf },
  { id: "WEEDS", label: "Unkraut", icon: Sprout },
  { id: "PESTS", label: "Schädlinge", icon: Bug },
  { id: "DISEASES", label: "Krankheiten", icon: Stethoscope },
  { id: "IMPROVE", label: "Gartenideen", icon: Lightbulb },
  { id: "ALL_OF_IT", label: "Alles davon", icon: Sparkles },
];

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
    setSelected((prev) => {
      if (id === "ALL_OF_IT") {
        return prev.includes("ALL_OF_IT") ? [] : ["ALL_OF_IT"];
      }
      const withoutAll = prev.filter((x) => x !== "ALL_OF_IT");
      return withoutAll.includes(id)
        ? withoutAll.filter((x) => x !== id)
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
      <div className="pt-6 flex-1">
        <OnboardingHeadline
          title="Wobei brauchst du Hilfe?"
          subtitle="Mehrfachauswahl möglich. Du kannst später alles ändern."
        />
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.06 } },
            hidden: {},
          }}
        >
          {OPTIONS.map((opt) => (
            <motion.div
              key={opt.id}
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <SelectableCard
                icon={opt.icon}
                label={opt.label}
                selected={selected.includes(opt.id)}
                onToggle={() => toggle(opt.id)}
              />
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
