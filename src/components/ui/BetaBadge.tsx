export function BetaBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full bg-clay-500/10 text-clay-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border border-clay-500/20 " +
        className
      }
      aria-label="Beta-Version"
    >
      Beta
    </span>
  );
}
