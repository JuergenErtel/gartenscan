"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useProfile } from "@/hooks/useProfile";
import { generateRecommendationPlan } from "@/domain/recommendations/engine";
import type {
  ContentEntry,
  FilteredRecommendation,
  TreatmentMethod,
} from "@/domain/types";

export function PersonalizedPrimaryAction({
  entry,
}: {
  entry: ContentEntry;
}) {
  const { profile, loading } = useProfile();

  if (entry.methods.length === 0) return null;

  const personalized = profile && !loading ? pickBest(entry, profile) : null;
  const method = personalized?.method ?? entry.methods[0];
  const showPersonalizedTag = Boolean(personalized);

  return (
    <section className="px-5 pt-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted">
          Beste erste Maßnahme
        </p>
        {showPersonalizedTag && (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-moss-600">
            <Sparkles className="h-3 w-3" strokeWidth={2} />
            Für dich
          </span>
        )}
      </div>
      <div className="rounded-[20px] bg-paper shadow-[0_2px_16px_rgba(28,42,33,0.06)] p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-700 text-paper">
            <span className="text-[14px] font-bold">1</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-[20px] leading-tight text-forest-900 font-normal mb-1">
              {method.title}
            </h3>
            <p className="text-[12px] text-ink-muted">
              {method.durationMin} Min · Erfolgsaussicht{" "}
              {method.successRate === "HIGH"
                ? "hoch"
                : method.successRate === "MEDIUM"
                  ? "mittel"
                  : "variabel"}
            </p>
          </div>
        </div>
        <p className="text-[14px] leading-relaxed text-ink-muted mb-4">
          {method.description}
        </p>
        <Button
          href={`/scan/${entry.id}/actions`}
          fullWidth
          iconRight={<ArrowRight className="h-4 w-4" />}
        >
          Alle {entry.methods.length} Maßnahmen ansehen
        </Button>
      </div>
    </section>
  );
}

function pickBest(
  entry: ContentEntry,
  profile: Parameters<typeof generateRecommendationPlan>[1]
): { method: TreatmentMethod } | null {
  const plan = generateRecommendationPlan(entry, profile);
  const firstRecommended: FilteredRecommendation | undefined =
    plan.nowActions[0] ?? plan.thisWeekActions[0] ?? plan.longTermActions[0];
  if (firstRecommended) return { method: firstRecommended.method };
  return null;
}
