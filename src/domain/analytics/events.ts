/**
 * Central event dictionary. Every tracker-emitted event must come from here.
 * Keep names snake_case and aligned with the product funnel.
 */
export const EVENT = {
  // Acquisition
  LANDING_VIEWED: "landing_viewed",
  LANDING_CTA_CLICKED: "landing_cta_clicked",

  // Onboarding
  ONBOARDING_STARTED: "onboarding_started",
  ONBOARDING_STEP_VIEWED: "onboarding_step_viewed",
  ONBOARDING_STEP_COMPLETED: "onboarding_step_completed",
  ONBOARDING_GOAL_SELECTED: "onboarding_goal_selected",
  ONBOARDING_ABANDONED: "onboarding_abandoned",
  ONBOARDING_BACK_CLICKED: "onboarding_back_clicked",
  ONBOARDING_SKIP_CLICKED: "onboarding_skip_clicked",
  ONBOARDING_COMPLETED: "onboarding_completed",
  PROFILE_COMPLETED: "profile_completed",
  FIRST_SCAN_CTA_CLICKED: "first_scan_cta_clicked",
  PAYWALL_AFTER_VALUE_VIEWED: "paywall_viewed_after_first_value",

  // Activation
  FIRST_SCAN_STARTED: "first_scan_started",
  FIRST_SCAN_COMPLETED: "first_scan_completed",
  FIRST_VALUE_MOMENT: "first_value_moment_reached",

  // Engagement
  SCAN_STARTED: "scan_started",
  SCAN_COMPLETED: "scan_completed",
  SCAN_LOW_CONFIDENCE: "scan_low_confidence",
  RECOMMENDATION_VIEWED: "recommendation_viewed",
  RECOMMENDATION_COMPLETED: "recommendation_completed",
  COACH_OPENED: "coach_opened",
  COACH_MESSAGE_SENT: "coach_message_sent",
  RESULT_SAVED: "result_saved",
  PLANT_ADDED: "plant_added",

  // Monetization
  PAYWALL_VIEWED: "paywall_viewed",
  PAYWALL_DISMISSED: "paywall_dismissed",
  TRIAL_STARTED: "trial_started",
  SUBSCRIPTION_STARTED: "subscription_started",
  SUBSCRIPTION_CANCELED: "subscription_canceled",

  // Retention
  RETURN_VISIT_7D: "return_visit_7d",
  RETURN_VISIT_30D: "return_visit_30d",
} as const;

export type EventName = (typeof EVENT)[keyof typeof EVENT];

export interface AnalyticsPayload {
  [key: string]: string | number | boolean | null | undefined;
}
