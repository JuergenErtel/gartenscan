"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Image as ImageIcon, Sparkles, ArrowRight } from "lucide-react";
import { OnboardingLayout } from "@/components/features/onboarding/OnboardingLayout";
import {
  onboardingStorage,
  profileStorage,
} from "@/lib/storage/profile";
import { track } from "@/domain/analytics/tracker";
import { EVENT } from "@/domain/analytics/events";
import type { GardenProfile } from "@/domain/types";

export default function FirstScanPage() {
  const router = useRouter();

  const finalizeOnboarding = (onComplete: () => void) => {
    // Persist full profile
    const state = onboardingStorage.get();
    const p = state?.profile ?? {};
    const profile: GardenProfile = {
      userId: "local-user",
      postalCode: p.postalCode ?? "80331",
      areas: p.areas ?? ["GARDEN"],
      hasChildren: p.hasChildren ?? false,
      pets: p.pets ?? [],
      solutionStyle: p.solutionStyle ?? "BALANCED",
      experience: p.experience ?? "INTERMEDIATE",
      useCases: p.useCases ?? ["PLANTS", "WEEDS", "PESTS", "DISEASES", "IMPROVE"],
      createdAt: state?.startedAt ?? new Date(),
      updatedAt: new Date(),
    };
    profileStorage.set(profile);
    onboardingStorage.markCompleted();
    track(EVENT.PROFILE_COMPLETED, {
      plz: profile.postalCode,
      style: profile.solutionStyle,
      experience: profile.experience,
    });
    track(EVENT.ONBOARDING_COMPLETED);
    onComplete();
  };

  return (
    <OnboardingLayout step={6} totalSteps={6}>
      <div className="px-5 pt-8">
        <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-ink-muted mb-2">
          Schritt 5 von 5 · Letzter Schritt
        </p>
        <h1 className="font-serif text-[32px] leading-[1.1] tracking-tight text-forest-900 font-normal">
          Dein erster Scan
        </h1>
        <p className="mt-3 text-[15px] text-ink-muted leading-relaxed max-w-prose">
          Die beste Art gartenscan kennenzulernen: einfach loslegen. Mach ein
          Foto von etwas in deinem Garten — oder probier ein Beispiel.
        </p>
      </div>

      <section className="px-5 pt-8 space-y-3">
        {/* Option 1: Camera */}
        <button
          onClick={() => {
            track(EVENT.FIRST_SCAN_STARTED, { source: "camera" });
            finalizeOnboarding(() => router.push("/scan/new"));
          }}
          className="group w-full text-left flex items-center gap-4 rounded-[20px] bg-gradient-to-br from-forest-700 to-moss-500 p-5 text-paper shadow-[0_8px_28px_rgba(46,74,56,0.2)] active:scale-[0.99] transition"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-paper/20 backdrop-blur">
            <Camera className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-[0.12em] font-bold text-sage-200 mb-1">
              Empfohlen
            </p>
            <p className="font-serif text-[20px] leading-tight font-normal">
              Foto mit Kamera machen
            </p>
            <p className="text-[13px] text-sage-200/85 mt-1">
              Eine Pflanze, ein Unkraut, ein verdächtiges Blatt.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-0.5" />
        </button>

        {/* Option 2: Upload */}
        <button
          onClick={() => {
            track(EVENT.FIRST_SCAN_STARTED, { source: "gallery" });
            finalizeOnboarding(() => router.push("/scan/new"));
          }}
          className="group w-full text-left flex items-center gap-4 rounded-[20px] bg-paper p-5 ring-1 ring-sage-200 hover:ring-forest-700/40 transition"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-sage-100 text-forest-700">
            <ImageIcon className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-[18px] leading-tight text-forest-900 font-normal">
              Aus Galerie wählen
            </p>
            <p className="text-[13px] text-ink-muted mt-1">
              Du hast bereits ein Foto? Nimm das.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-ink-muted group-hover:text-forest-700 group-hover:translate-x-0.5 transition" />
        </button>

        {/* Option 3: Example */}
        <button
          onClick={() => {
            track(EVENT.FIRST_SCAN_STARTED, { source: "example" });
            finalizeOnboarding(() =>
              router.push("/scan/weed_loewenzahn?example=1")
            );
          }}
          className="group w-full text-left flex items-center gap-4 rounded-[20px] bg-paper-dim p-5 ring-1 ring-sage-200 hover:ring-forest-700/40 transition"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-clay-500/15 text-clay-600">
            <Sparkles className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-[0.12em] font-bold text-clay-600 mb-1">
              Beispiel
            </p>
            <p className="font-serif text-[18px] leading-tight text-forest-900 font-normal">
              Löwenzahn-Demo ansehen
            </p>
            <p className="text-[13px] text-ink-muted mt-1">
              Kein Garten zur Hand? Wir zeigen dir, wie eine Analyse aussieht.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-ink-muted group-hover:text-forest-700 group-hover:translate-x-0.5 transition" />
        </button>
      </section>

      <div className="px-5 pt-8 pb-24">
        <Link
          href="/app"
          onClick={() => {
            finalizeOnboarding(() => {});
          }}
          className="block text-center text-[13px] text-ink-muted hover:text-forest-700 transition py-2"
        >
          Später machen — zur App
        </Link>
      </div>
    </OnboardingLayout>
  );
}
