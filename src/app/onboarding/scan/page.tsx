"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OnboardingShell } from "@/components/features/onboarding/OnboardingShell";
import { OnboardingHeadline } from "@/components/features/onboarding/OnboardingHeadline";
import { DemoScanCard } from "@/components/features/onboarding/DemoScanCard";
import { AnalyzingOverlay } from "@/components/features/onboarding/AnalyzingOverlay";
import { CompactResultView } from "@/components/features/onboarding/CompactResultView";
import { useOnboarding } from "@/hooks/useOnboarding";
import {
  trackOnboardingStepViewed,
  trackFirstScanCtaClicked,
  trackFirstScanStarted,
  trackFirstScanCompleted,
  trackOnboardingSkipClicked,
} from "@/domain/analytics/onboarding";
import { getContentById } from "@/content";

type Phase = "picker" | "analyzing" | "result";

interface DemoEntry {
  id: string;
  contentId: string;
  label: string;
  hint: string;
  image: string;
  metaBadge: string;
  summary: string;
}

const DEMOS: DemoEntry[] = [
  {
    id: "plant_tomate",
    contentId: "plant_tomate",
    label: "Tomate",
    hint: "Typisches Problem bei einer Pflanze",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f3/Tomatoes-on-the-bush.jpg",
    metaBadge: "Pflanze · Erkannt",
    summary:
      "Deine Tomate steht gut im Saft. Achte in dieser Phase auf gleichmäßige Wassergabe und früh erkennbare Krankheitssymptome.",
  },
  {
    id: "weed_loewenzahn",
    contentId: "weed_loewenzahn",
    label: "Löwenzahn",
    hint: "Typisches Unkraut im Rasen",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/4/4f/DandelionFlower.jpg",
    metaBadge: "Unkraut · Mittlere Relevanz",
    summary:
      "Breitet sich schnell aus und entzieht dem Rasen Nährstoffe. Jetzt gezielt entfernen, bevor er in Samen geht.",
  },
  {
    id: "disease_echter_mehltau",
    contentId: "disease_echter_mehltau",
    label: "Echter Mehltau",
    hint: "Typische Pflanzenkrankheit",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/7/7b/UncinulaTulasneiLeaf.jpg",
    metaBadge: "Krankheit · Hohe Relevanz",
    summary:
      "Pilzbefall, der sich bei Wärme rasch ausbreitet. Sofort handeln, damit er nicht auf andere Pflanzen übergreift.",
  },
];

export default function ScanPage() {
  const { advance, skipToComplete } = useOnboarding();
  const [phase, setPhase] = useState<Phase>("picker");
  const [selected, setSelected] = useState<DemoEntry | null>(null);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    trackOnboardingStepViewed("SCAN");
  }, []);

  function onPickDemo(demo: DemoEntry) {
    trackFirstScanCtaClicked(demo.id);
    setSelected(demo);
    setPhase("analyzing");
    startedAtRef.current = Date.now();
    trackFirstScanStarted(demo.id);
  }

  function onAnalyzeComplete() {
    if (!selected) return;
    trackFirstScanCompleted(
      selected.id,
      Date.now() - startedAtRef.current
    );
    setPhase("result");
  }

  function onPrimaryCta() {
    advance("SCAN", {});
  }

  function onSkipResult() {
    trackOnboardingSkipClicked("SCAN");
    skipToComplete("skipped_paywall");
  }

  function onSkipPicker() {
    trackOnboardingSkipClicked("SCAN");
    skipToComplete("skipped_scan");
  }

  return (
    <>
      <OnboardingShell step={5} hideProgress={phase !== "picker"}>
        <AnimatePresence mode="wait">
          {phase === "picker" && (
            <motion.div
              key="picker"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="pt-6 flex-1"
            >
              <OnboardingHeadline
                title="Lass uns deinen ersten Scan machen"
                subtitle="Wir zeigen dir, wie's geht — such dir ein Beispiel aus."
              />
              <div className="flex flex-col gap-3">
                {DEMOS.map((demo) => (
                  <DemoScanCard
                    key={demo.id}
                    label={demo.label}
                    hint={demo.hint}
                    image={demo.image}
                    onClick={() => onPickDemo(demo)}
                  />
                ))}
              </div>
              <p className="mt-6 text-center text-[12px] text-ink-muted/80">
                Beispiel-Scan. Deinen eigenen machst du gleich in der App.
              </p>
              <button
                type="button"
                onClick={onSkipPicker}
                className="mt-4 w-full py-2 text-[12px] text-ink-muted hover:text-forest-700 transition"
              >
                Überspringen
              </button>
            </motion.div>
          )}

          {phase === "result" && selected && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex-1"
            >
              <ResultFromDemo
                demo={selected}
                onPrimaryCta={onPrimaryCta}
                onSkip={onSkipResult}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </OnboardingShell>

      <AnimatePresence>
        {phase === "analyzing" && (
          <AnalyzingOverlay onComplete={onAnalyzeComplete} />
        )}
      </AnimatePresence>
    </>
  );
}

function ResultFromDemo({
  demo,
  onPrimaryCta,
  onSkip,
}: {
  demo: DemoEntry;
  onPrimaryCta: () => void;
  onSkip: () => void;
}) {
  const entry = getContentById(demo.contentId);
  if (!entry) {
    return (
      <div className="pt-12 text-center text-ink-muted">
        Inhalt nicht gefunden.
      </div>
    );
  }
  return (
    <CompactResultView
      entry={entry}
      metaBadge={demo.metaBadge}
      summary={demo.summary}
      onPrimaryCta={onPrimaryCta}
      onSkip={onSkip}
    />
  );
}
