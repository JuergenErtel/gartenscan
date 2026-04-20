"use client";

import Image from "next/image";
import { Lock, ArrowRight } from "lucide-react";
import type { ContentEntry, TreatmentMethod } from "@/domain/types";

interface Props {
  entry: ContentEntry;
  metaBadge: string;
  summary: string;
  onPrimaryCta: () => void;
  onSkip: () => void;
}

export function CompactResultView({
  entry,
  metaBadge,
  summary,
  onPrimaryCta,
  onSkip,
}: Props) {
  const recommended =
    entry.methods.find((m) => m.style.includes("BALANCED")) ??
    entry.methods[0];
  const others = entry.methods
    .filter((m) => m.id !== recommended?.id)
    .slice(0, 2);

  return (
    <div className="flex flex-col pt-4 pb-6">
      <div className="relative h-48 w-full overflow-hidden rounded-2xl mb-4">
        <Image
          src={entry.imageUrl}
          alt={entry.name}
          fill
          sizes="(max-width: 640px) 100vw, 512px"
          className="object-cover"
        />
      </div>
      <div className="inline-flex items-center self-start rounded-full bg-forest-700/10 px-3 py-1 text-[11px] font-semibold text-forest-700 uppercase tracking-wide mb-3">
        {metaBadge}
      </div>
      <h1 className="font-serif text-[28px] leading-tight text-forest-900 mb-2 font-normal">
        {entry.name}
      </h1>
      <p className="text-[14px] leading-relaxed text-ink-muted mb-8">
        {summary}
      </p>

      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink-muted mb-3">
        Das kannst du jetzt tun
      </h2>
      <div className="space-y-3 mb-8">
        {recommended && <RecommendedCard method={recommended} />}
        {others.map((m) => (
          <BlurredTeaserCard key={m.id} method={m} />
        ))}
      </div>

      <button
        type="button"
        onClick={onPrimaryCta}
        className="flex w-full items-center justify-center rounded-full bg-clay-500 hover:bg-clay-600 text-paper text-[15px] font-semibold transition active:scale-[0.98]"
        style={{ height: 52 }}
      >
        Alle Maßnahmen ansehen
      </button>
      <button
        type="button"
        onClick={onSkip}
        className="mt-3 w-full py-2 text-[13px] text-ink-muted hover:text-forest-700 transition"
      >
        Später, danke
      </button>
    </div>
  );
}

function RecommendedCard({ method }: { method: TreatmentMethod }) {
  return (
    <div className="rounded-2xl bg-paper p-4 border border-forest-700/15 shadow-[0_2px_10px_rgba(28,42,33,0.05)]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-forest-700">
          Empfohlen für dich
        </span>
        <ArrowRight className="h-4 w-4 text-forest-700" />
      </div>
      <h3 className="text-[15px] font-semibold text-forest-900 mb-1">
        {method.title}
      </h3>
      <p className="text-[13px] leading-relaxed text-ink-muted line-clamp-2">
        {method.description}
      </p>
    </div>
  );
}

function BlurredTeaserCard({ method }: { method: TreatmentMethod }) {
  return (
    <div className="relative rounded-2xl bg-paper p-4 border border-sage-200/60 overflow-hidden">
      <div className="blur-sm select-none">
        <h3 className="text-[15px] font-semibold text-forest-900 mb-1">
          {method.title}
        </h3>
        <p className="text-[13px] leading-relaxed text-ink-muted line-clamp-2">
          {method.description}
        </p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-2 rounded-full bg-forest-900/90 px-3 py-1.5 text-[12px] font-medium text-paper">
          <Lock className="h-3.5 w-3.5" strokeWidth={2} />
          Premium
        </div>
      </div>
    </div>
  );
}
