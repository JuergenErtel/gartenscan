"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Leaf, Sprout, Bug, Microscope, Sparkles, Check } from "lucide-react";
import { OnboardingLayout } from "@/components/features/onboarding/OnboardingLayout";
import { OnboardingFooter } from "@/components/features/onboarding/OnboardingFooter";
import { onboardingStorage } from "@/lib/storage/profile";
import { track } from "@/domain/analytics/tracker";
import { EVENT } from "@/domain/analytics/events";
import type { UseCase } from "@/domain/types";
import { cn } from "@/lib/utils";

const useCases: { id: UseCase; title: string; desc: string; Icon: React.ElementType; accent: string }[] = [
  { id: "PLANTS", title: "Pflanzen erkennen", desc: "Was wächst da? Wie pflege ich es richtig?", Icon: Leaf, accent: "moss-500" },
  { id: "WEEDS", title: "Unkraut entfernen", desc: "Ist das nützlich oder weg damit?", Icon: Sprout, accent: "sun-500" },
  { id: "PESTS", title: "Schädlinge bekämpfen", desc: "Läuse, Schnecken, Käfer – was hilft?", Icon: Bug, accent: "clay-500" },
  { id: "DISEASES", title: "Krankheiten verstehen", desc: "Flecken, Belag, Welke – was ist das?", Icon: Microscope, accent: "berry-500" },
  { id: "IMPROVE", title: "Garten verbessern", desc: "Nächste Schritte für einen besseren Garten.", Icon: Sparkles, accent: "sky-400" },
];

export default function UseCasesPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<UseCase>>(new Set());

  const toggle = (id: UseCase) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const onContinue = () => {
    const useCases = selected.size > 0 ? Array.from(selected) : (["PLANTS", "WEEDS", "PESTS", "DISEASES", "IMPROVE"] as UseCase[]);

    const existing = onboardingStorage.get();
    onboardingStorage.set({
      currentStep: "GARDEN",
      completedSteps: [...(existing?.completedSteps ?? []), "USE_CASES"],
      profile: { ...(existing?.profile ?? {}), useCases },
      startedAt: existing?.startedAt ?? new Date(),
    });

    track(EVENT.ONBOARDING_STEP_COMPLETED, {
      step: "use_cases",
      count: useCases.length,
    });

    router.push("/onboarding/garden");
  };

  return (
    <OnboardingLayout step={2} totalSteps={6}>
      <div className="px-5 pt-8">
        <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-muted mb-2">
          Schritt 1 von 5
        </p>
        <h1 className="font-serif text-[32px] leading-[1.1] tracking-tight text-forest-900 font-normal">
          Was möchtest du hauptsächlich lösen?
        </h1>
        <p className="mt-3 text-[14px] text-ink-muted leading-relaxed">
          Mehrfachauswahl möglich. Damit personalisieren wir deine Empfehlungen.
        </p>
      </div>

      <div className="px-5 pt-8 space-y-3">
        {useCases.map((uc) => {
          const active = selected.has(uc.id);
          return (
            <button
              key={uc.id}
              onClick={() => toggle(uc.id)}
              className={cn(
                "w-full flex items-center gap-4 rounded-[18px] p-5 text-left transition-all duration-200",
                active
                  ? "bg-paper ring-2 ring-forest-700 shadow-[0_6px_24px_rgba(46,74,56,0.12)]"
                  : "bg-paper/70 ring-1 ring-sage-200 hover:ring-forest-700/30"
              )}
            >
              <span
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]",
                  active ? "bg-forest-700 text-paper" : "bg-sage-100 text-forest-700"
                )}
              >
                <uc.Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-serif text-[18px] text-forest-900 leading-tight font-normal">
                  {uc.title}
                </span>
                <span className="block text-[13px] text-ink-muted leading-snug mt-0.5">
                  {uc.desc}
                </span>
              </span>
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition",
                  active ? "bg-forest-700" : "border-[1.5px] border-sage-300"
                )}
              >
                {active && <Check className="h-3.5 w-3.5 text-paper" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>

      <OnboardingFooter
        primaryLabel={selected.size > 0 ? `Weiter (${selected.size})` : "Überspringen"}
        primaryOnClick={onContinue}
      />
    </OnboardingLayout>
  );
}
