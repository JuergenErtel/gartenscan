# Premium Onboarding Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ersetze das bestehende 6-Screen-Onboarding durch einen Premium-Flow mit 6 Routen (welcome, use-cases, garden, trust, scan, premium), kuratiertem Demo-Scan als Aha-Moment, und Soft-Waitlist-Paywall. Guard-Logik sorgt dafür, dass unvollständige Profile zum Onboarding geleitet werden, abgeschlossene direkt in die App.

**Architecture:** Client-side State via `localStorage` (bestehende `profileStorage` + `onboardingStorage` werden erweitert). Neue Hooks `useOnboarding` und `useOnboardingGuard` kapseln Flow-Logik. Wiederverwendbare UI-Primitive in `src/components/features/onboarding/`. Analytics über bestehenden `ConsoleTracker`, Event-Namen in `src/domain/analytics/events.ts` erweitert. Scan-Route hat 3 Phasen als State-Machine in einer Komponente.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind 4, framer-motion (bereits installiert), lucide-react (bereits installiert).

**Spec reference:** `docs/superpowers/specs/2026-04-20-premium-onboarding-design.md`

---

## File Structure

### Neu zu erstellen

| Pfad | Verantwortung |
|------|---------------|
| `src/hooks/useOnboarding.ts` | Flow-Hook — liest/schreibt onboardingStorage, Actions: advance, goBack, skipToComplete, submitPaywall |
| `src/hooks/useOnboardingGuard.ts` | Redirect-Logik für onboarding vs. app Routes |
| `src/lib/storage/waitlist.ts` | Waitlist-Email-Storage + extractEmailDomain-Helper |
| `src/domain/analytics/onboarding.ts` | trackOnboardingEvent-Wrapper um ConsoleTracker |
| `src/components/features/onboarding/OnboardingShell.tsx` | Layout-Wrapper mit Back-Pfeil + ProgressDots |
| `src/components/features/onboarding/OnboardingHeadline.tsx` | Serif-Title + Sub-Zeile |
| `src/components/features/onboarding/ProgressDots.tsx` | 6 Mini-Dots, aktuelle Position hervorgehoben |
| `src/components/features/onboarding/SelectableCard.tsx` | Multi-Select-Karte mit Check-Badge |
| `src/components/features/onboarding/ChipGroup.tsx` | Multi-Select-Chips |
| `src/components/features/onboarding/SegmentedControl.tsx` | Single-Select Segmented-Button |
| `src/components/features/onboarding/YesNoToggle.tsx` | Pill-Toggle Ja/Nein |
| `src/components/features/onboarding/TrustStepCard.tsx` | Eine der 3 Trust-Karten |
| `src/components/features/onboarding/DemoScanCard.tsx` | Demo-Picker-Karte mit Bild |
| `src/components/features/onboarding/AnalyzingOverlay.tsx` | Fullscreen-Overlay mit rotierendem Ring + Status-Zeilen |
| `src/components/features/onboarding/CompactResultView.tsx` | Kompakte Result-View mit blurred-teaser-Cards |
| `src/components/features/onboarding/WaitlistCTA.tsx` | Email-Submit + Danke-State |
| `src/components/features/onboarding/OnboardingGuard.tsx` | Wrapper-Component für App-Routes |
| `src/app/onboarding/layout.tsx` | Route-Layout mit Guard + Shell + Footer-Hide |
| `src/app/onboarding/scan/page.tsx` | NEUE Route mit 3 Phasen |
| `src/app/onboarding/premium/page.tsx` | NEUE Route für Paywall |

### Zu ändern

| Pfad | Grund |
|------|-------|
| `src/domain/types.ts` | UseCase erweitern um `ALL_OF_IT`, GardenProfile um `hasPets`, OnboardingStep um `SCAN` und `PREMIUM` |
| `src/domain/analytics/events.ts` | Neue Event-Namen hinzufügen (step_viewed, goal_selected, cta_clicked, paywall_after_value) |
| `src/lib/storage/profile.ts` | `markComplete(data)`-Action hinzufügen; `isComplete` erweitern um `onboardingCompletedAt` |
| `src/app/onboarding/welcome/page.tsx` | Rebuild Premium-Design |
| `src/app/onboarding/use-cases/page.tsx` | Rebuild mit SelectableCards + neuer Option ALL_OF_IT |
| `src/app/onboarding/garden/page.tsx` | Rebuild mit 2 Sektionen (konsolidiert style + trust-Felder) |
| `src/app/onboarding/trust/page.tsx` | Rebuild als 3-Step How-it-works |
| `src/app/app/page.tsx` | OnboardingGuard einhüllen |
| `src/app/scan/[id]/page.tsx` | OnboardingGuard einhüllen |
| `src/app/scan/[id]/actions/page.tsx` | OnboardingGuard einhüllen |
| `src/app/garden/page.tsx` | OnboardingGuard einhüllen |
| `src/app/garden/[plantId]/page.tsx` | OnboardingGuard einhüllen |
| `src/app/coach/page.tsx` | OnboardingGuard einhüllen |
| `src/app/history/page.tsx` | OnboardingGuard einhüllen |
| `src/app/premium/page.tsx` | OnboardingGuard einhüllen |
| `src/app/layout.tsx` | Footer auf onboarding-Routes ausblenden (via pathname-check in Client-Wrapper) |
| `next.config.mjs` | Redirects für entfernte `/onboarding/style` und `/onboarding/first-scan` |

### Zu löschen

| Pfad | Grund |
|------|-------|
| `src/app/onboarding/style/page.tsx` (ganzes Verzeichnis) | Inhalt zieht in `/onboarding/garden` Sektion B |
| `src/app/onboarding/first-scan/page.tsx` (ganzes Verzeichnis) | Ersetzt durch `/onboarding/scan` mit 3 Phasen |

---

## Task 1: Domain-Types erweitern

**Files:**
- Modify: `src/domain/types.ts`

- [ ] **Step 1: UseCase-Enum ergänzen**

Finde in `src/domain/types.ts` die Zeile:
```ts
export type UseCase = "PLANTS" | "WEEDS" | "PESTS" | "DISEASES" | "IMPROVE";
```

Ersetze durch:
```ts
export type UseCase =
  | "PLANTS"
  | "WEEDS"
  | "PESTS"
  | "DISEASES"
  | "IMPROVE"
  | "ALL_OF_IT";
```

- [ ] **Step 2: GardenProfile um `hasPets` ergänzen**

Finde:
```ts
export interface GardenProfile {
  userId: string;
  name?: string;
  postalCode: string;
  climateZone?: string;
  locationName?: string;
  areas: GardenArea[];
  hasChildren: boolean;
  pets: PetType[];
  solutionStyle: SolutionStyle;
  experience: ExperienceLevel;
  useCases: UseCase[];
  createdAt: Date;
  updatedAt: Date;
}
```

Ersetze durch (fügt `hasPets` hinzu und optionale `onboardingCompletedAt`):
```ts
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
```

- [ ] **Step 3: OnboardingStep ergänzen**

Finde:
```ts
export type OnboardingStep =
  | "WELCOME"
  | "USE_CASES"
  | "GARDEN"
  | "STYLE"
  | "TRUST"
  | "FIRST_SCAN"
  | "DONE";
```

Ersetze durch (entfernt `STYLE` + `FIRST_SCAN`, fügt `SCAN` + `PREMIUM` hinzu):
```ts
export type OnboardingStep =
  | "WELCOME"
  | "USE_CASES"
  | "GARDEN"
  | "TRUST"
  | "SCAN"
  | "PREMIUM"
  | "DONE";
```

- [ ] **Step 4: Build check**

Run:
```bash
cd /c/users/juerg/gartenscanner && npm run build 2>&1 | grep -E "Compiled|Error" | head -5
```
Expected: `✓ Compiled successfully`. Falls TS-Fehler auftauchen, weil alte Code-Stellen auf `STYLE` oder `FIRST_SCAN` referenzieren, diese als DONE_WITH_CONCERNS melden — sie werden in Task 5 (useOnboarding) oder Task 15 (Scan-Screen) aufgelöst, wenn alte Screens entfernt werden. Für jetzt notieren.

- [ ] **Step 5: Commit**

```bash
git add src/domain/types.ts
git commit -m "feat(types): extend UseCase, add hasPets + onboardingCompletedAt, update OnboardingStep"
```

---

## Task 2: Profile-Storage um markComplete erweitern

**Files:**
- Modify: `src/lib/storage/profile.ts`

- [ ] **Step 1: Ersetze gesamten Inhalt**

Ersetze den kompletten Inhalt von `src/lib/storage/profile.ts` durch:

```ts
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
```

- [ ] **Step 2: Build check**

```bash
cd /c/users/juerg/gartenscanner && npm run build 2>&1 | grep -E "Compiled|Error" | head -5
```
Expected: `✓ Compiled successfully`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/storage/profile.ts
git commit -m "feat(storage): add markComplete action with profile defaults"
```

---

## Task 3: Waitlist-Storage + Email-Domain-Helper

**Files:**
- Create: `src/lib/storage/waitlist.ts`

- [ ] **Step 1: Datei erstellen**

```ts
"use client";

const WAITLIST_KEY = "gartenscan:waitlist_emails:v1";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const waitlistStorage = {
  add(email: string): void {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(WAITLIST_KEY);
      const existing = raw ? (JSON.parse(raw) as string[]) : [];
      if (!existing.includes(email)) {
        existing.push(email);
        localStorage.setItem(WAITLIST_KEY, JSON.stringify(existing));
      }
    } catch {
      // ignore localStorage errors (quota, private mode)
    }
  },

  all(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(WAITLIST_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  },
};

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function extractEmailDomain(email: string): string {
  const at = email.lastIndexOf("@");
  if (at < 0) return "";
  return email.slice(at + 1).toLowerCase();
}
```

- [ ] **Step 2: Build check**
```bash
cd /c/users/juerg/gartenscanner && npm run build 2>&1 | grep -E "Compiled|Error" | head -5
```
Expected: `✓ Compiled successfully`.

- [ ] **Step 3: Commit**
```bash
git add src/lib/storage/waitlist.ts
git commit -m "feat(storage): add waitlist email storage + email domain helper"
```

---

## Task 4: Analytics-Events-Dictionary erweitern

**Files:**
- Modify: `src/domain/analytics/events.ts`

- [ ] **Step 1: Erweitere den EVENT-Dictionary**

Finde in `src/domain/analytics/events.ts` den `Onboarding`-Block:
```ts
  // Onboarding
  ONBOARDING_STARTED: "onboarding_started",
  ONBOARDING_STEP_COMPLETED: "onboarding_step_completed",
  ONBOARDING_ABANDONED: "onboarding_abandoned",
  ONBOARDING_COMPLETED: "onboarding_completed",
  PROFILE_COMPLETED: "profile_completed",
```

Ersetze durch:
```ts
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
```

- [ ] **Step 2: Build check**
```bash
cd /c/users/juerg/gartenscanner && npm run build 2>&1 | grep -E "Compiled|Error" | head -5
```
Expected: `✓ Compiled successfully`.

- [ ] **Step 3: Commit**
```bash
git add src/domain/analytics/events.ts
git commit -m "feat(analytics): add onboarding-specific event names"
```

---

## Task 5: Onboarding-Analytics-Helper

**Files:**
- Create: `src/domain/analytics/onboarding.ts`

- [ ] **Step 1: Datei erstellen**

```ts
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
```

- [ ] **Step 2: Build check**
```bash
cd /c/users/juerg/gartenscanner && npm run build 2>&1 | grep -E "Compiled|Error" | head -5
```
Expected: `✓ Compiled successfully`.

- [ ] **Step 3: Commit**
```bash
git add src/domain/analytics/onboarding.ts
git commit -m "feat(analytics): onboarding event helper module"
```

---

## Task 6: useOnboarding-Hook

**Files:**
- Create: `src/hooks/useOnboarding.ts`

- [ ] **Step 1: Datei erstellen**

```ts
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
```

- [ ] **Step 2: Build check**
```bash
cd /c/users/juerg/gartenscanner && npm run build 2>&1 | grep -E "Compiled|Error" | head -5
```
Expected: `✓ Compiled successfully`.

- [ ] **Step 3: Commit**
```bash
git add src/hooks/useOnboarding.ts
git commit -m "feat(hooks): add useOnboarding flow hook"
```

---

## Task 7: useOnboardingGuard-Hook

**Files:**
- Create: `src/hooks/useOnboardingGuard.ts`

- [ ] **Step 1: Datei erstellen**

```ts
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { profileStorage, onboardingStorage } from "@/lib/storage/profile";

export interface GuardResult {
  ready: boolean;
}

/**
 * Guard-Logik:
 * - onboarding-Routes mit abgeschlossenem Profil → Redirect /app
 * - app-Routes ohne abgeschlossenem Profil → Redirect /onboarding/<letzter-step>
 * - Während Loading (Pre-Mount) wird { ready: false } zurückgegeben; Komponenten rendern nichts.
 */
export function useOnboardingGuard(): GuardResult {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const completed = profileStorage.isComplete();
    const isOnboardingRoute = pathname?.startsWith("/onboarding");

    if (isOnboardingRoute && completed) {
      router.replace("/app");
      return;
    }
    if (!isOnboardingRoute && !completed) {
      const state = onboardingStorage.get();
      const step = state?.currentStep ?? "WELCOME";
      const target =
        step === "DONE" ? "/onboarding/welcome" : routeForStep(step);
      router.replace(target);
      return;
    }

    setReady(true);
  }, [router, pathname]);

  return { ready };
}

function routeForStep(step: string): string {
  const map: Record<string, string> = {
    WELCOME: "/onboarding/welcome",
    USE_CASES: "/onboarding/use-cases",
    GARDEN: "/onboarding/garden",
    TRUST: "/onboarding/trust",
    SCAN: "/onboarding/scan",
    PREMIUM: "/onboarding/premium",
  };
  return map[step] ?? "/onboarding/welcome";
}
```

- [ ] **Step 2: Build check**
```bash
cd /c/users/juerg/gartenscanner && npm run build 2>&1 | grep -E "Compiled|Error" | head -5
```
Expected: `✓ Compiled successfully`.

- [ ] **Step 3: Commit**
```bash
git add src/hooks/useOnboardingGuard.ts
git commit -m "feat(hooks): add useOnboardingGuard redirect logic"
```

---

## Task 8: ProgressDots + OnboardingHeadline

**Files:**
- Create: `src/components/features/onboarding/ProgressDots.tsx`
- Create: `src/components/features/onboarding/OnboardingHeadline.tsx`

- [ ] **Step 1: ProgressDots**

Create `src/components/features/onboarding/ProgressDots.tsx`:
```tsx
"use client";

import { cn } from "@/lib/utils";

interface Props {
  total?: number;
  active: number; // 1-indexed
  className?: string;
}

export function ProgressDots({ total = 6, active, className }: Props) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1.5",
        className
      )}
      aria-label={`Schritt ${active} von ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const index = i + 1;
        const isActive = index === active;
        return (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              isActive
                ? "w-6 bg-forest-700"
                : index < active
                ? "w-1.5 bg-forest-700/40"
                : "w-1.5 bg-forest-700/15"
            )}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: OnboardingHeadline**

Create `src/components/features/onboarding/OnboardingHeadline.tsx`:
```tsx
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subtitle?: string;
  className?: string;
}

export function OnboardingHeadline({ title, subtitle, className }: Props) {
  return (
    <div className={cn("mb-8", className)}>
      <h1 className="font-serif text-[28px] leading-[1.1] text-forest-900 mb-2 font-normal tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[15px] leading-relaxed text-ink-muted">
          {subtitle}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Build check**
```bash
cd /c/users/juerg/gartenscanner && npm run build 2>&1 | grep -E "Compiled|Error" | head -5
```
Expected: `✓ Compiled successfully`.

- [ ] **Step 4: Commit**
```bash
git add src/components/features/onboarding/
git commit -m "feat(onboarding): add ProgressDots and OnboardingHeadline"
```

---

## Task 9: Selection-Primitives (SelectableCard, ChipGroup, SegmentedControl, YesNoToggle)

**Files:**
- Create: `src/components/features/onboarding/SelectableCard.tsx`
- Create: `src/components/features/onboarding/ChipGroup.tsx`
- Create: `src/components/features/onboarding/SegmentedControl.tsx`
- Create: `src/components/features/onboarding/YesNoToggle.tsx`

- [ ] **Step 1: SelectableCard**

```tsx
"use client";

import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  icon: LucideIcon;
  label: string;
  selected: boolean;
  onToggle: () => void;
  className?: string;
}

export function SelectableCard({
  icon: Icon,
  label,
  selected,
  onToggle,
  className,
}: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 rounded-2xl border bg-paper p-5 text-center transition active:scale-[0.98]",
        selected
          ? "border-forest-700 shadow-[0_4px_20px_rgba(28,42,33,0.08)]"
          : "border-sage-200/80 hover:border-sage-300",
        className
      )}
    >
      {selected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-forest-700 text-paper">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
      <Icon
        className={cn(
          "h-7 w-7 transition",
          selected ? "text-forest-700" : "text-ink-muted"
        )}
        strokeWidth={1.75}
      />
      <span
        className={cn(
          "text-[14px] font-medium transition",
          selected ? "text-forest-900" : "text-forest-900/80"
        )}
      >
        {label}
      </span>
    </button>
  );
}
```

- [ ] **Step 2: ChipGroup**

```tsx
"use client";

import { cn } from "@/lib/utils";

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: ChipOption<T>[];
  selected: T[];
  onToggle: (value: T) => void;
  className?: string;
}

export function ChipGroup<T extends string>({
  options,
  selected,
  onToggle,
  className,
}: Props<T>) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            aria-pressed={isSelected}
            className={cn(
              "rounded-full px-4 py-2 text-[13px] font-medium transition active:scale-[0.97]",
              isSelected
                ? "bg-forest-700 text-paper"
                : "bg-paper text-forest-900/80 border border-sage-200/80 hover:border-sage-300"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: SegmentedControl**

```tsx
"use client";

import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: SegmentOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: Props<T>) {
  return (
    <div
      className={cn(
        "inline-flex w-full rounded-xl bg-sage-100 p-1",
        className
      )}
      role="radiogroup"
    >
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-[13px] font-medium transition",
              isActive
                ? "bg-paper text-forest-900 shadow-[0_1px_3px_rgba(28,42,33,0.08)]"
                : "text-forest-900/70 hover:text-forest-900"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: YesNoToggle**

```tsx
"use client";

import { cn } from "@/lib/utils";

interface Props {
  value: boolean | null;
  onChange: (value: boolean) => void;
  className?: string;
  ariaLabel?: string;
}

export function YesNoToggle({
  value,
  onChange,
  className,
  ariaLabel,
}: Props) {
  return (
    <div
      className={cn(
        "inline-flex rounded-full bg-sage-100 p-1",
        className
      )}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {[
        { val: true, label: "Ja" },
        { val: false, label: "Nein" },
      ].map(({ val, label }) => {
        const isActive = value === val;
        return (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(val)}
            className={cn(
              "rounded-full px-5 py-1.5 text-[13px] font-medium transition min-w-[60px]",
              isActive
                ? "bg-paper text-forest-900 shadow-[0_1px_3px_rgba(28,42,33,0.08)]"
                : "text-forest-900/70"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 5: Build check**
```bash
cd /c/users/juerg/gartenscanner && npm run build 2>&1 | grep -E "Compiled|Error" | head -5
```
Expected: `✓ Compiled successfully`.

- [ ] **Step 6: Commit**
```bash
git add src/components/features/onboarding/
git commit -m "feat(onboarding): add selection primitives (SelectableCard, ChipGroup, SegmentedControl, YesNoToggle)"
```

---

## Task 10: OnboardingShell + OnboardingGuard + Onboarding-Layout + Footer-Hide

**Files:**
- Create: `src/components/features/onboarding/OnboardingShell.tsx`
- Create: `src/components/features/onboarding/OnboardingGuard.tsx`
- Create: `src/app/onboarding/layout.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: OnboardingShell**

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressDots } from "./ProgressDots";

interface Props {
  step: number; // 1..6
  hideProgress?: boolean;
  hideBack?: boolean;
  backHref?: string;
  children: React.ReactNode;
  className?: string;
}

export function OnboardingShell({
  step,
  hideProgress,
  hideBack,
  backHref,
  children,
  className,
}: Props) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "min-h-[100dvh] bg-sage-50 flex flex-col safe-top",
        className
      )}
    >
      <header className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="w-10">
          {!hideBack &&
            (backHref ? (
              <Link
                href={backHref}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-paper/80 hover:bg-paper active:scale-95 transition"
                aria-label="Zurück"
              >
                <ArrowLeft className="h-5 w-5 text-forest-700" />
              </Link>
            ) : (
              <button
                onClick={() => router.back()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-paper/80 hover:bg-paper active:scale-95 transition"
                aria-label="Zurück"
              >
                <ArrowLeft className="h-5 w-5 text-forest-700" />
              </button>
            ))}
        </div>
        <div className="flex-1 flex justify-center">
          {!hideProgress && <ProgressDots active={step} />}
        </div>
        <div className="w-10" />
      </header>
      <main className="flex-1 flex flex-col mx-auto w-full max-w-lg px-5 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: OnboardingGuard**

```tsx
"use client";

import { useOnboardingGuard } from "@/hooks/useOnboardingGuard";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { ready } = useOnboardingGuard();
  if (!ready) {
    return <div className="min-h-[100dvh] bg-sage-50" aria-hidden />;
  }
  return <>{children}</>;
}
```

- [ ] **Step 3: src/app/onboarding/layout.tsx**

```tsx
import { OnboardingGuard } from "@/components/features/onboarding/OnboardingGuard";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OnboardingGuard>{children}</OnboardingGuard>;
}
```

- [ ] **Step 4: Footer auf Onboarding-Routes ausblenden**

Lese zuerst `src/app/layout.tsx`, dann ersetze den `<body>`-Inhalt, indem du einen Client-Wrapper einbaust, der den Footer auf `/onboarding/*`-Pfaden nicht rendert.

Neue Datei erstellen `src/components/layout/ConditionalFooter.tsx`:

```tsx
"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/onboarding")) return null;
  return <Footer />;
}
```

Dann in `src/app/layout.tsx`:

Finde:
```tsx
import { Footer } from "@/components/layout/Footer";
```
Ersetze durch:
```tsx
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";
```

Und finde:
```tsx
        {children}
        <Footer />
        <Analytics />
```
Ersetze durch:
```tsx
        {children}
        <ConditionalFooter />
        <Analytics />
```

- [ ] **Step 5: Build check**
```bash
cd /c/users/juerg/gartenscanner && npm run build 2>&1 | grep -E "Compiled|Error" | head -5
```
Expected: `✓ Compiled successfully`.

- [ ] **Step 6: Commit**
```bash
git add src/components/features/onboarding/OnboardingShell.tsx src/components/features/onboarding/OnboardingGuard.tsx src/app/onboarding/layout.tsx src/components/layout/ConditionalFooter.tsx src/app/layout.tsx
git commit -m "feat(onboarding): add shell, guard wrapper, route layout, hide footer on onboarding"
```

---

## Task 11: Delete old routes + Redirects

**Files:**
- Delete: `src/app/onboarding/style/` (entire dir)
- Delete: `src/app/onboarding/first-scan/` (entire dir)
- Modify: `next.config.mjs`

- [ ] **Step 1: Alte Routen löschen**

```bash
cd /c/users/juerg/gartenscanner && rm -rf src/app/onboarding/style src/app/onboarding/first-scan
```

- [ ] **Step 2: Redirects in next.config.mjs ergänzen**

Ersetze gesamten Inhalt von `next.config.mjs` durch:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.2.42", "localhost"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/onboarding/style",
        destination: "/onboarding/garden",
        permanent: false,
      },
      {
        source: "/onboarding/first-scan",
        destination: "/onboarding/scan",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 3: Build check**
```bash
cd /c/users/juerg/gartenscanner && npm run build 2>&1 | grep -E "Compiled|Error" | head -5
```
Expected: `✓ Compiled successfully`. Wenn TypeScript-Fehler wegen Referenzen auf alte Routen — notieren für spätere Tasks.

- [ ] **Step 4: Commit**
```bash
git add -A src/app/onboarding/ next.config.mjs
git commit -m "chore(onboarding): delete style + first-scan routes, add redirects"
```

---

## Task 12: Welcome-Screen

**Files:**
- Modify: `src/app/onboarding/welcome/page.tsx` (komplett ersetzen)

- [ ] **Step 1: Komplette Datei ersetzen**

```tsx
"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { OnboardingShell } from "@/components/features/onboarding/OnboardingShell";
import {
  trackOnboardingStarted,
  trackOnboardingStepViewed,
} from "@/domain/analytics/onboarding";

const STARTED_FLAG = "gartenscan:onboarding_started_flag";

export default function WelcomePage() {
  const startedRef = useRef(false);

  useEffect(() => {
    trackOnboardingStepViewed("WELCOME");
    if (!startedRef.current) {
      const alreadyStarted = sessionStorage.getItem(STARTED_FLAG);
      if (!alreadyStarted) {
        trackOnboardingStarted(
          document.referrer.includes(window.location.host)
            ? "landing"
            : "direct"
        );
        sessionStorage.setItem(STARTED_FLAG, "1");
      }
      startedRef.current = true;
    }
  }, []);

  return (
    <OnboardingShell step={1} hideBack>
      <div className="flex-1 flex flex-col items-center justify-center pb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mb-10"
        >
          <HeroVisual />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="text-center max-w-md mx-auto"
        >
          <h1 className="font-serif text-[34px] leading-[1.05] text-forest-900 mb-3 font-normal tracking-tight">
            Erkenne jedes Gartenproblem in Sekunden.
          </h1>
          <p className="text-[16px] leading-relaxed text-ink-muted">
            Foto machen. Verstehen. Richtig lösen.
          </p>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
        className="flex flex-col gap-3"
      >
        <Link
          href="/onboarding/use-cases"
          className="flex h-13 items-center justify-center rounded-full bg-clay-500 hover:bg-clay-600 text-paper text-[15px] font-semibold px-6 active:scale-[0.98] transition"
          style={{ height: 52 }}
        >
          Los geht's
        </Link>
        <span className="text-center text-[12px] text-ink-muted/70 pt-1">
          Schon Nutzer? Später einloggen
        </span>
      </motion.div>
    </OnboardingShell>
  );
}

function HeroVisual() {
  return (
    <div className="relative h-44 w-44 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sage-200/60 to-forest-100/40 blur-2xl" />
      <div className="absolute inset-4 rounded-full border-2 border-forest-700/20" />
      <div className="absolute inset-8 rounded-full border border-forest-700/10" />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-paper shadow-[0_6px_24px_rgba(28,42,33,0.12)]">
        <Sparkles className="h-8 w-8 text-forest-700" strokeWidth={1.5} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build check**
```bash
cd /c/users/juerg/gartenscanner && npm run build 2>&1 | grep -E "Compiled|Error" | head -5
```
Expected: `✓ Compiled successfully`.

- [ ] **Step 3: Commit**
```bash
git add src/app/onboarding/welcome/page.tsx
git commit -m "feat(onboarding): rebuild welcome screen with premium hero"
```

---

## Task 13: Use-Cases-Screen

**Files:**
- Modify: `src/app/onboarding/use-cases/page.tsx` (komplett ersetzen)

- [ ] **Step 1: Komplette Datei ersetzen**

```tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Leaf,
  Sprout,
  Bug,
  Stethoscope,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { OnboardingShell } from "@/components/features/onboarding/OnboardingShell";
import { OnboardingHeadline } from "@/components/features/onboarding/OnboardingHeadline";
import { SelectableCard } from "@/components/features/onboarding/SelectableCard";
import { useOnboarding } from "@/hooks/useOnboarding";
import {
  trackOnboardingStepViewed,
  trackGoalsSelected,
} from "@/domain/analytics/onboarding";
import type { UseCase } from "@/domain/types";

const OPTIONS: Array<{ id: UseCase; label: string; icon: typeof Leaf }> = [
  { id: "PLANTS", label: "Pflanzen erkennen", icon: Leaf },
  { id: "WEEDS", label: "Unkraut", icon: Sprout },
  { id: "PESTS", label: "Schädlinge", icon: Bug },
  { id: "DISEASES", label: "Krankheiten", icon: Stethoscope },
  { id: "IMPROVE", label: "Gartenideen", icon: Lightbulb },
  { id: "ALL_OF_IT", label: "Alles davon", icon: Sparkles },
];

export default function UseCasesPage() {
  const { advance, state } = useOnboarding();
  const [selected, setSelected] = useState<UseCase[]>([]);

  useEffect(() => {
    trackOnboardingStepViewed("USE_CASES");
  }, []);

  useEffect(() => {
    if (state?.profile.useCases) {
      setSelected(state.profile.useCases);
    }
  }, [state]);

  function toggle(id: UseCase) {
    setSelected((prev) => {
      if (id === "ALL_OF_IT") {
        return prev.includes("ALL_OF_IT") ? [] : ["ALL_OF_IT"];
      }
      const withoutAll = prev.filter((x) => x !== "ALL_OF_IT");
      return withoutAll.includes(id)
        ? withoutAll.filter((x) => x !== id)
        : [...withoutAll, id];
    });
  }

  function onSubmit() {
    if (selected.length === 0) return;
    trackGoalsSelected(selected);
    advance("USE_CASES", { useCases: selected });
  }

  const enabled = selected.length > 0;

  return (
    <OnboardingShell step={2}>
      <div className="pt-6 flex-1">
        <OnboardingHeadline
          title="Wobei brauchst du Hilfe?"
          subtitle="Mehrfachauswahl möglich. Du kannst später alles ändern."
        />
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.06 } },
            hidden: {},
          }}
        >
          {OPTIONS.map((opt) => (
            <motion.div
              key={opt.id}
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <SelectableCard
                icon={opt.icon}
                label={opt.label}
                selected={selected.includes(opt.id)}
                onToggle={() => toggle(opt.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
      <div className="pt-4">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!enabled}
          className={`flex h-13 w-full items-center justify-center rounded-full text-[15px] font-semibold transition ${
            enabled
              ? "bg-clay-500 hover:bg-clay-600 text-paper active:scale-[0.98]"
              : "bg-sage-200 text-forest-900/40 cursor-not-allowed"
          }`}
          style={{ height: 52 }}
        >
          Weiter
        </button>
      </div>
    </OnboardingShell>
  );
}
```

- [ ] **Step 2: Build check**
```bash
cd /c/users/juerg/gartenscanner && npm run build 2>&1 | grep -E "Compiled|Error" | head -5
```
Expected: `✓ Compiled successfully`.

- [ ] **Step 3: Commit**
```bash
git add src/app/onboarding/use-cases/page.tsx
git commit -m "feat(onboarding): rebuild use-cases screen with selectable cards"
```

---

## Task 14: Garden-Screen

**Files:**
- Modify: `src/app/onboarding/garden/page.tsx` (komplett ersetzen)

- [ ] **Step 1: Komplette Datei ersetzen**

```tsx
"use client";

import { useEffect, useState } from "react";
import { OnboardingShell } from "@/components/features/onboarding/OnboardingShell";
import { OnboardingHeadline } from "@/components/features/onboarding/OnboardingHeadline";
import { ChipGroup } from "@/components/features/onboarding/ChipGroup";
import { SegmentedControl } from "@/components/features/onboarding/SegmentedControl";
import { YesNoToggle } from "@/components/features/onboarding/YesNoToggle";
import { useOnboarding } from "@/hooks/useOnboarding";
import {
  trackOnboardingStepViewed,
  trackProfileCompleted,
} from "@/domain/analytics/onboarding";
import type {
  GardenArea,
  SolutionStyle,
  ExperienceLevel,
} from "@/domain/types";

const AREA_OPTIONS: Array<{ value: GardenArea; label: string }> = [
  { value: "GARDEN", label: "Garten" },
  { value: "LAWN", label: "Rasen" },
  { value: "BED", label: "Beet" },
  { value: "BALCONY", label: "Balkon" },
  { value: "TERRACE", label: "Terrasse" },
  { value: "POTS", label: "Topfpflanzen" },
];

const STYLE_OPTIONS: Array<{ value: SolutionStyle; label: string }> = [
  { value: "ORGANIC", label: "Bio" },
  { value: "BALANCED", label: "Ausgewogen" },
  { value: "EFFECTIVE", label: "Schnell" },
];

const EXP_OPTIONS: Array<{ value: ExperienceLevel; label: string }> = [
  { value: "BEGINNER", label: "Anfänger" },
  { value: "INTERMEDIATE", label: "Fortgeschritten" },
];

export default function GardenPage() {
  const { advance, state } = useOnboarding();
  const [areas, setAreas] = useState<GardenArea[]>([]);
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [hasPets, setHasPets] = useState<boolean | null>(null);
  const [style, setStyle] = useState<SolutionStyle | null>(null);
  const [exp, setExp] = useState<ExperienceLevel | null>(null);
  const [showAreaError, setShowAreaError] = useState(false);

  useEffect(() => {
    trackOnboardingStepViewed("GARDEN");
  }, []);

  useEffect(() => {
    if (!state?.profile) return;
    const p = state.profile;
    if (p.areas) setAreas(p.areas);
    if (typeof p.hasChildren === "boolean") setHasChildren(p.hasChildren);
    if (typeof p.hasPets === "boolean") setHasPets(p.hasPets);
    if (p.solutionStyle) setStyle(p.solutionStyle);
    if (p.experience) setExp(p.experience);
  }, [state]);

  function toggleArea(v: GardenArea) {
    setAreas((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
    setShowAreaError(false);
  }

  function onSubmit() {
    if (areas.length === 0) {
      setShowAreaError(true);
      return;
    }
    const resolvedStyle: SolutionStyle = style ?? "BALANCED";
    const resolvedExp: ExperienceLevel = exp ?? "BEGINNER";
    const resolvedHasChildren = hasChildren ?? false;
    const resolvedHasPets = hasPets ?? false;

    trackProfileCompleted({
      areas,
      hasChildren: resolvedHasChildren,
      hasPets: resolvedHasPets,
      solutionStyle: resolvedStyle,
      experience: resolvedExp,
    });

    advance("GARDEN", {
      areas,
      hasChildren: resolvedHasChildren,
      hasPets: resolvedHasPets,
      pets: resolvedHasPets ? ["DOG"] : [],
      solutionStyle: resolvedStyle,
      experience: resolvedExp,
    });
  }

  return (
    <OnboardingShell step={3}>
      <div className="pt-6 flex-1 pb-6">
        <OnboardingHeadline
          title="Erzähl uns kurz von dir."
          subtitle="Damit unsere Empfehlungen zu dir passen."
        />

        <section className="mb-8">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink-muted mb-3">
            Dein Garten
          </h2>
          <div className="rounded-2xl bg-paper p-5 space-y-5 border border-sage-200/60">
            <div>
              <label className="block text-[13px] font-medium text-forest-900 mb-2">
                Bereich
              </label>
              <ChipGroup
                options={AREA_OPTIONS}
                selected={areas}
                onToggle={toggleArea}
              />
              {showAreaError && (
                <p className="mt-2 text-[12px] text-clay-600">
                  Wähle mindestens einen Bereich
                </p>
              )}
            </div>
            <Row label="Kinder im Haushalt">
              <YesNoToggle
                value={hasChildren}
                onChange={setHasChildren}
                ariaLabel="Kinder im Haushalt"
              />
            </Row>
            <Row label="Haustiere">
              <YesNoToggle
                value={hasPets}
                onChange={setHasPets}
                ariaLabel="Haustiere"
              />
            </Row>
          </div>
        </section>

        <section>
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink-muted mb-3">
            Deine Vorlieben
          </h2>
          <div className="rounded-2xl bg-paper p-5 space-y-5 border border-sage-200/60">
            <div>
              <label className="block text-[13px] font-medium text-forest-900 mb-2">
                Lösungsart
              </label>
              <SegmentedControl
                options={STYLE_OPTIONS}
                value={style}
                onChange={setStyle}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-forest-900 mb-2">
                Erfahrung
              </label>
              <SegmentedControl
                options={EXP_OPTIONS}
                value={exp}
                onChange={setExp}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onSubmit}
          className="flex h-13 w-full items-center justify-center rounded-full bg-clay-500 hover:bg-clay-600 text-paper text-[15px] font-semibold transition active:scale-[0.98]"
          style={{ height: 52 }}
        >
          Weiter
        </button>
      </div>
    </OnboardingShell>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[14px] font-medium text-forest-900">{label}</span>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Build check**
```bash
cd /c/users/juerg/gartenscanner && npm run build 2>&1 | grep -E "Compiled|Error" | head -5
```
Expected: `✓ Compiled successfully`.

- [ ] **Step 3: Commit**
```bash
git add src/app/onboarding/garden/page.tsx
git commit -m "feat(onboarding): rebuild garden screen with consolidated profile sections"
```

---

## Task 15: Trust-Screen

**Files:**
- Create: `src/components/features/onboarding/TrustStepCard.tsx`
- Modify: `src/app/onboarding/trust/page.tsx` (komplett ersetzen)

- [ ] **Step 1: TrustStepCard erstellen**

```tsx
"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  number: number;
  icon: LucideIcon;
  title: string;
  text: string;
  className?: string;
}

export function TrustStepCard({
  number,
  icon: Icon,
  title,
  text,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "relative flex gap-4 rounded-2xl bg-paper p-5 border border-sage-200/60",
        className
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest-700/5">
        <Icon className="h-6 w-6 text-forest-700" strokeWidth={1.75} />
      </div>
      <div className="flex-1 pt-0.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted/80 mb-0.5">
          Schritt {number}
        </div>
        <h3 className="text-[16px] font-semibold text-forest-900 mb-1">
          {title}
        </h3>
        <p className="text-[13px] leading-relaxed text-ink-muted">{text}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Trust-Page ersetzen**

Ersetze gesamten Inhalt von `src/app/onboarding/trust/page.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Sparkles, CheckCircle2 } from "lucide-react";
import { OnboardingShell } from "@/components/features/onboarding/OnboardingShell";
import { OnboardingHeadline } from "@/components/features/onboarding/OnboardingHeadline";
import { TrustStepCard } from "@/components/features/onboarding/TrustStepCard";
import { useOnboarding } from "@/hooks/useOnboarding";
import { trackOnboardingStepViewed } from "@/domain/analytics/onboarding";

const STEPS = [
  {
    number: 1,
    icon: Camera,
    title: "Scannen",
    text: "Du machst ein Foto von deinem Problem.",
  },
  {
    number: 2,
    icon: Sparkles,
    title: "Verstehen",
    text: "Wir erkennen Pflanze, Ursache und Dringlichkeit.",
  },
  {
    number: 3,
    icon: CheckCircle2,
    title: "Lösen",
    text: "Du bekommst konkrete Schritte — angepasst an deinen Garten.",
  },
];

export default function TrustPage() {
  const { advance } = useOnboarding();

  useEffect(() => {
    trackOnboardingStepViewed("TRUST");
  }, []);

  return (
    <OnboardingShell step={4}>
      <div className="pt-6 flex-1">
        <OnboardingHeadline
          title="Deine neue Garten-Superkraft."
          subtitle="In drei Schritten vom Foto zur Lösung."
        />
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.12 } },
            hidden: {},
          }}
        >
          {STEPS.map((s) => (
            <motion.div
              key={s.number}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <TrustStepCard
                number={s.number}
                icon={s.icon}
                title={s.title}
                text={s.text}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
      <div className="pt-6">
        <button
          type="button"
          onClick={() => advance("TRUST", {})}
          className="flex w-full items-center justify-center rounded-full bg-clay-500 hover:bg-clay-600 text-paper text-[15px] font-semibold transition active:scale-[0.98]"
          style={{ height: 52 }}
        >
          Probier's aus
        </button>
      </div>
    </OnboardingShell>
  );
}
```

- [ ] **Step 3: Build check**
```bash
cd /c/users/juerg/gartenscanner && npm run build 2>&1 | grep -E "Compiled|Error" | head -5
```
Expected: `✓ Compiled successfully`.

- [ ] **Step 4: Commit**
```bash
git add src/components/features/onboarding/TrustStepCard.tsx src/app/onboarding/trust/page.tsx
git commit -m "feat(onboarding): rebuild trust screen as 3-step explainer"
```

---

## Task 16: Scan-Screen mit 3 Phasen (DemoScanCard + AnalyzingOverlay + CompactResultView)

**Files:**
- Create: `src/components/features/onboarding/DemoScanCard.tsx`
- Create: `src/components/features/onboarding/AnalyzingOverlay.tsx`
- Create: `src/components/features/onboarding/CompactResultView.tsx`
- Create: `src/app/onboarding/scan/page.tsx`

- [ ] **Step 1: DemoScanCard**

```tsx
"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  hint: string;
  image: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function DemoScanCard({
  label,
  hint,
  image,
  onClick,
  disabled,
  className,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl bg-paper p-3 text-left shadow-[0_2px_12px_rgba(28,42,33,0.06)] transition",
        disabled
          ? "opacity-50"
          : "hover:shadow-[0_4px_16px_rgba(28,42,33,0.08)] active:scale-[0.99]",
        className
      )}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
        <Image
          src={image}
          alt={label}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-forest-900 truncate">
          {label}
        </p>
        <p className="text-[12px] text-ink-muted truncate">{hint}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-forest-700 opacity-60 group-hover:opacity-100 transition" />
    </button>
  );
}
```

- [ ] **Step 2: AnalyzingOverlay**

```tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Bildmerkmale erkennen",
  "Mit 12 000 Arten vergleichen",
  "Relevanz bewerten",
  "Passende Empfehlung vorbereiten",
];

interface Props {
  onComplete: () => void;
  stepDurationMs?: number;
}

export function AnalyzingOverlay({
  onComplete,
  stepDurationMs = 650,
}: Props) {
  const [progressStep, setProgressStep] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((_, i) => {
      timers.push(
        setTimeout(() => setProgressStep(i + 1), (i + 1) * stepDurationMs)
      );
    });
    timers.push(
      setTimeout(onComplete, STEPS.length * stepDurationMs + 350)
    );
    return () => timers.forEach(clearTimeout);
  }, [onComplete, stepDurationMs]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-forest-900/92 backdrop-blur-xl px-8"
    >
      <div className="relative flex h-32 w-32 items-center justify-center mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-paper/20" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-t-paper border-r-paper/60 border-b-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        />
        <Sparkles className="h-10 w-10 text-paper" strokeWidth={1.5} />
      </div>
      <p className="font-serif text-[26px] leading-tight text-paper mb-1 font-normal text-center">
        Ich analysiere dein Beispiel
      </p>
      <p className="text-[13px] text-sage-200/80 mb-10 text-center">
        Das dauert nur einen Moment
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {STEPS.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: progressStep > i ? 1 : 0.3 }}
            className="flex items-center gap-3 text-[13px]"
          >
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full transition",
                progressStep > i
                  ? "bg-paper text-forest-900"
                  : "border border-paper/30"
              )}
            >
              {progressStep > i && (
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span className="text-paper/90">{s}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 3: CompactResultView**

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import type { ContentEntry, TreatmentMethod } from "@/domain/types";

interface Props {
  entry: ContentEntry;
  metaBadge: string;
  summary: string;
  onPrimaryCta: () => void;
  onSkip: () => void;
}

export function CompactResultView({
  entry,
  metaBadge,
  summary,
  onPrimaryCta,
  onSkip,
}: Props) {
  const recommended =
    entry.methods.find((m) => m.style.includes("BALANCED")) ??
    entry.methods[0];
  const others = entry.methods
    .filter((m) => m.id !== recommended?.id)
    .slice(0, 2);

  return (
    <div className="flex flex-col pt-4 pb-6">
      <div className="relative h-48 w-full overflow-hidden rounded-2xl mb-4">
        <Image
          src={entry.imageUrl}
          alt={entry.name}
          fill
          sizes="(max-width: 640px) 100vw, 512px"
          className="object-cover"
        />
      </div>
      <div className="inline-flex items-center self-start rounded-full bg-forest-700/10 px-3 py-1 text-[11px] font-semibold text-forest-700 uppercase tracking-wide mb-3">
        {metaBadge}
      </div>
      <h1 className="font-serif text-[28px] leading-tight text-forest-900 mb-2 font-normal">
        {entry.name}
      </h1>
      <p className="text-[14px] leading-relaxed text-ink-muted mb-8">
        {summary}
      </p>

      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink-muted mb-3">
        Das kannst du jetzt tun
      </h2>
      <div className="space-y-3 mb-8">
        {recommended && (
          <RecommendedCard method={recommended} />
        )}
        {others.map((m) => (
          <BlurredTeaserCard key={m.id} method={m} />
        ))}
      </div>

      <button
        type="button"
        onClick={onPrimaryCta}
        className="flex w-full items-center justify-center rounded-full bg-clay-500 hover:bg-clay-600 text-paper text-[15px] font-semibold transition active:scale-[0.98]"
        style={{ height: 52 }}
      >
        Alle Maßnahmen ansehen
      </button>
      <button
        type="button"
        onClick={onSkip}
        className="mt-3 w-full py-2 text-[13px] text-ink-muted hover:text-forest-700 transition"
      >
        Später, danke
      </button>
    </div>
  );
}

function RecommendedCard({ method }: { method: TreatmentMethod }) {
  return (
    <div className="rounded-2xl bg-paper p-4 border border-forest-700/15 shadow-[0_2px_10px_rgba(28,42,33,0.05)]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-forest-700">
          Empfohlen für dich
        </span>
        <ArrowRight className="h-4 w-4 text-forest-700" />
      </div>
      <h3 className="text-[15px] font-semibold text-forest-900 mb-1">
        {method.title}
      </h3>
      <p className="text-[13px] leading-relaxed text-ink-muted line-clamp-2">
        {method.description}
      </p>
    </div>
  );
}

function BlurredTeaserCard({ method }: { method: TreatmentMethod }) {
  return (
    <div className="relative rounded-2xl bg-paper p-4 border border-sage-200/60 overflow-hidden">
      <div className="blur-sm select-none">
        <h3 className="text-[15px] font-semibold text-forest-900 mb-1">
          {method.title}
        </h3>
        <p className="text-[13px] leading-relaxed text-ink-muted line-clamp-2">
          {method.description}
        </p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-2 rounded-full bg-forest-900/90 px-3 py-1.5 text-[12px] font-medium text-paper">
          <Lock className="h-3.5 w-3.5" strokeWidth={2} />
          Premium
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Scan-Screen Page**

Create `src/app/onboarding/scan/page.tsx`:

```tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OnboardingShell } from "@/components/features/onboarding/OnboardingShell";
import { OnboardingHeadline } from "@/components/features/onboarding/OnboardingHeadline";
import { DemoScanCard } from "@/components/features/onboarding/DemoScanCard";
import { AnalyzingOverlay } from "@/components/features/onboarding/AnalyzingOverlay";
import { CompactResultView } from "@/components/features/onboarding/CompactResultView";
import { useOnboarding } from "@/hooks/useOnboarding";
import {
  trackOnboardingStepViewed,
  trackFirstScanCtaClicked,
  trackFirstScanStarted,
  trackFirstScanCompleted,
  trackOnboardingSkipClicked,
} from "@/domain/analytics/onboarding";
import { getContentById } from "@/content";

type Phase = "picker" | "analyzing" | "result";

interface DemoEntry {
  id: string;
  contentId: string;
  label: string;
  hint: string;
  image: string;
  metaBadge: string;
  summary: string;
}

const DEMOS: DemoEntry[] = [
  {
    id: "plant_tomate",
    contentId: "plant_tomate",
    label: "Tomate",
    hint: "Typisches Problem bei einer Pflanze",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f3/Tomatoes-on-the-bush.jpg",
    metaBadge: "Pflanze · Erkannt",
    summary:
      "Deine Tomate steht gut im Saft. Achte in dieser Phase auf gleichmäßige Wassergabe und früh erkennbare Krankheitssymptome.",
  },
  {
    id: "weed_loewenzahn",
    contentId: "weed_loewenzahn",
    label: "Löwenzahn",
    hint: "Typisches Unkraut im Rasen",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/4/4f/DandelionFlower.jpg",
    metaBadge: "Unkraut · Mittlere Relevanz",
    summary:
      "Breitet sich schnell aus und entzieht dem Rasen Nährstoffe. Jetzt gezielt entfernen, bevor er in Samen geht.",
  },
  {
    id: "disease_echter_mehltau",
    contentId: "disease_echter_mehltau",
    label: "Echter Mehltau",
    hint: "Typische Pflanzenkrankheit",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/7/7b/UncinulaTulasneiLeaf.jpg",
    metaBadge: "Krankheit · Hohe Relevanz",
    summary:
      "Pilzbefall, der sich bei Wärme rasch ausbreitet. Sofort handeln, damit er nicht auf andere Pflanzen übergreift.",
  },
];

export default function ScanPage() {
  const { advance, skipToComplete } = useOnboarding();
  const [phase, setPhase] = useState<Phase>("picker");
  const [selected, setSelected] = useState<DemoEntry | null>(null);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    trackOnboardingStepViewed("SCAN");
  }, []);

  function onPickDemo(demo: DemoEntry) {
    trackFirstScanCtaClicked(demo.id);
    setSelected(demo);
    setPhase("analyzing");
    startedAtRef.current = Date.now();
    trackFirstScanStarted(demo.id);
  }

  function onAnalyzeComplete() {
    if (!selected) return;
    trackFirstScanCompleted(
      selected.id,
      Date.now() - startedAtRef.current
    );
    setPhase("result");
  }

  function onPrimaryCta() {
    advance("SCAN", {});
  }

  function onSkip() {
    trackOnboardingSkipClicked("SCAN");
    skipToComplete("skipped_paywall");
  }

  return (
    <>
      <OnboardingShell step={5} hideProgress={phase !== "picker"}>
        <AnimatePresence mode="wait">
          {phase === "picker" && (
            <motion.div
              key="picker"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="pt-6 flex-1"
            >
              <OnboardingHeadline
                title="Lass uns deinen ersten Scan machen"
                subtitle="Wir zeigen dir, wie's geht — such dir ein Beispiel aus."
              />
              <div className="flex flex-col gap-3">
                {DEMOS.map((demo) => (
                  <DemoScanCard
                    key={demo.id}
                    label={demo.label}
                    hint={demo.hint}
                    image={demo.image}
                    onClick={() => onPickDemo(demo)}
                  />
                ))}
              </div>
              <p className="mt-6 text-center text-[12px] text-ink-muted/80">
                Echte Foto-Erkennung startet in Kürze.
              </p>
              <button
                type="button"
                onClick={() => {
                  trackOnboardingSkipClicked("SCAN");
                  skipToComplete("skipped_scan");
                }}
                className="mt-4 w-full py-2 text-[12px] text-ink-muted hover:text-forest-700 transition"
              >
                Überspringen
              </button>
            </motion.div>
          )}

          {phase === "result" && selected && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex-1"
            >
              <ResultFromDemo
                demo={selected}
                onPrimaryCta={onPrimaryCta}
                onSkip={onSkip}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </OnboardingShell>

      <AnimatePresence>
        {phase === "analyzing" && (
          <AnalyzingOverlay onComplete={onAnalyzeComplete} />
        )}
      </AnimatePresence>
    </>
  );
}

function ResultFromDemo({
  demo,
  onPrimaryCta,
  onSkip,
}: {
  demo: DemoEntry;
  onPrimaryCta: () => void;
  onSkip: () => void;
}) {
  const entry = getContentById(demo.contentId);
  if (!entry) {
    return (
      <div className="pt-12 text-center text-ink-muted">
        Inhalt nicht gefunden.
      </div>
    );
  }
  return (
    <CompactResultView
      entry={entry}
      metaBadge={demo.metaBadge}
      summary={demo.summary}
      onPrimaryCta={onPrimaryCta}
      onSkip={onSkip}
    />
  );
}
```

- [ ] **Step 5: Build check**
```bash
cd /c/users/juerg/gartenscanner && npm run build 2>&1 | grep -E "Compiled|Error" | head -5
```
Expected: `✓ Compiled successfully`. **Wichtig:** Wenn `getContentById` nicht aus `@/content` exportiert wird, prüfe den tatsächlichen Export-Pfad in `src/content/index.ts` und passe den Import an (`@/content` vs `@/content/index` — beide sollten funktionieren wegen Next.js Module Resolution).

- [ ] **Step 6: Commit**
```bash
git add src/components/features/onboarding/DemoScanCard.tsx src/components/features/onboarding/AnalyzingOverlay.tsx src/components/features/onboarding/CompactResultView.tsx src/app/onboarding/scan/page.tsx
git commit -m "feat(onboarding): add scan screen with picker/analyzing/result phases"
```

---

## Task 17: Premium-Paywall-Screen

**Files:**
- Create: `src/components/features/onboarding/WaitlistCTA.tsx`
- Create: `src/app/onboarding/premium/page.tsx`

- [ ] **Step 1: WaitlistCTA-Component**

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { isValidEmail } from "@/lib/storage/waitlist";

interface Props {
  onSubmit: (email: string) => void;
  onAfterSubmit: () => void;
}

type CTAPhase = "idle" | "input" | "done";

export function WaitlistCTA({ onSubmit, onAfterSubmit }: Props) {
  const [phase, setPhase] = useState<CTAPhase>("idle");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmitClick() {
    if (phase === "idle") {
      setPhase("input");
      return;
    }
    if (phase === "input") {
      if (!isValidEmail(email)) {
        setError("Bitte gültige E-Mail eingeben");
        return;
      }
      onSubmit(email.trim());
      setPhase("done");
      return;
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence>
        {phase === "input" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="deine@email.de"
              className={cn(
                "w-full rounded-full bg-paper px-5 py-3 text-[15px] text-forest-900 placeholder:text-ink-muted/60 border",
                error ? "border-clay-500" : "border-sage-200"
              )}
              style={{ height: 52 }}
            />
            {error && (
              <p className="mt-2 text-[12px] text-clay-600 text-center">
                {error}
              </p>
            )}
          </motion.div>
        )}
        {phase === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-2 rounded-full bg-forest-700/15 px-4 py-3 text-[14px] font-medium text-forest-700"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
            Wir melden uns, sobald Premium startet.
          </motion.div>
        )}
      </AnimatePresence>

      {phase !== "done" ? (
        <button
          type="button"
          onClick={onSubmitClick}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-clay-500 hover:bg-clay-600 text-paper text-[15px] font-semibold transition active:scale-[0.98]"
          style={{ height: 52 }}
        >
          {phase === "idle" ? (
            <>
              Ich will dabei sein
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            "Absenden"
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onAfterSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-clay-500 hover:bg-clay-600 text-paper text-[15px] font-semibold transition active:scale-[0.98]"
          style={{ height: 52 }}
        >
          Weiter zur App
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Premium-Page**

Create `src/app/onboarding/premium/page.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";
import { WaitlistCTA } from "@/components/features/onboarding/WaitlistCTA";
import { useOnboarding } from "@/hooks/useOnboarding";
import {
  trackOnboardingStepViewed,
  trackPaywallViewed,
  trackOnboardingSkipClicked,
} from "@/domain/analytics/onboarding";

const BENEFITS = [
  "Alle Empfehlungen freischalten",
  "Verlauf deiner Scans",
  "Unbegrenzte Analysen",
  "Personalisierte Wochenplanung",
];

export default function PremiumPage() {
  const { submitPaywall, skipToComplete } = useOnboarding();

  useEffect(() => {
    trackOnboardingStepViewed("PREMIUM");
    trackPaywallViewed();
  }, []);

  return (
    <main
      className="min-h-[100dvh] safe-top flex flex-col"
      style={{
        background:
          "linear-gradient(165deg, #1C2A21 0%, #2F4635 55%, #3F5B46 100%)",
      }}
    >
      <div className="flex-1 flex flex-col mx-auto w-full max-w-lg px-5 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-12">
        <div className="flex-1 flex flex-col justify-center">
          <div className="inline-flex items-center self-start rounded-full bg-paper/15 px-3 py-1 text-[11px] font-semibold text-paper uppercase tracking-wider mb-5 backdrop-blur">
            Premium — in Kürze verfügbar
          </div>
          <h1 className="font-serif text-[30px] leading-[1.1] text-paper mb-2 font-normal">
            Bekomme Lösungen für alles, was du scannst.
          </h1>
          <p className="text-[15px] leading-relaxed text-sage-200/90 mb-8">
            Werde einer der ersten und bekomme einen Preis, der später nicht
            mehr angeboten wird.
          </p>

          <ul className="space-y-3 mb-8">
            {BENEFITS.map((b) => (
              <li
                key={b}
                className="flex items-start gap-3 text-[15px] text-paper/95"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-paper text-forest-900">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border border-paper/20 bg-paper/10 p-4 backdrop-blur mb-8">
            <div className="text-[13px] text-sage-200/80 mb-1">
              Early-Bird für die ersten 200 Nutzer
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-[28px] text-paper font-normal">
                29 €
              </span>
              <span className="text-[13px] text-sage-200/80">/Jahr</span>
              <span className="ml-auto text-[13px] text-sage-200/60 line-through">
                49 €
              </span>
            </div>
          </div>
        </div>

        <WaitlistCTA
          onSubmit={submitPaywall}
          onAfterSubmit={() => {
            /* submitPaywall has already completed & navigated */
          }}
        />
        <button
          type="button"
          onClick={() => {
            trackOnboardingSkipClicked("PREMIUM");
            skipToComplete("skipped_paywall");
          }}
          className="mt-3 w-full py-2 text-[13px] text-paper/70 hover:text-paper transition"
        >
          Später
        </button>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Build check**
```bash
cd /c/users/juerg/gartenscanner && npm run build 2>&1 | grep -E "Compiled|Error" | head -5
```
Expected: `✓ Compiled successfully`.

- [ ] **Step 4: Commit**
```bash
git add src/components/features/onboarding/WaitlistCTA.tsx src/app/onboarding/premium/page.tsx
git commit -m "feat(onboarding): add premium paywall screen with waitlist CTA"
```

---

## Task 18: Guard auf Dashboard + App-Routen

**Files:**
- Modify: `src/app/app/page.tsx` — einhüllen mit OnboardingGuard
- Modify: `src/app/scan/[id]/page.tsx`
- Modify: `src/app/scan/[id]/actions/page.tsx`
- Modify: `src/app/scan/new/page.tsx`
- Modify: `src/app/garden/page.tsx`
- Modify: `src/app/garden/[plantId]/page.tsx`
- Modify: `src/app/coach/page.tsx`
- Modify: `src/app/history/page.tsx`
- Modify: `src/app/premium/page.tsx`

**Approach:** Alle diese Pages sind Server-Components oder Client-Components. Statt jede Page einzeln zu ändern, packe wir `OnboardingGuard` jeweils im Rendering ein. Da die Guard-Logik `"use client"` ist, ist das für Server-Components das richtige Pattern: Server-Component rendert einen Client-Wrapper, der die Children als Props nimmt.

- [ ] **Step 1: OnboardingGuard um `src/app/app/page.tsx`**

Lese die Datei zuerst, um den Inhalt zu kennen. Dann passe nur die Import-Sektion + den Rückgabewert an.

Oberhalb der default-export-Funktion `DashboardPage` Import hinzufügen:
```ts
import { OnboardingGuard } from "@/components/features/onboarding/OnboardingGuard";
```

Umhülle den return-Block:
- Finde die erste Zeile `return (` in `DashboardPage`
- Finde den passenden schließenden `)` am Ende
- Wrappe den Inhalt in `<OnboardingGuard>{...}</OnboardingGuard>`

Beispiel-Pattern (nicht kopieren — jede Datei hat anderen Inhalt):
```tsx
return (
  <OnboardingGuard>
    <AppShell>
      {/* ... existing content ... */}
    </AppShell>
  </OnboardingGuard>
);
```

- [ ] **Step 2: Gleiches Pattern auf alle anderen app-Routen anwenden**

Wiederhole Step 1 für jede Datei in der File-Liste. Wichtig:
- Bei Server-Components ist das OK — `<OnboardingGuard>` ist ein Client-Component und bekommt Children-Tree als React-Node
- Bei Client-Components genauso — der Wrapper darf rundherum sein

- [ ] **Step 3: Build check**
```bash
cd /c/users/juerg/gartenscanner && npm run build 2>&1 | grep -E "Compiled|Error" | head -5
```
Expected: `✓ Compiled successfully`.

- [ ] **Step 4: Smoke-Test im dev-server**

```bash
cd /c/users/juerg/gartenscanner && npm run dev
```

Danach im Browser auf iPhone-14-Viewport (390×844):
1. localStorage löschen (`localStorage.clear()` in DevTools-Console)
2. Gehe auf `http://localhost:3000/app` → erwartet: Redirect auf `/onboarding/welcome`
3. Gehe auf `http://localhost:3000/scan/new` → erwartet: Redirect auf `/onboarding/welcome`

Server mit `Ctrl+C` stoppen.

- [ ] **Step 5: Commit**
```bash
git add src/app/app/page.tsx src/app/scan/ src/app/garden/ src/app/coach/ src/app/history/ src/app/premium/page.tsx
git commit -m "feat(onboarding): wrap all app routes with OnboardingGuard"
```

---

## Task 19: Happy-Path-Smoke-Test + komplettes Onboarding lokal durchspielen

**Files:** keine — reine manuelle Verifikation.

- [ ] **Step 1: Clean-Build**

```bash
cd /c/users/juerg/gartenscanner && rm -rf .next && npm run build 2>&1 | tail -25
```
Expected: `✓ Compiled successfully`, komplette Route-Tabelle zeigt alle 6 Onboarding-Routen:
- `/onboarding/welcome`
- `/onboarding/use-cases`
- `/onboarding/garden`
- `/onboarding/trust`
- `/onboarding/scan`
- `/onboarding/premium`

Die gelöschten Routen `/onboarding/style` und `/onboarding/first-scan` tauchen NICHT mehr auf.

- [ ] **Step 2: Production-Start**

```bash
cd /c/users/juerg/gartenscanner && npm run start
```

- [ ] **Step 3: Mobile-Smoke-Test (iPhone 14 viewport)**

Im Browser (Chrome DevTools, 390×844):

**Happy-Path-Full:**
1. `localStorage.clear()` in DevTools
2. `/` öffnen — Landing lädt, CTA „Jetzt starten"
3. CTA → `/onboarding/welcome`. Hero-Visual, Headline, Sub, CTA „Los geht's"
4. „Los geht's" → `/onboarding/use-cases`. 6 Karten. Wähle 2. „Weiter" wird aktiv → Tap.
5. `/onboarding/garden`. Bereich: „Garten" + „Beet". Kinder: Ja. Haustiere: Nein. Lösungsart: Bio. Erfahrung: Anfänger. „Weiter" → tap.
6. `/onboarding/trust`. 3 Karten stagged fade-in. „Probier's aus" → tap.
7. `/onboarding/scan`. 3 Demo-Karten. Tap „Löwenzahn" → Analyzing-Overlay (2,8 s) → Result-View mit Löwenzahn-Bild + 1 Empfohlen-Card + 2 blurred Premium-Karten
8. „Alle Maßnahmen ansehen" → `/onboarding/premium`. Dark-Green-Gradient, 4 Benefits, Price-Card.
9. „Ich will dabei sein" → Email-Input slides in. Eingabe `test@test.de` → „Absenden" → Danke-State. „Weiter zur App" → `/app`
10. `/app` rendert Dashboard mit BottomNav. Beta-Badge ist oben rechts.
11. Footer NICHT sichtbar auf `/app` bzw. im Onboarding.

**Skip-Path:**
1. `localStorage.clear()`, Onboarding bis `/onboarding/scan` durchklicken
2. Unten „Überspringen" tap → `/app`
3. `localStorage.clear()`, Onboarding bis `/onboarding/premium` durchklicken
4. Unten „Später" tap → `/app`

**Guard-Path:**
1. Abgeschlossenes Profil (nach Happy Path): `/onboarding/welcome` im Browser → sofortiger Redirect auf `/app`
2. `localStorage.clear()`, `/app` → Redirect auf `/onboarding/welcome`
3. `localStorage.clear()`, `/scan/new` → Redirect auf `/onboarding/welcome`

**Resume-Path:**
1. `localStorage.clear()`, Onboarding bis `/onboarding/garden` durchklicken, aber NICHT „Weiter" tappen
2. Tab schließen
3. Neuer Tab, `/onboarding/welcome` öffnen → Guard erlaubt, weil completed=false
4. Navigiere manuell zu `/onboarding/garden` → Werte aus letztem Tab sind noch da (ausgefüllte Chips, Toggles)

**Back-Path:**
1. Auf `/onboarding/garden`: Back-Pfeil → zurück zu `/onboarding/use-cases`. Auswahl dort bleibt erhalten.

**OG-Preview + Live-Parität-Check:** Überspringen, weil Launch-Tests separat laufen.

Server mit `Ctrl+C` stoppen.

- [ ] **Step 4: Falls Fehler auftreten**

Jeder aufgefundene Bug wird als separater kleiner Fix committed. Hinweise zu typischen Fehlern:
- Hydration-Warnungen: `useEffect`-Hook wird erst nach Mount laufen. Wenn Fehler kommt, prüfen ob `typeof window !== "undefined"`-Guards fehlen
- ESLint-Warning zu `exhaustive-deps`: Wo immer wir absichtlich Hooks mit unvollständigen deps haben, muss `// eslint-disable-next-line react-hooks/exhaustive-deps` stehen
- Framer-Motion-Warning zu `className` auf `<motion.div>`: ignoriert, ist ein bekanntes Harmloses

- [ ] **Step 5: Kein Commit nötig** (reine Verifikation).

---

## Task 20: Pipeline-Update

**Files:** keine.

- [ ] **Step 1: Pipeline-Update pushen**

Im Terminal (PowerShell, weil `pipeline-update` ein PS-Cmdlet ist):

```powershell
pipeline-update -Slug gartenscanner `
  -Stage testing `
  -Progress 75 `
  -Summary "Premium-Onboarding live: 6 Screens, Demo-Scan als Aha-Moment, Soft-Waitlist-Paywall, Guard-Logik auf allen App-Routen" `
  -Todos @(
    "Impressum HRB + USt-IdNr nachtragen (außerhalb Onboarding-Scope)",
    "Echten Vision-Provider anbinden, ENABLE_PHOTO_UPLOAD auf true",
    "Content-Set auf 50-80 Eintraege erweitern",
    "Coach mit LLM-Integration",
    "Stripe anbinden und Waitlist-Emails migrieren"
  )
```
Expected: `pipeline-update` antwortet mit OK.

- [ ] **Step 2: Final push + live-check**

```bash
cd /c/users/juerg/gartenscanner && git push origin main
```

Warte ~2 Min, dann:
```bash
curl -sI https://gartenscan.de/onboarding/welcome | head -3
```
Expected: `HTTP/1.1 200 OK`.

- [ ] **Step 3: Kein Commit nötig** (Deploy-Commit wird automatisch von Vercel gemacht).

---

## Done

Premium-Onboarding ist live. Der Flow spielt sauber von Landing → 6 Screens → `/app`, Guards schützen App-Routen, Waitlist-Emails landen in localStorage, Analytics-Events in ConsoleTracker.

Offen (nicht in diesem Plan-Scope):
- Impressum HRB + USt-IdNr nachtragen
- Echten Vision-Provider anbinden
- Content-Set erweitern
- Stripe + echte Paywall
- PostHog oder Plausible statt ConsoleTracker
