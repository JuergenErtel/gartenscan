"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  hint?: string;
  className?: string;
  /** Schwellwert in ms, ab dem ein „dauert länger"-Sub-Hint gezeigt wird. Default 2000. */
  longHintThresholdMs?: number;
}

export function LoadingState({
  hint = "Einen Moment …",
  className,
  longHintThresholdMs = 2000,
}: LoadingStateProps) {
  const [showLongHint, setShowLongHint] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setShowLongHint(true), longHintThresholdMs);
    return () => clearTimeout(t);
  }, [longHintThresholdMs]);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[40vh] gap-4 px-6",
        className
      )}
    >
      <span className="anim-breath inline-block h-3 w-3 rounded-full bg-bark-900" />
      <p className="font-serif italic text-[14px] text-ink-muted">{hint}</p>
      {showLongHint && (
        <p className="font-serif italic text-[12px] text-ink-soft opacity-60">
          Lädt etwas länger als sonst …
        </p>
      )}
    </div>
  );
}
