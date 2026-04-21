import * as React from "react";
import Link from "next/link";
import { BotanicalIcon } from "@/components/ui/BotanicalIcon";
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
        <Link
          href={ctaHref}
          className="tap-press inline-flex items-center justify-center rounded-[14px] bg-bark-900 px-6 h-12 text-cream text-[14px] font-medium hover:bg-clay-800 transition-colors"
        >
          {ctaLabel}
        </Link>
      )}
      {ctaLabel && onCta && !ctaHref && (
        <button
          type="button"
          onClick={onCta}
          className="tap-press inline-flex items-center justify-center rounded-[14px] bg-bark-900 px-6 h-12 text-cream text-[14px] font-medium hover:bg-clay-800 transition-colors"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
