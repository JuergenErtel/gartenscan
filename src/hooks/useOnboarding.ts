"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  trackOnboardingCompleted,
  trackTrialStarted,
} from "@/domain/analytics/onboarding";
import type {
  GardenProfile,
  OnboardingState,
  OnboardingStep,
} from "@/domain/types";

const STEP_ORDER: OnboardingStep[] = ["WELCOME", "USE_CASES", "GARDEN", "TRUST", "SCAN", "PREMIUM"];

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
  return { currentStep: current, completedSteps: [], profile: {}, startedAt: new Date() };
}

const SESSION_KEY = "gartenscan:onboarding:session:v2";

function readSession(): OnboardingState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingState;
    return { ...parsed, startedAt: new Date(parsed.startedAt) };
  } catch {
    return null;
  }
}

function writeSession(state: OnboardingState) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
}

function clearSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}

async function completeOnboarding(profile: Partial<GardenProfile>) {
  const res = await fetch("/api/onboarding/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile }),
  });
  if (!res.ok) throw new Error(`onboarding/complete http ${res.status}`);
}

export interface UseOnboardingResult {
  state: OnboardingState | null;
  loading: boolean;
  advance: (currentStep: OnboardingStep, data: Partial<GardenProfile>) => void;
  goBack: () => void;
  skipToComplete: (pathTaken: "skipped_scan" | "skipped_paywall" | "skipped_both") => void;
  submitPaywall: (email: string) => void;
}

export function useOnboarding(): UseOnboardingResult {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existing = readSession();
    if (existing) {
      setState(existing);
    } else {
      const fresh = emptyState();
      writeSession(fresh);
      setState(fresh);
    }
    setLoading(false);
  }, []);

  const advance = useCallback(
    (currentStep: OnboardingStep, data: Partial<GardenProfile>) => {
      const base = readSession() ?? emptyState(currentStep);
      const next = nextStep(currentStep);
      const updated: OnboardingState = {
        ...base,
        currentStep: next,
        completedSteps: Array.from(new Set([...(base.completedSteps ?? []), currentStep])),
        profile: { ...base.profile, ...data },
      };
      writeSession(updated);
      setState(updated);
      router.push(STEP_ROUTES[next]);
    },
    [router]
  );

  const goBack = useCallback(() => router.back(), [router]);

  const skipToComplete = useCallback(
    (pathTaken: "skipped_scan" | "skipped_paywall" | "skipped_both") => {
      const base = readSession() ?? emptyState();
      completeOnboarding(base.profile)
        .then(() => {
          trackOnboardingCompleted(pathTaken);
          clearSession();
          router.replace("/app");
        })
        .catch((err) => {
          console.error("onboarding complete failed", err);
          alert("Onboarding konnte nicht gespeichert werden. Bitte versuch es erneut.");
        });
    },
    [router]
  );

  const submitPaywall = useCallback(
    (email: string) => {
      const base = readSession() ?? emptyState();
      completeOnboarding({ ...base.profile })
        .then(() => {
          trackTrialStarted(email.split("@")[1] ?? "unknown");
          trackOnboardingCompleted("full");
          clearSession();
          router.replace("/app");
        })
        .catch((err) => {
          console.error("onboarding complete failed", err);
          alert("Onboarding konnte nicht gespeichert werden. Bitte versuch es erneut.");
        });
    },
    [router]
  );

  return { state, loading, advance, goBack, skipToComplete, submitPaywall };
}
