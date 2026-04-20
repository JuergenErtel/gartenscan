"use client";

import { useOnboardingGuard } from "@/hooks/useOnboardingGuard";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { ready } = useOnboardingGuard();
  if (!ready) {
    return <div className="min-h-[100dvh] bg-sage-50" aria-hidden />;
  }
  return <>{children}</>;
}
