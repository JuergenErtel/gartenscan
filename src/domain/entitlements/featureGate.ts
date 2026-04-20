import type {
  Entitlements,
  Feature,
  PaywallContext,
  Result,
  SubscriptionTier,
} from "@/domain/types";
import { Err, Ok } from "@/domain/types";
import { POLICY, minTierForFeature } from "./policy";

/**
 * FeatureGate – central access control.
 * Every protected capability goes through this. Services must not check
 * tier/limits directly.
 */
export class FeatureGate {
  constructor(private entitlements: Entitlements) {}

  /** Check if the user has access to a feature. Returns paywall context on denial. */
  check(feature: Feature): Result<true, { context: PaywallContext }> {
    if (this.entitlements.features.has(feature)) return Ok(true);
    return Err({
      context: { reason: "FEATURE_REQUIRED", feature },
    });
  }

  /** Check if the user can perform another scan this month. */
  canScan(): Result<true, { context: PaywallContext }> {
    const limit = this.entitlements.scansPerMonth;
    if (limit === Infinity) return Ok(true);
    if (this.entitlements.scansUsedThisMonth < limit) return Ok(true);
    return Err({
      context: {
        reason: "SCAN_LIMIT",
        used: this.entitlements.scansUsedThisMonth,
        limit,
        resetsAt: nextMonthStart(),
      },
    });
  }

  /** Check if the user can send another coach message today. */
  canCoachMessage(): Result<true, { context: PaywallContext }> {
    const limit = this.entitlements.coachMessagesPerDay;
    if (limit === Infinity) return Ok(true);
    if (this.entitlements.coachMessagesUsedToday < limit) return Ok(true);
    return Err({
      context: {
        reason: "FEATURE_REQUIRED",
        feature: "EXPERT_CHAT",
      },
    });
  }

  /** Show a milestone paywall after N successful scans. */
  shouldShowMilestone(totalScans: number): PaywallContext | null {
    if (this.entitlements.tier !== "FREE") return null;
    if (totalScans === 3 || totalScans === 10) {
      return { reason: "MILESTONE_MOMENT", scansCount: totalScans };
    }
    return null;
  }
}

/** Build entitlements from a tier and current usage counters. */
export function buildEntitlements(params: {
  tier: SubscriptionTier;
  scansUsedThisMonth?: number;
  coachMessagesUsedToday?: number;
  trialEndsAt?: Date;
}): Entitlements {
  const policy = POLICY[params.tier];
  return {
    tier: params.tier,
    scansPerMonth: policy.scansPerMonth,
    scansUsedThisMonth: params.scansUsedThisMonth ?? 0,
    gardenAreasLimit: policy.gardenAreasLimit,
    coachMessagesPerDay: policy.coachMessagesPerDay,
    coachMessagesUsedToday: params.coachMessagesUsedToday ?? 0,
    features: policy.features,
    trialEndsAt: params.trialEndsAt,
  };
}

function nextMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

// Re-export for convenience
export { minTierForFeature };
