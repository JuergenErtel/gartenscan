"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Leaf, Scale, Zap } from "lucide-react";
import { OnboardingLayout } from "@/components/features/onboarding/OnboardingLayout";
import { OnboardingFooter } from "@/components/features/onboarding/OnboardingFooter";
import { onboardingStorage } from "@/lib/storage/profile";
import { track } from "@/domain/analytics/tracker";
import { EVENT } from "@/domain/analytics/events";
import type { ExperienceLevel, SolutionStyle } from "@/domain/types";
import { cn } from "@/lib/utils";

const styles: { id: SolutionStyle; title: string; desc: string; Icon: React.ElementType }[] = [
  { id: "ORGANIC", title: "Bio & natürlich", desc: "Hausmittel, Nützlinge, keine Chemie.", Icon: Leaf },
  { id: "BALANCED", title: "Ausgewogen", desc: "Bio bevorzugt, bei Bedarf auch zugelassene Mittel.", Icon: Scale },
  { id: "EFFECTIVE", title: "Effektiv", desc: "Die schnellste wirksame Lösung, auch chemisch.", Icon: Zap },
];

const levels: { id: ExperienceLevel; label: string; desc: string }[] = [
  { id: "BEGINNER", label: "Anfänger", desc: "Bin neu im Gärtnern" },
  { id: "INTERMEDIATE", label: "Fortgeschritten", desc: "Kenne die Basics" },
  { id: "EXPERT", label: "Profi", desc: "Jahrelange Erfahrung" },
];

export default function StylePage() {
  const router = useRouter();
  const [style, setStyle] = useState<SolutionStyle>("BALANCED");
  const [experience, setExperience] = useState<ExperienceLevel>("INTERMEDIATE");

  const onContinue = () => {
    const existing = onboardingStorage.get();
    onboardingStorage.set({
      currentStep: "TRUST",
      completedSteps: [...(existing?.completedSteps ?? []), "STYLE"],
      profile: {
        ...(existing?.profile ?? {}),
        solutionStyle: style,
        experience,
      },
      startedAt: existing?.startedAt ?? new Date(),
    });
    track(EVENT.ONBOARDING_STEP_COMPLETED, {
      step: "style",
      style,
      experience,
    });
    router.push("/onboarding/trust");
  };

  return (
    <OnboardingLayout step={4} totalSteps={6}>
      <div className="px-5 pt-8">
        <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-muted mb-2">
          Schritt 3 von 5
        </p>
        <h1 className="font-serif text-[32px] leading-[1.1] tracking-tight text-forest-900 font-normal">
          Dein Lösungsstil
        </h1>
        <p className="mt-3 text-[14px] text-ink-muted leading-relaxed">
          Wir filtern Maßnahmen-Vorschläge passend zu deiner Präferenz.
        </p>
      </div>

      <section className="px-5 pt-8 space-y-3">
        {styles.map((s) => {
          const active = style === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
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
                <s.Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-serif text-[18px] text-forest-900 leading-tight font-normal">
                  {s.title}
                </span>
                <span className="block text-[13px] text-ink-muted leading-snug mt-0.5">
                  {s.desc}
                </span>
              </span>
            </button>
          );
        })}
      </section>

      <div className="px-5 pt-10 pb-1">
        <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-forest-700 mb-3">
          Erfahrungslevel
        </p>
        <div className="grid grid-cols-3 gap-2">
          {levels.map((l) => {
            const active = experience === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setExperience(l.id)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-[14px] p-4 text-left transition",
                  active
                    ? "bg-forest-700 text-paper"
                    : "bg-paper ring-1 ring-sage-200 text-forest-800 hover:ring-forest-700/40"
                )}
              >
                <span className="text-[13px] font-semibold">{l.label}</span>
                <span className={cn("text-[11px]", active ? "text-sage-200" : "text-ink-muted")}>
                  {l.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <OnboardingFooter primaryOnClick={onContinue} />
    </OnboardingLayout>
  );
}
