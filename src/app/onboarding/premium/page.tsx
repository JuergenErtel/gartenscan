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
