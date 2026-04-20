"use client";

import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  icon: LucideIcon;
  label: string;
  selected: boolean;
  onToggle: () => void;
  className?: string;
}

export function SelectableCard({
  icon: Icon,
  label,
  selected,
  onToggle,
  className,
}: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 rounded-2xl border bg-paper p-5 text-center transition active:scale-[0.98]",
        selected
          ? "border-forest-700 shadow-[0_4px_20px_rgba(28,42,33,0.08)]"
          : "border-sage-200/80 hover:border-sage-300",
        className
      )}
    >
      {selected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-forest-700 text-paper">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
      <Icon
        className={cn(
          "h-7 w-7 transition",
          selected ? "text-forest-700" : "text-ink-muted"
        )}
        strokeWidth={1.75}
      />
      <span
        className={cn(
          "text-[14px] font-medium transition",
          selected ? "text-forest-900" : "text-forest-900/80"
        )}
      >
        {label}
      </span>
    </button>
  );
}
