"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Bildmerkmale erkennen",
  "Mit 12 000 Arten vergleichen",
  "Relevanz bewerten",
  "Passende Empfehlung vorbereiten",
];

interface Props {
  onComplete: () => void;
  stepDurationMs?: number;
}

export function AnalyzingOverlay({
  onComplete,
  stepDurationMs = 650,
}: Props) {
  const [progressStep, setProgressStep] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((_, i) => {
      timers.push(
        setTimeout(() => setProgressStep(i + 1), (i + 1) * stepDurationMs)
      );
    });
    timers.push(
      setTimeout(onComplete, STEPS.length * stepDurationMs + 350)
    );
    return () => timers.forEach(clearTimeout);
  }, [onComplete, stepDurationMs]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-forest-900/92 backdrop-blur-xl px-8"
    >
      <div className="relative flex h-32 w-32 items-center justify-center mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-paper/20" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-t-paper border-r-paper/60 border-b-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        />
        <Sparkles className="h-10 w-10 text-paper" strokeWidth={1.5} />
      </div>
      <p className="font-serif text-[26px] leading-tight text-paper mb-1 font-normal text-center">
        Ich analysiere dein Beispiel
      </p>
      <p className="text-[13px] text-sage-200/80 mb-10 text-center">
        Das dauert nur einen Moment
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {STEPS.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: progressStep > i ? 1 : 0.3 }}
            className="flex items-center gap-3 text-[13px]"
          >
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full transition",
                progressStep > i
                  ? "bg-paper text-forest-900"
                  : "border border-paper/30"
              )}
            >
              {progressStep > i && (
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span className="text-paper/90">{s}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
