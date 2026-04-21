"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
          <LiveDrawnMark />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="text-center max-w-md mx-auto"
        >
          <p className="eyebrow mb-3">Willkommen</p>
          <h1 className="font-serif text-[40px] leading-[1.05] text-bark-900 font-normal tracking-tight mb-4">
            Erkennen.{" "}
            <span className="italic text-clay-800">Verstehen.</span>{" "}
            Lösen.
          </h1>
          <p className="text-[15px] leading-relaxed text-ink-muted">
            Dein Garten in der Hosentasche — vom ersten Foto zur konkreten Antwort in 30 Sekunden.
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
          className="tap-press flex items-center justify-center rounded-[14px] bg-bark-900 hover:bg-clay-800 text-cream text-[15px] font-medium px-6 transition-colors"
          style={{ height: 52 }}
        >
          Los geht&apos;s
        </Link>
        <span className="text-center text-[12px] text-ink-muted/70 pt-1">
          Schon Konto? Später anmelden
        </span>
      </motion.div>
    </OnboardingShell>
  );
}

function LiveDrawnMark() {
  return (
    <div className="relative h-[200px] w-[200px] flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(168,120,66,0.18)_0%,transparent_65%)] anim-breath" />
      <div className="relative h-[160px] w-[160px] rounded-full bg-cream border-[1.5px] border-terra-500/70 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          stroke="#3a2515"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[70%] w-[70%]"
        >
          <path className="anim-write" d="M50 90 Q50 60 35 40 Q40 30 50 30 Q60 30 65 40 Q50 60 50 90" />
          <path className="anim-write" style={{ animationDelay: "0.6s" }} d="M50 70 L40 50 M50 70 L60 50 M50 50 L42 35 M50 50 L58 35" />
          <circle className="anim-bloom" style={{ animationDelay: "2.2s" }} cx="50" cy="22" r="4" fill="#a04030" stroke="none" />
        </svg>
      </div>
    </div>
  );
}
