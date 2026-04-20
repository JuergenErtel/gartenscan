"use client";

import type { GardenProfile, OnboardingState } from "@/domain/types";

const PROFILE_KEY = "gartenscan:profile:v1";
const ONBOARDING_KEY = "gartenscan:onboarding:v1";

/**
 * Client-side profile storage. In production this is replaced by
 * server-side persistence via tRPC + DB.
 */
export const profileStorage = {
  get(): GardenProfile | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as GardenProfile;
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
      };
    } catch {
      return null;
    }
  },

  set(profile: GardenProfile): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify({ ...profile, updatedAt: new Date() })
    );
  },

  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
  },

  isComplete(): boolean {
    const p = this.get();
    return !!(p && p.postalCode && p.useCases.length > 0);
  },
};

export const onboardingStorage = {
  get(): OnboardingState | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(ONBOARDING_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as OnboardingState;
      return {
        ...parsed,
        startedAt: new Date(parsed.startedAt),
        completedAt: parsed.completedAt
          ? new Date(parsed.completedAt)
          : undefined,
      };
    } catch {
      return null;
    }
  },

  set(state: OnboardingState): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
  },

  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ONBOARDING_KEY);
  },

  markCompleted(): void {
    const current = this.get();
    if (!current) return;
    this.set({
      ...current,
      currentStep: "DONE",
      completedAt: new Date(),
    });
  },
};
