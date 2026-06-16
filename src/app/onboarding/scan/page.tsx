"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Camera, Sparkles, Sprout } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OnboardingShell } from "@/components/features/onboarding/OnboardingShell";
import { OnboardingHeadline } from "@/components/features/onboarding/OnboardingHeadline";
import { TrustStepCard } from "@/components/features/onboarding/TrustStepCard";
import { useOnboarding } from "@/hooks/useOnboarding";
import { trackOnboardingStepViewed } from "@/domain/analytics/onboarding";

const STEPS = [
  {
    icon: Camera,
    title: "Foto machen",
    text: "Pflanze, Unkraut oder Blatt – einfach drauf halten.",
  },
  {
    icon: Sparkles,
    title: "KI erkennt sofort",
    text: "Art, Krankheit und Schädling in Sekunden.",
  },
  {
    icon: Sprout,
    title: "Pflegetipps erhalten",
    text: "Konkrete, saisonale Empfehlungen für deinen Garten.",
  },
];

export default function ScanPage() {
  const { advance } = useOnboarding();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    trackOnboardingStepViewed("SCAN");
  }, []);

  return (
    <OnboardingShell step={5}>
      <div className="flex-1 pt-6">
        <OnboardingHeadline
          title="So einfach geht's"
          subtitle="In drei Schritten vom Foto zur Pflege-Empfehlung."
        />

        <motion.div
          className="mt-8 space-y-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.15 } },
            hidden: {},
          }}
        >
          {STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              variants={{
                hidden: { opacity: 0, y: reduceMotion ? 0 : 12 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <TrustStepCard
                number={index + 1}
                icon={step.icon}
                title={step.title}
                text={step.text}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="pt-8">
        <Button
          onClick={() => advance("SCAN", {})}
          variant="editorial"
          size="lg"
          fullWidth
        >
          Los geht's
        </Button>
      </div>
    </OnboardingShell>
  );
}
