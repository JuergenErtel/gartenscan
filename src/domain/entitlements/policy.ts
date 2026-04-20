import type { Feature, SubscriptionTier } from "@/domain/types";

/**
 * Single source of truth for tier limits and feature access.
 * NEVER hardcode limits in services — always reference POLICY.
 */
export const POLICY = {
  FREE: {
    scansPerMonth: 5,
    gardenAreasLimit: 1,
    coachMessagesPerDay: 3,
    features: new Set<Feature>(["BASIC_ID"]),
    familySeats: 1,
  },
  PREMIUM: {
    scansPerMonth: Infinity,
    gardenAreasLimit: 3,
    coachMessagesPerDay: 50,
    features: new Set<Feature>([
      "BASIC_ID",
      "FULL_PLAN",
      "WEATHER_ALERTS",
      "SYMPTOM_TRACKING",
      "PLANT_HISTORY",
      "FAVORITES",
      "OFFLINE",
    ]),
    familySeats: 1,
  },
  PRO: {
    scansPerMonth: Infinity,
    gardenAreasLimit: Infinity,
    coachMessagesPerDay: Infinity,
    features: new Set<Feature>([
      "BASIC_ID",
      "FULL_PLAN",
      "WEATHER_ALERTS",
      "SYMPTOM_TRACKING",
      "PLANT_HISTORY",
      "FAVORITES",
      "OFFLINE",
      "EXPERT_CHAT",
      "FAMILY_SHARING",
      "AREA_MANAGEMENT",
      "BEFORE_AFTER",
      "EARLY_WEATHER",
    ]),
    familySeats: 5,
  },
} as const;

export const PRICING = {
  PREMIUM: {
    monthly: 9.99,
    yearly: 59.99,
    yearlyDiscount: 0.5, // shown as "50% sparen"
    trialDays: 7,
  },
  PRO: {
    monthly: 19.99,
    yearly: 129.0,
    yearlyDiscount: 0.46,
    trialDays: 7,
  },
} as const;

export function minTierForFeature(feature: Feature): SubscriptionTier {
  if (POLICY.FREE.features.has(feature)) return "FREE";
  if (POLICY.PREMIUM.features.has(feature)) return "PREMIUM";
  return "PRO";
}

export function hasFeature(
  tier: SubscriptionTier,
  feature: Feature
): boolean {
  return POLICY[tier].features.has(feature);
}
