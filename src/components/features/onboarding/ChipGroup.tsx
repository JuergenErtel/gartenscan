"use client";

import { cn } from "@/lib/utils";

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: ChipOption<T>[];
  selected: T[];
  onToggle: (value: T) => void;
  className?: string;
}

export function ChipGroup<T extends string>({
  options,
  selected,
  onToggle,
  className,
}: Props<T>) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            aria-pressed={isSelected}
            className={cn(
              "rounded-full px-4 py-2 text-[13px] font-medium transition active:scale-[0.97]",
              isSelected
                ? "bg-forest-700 text-paper"
                : "bg-paper text-forest-900/80 border border-sage-200/80 hover:border-sage-300"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
