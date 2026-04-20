"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onboardingStorage, profileStorage } from "@/lib/storage/profile";
import { waitlistStorage, extractEmailDomain } from "@/lib/storage/waitlist";
import {
  trackOnboardingCompleted,
  trackTrialStarted,
} from "@/domain/analytics/onboarding";
import type {
  GardenProfile,
  OnboardingState,
  OnboardingStep,
} from "@/domain/types";

const STEP_ORDER: OnboardingStep[] = [
  "WELCOME",
  "USE_CASES",
  "GARDEN",
  "TRUST",
  "SCAN",
  "PREMIUM",
];

const STEP_ROUTES: Record<OnboardingStep, string> = {
  WELCOME: "/onboarding/welcome",
  USE_CASES: "/onboarding/use-cases",
  GARDEN: "/onboarding/garden",
  TRUST: "/onboarding/trust",
  SCAN: "/onboarding/scan",
  PREMIUM: "/onboarding/premium",
  DONE: "/app",
};

function nextStep(current: OnboardingStep): OnboardingStep {
  const i = STEP_ORDER.indexOf(current);
  if (i < 0 || i >= STEP_ORDER.length - 1) return "DONE";
  return STEP_ORDER[i + 1];
}

function emptyState(current: OnboardingStep = "WELCOME"): OnboardingState {
  return {
    currentStep: current,
    completedSteps: [],
    profile: {},
    startedAt: new Date(),
  };
}

export interface UseOnboardingResult {
  state: OnboardingState | null;
  loading: boolean;
  advance: (currentStep: OnboardingStep, data: Partial<GardenProfile>) => void;
  goBack: () => void;
  skipToComplete: (
    pathTaken: "skipped_scan" | "skipped_paywall" | "skipped_both"
  ) => void;
  submitPaywall: (email: string) => void;
}

export function useOnboarding(): UseOnboardingResult {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existing = onboardingStorage.get();
    if (existing) {
      setState(existing);
    } else {
      const fresh = emptyState();
      onboardingStorage.set(fresh);
      setState(fresh);
    }
    setLoading(false);
  }, []);

  const advance = useCallback(
    (currentStep: OnboardingStep, data: Partial<GardenProfile>) => {
      const base = onboardingStorage.get() ?? emptyState(currentStep);
      const next = nextStep(currentStep);
      const updated: OnboardingState = {
        ...base,
        currentStep: next,
        completedSteps: Array.from(
          new Set([...(base.completedSteps ?? []), currentStep])
        ),
        profile: { ...base.profile, ...data },
      };
      onboardingStorage.set(updated);
      setState(updated);
      router.push(STEP_ROUTES[next]);
    },
    [router]
  );

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  const skipToComplete = useCallback(
    (pathTaken: "skipped_scan" | "skipped_paywall" | "skipped_both") => {
      const base = onboardingStorage.get() ?? emptyState();
      profileStorage.markComplete(base.profile);
      onboardingStorage.markCompleted();
      trackOnboardingCompleted(pathTaken);
      router.replace("/app");
    },
    [router]
  );

  const submitPaywall = useCallback(
    (email: string) => {
      const base = onboardingStorage.get() ?? emptyState();
      waitlistStorage.add(email);
      trackTrialStarted(extractEmailDomain(email));
      profileStorage.markComplete(base.profile);
      onboardingStorage.markCompleted();
      trackOnboardingCompleted("full");
      router.replace("/app");
    },
    [router]
  );

  return { state, loading, advance, goBack, skipToComplete, submitPaywall };
}
