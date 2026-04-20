"use client";

import { ShieldAlert } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { generateRecommendationPlan } from "@/domain/recommendations/engine";
import type { ContentEntry } from "@/domain/types";

export function PersonalizedSafetyBanner({
  entry,
}: {
  entry: ContentEntry;
}) {
  const { profile, loading } = useProfile();

  const hasGenericRisk =
    entry.safety.toxicToChildren ||
    entry.safety.toxicToPets.length > 0 ||
    entry.safety.allergyRisk;

  if (loading || !profile) {
    if (!hasGenericRisk) return null;
    return (
      <Banner
        message={
          entry.safety.notes ??
          "Achte bei Kindern und Haustieren auf den Umgang mit dieser Pflanze."
        }
      />
    );
  }

  const plan = generateRecommendationPlan(entry, profile);
  if (plan.warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {plan.warnings.map((w, i) => (
        <Banner key={i} message={w} />
      ))}
    </div>
  );
}

function Banner({ message }: { message: string }) {
  return (
    <div className="rounded-[16px] bg-berry-100 border border-berry-500/30 p-4 flex gap-3">
      <ShieldAlert
        className="h-5 w-5 shrink-0 text-berry-600 mt-0.5"
        strokeWidth={1.75}
      />
      <div>
        <p className="text-[13px] font-semibold text-berry-600 mb-1">
          Sicherheitshinweis
        </p>
        <p className="text-[13px] leading-relaxed text-forest-900">{message}</p>
      </div>
    </div>
  );
}
