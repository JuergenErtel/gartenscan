import type { OnboardingStep, UseCase } from "@/domain/types";
import { track } from "./tracker";
import { EVENT } from "./events";

const STEP_INDEX: Record<OnboardingStep, number> = {
  WELCOME: 1,
  USE_CASES: 2,
  GARDEN: 3,
  TRUST: 4,
  SCAN: 5,
  PREMIUM: 6,
  DONE: 7,
};

export function trackOnboardingStarted(source: "landing" | "direct"): void {
  track(EVENT.ONBOARDING_STARTED, { source });
}

export function trackOnboardingStepViewed(step: OnboardingStep): void {
  track(EVENT.ONBOARDING_STEP_VIEWED, {
    step,
    index: STEP_INDEX[step] ?? 0,
  });
}

export function trackGoalsSelected(goals: UseCase[]): void {
  track(EVENT.ONBOARDING_GOAL_SELECTED, {
    goals: goals.join(","),
    count: goals.length,
  });
}

export function trackProfileCompleted(profile: {
  areas: string[];
  hasChildren: boolean;
  hasPets: boolean;
  solutionStyle: string;
  experience: string;
}): void {
  track(EVENT.PROFILE_COMPLETED, {
    areas: profile.areas.join(","),
    areaCount: profile.areas.length,
    hasChildren: profile.hasChildren,
    hasPets: profile.hasPets,
    solutionStyle: profile.solutionStyle,
    experience: profile.experience,
  });
}

export function trackFirstScanCtaClicked(demoId: string): void {
  track(EVENT.FIRST_SCAN_CTA_CLICKED, { demoId });
}

export function trackFirstScanStarted(demoId: string): void {
  track(EVENT.FIRST_SCAN_STARTED, { demoId });
}

export function trackFirstScanCompleted(
  demoId: string,
  durationMs: number
): void {
  track(EVENT.FIRST_SCAN_COMPLETED, { demoId, durationMs });
}

export function trackPaywallViewed(): void {
  track(EVENT.PAYWALL_AFTER_VALUE_VIEWED);
}

export function trackTrialStarted(emailDomain: string): void {
  track(EVENT.TRIAL_STARTED, { emailDomain });
}

export function trackOnboardingCompleted(
  pathTaken: "full" | "skipped_paywall" | "skipped_scan" | "skipped_both"
): void {
  track(EVENT.ONBOARDING_COMPLETED, { pathTaken });
}

export function trackOnboardingSkipClicked(step: OnboardingStep): void {
  track(EVENT.ONBOARDING_SKIP_CLICKED, { step });
}

export function trackOnboardingBackClicked(fromStep: OnboardingStep): void {
  track(EVENT.ONBOARDING_BACK_CLICKED, { fromStep });
}
