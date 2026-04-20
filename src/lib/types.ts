/**
 * Legacy re-export — new code should import directly from @/domain/types.
 * This shim keeps old imports working during the production refactor.
 */
export type {
  Category,
  Urgency,
  EffortLevel,
  ActionTimeframe,
  MethodType,
} from "@/domain/types";

/** Legacy severity (pre-content-system). */
export type Severity = "NONE" | "MILD" | "MODERATE" | "SEVERE" | "CRITICAL";

// Legacy type adapters used by dashboard components below
import type { EffortLevel, MethodType, ActionTimeframe, Urgency } from "@/domain/types";

/** Legacy simple method shape (pre-content-system). */
export interface Method {
  id: string;
  type: MethodType;
  title: string;
  description: string;
  ingredients?: string[];
  ecoScore?: number;
}

/** Legacy recommendation shape used by dashboard/actions UI. */
export interface Recommendation {
  id: string;
  timeframe: ActionTimeframe;
  title: string;
  description: string;
  steps: string[];
  effort: EffortLevel;
  durationMin: number;
  priority: number;
  methods: Method[];
  completed?: boolean;
}

/** Legacy plant card used on dashboard/garden tiles. */
export interface Plant {
  id: string;
  nickname: string;
  species: string;
  latinName?: string;
  photoUrl: string;
  addedAt: Date;
  zoneLabel: string;
  healthStatus: "HEALTHY" | "ATTENTION" | "CRITICAL" | "RECOVERING";
  lastScanAt?: Date;
  scanCount: number;
}

/** Legacy daily task used on dashboard. */
export interface DailyTask {
  id: string;
  title: string;
  description: string;
  plantId?: string;
  plantName?: string;
  effort: EffortLevel;
  durationMin: number;
  urgency: Urgency;
  source: "SCAN" | "WEATHER" | "SEASONAL" | "USER";
  completed?: boolean;
}

export interface WeatherSnapshot {
  tempC: number;
  condition: string;
  icon: "sun" | "cloud" | "rain" | "snow" | "wind";
  location?: string;
  updatedAt?: Date;
  alert?: {
    type: "frost" | "storm" | "heat" | "heavy_rain";
    message: string;
    inHours: number;
  };
}

export interface CoachMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  citations?: string[];
}

export type SubscriptionTier = "FREE" | "PREMIUM" | "PRO";

export type HealthStatus = "HEALTHY" | "ATTENTION" | "CRITICAL" | "RECOVERING";
