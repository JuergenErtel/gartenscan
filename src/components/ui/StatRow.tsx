import * as React from "react";
import { cn } from "@/lib/utils";

interface StatItem {
  value: React.ReactNode;
  label: string;
}

export function StatRow({ items, className }: { items: StatItem[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-3 gap-2 rounded-lg bg-cream p-2", className)}>
      {items.map((item, i) => (
        <div key={i} className="flex flex-col items-center gap-1 rounded-md bg-linen px-2 py-3 text-center">
          <span className="text-[16px] font-semibold text-bark-900">{item.value}</span>
          <span className="eyebrow text-ink-muted">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
