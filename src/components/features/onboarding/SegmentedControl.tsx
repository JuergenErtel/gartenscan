"use client";

import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: SegmentOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: Props<T>) {
  return (
    <div
      className={cn(
        "inline-flex w-full rounded-xl bg-sage-100 p-1",
        className
      )}
      role="radiogroup"
    >
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-[13px] font-medium transition",
              isActive
                ? "bg-paper text-forest-900 shadow-[0_1px_3px_rgba(28,42,33,0.08)]"
                : "text-forest-900/70 hover:text-forest-900"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
