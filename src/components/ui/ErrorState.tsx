"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { StatePanel } from "@/components/ui/StatePanel";

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
    <StatePanel
      mark={
        <span className="inline-flex h-[88px] w-[88px] items-center justify-center rounded-full bg-cream border-[1.5px] border-berry-500/60 text-berry-600">
          <svg viewBox="0 0 100 100" className="h-[60%] w-[60%]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="50" cy="50" r="35" />
            <path d="M50 32 L50 56" />
            <circle cx="50" cy="68" r="2.5" fill="currentColor" stroke="none" />
          </svg>
        </span>
      }
      title={title}
      body={body}
      className={className}
    >
      {onRetry && (
        <Button onClick={onRetry} variant="editorial" size="md" className="mb-3">
          Erneut versuchen
        </Button>
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
    </StatePanel>
  );
}
