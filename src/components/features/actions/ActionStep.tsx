"use client";

import { useState } from "react";
import {
  ChevronDown,
  Leaf,
  Droplets,
  Package,
  Wrench,
  Sprout,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Recommendation, Method, MethodType } from "@/lib/types";
import { EffortBadge } from "@/components/ui/EffortBadge";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const timeframeColor = {
  NOW: "from-berry-500 to-berry-600",
  THIS_WEEK: "from-sun-500 to-clay-500",
  LONG_TERM: "from-moss-500 to-forest-700",
  SEASONAL: "from-sky-400 to-sky-300",
} as const;

const timeframeLabel = {
  NOW: "Jetzt sofort",
  THIS_WEEK: "Diese Woche",
  LONG_TERM: "Langfristig",
  SEASONAL: "Saisonal",
} as const;

const methodIcons: Record<MethodType, React.ElementType> = {
  HOME_REMEDY: Droplets,
  ORGANIC_PRODUCT: Leaf,
  CHEMICAL_PRODUCT: Package,
  MECHANICAL: Wrench,
  CULTURAL: Sprout,
  BIOLOGICAL: Leaf,
};

const methodLabels: Record<MethodType, string> = {
  HOME_REMEDY: "Hausmittel",
  ORGANIC_PRODUCT: "Bio-Produkt",
  CHEMICAL_PRODUCT: "Produkt",
  MECHANICAL: "Mechanisch",
  CULTURAL: "Prävention",
  BIOLOGICAL: "Biologisch",
};

interface ActionStepProps {
  recommendation: Recommendation;
  index: number;
}

export function ActionStep({ recommendation: r, index }: ActionStepProps) {
  const [expanded, setExpanded] = useState(index === 0);
  const [completed, setCompleted] = useState(false);

  return (
    <div className="relative">
      {/* Timeline line */}
      <div
        className={cn(
          "absolute left-[19px] top-12 w-[2px] h-[calc(100%-2.5rem)]",
          completed ? "bg-moss-500" : "bg-sage-200"
        )}
        aria-hidden
      />

      <div className="flex gap-4">
        {/* Timeline dot */}
        <button
          onClick={() => setCompleted((c) => !c)}
          className={cn(
            "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300",
            completed
              ? "bg-moss-500 text-paper"
              : "bg-paper border-[1.5px] border-sage-200 text-forest-700 hover:border-forest-700"
          )}
        >
          <AnimatePresence mode="wait">
            {completed ? (
              <motion.span
                key="done"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Check className="h-5 w-5" strokeWidth={2.5} />
              </motion.span>
            ) : (
              <motion.span
                key="num"
                className="text-[14px] font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                {index + 1}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Content card */}
        <div className="flex-1 pb-8">
          <div
            className={cn(
              "overflow-hidden rounded-[20px] bg-paper shadow-[0_2px_16px_rgba(28,42,33,0.06)] transition-opacity",
              completed && "opacity-60"
            )}
          >
            {/* Timeframe accent */}
            <div
              className={cn(
                "h-1 w-full bg-gradient-to-r",
                timeframeColor[r.timeframe]
              )}
            />
            <button
              onClick={() => setExpanded((e) => !e)}
              className="w-full p-5 text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-ink-muted">
                  {timeframeLabel[r.timeframe]}
                </span>
              </div>
              <h3 className="font-serif text-[20px] leading-tight text-forest-900 font-normal mb-3">
                {r.title}
              </h3>
              <p className="text-[14px] leading-relaxed text-ink-muted mb-4 line-clamp-2">
                {r.description}
              </p>
              <div className="flex items-center justify-between">
                <EffortBadge
                  effort={r.effort}
                  durationMin={r.durationMin}
                />
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-[12px] font-semibold text-forest-700 transition-transform",
                    expanded && "rotate-180"
                  )}
                >
                  <ChevronDown className="h-4 w-4" />
                </span>
              </div>
            </button>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-sage-100 px-5 py-4">
                    <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted mb-3">
                      Anleitung
                    </p>
                    <ol className="space-y-2.5 mb-5">
                      {r.steps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-[14px] leading-relaxed">
                          <span className="shrink-0 text-forest-700 font-bold mt-0.5 tabular-nums">
                            {i + 1}.
                          </span>
                          <span className="text-forest-800">{step}</span>
                        </li>
                      ))}
                    </ol>

                    {r.methods.length > 0 && (
                      <>
                        <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted mb-3">
                          Methoden
                        </p>
                        <div className="space-y-2">
                          {r.methods.map((m) => (
                            <MethodCard key={m.id} method={m} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function MethodCard({ method }: { method: Method }) {
  const Icon = methodIcons[method.type];
  return (
    <div className="flex gap-3 rounded-[14px] bg-sage-50/60 p-3.5 border border-sage-200/60">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper">
        <Icon className="h-4 w-4 text-moss-600" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[14px] font-semibold text-forest-900">
            {method.title}
          </p>
          {method.ecoScore && method.ecoScore >= 4 && (
            <Badge tone="success" className="!py-0.5 !px-1.5 !text-[10px]">
              Eco
            </Badge>
          )}
        </div>
        <p className="text-[12px] text-ink-muted leading-relaxed mb-1.5">
          {method.description}
        </p>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-ink-soft">
          {methodLabels[method.type]}
        </span>
        {method.ingredients && (
          <div className="mt-2 flex flex-wrap gap-1">
            {method.ingredients.map((ing) => (
              <span
                key={ing}
                className="inline-block rounded-full bg-paper border border-sage-200 px-2 py-0.5 text-[10px] text-forest-800"
              >
                {ing}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
