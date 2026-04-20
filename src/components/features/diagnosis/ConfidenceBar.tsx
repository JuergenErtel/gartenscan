import { cn } from "@/lib/utils";

export function ConfidenceBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const pct = Math.round(value * 100);
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative h-1 w-16 overflow-hidden rounded-full bg-sage-200">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-moss-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] font-semibold text-forest-800">{pct}%</span>
    </div>
  );
}
