"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { OnboardingHeadline } from "@/components/features/onboarding/OnboardingHeadline";
import { OnboardingShell } from "@/components/features/onboarding/OnboardingShell";
import { useOnboarding } from "@/hooks/useOnboarding";
import { trackOnboardingStepViewed } from "@/domain/analytics/onboarding";

const QUOTES = [
  {
    eyebrow: "Ehrlichkeit",
    quote:
      "Wenn wir unsicher sind, sagen wir es. Ein Fake-sicheres Ergebnis ist schlimmer als ein offenes Vielleicht.",
    foot: "Konfidenz, Alternativen und Wiederholungs-Hinweise gehoeren zum Produktkern.",
  },
  {
    eyebrow: "Scope",
    quote:
      "Heute sind wir im Live-Scan am staerksten bei Pflanzen und klaren Einzelmotiven. Andere Problemklassen bauen wir sichtbar aus.",
    foot: "Lieber ehrlicher Fokus als eine ueberdehnte Alleskann-App.",
  },
  {
    eyebrow: "Nutzen",
    quote:
      "Ein Ergebnis ist erst dann gut, wenn du danach weisst, ob du handeln musst und womit du anfangen solltest.",
    foot: "Genau deshalb priorisieren wir Relevanz und Massnahmen vor Lexikon-Wissen.",
  },
];

export default function TrustPage() {
  const { advance } = useOnboarding();

  useEffect(() => {
    trackOnboardingStepViewed("TRUST");
  }, []);

  return (
    <OnboardingShell step={4}>
      <div className="flex-1 pt-6">
        <OnboardingHeadline
          title="Wie wir Vertrauen verdienen."
          subtitle="Nicht mit Marketing-Saetzen, sondern mit klaren Grenzen und brauchbaren Antworten."
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
          {QUOTES.map((quote) => (
            <motion.div
              key={quote.eyebrow}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <article className="rounded-2xl border border-terra-500/20 bg-cream p-5 shadow-[var(--shadow-editorial)]">
                <p className="eyebrow mb-3">{quote.eyebrow}</p>
                <p className="pull-quote">{quote.quote}</p>
                <p className="mt-3 text-[12px] leading-relaxed text-ink-muted">
                  {quote.foot}
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
          Weiter zum ersten echten Wertmoment
        </Button>
      </div>
    </OnboardingShell>
  );
}
