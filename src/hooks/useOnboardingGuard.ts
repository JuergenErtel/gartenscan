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
