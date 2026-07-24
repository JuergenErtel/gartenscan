"use client";

import * as React from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  const detail =
    process.env.NODE_ENV === "development"
      ? [error.message, error.digest && `digest: ${error.digest}`]
          .filter(Boolean)
          .join("\n")
      : undefined;

  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-5 safe-top">
      <ErrorState onRetry={reset} detail={detail} />
    </main>
  );
}
