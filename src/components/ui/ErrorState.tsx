"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  body?: string;
  detail?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Fehler-Layout für error.tsx Boundaries und manuelle Fehler-States.
 * Mark in berry-Color als visueller Marker.
 */
export function ErrorState({
  title = "Etwas ist schiefgelaufen",
  body = "Wir konnten den Vorgang nicht abschließen. Versuche es bitte erneut.",
  detail,
  onRetry,
  className,
}: ErrorStateProps) {
  const [showDetail, setShowDetail] = React.useState(false);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-12 mx-auto max-w-sm",
        className
      )}
    >
      <span className="inline-flex h-[88px] w-[88px] items-center justify-center rounded-full bg-cream border-[1.5px] border-berry-500/60">
        <svg viewBox="0 0 100 100" className="h-[60%] w-[60%]" fill="none" stroke="#7a2e2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="35" />
          <path d="M50 32 L50 56" />
          <circle cx="50" cy="68" r="2.5" fill="#7a2e2e" stroke="none" />
        </svg>
      </span>
      <h3 className="display-m mt-6 mb-2 text-bark-900">{title}</h3>
      <p className="text-[14px] leading-relaxed text-ink-muted mb-6">{body}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="tap-press inline-flex items-center justify-center rounded-[14px] bg-bark-900 px-6 h-12 text-cream text-[14px] font-medium hover:bg-clay-800 transition-colors mb-3"
        >
          Erneut versuchen
        </button>
      )}
      {detail && (
        <>
          <button
            type="button"
            onClick={() => setShowDetail((v) => !v)}
            className="text-[12px] text-ink-soft underline-offset-4 hover:underline"
          >
            {showDetail ? "Details ausblenden" : "Details anzeigen"}
          </button>
          {showDetail && (
            <pre className="mt-3 max-w-full overflow-x-auto rounded-md bg-linen p-3 text-left text-[11px] text-ink-muted whitespace-pre-wrap break-words">
              {detail}
            </pre>
          )}
        </>
      )}
    </div>
  );
}
