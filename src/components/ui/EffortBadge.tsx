import { Clock } from "lucide-react";
import type { EffortLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const effortLabel: Record<EffortLevel, string> = {
  EASY: "Einfach",
  MEDIUM: "Mittel",
  HARD: "Aufwändig",
};

const effortColor: Record<EffortLevel, string> = {
  EASY: "text-moss-600",
  MEDIUM: "text-sun-500",
  HARD: "text-clay-500",
};

interface EffortBadgeProps {
  effort: EffortLevel;
  durationMin?: number;
  className?: string;
}

export function EffortBadge({
  effort,
  durationMin,
  className,
}: EffortBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-muted",
        className
      )}
    >
      <span className="flex gap-0.5">
        <span
          className={cn(
            "h-3 w-1 rounded-full",
            effort === "EASY"
              ? "bg-moss-500"
              : effort === "MEDIUM"
                ? "bg-sun-500"
                : "bg-clay-500"
          )}
        />
        <span
          className={cn(
            "h-3 w-1 rounded-full",
            effort === "MEDIUM" || effort === "HARD"
              ? effort === "MEDIUM"
                ? "bg-sun-500"
                : "bg-clay-500"
              : "bg-sage-200"
          )}
        />
        <span
          className={cn(
            "h-3 w-1 rounded-full",
            effort === "HARD" ? "bg-clay-500" : "bg-sage-200"
          )}
        />
      </span>
      <span className={effortColor[effort]}>{effortLabel[effort]}</span>
      {durationMin !== undefined && (
        <>
          <span className="text-sage-300">·</span>
          <Clock className="h-3 w-3" />
          <span>{durationMin} Min</span>
        </>
      )}
    </span>
  );
}
