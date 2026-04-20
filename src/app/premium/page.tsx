"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Sparkles,
  CloudRain,
  MessageCircle,
  Calendar,
  Infinity as InfinityIcon,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { OnboardingGuard } from "@/components/features/onboarding/OnboardingGuard";

type Interval = "month" | "year";
type Tier = "free" | "premium" | "pro";

const plans = {
  free: {
    name: "Free",
    tagline: "Einsteiger",
    monthly: 0,
    yearly: 0,
    features: [
      "3 Scans pro Monat",
      "Basis-Identifikation",
      "5 Pflanzen im Garten",
      "Ein erster Tipp je Scan",
    ],
    missing: ["Volle Maßnahmenpläne", "Wetterwarnungen", "Experten-Chat"],
  },
  premium: {
    name: "Premium",
    tagline: "Für Hobbygärtner",
    monthly: 9.99,
    yearly: 59.99,
    badge: "Beliebteste Wahl",
    features: [
      "Unbegrenzte Scans",
      "Volle Maßnahmenpläne mit Priorisierung",
      "Wetter-gekoppelte Frost-Warnungen",
      "Pflanzen-Symptom-Tracking",
      "Mein Garten unbegrenzt",
      "Werbefrei & Offline-Modus",
    ],
  },
  pro: {
    name: "Pro",
    tagline: "Für echte Gartenfreunde",
    monthly: 19.99,
    yearly: 129,
    features: [
      "Alles aus Premium",
      "Experten-Chat – Antwort <24h",
      "Monatlicher Garten-Gesundheitsreport",
      "Familien-Account bis 5 Personen",
      "48h früher Wetterwarnungen",
      "Exklusive Masterclasses",
    ],
  },
} as const;

const valueStories = [
  {
    icon: CloudRain,
    title: "Bevor es kritisch wird",
    text: "Wetter- und Schädlingswarnungen zwei Tage im Voraus, spezifisch für deine PLZ.",
  },
  {
    icon: MessageCircle,
    title: "Wenn du unsicher bist",
    text: "Echte Gartenbauer beantworten deine Frage binnen 24 Stunden.",
  },
  {
    icon: Calendar,
    title: "Jahr für Jahr",
    text: "Dein persönliches Gartenjahrbuch dokumentiert jede Entscheidung und jeden Erfolg.",
  },
];

export default function PremiumPage() {
  const [interval, setInterval] = useState<Interval>("year");
  const [selected, setSelected] = useState<Tier>("premium");

  const formatPrice = (n: number) =>
    n === 0 ? "0 €" : n.toFixed(2).replace(".", ",") + " €";

  return (
    <OnboardingGuard>
    <div className="min-h-screen bg-sage-50 pb-32">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-sage-50/85 backdrop-blur-md safe-top">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-paper active:scale-95 transition"
        >
          <ArrowLeft className="h-5 w-5 text-forest-700" />
        </Link>
        <span className="text-[12px] font-medium text-ink-muted">
          Später
        </span>
      </header>

      {/* Editorial Hero */}
      <section className="px-5 pt-4">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 p-8 text-paper min-h-[320px] flex flex-col justify-between">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-clay-500/20 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-moss-500/30 blur-2xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-paper/10 backdrop-blur px-3 py-1 mb-6">
              <Sparkles className="h-3 w-3 text-clay-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                gartenscan Premium
              </span>
            </div>
            <h1 className="font-serif text-[34px] leading-[1.1] tracking-tight font-normal max-w-[90%]">
              Dein Garten verdient mehr als Identifikation.
            </h1>
          </div>
          <p className="relative text-[14px] leading-relaxed text-sage-200/85 max-w-[90%] mt-6">
            Ein persönlicher Gartenexperte in der Tasche – 365 Tage im Jahr,
            bei jedem Wetter, für jede Pflanze.
          </p>
        </div>
      </section>

      {/* Value stories */}
      <section className="px-5 pt-8 space-y-3">
        {valueStories.map((v) => (
          <div
            key={v.title}
            className="flex items-start gap-4 rounded-[18px] bg-paper p-5 shadow-[0_2px_12px_rgba(28,42,33,0.04)]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage-100 text-forest-700">
              <v.icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="font-serif text-[18px] leading-tight text-forest-900 font-normal mb-1">
                {v.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-ink-muted">
                {v.text}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Interval toggle */}
      <section className="px-5 pt-10">
        <div className="mx-auto inline-flex items-center rounded-full bg-paper p-1 w-full border border-sage-200">
          {(["year", "month"] as const).map((i) => (
            <button
              key={i}
              onClick={() => setInterval(i)}
              className={cn(
                "flex-1 h-10 rounded-full text-[13px] font-semibold transition-all relative",
                interval === i
                  ? "bg-forest-700 text-paper shadow"
                  : "text-ink-muted hover:text-forest-700"
              )}
            >
              {i === "year" ? "Jährlich" : "Monatlich"}
              {i === "year" && interval !== "year" && (
                <span className="ml-2 text-[10px] font-bold text-clay-500">
                  40% SPAREN
                </span>
              )}
              {i === "year" && interval === "year" && (
                <Badge
                  tone="premium"
                  className="!py-0 !px-1.5 !text-[9px] ml-2 !bg-clay-400"
                >
                  40% sparen
                </Badge>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section className="px-5 pt-6 space-y-3">
        {(Object.keys(plans) as Tier[]).map((t) => {
          const plan = plans[t];
          const price = interval === "year" ? plan.yearly : plan.monthly;
          const isSelected = selected === t;
          const isPremium = t === "premium";
          const isPro = t === "pro";

          return (
            <button
              key={t}
              onClick={() => setSelected(t)}
              className={cn(
                "w-full text-left overflow-hidden rounded-[22px] transition-all duration-300 relative",
                isSelected
                  ? "bg-paper ring-2 ring-forest-700 shadow-[0_8px_28px_rgba(28,42,33,0.12)]"
                  : "bg-paper/70 ring-1 ring-sage-200",
                isPro && "bg-gradient-to-br from-paper to-paper-dim"
              )}
            >
              {isPremium && "badge" in plan && (
                <div className="absolute top-0 right-6 bg-clay-500 text-paper text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-b-[10px]">
                  {plan.badge}
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted">
                      {plan.tagline}
                    </p>
                    <h3
                      className={cn(
                        "font-serif text-[26px] leading-tight font-normal mt-1",
                        isPro ? "text-clay-600" : "text-forest-900"
                      )}
                    >
                      {plan.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    {price > 0 ? (
                      <>
                        <p className="font-serif text-[26px] leading-none text-forest-900 tabular-nums">
                          {formatPrice(price)}
                        </p>
                        <p className="text-[11px] text-ink-muted mt-1">
                          {interval === "year" ? "pro Jahr" : "pro Monat"}
                        </p>
                      </>
                    ) : (
                      <p className="font-serif text-[22px] text-ink-muted">
                        Kostenlos
                      </p>
                    )}
                  </div>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-[13px] text-forest-800"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0 mt-0.5",
                          isPro ? "text-clay-500" : "text-moss-500"
                        )}
                        strokeWidth={2.5}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                  {"missing" in plan &&
                    plan.missing?.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-[13px] text-ink-soft"
                      >
                        <span className="h-4 w-4 shrink-0 mt-0.5 inline-block text-center">
                          —
                        </span>
                        <span className="line-through">{f}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </button>
          );
        })}
      </section>

      {/* Testimonial */}
      <section className="px-5 pt-8">
        <figure className="rounded-[20px] bg-paper-dim p-6">
          <blockquote className="font-serif text-[18px] leading-[1.45] text-forest-900 italic font-normal">
            „Seit ich gartenscan nutze, habe ich keinen Schädlingsbefall
            mehr übersehen. Meine Rosen haben noch nie so geblüht."
          </blockquote>
          <figcaption className="flex items-center gap-3 mt-5">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-moss-500 to-forest-700 flex items-center justify-center text-paper font-semibold text-[13px]">
              AS
            </div>
            <div>
              <p className="text-[13px] font-semibold text-forest-900">
                Anna Schäfer
              </p>
              <p className="text-[11px] text-ink-muted">
                Premium-Nutzerin · Berlin
              </p>
            </div>
          </figcaption>
        </figure>
      </section>

      {/* Trust row */}
      <section className="px-5 pt-8">
        <div className="flex items-center justify-around">
          {[
            { icon: ShieldCheck, label: "Keine Abofallen" },
            { icon: Zap, label: "Jederzeit kündbar" },
            { icon: InfinityIcon, label: "14 Tage Rückgabe" },
          ].map((t) => (
            <div key={t.label} className="flex flex-col items-center gap-1.5">
              <t.icon className="h-5 w-5 text-forest-700" strokeWidth={1.5} />
              <span className="text-[11px] text-ink-muted text-center">
                {t.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-5 pb-[max(env(safe-area-inset-bottom),1rem)] pt-4 bg-gradient-to-t from-sage-50 via-sage-50/95 to-transparent">
        <div className="mx-auto max-w-lg space-y-2">
          <Button fullWidth size="lg">
            {selected === "free"
              ? "Weiter mit Free"
              : `7 Tage ${plans[selected].name} kostenlos testen`}
          </Button>
          <p className="text-center text-[11px] text-ink-muted">
            Keine Belastung bis zum Testende. Jederzeit kündbar.
          </p>
        </div>
      </div>
    </div>
    </OnboardingGuard>
  );
}
