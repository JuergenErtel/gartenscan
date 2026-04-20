"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  number: number;
  icon: LucideIcon;
  title: string;
  text: string;
  className?: string;
}

export function TrustStepCard({
  number,
  icon: Icon,
  title,
  text,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "relative flex gap-4 rounded-2xl bg-paper p-5 border border-sage-200/60",
        className
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest-700/5">
        <Icon className="h-6 w-6 text-forest-700" strokeWidth={1.75} />
      </div>
      <div className="flex-1 pt-0.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted/80 mb-0.5">
          Schritt {number}
        </div>
        <h3 className="text-[16px] font-semibold text-forest-900 mb-1">
          {title}
        </h3>
        <p className="text-[13px] leading-relaxed text-ink-muted">{text}</p>
      </div>
    </div>
  );
}
