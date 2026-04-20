"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { OnboardingShell } from "@/components/features/onboarding/OnboardingShell";
import {
  trackOnboardingStarted,
  trackOnboardingStepViewed,
} from "@/domain/analytics/onboarding";

const STARTED_FLAG = "gartenscan:onboarding_started_flag";

export default function WelcomePage() {
  const startedRef = useRef(false);

  useEffect(() => {
    trackOnboardingStepViewed("WELCOME");
    if (!startedRef.current) {
      const alreadyStarted = sessionStorage.getItem(STARTED_FLAG);
      if (!alreadyStarted) {
        trackOnboardingStarted(
          document.referrer.includes(window.location.host)
            ? "landing"
            : "direct"
        );
        sessionStorage.setItem(STARTED_FLAG, "1");
      }
      startedRef.current = true;
    }
  }, []);

  return (
    <OnboardingShell step={1} hideBack>
      <div className="flex-1 flex flex-col items-center justify-center pb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mb-10"
        >
          <HeroVisual />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="text-center max-w-md mx-auto"
        >
          <h1 className="font-serif text-[34px] leading-[1.05] text-forest-900 mb-3 font-normal tracking-tight">
            Erkenne jedes Gartenproblem in Sekunden.
          </h1>
          <p className="text-[16px] leading-relaxed text-ink-muted">
            Foto machen. Verstehen. Richtig lösen.
          </p>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
        className="flex flex-col gap-3"
      >
        <Link
          href="/onboarding/use-cases"
          className="flex items-center justify-center rounded-full bg-clay-500 hover:bg-clay-600 text-paper text-[15px] font-semibold px-6 active:scale-[0.98] transition"
          style={{ height: 52 }}
        >
          Los geht's
        </Link>
        <span className="text-center text-[12px] text-ink-muted/70 pt-1">
          Schon Nutzer? Später einloggen
        </span>
      </motion.div>
    </OnboardingShell>
  );
}

function HeroVisual() {
  return (
    <div className="relative h-44 w-44 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sage-200/60 to-forest-100/40 blur-2xl" />
      <div className="absolute inset-4 rounded-full border-2 border-forest-700/20" />
      <div className="absolute inset-8 rounded-full border border-forest-700/10" />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-paper shadow-[0_6px_24px_rgba(28,42,33,0.12)]">
        <Sparkles className="h-8 w-8 text-forest-700" strokeWidth={1.5} />
      </div>
    </div>
  );
}
