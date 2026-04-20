import * as React from "react";
import { cn } from "@/lib/utils";

type Tone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "premium"
  | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  icon?: React.ReactNode;
}

const toneClasses: Record<Tone, string> = {
  neutral: "bg-sage-100 text-forest-800",
  success: "bg-moss-500 text-paper",
  warning: "bg-sun-100 text-[#8a6a14] border border-sun-400/50",
  danger: "bg-berry-500 text-paper",
  info: "bg-sky-100 text-[#3d5565]",
  premium:
    "bg-gradient-to-r from-clay-500 to-clay-400 text-paper shadow-[0_2px_8px_rgba(184,98,58,0.25)]",
  outline: "bg-transparent text-forest-800 border border-forest-700/30",
};

export function Badge({
  className,
  tone = "neutral",
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {icon && <span className="inline-flex -ml-0.5">{icon}</span>}
      {children}
    </span>
  );
}
