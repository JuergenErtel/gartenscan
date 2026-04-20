"use client";

import { cn } from "@/lib/utils";

interface Props {
  total?: number;
  active: number; // 1-indexed
  className?: string;
}

export function ProgressDots({ total = 6, active, className }: Props) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1.5",
        className
      )}
      aria-label={`Schritt ${active} von ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const index = i + 1;
        const isActive = index === active;
        return (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              isActive
                ? "w-6 bg-forest-700"
                : index < active
                ? "w-1.5 bg-forest-700/40"
                : "w-1.5 bg-forest-700/15"
            )}
          />
        );
      })}
    </div>
  );
}
