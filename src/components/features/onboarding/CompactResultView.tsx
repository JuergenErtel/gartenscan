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
          className="object-cover [filter:contrast(0.92)_saturate(0.85)_sepia(0.12)_brightness(1.02)]"
        />
        <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_50%,rgba(58,37,21,0.18)_100%)]" />
      </div>

      <p className="eyebrow self-start mb-2">{metaBadge}</p>
      <h1 className="font-serif text-[28px] leading-tight text-bark-900 mb-2 font-normal tracking-tight">
        {entry.name}
      </h1>
      <p className="text-[14px] leading-relaxed text-ink-muted mb-6">
        {summary}
      </p>

      <p className="eyebrow mb-3">Das kannst du jetzt tun</p>
      <div className="space-y-3 mb-8">
        {recommended && <RecommendedCard method={recommended} />}
        {others.map((m) => (
          <BlurredTeaserCard key={m.id} method={m} />
        ))}
      </div>

      <button
        type="button"
        onClick={onPrimaryCta}
        className="tap-press flex w-full items-center justify-center rounded-[14px] bg-bark-900 hover:bg-clay-800 text-cream text-[15px] font-medium transition-colors"
        style={{ height: 52 }}
      >
        Alle Maßnahmen ansehen
      </button>
      <button
        type="button"
        onClick={onSkip}
        className="mt-3 w-full py-2 text-[13px] text-ink-muted hover:text-bark-900 transition"
      >
        Später, danke
      </button>
    </div>
  );
}

function RecommendedCard({ method }: { method: TreatmentMethod }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-bark-900 to-clay-800 p-4 shadow-[var(--shadow-editorial)]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-sun-500">
          Empfohlen für dich
        </span>
        <ArrowRight className="h-4 w-4 text-cream" />
      </div>
      <h3 className="font-serif text-[16px] font-bold text-cream mb-1">
        {method.title}
      </h3>
      <p className="text-[13px] leading-relaxed text-cream/75 line-clamp-2">
        {method.description}
      </p>
    </div>
  );
}

function BlurredTeaserCard({ method }: { method: TreatmentMethod }) {
  return (
    <div className="relative rounded-2xl bg-linen p-4 overflow-hidden">
      <div className="opacity-50">
        <h3 className="font-serif text-[15px] font-semibold text-bark-900 mb-1">
          {method.title}
        </h3>
        <p className="text-[13px] leading-relaxed text-ink-muted line-clamp-2">
          {method.description}
        </p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-linen/40 to-linen/95 backdrop-blur-[1.5px]" />
      <div className="absolute bottom-3 right-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-500 px-2.5 py-1 text-[10px] font-bold text-bark-900">
          <Lock className="h-3 w-3" strokeWidth={2.5} />
          Premium
        </span>
      </div>
    </div>
  );
}
