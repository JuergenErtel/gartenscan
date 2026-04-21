"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const STEPS = [
  "Blatt erkannt",
  "Muster vergleichen",
  "Diagnose erstellen",
];

interface Props {
  onComplete: () => void;
  /** Gesamtdauer in ms. Default 2800. */
  totalDurationMs?: number;
}

export function AnalyzingOverlay({
  onComplete,
  totalDurationMs = 2800,
}: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const stepDuration = Math.floor(totalDurationMs / (STEPS.length + 1));

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setActiveStep(i), (i + 1) * stepDuration));
    });
    timers.push(setTimeout(onComplete, totalDurationMs));
    return () => timers.forEach(clearTimeout);
  }, [onComplete, stepDuration, totalDurationMs]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bark-900/92 backdrop-blur-xl px-8"
    >
      <div className="relative flex h-[110px] w-[110px] items-center justify-center mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-cream/15" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-t-sun-500 border-r-sun-500/40 border-b-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <p className="eyebrow text-sun-500 mb-3">
        Schritt {activeStep + 1} / {STEPS.length}
      </p>

      <div className="relative h-[40px] w-full max-w-xs overflow-hidden">
        {STEPS.map((s, i) => (
          <motion.p
            key={s}
            initial={{ opacity: 0, y: 8 }}
            animate={{
              opacity: activeStep === i ? 1 : 0,
              y: activeStep === i ? 0 : -8,
            }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 font-serif italic text-[18px] text-cream text-center"
          >
            {s}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}
