"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Sparkles, CheckCircle2 } from "lucide-react";
import { OnboardingShell } from "@/components/features/onboarding/OnboardingShell";
import { OnboardingHeadline } from "@/components/features/onboarding/OnboardingHeadline";
import { TrustStepCard } from "@/components/features/onboarding/TrustStepCard";
import { useOnboarding } from "@/hooks/useOnboarding";
import { trackOnboardingStepViewed } from "@/domain/analytics/onboarding";

const STEPS = [
  {
    number: 1,
    icon: Camera,
    title: "Scannen",
    text: "Du machst ein Foto von deinem Problem.",
  },
  {
    number: 2,
    icon: Sparkles,
    title: "Verstehen",
    text: "Wir erkennen Pflanze, Ursache und Dringlichkeit.",
  },
  {
    number: 3,
    icon: CheckCircle2,
    title: "Lösen",
    text: "Du bekommst konkrete Schritte — angepasst an deinen Garten.",
  },
];

export default function TrustPage() {
  const { advance } = useOnboarding();

  useEffect(() => {
    trackOnboardingStepViewed("TRUST");
  }, []);

  return (
    <OnboardingShell step={4}>
      <div className="pt-6 flex-1">
        <OnboardingHeadline
          title="Deine neue Garten-Superkraft."
          subtitle="In drei Schritten vom Foto zur Lösung."
        />
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.12 } },
            hidden: {},
          }}
        >
          {STEPS.map((s) => (
            <motion.div
              key={s.number}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <TrustStepCard
                number={s.number}
                icon={s.icon}
                title={s.title}
                text={s.text}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
      <div className="pt-6">
        <button
          type="button"
          onClick={() => advance("TRUST", {})}
          className="flex w-full items-center justify-center rounded-full bg-clay-500 hover:bg-clay-600 text-paper text-[15px] font-semibold transition active:scale-[0.98]"
          style={{ height: 52 }}
        >
          Probier's aus
        </button>
      </div>
    </OnboardingShell>
  );
}
