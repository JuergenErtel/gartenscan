import { AlertCircle, Eye, Clock, CheckCircle2 } from "lucide-react";
import type { Urgency } from "@/lib/types";
import { cn } from "@/lib/utils";

const config = {
  IMMEDIATE: {
    label: "Jetzt handeln",
    icon: AlertCircle,
    dot: "bg-berry-500",
    text: "text-berry-600",
    bg: "bg-berry-100",
    ring: "anim-pulse-ring",
  },
  THIS_WEEK: {
    label: "Diese Woche",
    icon: Clock,
    dot: "bg-sun-500",
    text: "text-[#8a6a14]",
    bg: "bg-sun-100",
    ring: "",
  },
  MONITOR: {
    label: "Beobachten",
    icon: Eye,
    dot: "bg-moss-500",
    text: "text-moss-600",
    bg: "bg-sage-200",
    ring: "",
  },
  GONE: {
    label: "Gesund",
    icon: CheckCircle2,
    dot: "bg-moss-500",
    text: "text-moss-600",
    bg: "bg-sage-100",
    ring: "",
  },
} as const;

interface UrgencyIndicatorProps {
  urgency: Urgency;
  variant?: "chip" | "banner" | "dot";
  className?: string;
}

export function UrgencyIndicator({
  urgency,
  variant = "chip",
  className,
}: UrgencyIndicatorProps) {
  const c = config[urgency];
  const Icon = c.icon;

  if (variant === "dot") {
    return (
      <span
        className={cn(
          "relative inline-flex h-2.5 w-2.5 rounded-full",
          c.dot,
          c.ring,
          className
        )}
      />
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-[14px] px-4 py-3",
          c.bg,
          className
        )}
      >
        <Icon className={cn("h-5 w-5 shrink-0", c.text)} />
        <span className={cn("text-[13px] font-semibold", c.text)}>
          {c.label}
        </span>
      </div>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]",
        c.bg,
        c.text,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}
