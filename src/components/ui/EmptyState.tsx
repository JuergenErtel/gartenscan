import * as React from "react";
import { BotanicalIcon } from "@/components/ui/BotanicalIcon";
import { Button } from "@/components/ui/Button";
import { StatePanel } from "@/components/ui/StatePanel";
import type { BotanicalName } from "@/components/icons/botanical";

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
    <StatePanel
      mark={<BotanicalIcon name={mark} size={88} animate />}
      title={title}
      body={body}
      className={className}
    >
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
    </StatePanel>
  );
}
