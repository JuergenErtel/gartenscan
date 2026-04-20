/**
 * gartenscan – domain types.
 * Framework-free: no Next.js, React, or lib imports here.
 */

// ==================== Taxonomy ====================

export type Category =
  | "PLANT"
  | "WEED"
  | "PEST"
  | "BENEFICIAL"
  | "DISEASE"
  | "DAMAGE";

export type Significance =
  | "BENEFIT" // clearly helpful (e.g. ladybug)
  | "NEUTRAL" // no action needed
  | "NUISANCE" // annoying but harmless
  | "HARMFUL" // needs action soon
  | "DANGEROUS"; // urgent, may spread or poison

export type Season = "SPRING" | "SUMMER" | "AUTUMN" | "WINTER";

export type PetType = "DOG" | "CAT" | "OTHER";

export type Urgency = "GONE" | "MONITOR" | "THIS_WEEK" | "IMMEDIATE";

export type ActionTimeframe = "NOW" | "THIS_WEEK" | "LONG_TERM" | "SEASONAL";

export type EffortLevel = "EASY" | "MEDIUM" | "HARD";

export type MethodType =
  | "HOME_REMEDY"
  | "ORGANIC_PRODUCT"
  | "CHEMICAL_PRODUCT"
  | "MECHANICAL"
  | "CULTURAL"
  | "BIOLOGICAL"; // beneficials, predators

export type SolutionStyle = "ORGANIC" | "BALANCED" | "EFFECTIVE";

export type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "EXPERT";

export type UseCase =
  | "PLANTS"
  | "WEEDS"
  | "PESTS"
  | "DISEASES"
  | "IMPROVE"
  | "ALL_OF_IT";

export type GardenArea =
  | "GARDEN"
  | "LAWN"
  | "BED"
  | "BALCONY"
  | "TERRACE"
  | "POTS";

// ==================== Content ====================

export interface Source {
  title: string;
  url?: string;
  type: "official" | "expert" | "community" | "scientific";
}

export interface TreatmentMethod {
  id: string;
  type: MethodType;
  style: SolutionStyle[];
  title: string;
  description: string;
  steps: string[];
  effort: EffortLevel;
  durationMin: number;
  timeframe: ActionTimeframe;
  ingredients?: string[];
  ecoScore: 1 | 2 | 3 | 4 | 5;
  successRate?: "LOW" | "MEDIUM" | "HIGH";
  minExperience: ExperienceLevel;
  safeForChildren: boolean;
  safeForPets: boolean;
  costEur?: "€" | "€€" | "€€€";
}

export interface SafetyInfo {
  toxicToChildren: boolean;
  toxicToPets: PetType[];
  allergyRisk: boolean;
  invasive: boolean;
  notes?: string;
}

export interface ContentEntry {
  id: string;
  category: Category;
  name: string;
  scientificName: string;
  aliases: string[];
  description: string;
  traits: string[];
  significance: Significance;
  defaultUrgency: Urgency;
  habitat: string;
  seasons: Season[];
  areas: GardenArea[];
  confusionRisk: { name: string; note: string }[];
  safety: SafetyInfo;
  methods: TreatmentMethod[];
  prevention: string[];
  sources: Source[];
  contentConfidence: "HIGH" | "MEDIUM" | "LOW";
  version: string;
  imageUrl: string;
}

// ==================== Scan & Diagnosis ====================

export interface CandidateMatch {
  entryId: string;
  confidence: number; // 0..1
}

export interface DetectionResult {
  primary: CandidateMatch;
  alternatives: CandidateMatch[];
  overallConfidence: number;
  needsBetterPhoto: boolean;
  followUpQuestions?: string[];
}

export interface ScanRecord {
  id: string;
  userId: string;
  photoUrl: string;
  capturedAt: Date;
  detection: DetectionResult;
  entry: ContentEntry; // resolved from detection.primary.entryId
  urgency: Urgency;
  userNote?: string;
  isExample?: boolean; // true for onboarding demo
}

// ==================== Recommendations ====================

export interface FilteredRecommendation {
  method: TreatmentMethod;
  priority: number;
  blockedBy?: {
    reason: "CHILD_SAFETY" | "PET_SAFETY" | "EXPERIENCE" | "STYLE";
    message: string;
  };
  recommended: boolean; // true = show as primary, false = show as alternative
}

export interface RecommendationPlan {
  entryId: string;
  urgency: Urgency;
  summary: string;
  nowActions: FilteredRecommendation[];
  thisWeekActions: FilteredRecommendation[];
  longTermActions: FilteredRecommendation[];
  blockedActions: FilteredRecommendation[]; // filtered out for this profile
  warnings: string[]; // safety warnings tailored to profile
}

// ==================== Profile ====================

export interface GardenProfile {
  userId: string;
  name?: string;
  postalCode: string;
  climateZone?: string;
  locationName?: string;
  areas: GardenArea[];
  hasChildren: boolean;
  hasPets: boolean;
  pets: PetType[];
  solutionStyle: SolutionStyle;
  experience: ExperienceLevel;
  useCases: UseCase[];
  createdAt: Date;
  updatedAt: Date;
  onboardingCompletedAt?: Date;
}

// ==================== Onboarding ====================

export type OnboardingStep =
  | "WELCOME"
  | "USE_CASES"
  | "GARDEN"
  | "TRUST"
  | "SCAN"
  | "PREMIUM"
  | "DONE";

export interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  profile: Partial<GardenProfile>;
  startedAt: Date;
  completedAt?: Date;
}

// ==================== Entitlements / Subscription ====================

export type SubscriptionTier = "FREE" | "PREMIUM" | "PRO";

export type Feature =
  | "BASIC_ID"
  | "FULL_PLAN"
  | "WEATHER_ALERTS"
  | "SYMPTOM_TRACKING"
  | "PLANT_HISTORY"
  | "FAVORITES"
  | "OFFLINE"
  | "EXPERT_CHAT"
  | "FAMILY_SHARING"
  | "AREA_MANAGEMENT"
  | "BEFORE_AFTER"
  | "EARLY_WEATHER";

export interface Entitlements {
  tier: SubscriptionTier;
  scansPerMonth: number; // Infinity as -1 for JSON friendliness
  scansUsedThisMonth: number;
  gardenAreasLimit: number;
  coachMessagesPerDay: number;
  coachMessagesUsedToday: number;
  features: Set<Feature>;
  trialEndsAt?: Date;
}

export type PaywallContext =
  | { reason: "SCAN_LIMIT"; used: number; limit: number; resetsAt: Date }
  | { reason: "FEATURE_REQUIRED"; feature: Feature }
  | { reason: "MILESTONE_MOMENT"; scansCount: number }
  | { reason: "CRITICAL_DIAGNOSIS"; scanId: string }
  | { reason: "SEASONAL_CAMPAIGN"; season: Season };

// ==================== Result type ====================

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const Ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const Err = <E>(error: E): Result<never, E> => ({ ok: false, error });
