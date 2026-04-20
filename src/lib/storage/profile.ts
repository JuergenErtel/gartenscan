"use client";

import type { GardenProfile, OnboardingState, PetType } from "@/domain/types";

const PROFILE_KEY = "gartenscan:profile:v1";
const ONBOARDING_KEY = "gartenscan:onboarding:v1";

const DEFAULT_POSTAL_CODE = "80331";

function buildDefaultProfile(
  partial: Partial<GardenProfile>
): GardenProfile {
  const now = new Date();
  const pets: PetType[] =
    partial.pets ?? (partial.hasPets ? ["DOG"] : []);
  return {
    userId: partial.userId ?? generateUserId(),
    name: partial.name,
    postalCode: partial.postalCode ?? DEFAULT_POSTAL_CODE,
    climateZone: partial.climateZone,
    locationName: partial.locationName,
    areas: partial.areas ?? [],
    hasChildren: partial.hasChildren ?? false,
    hasPets: partial.hasPets ?? false,
    pets,
    solutionStyle: partial.solutionStyle ?? "BALANCED",
    experience: partial.experience ?? "BEGINNER",
    useCases: partial.useCases ?? [],
    createdAt: partial.createdAt ?? now,
    updatedAt: now,
    onboardingCompletedAt: partial.onboardingCompletedAt,
  };
}

function generateUserId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `user_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

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
        onboardingCompletedAt: parsed.onboardingCompletedAt
          ? new Date(parsed.onboardingCompletedAt)
          : undefined,
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

  /**
   * Baut aus Partial<GardenProfile> ein vollständiges Profil mit Defaults
   * und schreibt es als abgeschlossenes Onboarding-Profil.
   */
  markComplete(partial: Partial<GardenProfile>): GardenProfile {
    const existing = this.get();
    const profile = buildDefaultProfile({
      ...(existing ?? {}),
      ...partial,
      onboardingCompletedAt: new Date(),
    });
    this.set(profile);
    return profile;
  },

  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
  },

  isComplete(): boolean {
    const p = this.get();
    return !!(p && p.onboardingCompletedAt);
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
