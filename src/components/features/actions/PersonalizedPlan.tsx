"use client";

import { useState } from "react";
import { ChevronDown, Lock, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ActionStep } from "./ActionStep";
import { useProfile } from "@/hooks/useProfile";
import { generateRecommendationPlan } from "@/domain/recommendations/engine";
import type {
  ContentEntry,
  FilteredRecommendation,
  TreatmentMethod,
} from "@/domain/types";
import type { Recommendation } from "@/lib/types";
import { cn } from "@/lib/utils";

function toRecommendation(m: TreatmentMethod): Recommendation {
  return {
    id: m.id,
    timeframe: m.timeframe,
    priority: 1,
    title: m.title,
    description: m.description,
    steps: m.steps,
    effort: m.effort,
    durationMin: m.durationMin,
    methods: [
      {
        id: m.id,
        type: m.type,
        title: m.title,
        description: m.description,
        ingredients: m.ingredients,
        ecoScore: m.ecoScore,
      },
    ],
  };
}

export function PersonalizedPlan({ entry }: { entry: ContentEntry }) {
  const { profile, loading } = useProfile();

  if (loading || !profile) {
    return (
      <>
        {entry.methods.map((m, i) => (
          <ActionStep key={m.id} recommendation={toRecommendation(m)} index={i} />
        ))}
      </>
    );
  }

  const plan = generateRecommendationPlan(entry, profile);
  const recommended = [
    ...plan.nowActions,
    ...plan.thisWeekActions,
    ...plan.longTermActions,
  ];
  const blocked = plan.blockedActions;

  return (
    <>
      {recommended.length > 0 ? (
        <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] font-semibold text-moss-600">
          <Sparkles className="h-3 w-3" strokeWidth={2} />
          Auf dein Profil abgestimmt
        </div>
      ) : (
        <EmptyRecommendedNote />
      )}

      {recommended.map((r, i) => (
        <ActionStep
          key={r.method.id}
          recommendation={toRecommendation(r.method)}
          index={i}
        />
      ))}

      {blocked.length > 0 && <BlockedSection blocked={blocked} />}
    </>
  );
}

function BlockedSection({ blocked }: { blocked: FilteredRecommendation[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-[16px] bg-paper border border-sage-200/60 px-4 py-3.5 hover:border-forest-700/30 transition"
      >
        <div className="flex items-center gap-2.5">
          <Lock className="h-4 w-4 text-ink-muted" strokeWidth={1.75} />
          <span className="text-[13px] font-semibold text-forest-900">
            Weitere Methoden ({blocked.length})
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-ink-muted transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-2">
              {blocked.map((r) => (
                <BlockedCard key={r.method.id} rec={r} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BlockedCard({ rec }: { rec: FilteredRecommendation }) {
  return (
    <div className="rounded-[14px] bg-sage-50/60 border border-sage-200/60 p-4">
      <div className="flex items-start gap-2 mb-2">
        <Lock
          className="h-3.5 w-3.5 text-ink-muted shrink-0 mt-0.5"
          strokeWidth={2}
        />
        <div className="flex-1 min-w-0">
          <p className="font-serif text-[16px] leading-tight text-forest-900/80">
            {rec.method.title}
          </p>
          <p className="text-[11px] text-ink-muted mt-1">
            {rec.blockedBy?.message ?? "Passt nicht zu deinem Profil"}
          </p>
        </div>
      </div>
      <p className="text-[12px] text-ink-muted leading-relaxed line-clamp-2">
        {rec.method.description}
      </p>
    </div>
  );
}

function EmptyRecommendedNote() {
  return (
    <div className="mb-4 rounded-[16px] bg-sun-100/60 border border-sun-500/30 p-4">
      <p className="text-[13px] leading-relaxed text-forest-900">
        Keine Methode passt perfekt zu deinem Profil. Schau bei den weiteren
        Methoden unten – du kannst mit ein paar Anpassungen trotzdem etwas
        davon nutzen.
      </p>
    </div>
  );
}

