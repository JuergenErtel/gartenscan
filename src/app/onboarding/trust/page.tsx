"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { OnboardingShell } from "@/components/features/onboarding/OnboardingShell";
import { OnboardingHeadline } from "@/components/features/onboarding/OnboardingHeadline";
import { useOnboarding } from "@/hooks/useOnboarding";
import { trackOnboardingStepViewed } from "@/domain/analytics/onboarding";

const QUOTES = [
  {
    eyebrow: "Datenschutz",
    quote:
      "Deine Fotos verlassen dein Gerät erst, wenn du auf „analysieren“ tippst.",
    foot: "Speicherung lokal, keine Cloud-Synchronisation ohne Premium.",
  },
  {
    eyebrow: "Methode",
    quote:
      "Wir vergleichen dein Bild mit Tausenden kuratierter Beispiele — und sagen dir, wie sicher wir uns sind.",
    foot: "Konfidenzwert auf jedem Result, plus Alternativen bei Unsicherheit.",
  },
  {
    eyebrow: "Empfehlung",
    quote:
      "Jede Maßnahme passt zu deinem Garten — Standort, Bodenart, Saison, was du selbst zur Hand hast.",
    foot: "Drei Empfehlungstiefen: schnell · ausgewogen · gründlich.",
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
          title="Wie wir es ernst meinen."
          subtitle="Drei Versprechen, die du jederzeit einfordern kannst."
        />

        <motion.div
          className="space-y-4 mt-8"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.15 } },
            hidden: {},
          }}
        >
          {QUOTES.map((q) => (
            <motion.div
              key={q.eyebrow}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <article className="rounded-2xl bg-cream border border-terra-500/20 p-5 shadow-[var(--shadow-editorial)]">
                <p className="eyebrow mb-3">{q.eyebrow}</p>
                <p className="pull-quote">{q.quote}</p>
                <p className="text-[12px] text-ink-muted mt-3 leading-relaxed">
                  {q.foot}
                </p>
              </article>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="pt-8">
        <Button
          onClick={() => advance("TRUST", {})}
          variant="editorial"
          size="lg"
          fullWidth
        >
          Probier&apos;s aus
        </Button>
      </div>
    </OnboardingShell>
  );
}
