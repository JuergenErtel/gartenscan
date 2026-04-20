"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface OnboardingFooterProps {
  primaryLabel?: string;
  primaryHref?: string;
  primaryOnClick?: () => void;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  secondaryHref?: string;
  hint?: string;
}

export function OnboardingFooter({
  primaryLabel = "Weiter",
  primaryHref,
  primaryOnClick,
  primaryDisabled,
  secondaryLabel,
  secondaryHref,
  hint,
}: OnboardingFooterProps) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 px-5 pb-[max(env(safe-area-inset-bottom),1rem)] pt-5",
        "bg-gradient-to-t from-sage-50 via-sage-50/95 to-transparent"
      )}
    >
      <div className="mx-auto max-w-lg space-y-2.5">
        {primaryHref && !primaryDisabled ? (
          <Button
            fullWidth
            size="lg"
            href={primaryHref}
            iconRight={<ArrowRight className="h-4 w-4" />}
          >
            {primaryLabel}
          </Button>
        ) : (
          <Button
            fullWidth
            size="lg"
            disabled={primaryDisabled}
            onClick={primaryOnClick}
            iconRight={<ArrowRight className="h-4 w-4" />}
          >
            {primaryLabel}
          </Button>
        )}
        {secondaryLabel && secondaryHref && (
          <Link
            href={secondaryHref}
            className="block text-center text-[13px] text-ink-muted hover:text-forest-700 transition py-1"
          >
            {secondaryLabel}
          </Link>
        )}
        {hint && (
          <p className="text-center text-[11px] text-ink-soft">{hint}</p>
        )}
      </div>
    </div>
  );
}
