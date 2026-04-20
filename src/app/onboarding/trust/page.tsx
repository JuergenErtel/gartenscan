"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Camera, Search, CheckSquare, ShieldCheck, Users, Lock } from "lucide-react";
import { OnboardingLayout } from "@/components/features/onboarding/OnboardingLayout";
import { OnboardingFooter } from "@/components/features/onboarding/OnboardingFooter";
import { onboardingStorage } from "@/lib/storage/profile";
import { track } from "@/domain/analytics/tracker";
import { EVENT } from "@/domain/analytics/events";

const steps = [
  {
    Icon: Camera,
    title: "Foto analysieren",
    text: "Die KI erkennt in Sekunden, was vor dir steht – auch Unkraut, Insekten, Schäden.",
  },
  {
    Icon: Search,
    title: "Problem verstehen",
    text: "Ursachen, Dringlichkeit, Sicherheit – alles in Alltagssprache. Keine Fachchinesisch.",
  },
  {
    Icon: CheckSquare,
    title: "Plan erhalten",
    text: "Konkrete Schritte: heute sofort · diese Woche · langfristig. Passend zu deinem Stil.",
  },
];

const trust = [
  { Icon: ShieldCheck, text: "Empfehlungen mit Quellenangabe" },
  { Icon: Users, text: "Von Gartenbauer:innen geprüft" },
  { Icon: Lock, text: "Deine Daten bleiben bei dir" },
];

export default function TrustPage() {
  const router = useRouter();

  const onContinue = () => {
    const existing = onboardingStorage.get();
    onboardingStorage.set({
      currentStep: "FIRST_SCAN",
      completedSteps: [...(existing?.completedSteps ?? []), "TRUST"],
      profile: existing?.profile ?? {},
      startedAt: existing?.startedAt ?? new Date(),
    });
    track(EVENT.ONBOARDING_STEP_COMPLETED, { step: "trust" });
    router.push("/onboarding/first-scan");
  };

  return (
    <OnboardingLayout step={5} totalSteps={6}>
      <div className="px-5 pt-8">
        <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-muted mb-2">
          Schritt 4 von 5
        </p>
        <h1 className="font-serif text-[32px] leading-[1.1] tracking-tight text-forest-900 font-normal">
          So arbeiten wir
        </h1>
        <p className="mt-3 text-[14px] text-ink-muted leading-relaxed">
          Drei klare Schritte – vom Foto bis zur konkreten Handlung.
        </p>
      </div>

      {/* Animated steps */}
      <section className="px-5 pt-8 space-y-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.1 + i * 0.18,
              duration: 0.5,
              ease: [0.2, 0.8, 0.2, 1],
            }}
            className="relative flex items-start gap-4 rounded-[18px] bg-paper p-5 shadow-[0_2px_12px_rgba(28,42,33,0.04)]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-moss-500 to-forest-700 text-paper font-bold">
              <span className="text-[13px] absolute font-semibold">{i + 1}</span>
              <s.Icon className="h-5 w-5 opacity-0" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <s.Icon
                  className="h-4 w-4 text-forest-700"
                  strokeWidth={1.75}
                />
                <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-forest-700">
                  Schritt {i + 1}
                </span>
              </div>
              <h3 className="font-serif text-[18px] leading-tight text-forest-900 font-normal">
                {s.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-ink-muted mt-1">
                {s.text}
              </p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Trust strip */}
      <section className="px-5 pt-8">
        <div className="rounded-[16px] bg-forest-900 text-paper p-5">
          <p className="text-[11px] uppercase tracking-[0.12em] font-bold text-sage-200 mb-4">
            Du kannst uns vertrauen
          </p>
          <div className="space-y-3">
            {trust.map((t) => (
              <div key={t.text} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper/10">
                  <t.Icon
                    className="h-4 w-4 text-sage-200"
                    strokeWidth={1.75}
                  />
                </span>
                <span className="text-[13px] text-sage-200/90">{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <OnboardingFooter
        primaryLabel="Jetzt ersten Scan machen"
        primaryOnClick={onContinue}
      />
    </OnboardingLayout>
  );
}
