import * as React from "react";
import { BotanicalIcon } from "@/components/ui/BotanicalIcon";
import { Button } from "@/components/ui/Button";
import type { BotanicalName } from "@/components/icons/botanical";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  mark: BotanicalName;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
  className?: string;
}

export function EmptyState({
  mark,
  title,
  body,
  ctaLabel,
  ctaHref,
  onCta,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-12 mx-auto max-w-sm",
        className
      )}
    >
      <BotanicalIcon name={mark} size={88} animate />
      <h3 className="display-m mt-6 mb-2 text-bark-900">{title}</h3>
      <p className="text-[14px] leading-relaxed text-ink-muted mb-6">{body}</p>
      {ctaLabel && ctaHref && (
        <Button href={ctaHref} variant="editorial" size="md">
          {ctaLabel}
        </Button>
      )}
      {ctaLabel && onCta && !ctaHref && (
        <Button onClick={onCta} variant="editorial" size="md">
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
