"use client";

import { cn } from "@/lib/utils";

interface Props {
  value: boolean | null;
  onChange: (value: boolean) => void;
  className?: string;
  ariaLabel?: string;
}

export function YesNoToggle({
  value,
  onChange,
  className,
  ariaLabel,
}: Props) {
  return (
    <div
      className={cn(
        "inline-flex rounded-full bg-sage-100 p-1",
        className
      )}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {[
        { val: true, label: "Ja" },
        { val: false, label: "Nein" },
      ].map(({ val, label }) => {
        const isActive = value === val;
        return (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(val)}
            className={cn(
              "rounded-full px-5 py-1.5 text-[13px] font-medium transition min-w-[60px]",
              isActive
                ? "bg-paper text-forest-900 shadow-[0_1px_3px_rgba(28,42,33,0.08)]"
                : "text-forest-900/70"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
