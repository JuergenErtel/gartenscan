"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Infinity as InfinityIcon,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Interval = "month" | "year";
type Tier = "free" | "premium" | "pro";

const plans = {
  free: {
    name: "Free",
    tagline: "Zum Reinschauen",
    monthly: 0,
    yearly: 0,
    features: [
      "3 Scans pro Monat",
      "Basis-Erkennung",
      "Ein erster Tipp pro Fall",
      "Kleiner Garten ohne Verlaufstiefe",
    ],
    missing: [
      "Volle Handlungsempfehlungen",
      "Folgeaufgaben und Erinnerungen",
      "Coach mit Kontext",
    ],
  },
  premium: {
    name: "Premium",
    tagline: "Fuer echte Problemloesung",
    monthly: 9.99,
    yearly: 59.99,
    badge: "Bester Wert",
    features: [
      "Unbegrenzte Scans",
      "Volle Massnahmenplaene nach Wirkung sortiert",
      "Bio, schnell und haustierfreundlich vergleichbar",
      "Verlauf mit Folgeaufgaben und Beobachtung",
      "Wetterwarnungen fuer deinen Garten",
      "Coach mit Problemkontext",
    ],
  },
  pro: {
    name: "Pro",
    tagline: "Fuer ambitionierte Gartenhaushalte",
    monthly: 19.99,
    yearly: 129,
    features: [
      "Alles aus Premium",
      "Experten-Chat mit Antwort unter 24h",
      "Monatlicher Garten-Gesundheitsreport",
      "Familien-Account bis 5 Personen",
      "Fruehere Wetterwarnungen",
      "Exklusive Masterclasses",
    ],
  },
} as const;

const PROMISES = [
  {
    eyebrow: "Warum zahlen?",
    quote: "Weil du nicht fuer Namen zahlst. Du zahlst fuer Entscheidungen.",
    foot: "Die Paywall muss auf Problemloesung einzahlen, nicht auf Feature-Listen.",
  },
  {
    eyebrow: "Wertmoment 1",
    quote: "Ein echter Fall endet nicht beim Scan, sondern beim richtigen naechsten Schritt.",
    foot: "Premium vertieft, priorisiert und merkt sich, was du bereits getan hast.",
  },
  {
    eyebrow: "Wertmoment 2",
    quote: "Wenn Wetter, Verlauf und Coach zusammenspielen, wird aus einer App ein Werkzeug.",
    foot: "Genau dort entsteht Wiederkehrnutzen und Abowert.",
  },
];

export default function PremiumPage() {
  const [interval, setInterval] = useState<Interval>("year");
  const [selected, setSelected] = useState<Tier>("premium");

  const formatPrice = (value: number) =>
    value === 0 ? "0 EUR" : `${value.toFixed(2).replace(".", ",")} EUR`;

  return (
    <div className="min-h-screen bg-linen pb-32">
      <header className="safe-top sticky top-0 z-30 flex h-14 items-center justify-between bg-linen/85 px-4 backdrop-blur-md">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-paper active:scale-95 transition"
        >
          <ArrowLeft className="h-5 w-5 text-forest-700" />
        </Link>
        <span className="text-[12px] font-medium text-ink-muted">Spaeter</span>
      </header>

      <section className="px-5 pt-4">
        <div className="relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-[28px] bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 p-8 text-paper">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-clay-500/20 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-moss-500/30 blur-2xl" />

          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-paper/10 px-3 py-1 backdrop-blur">
              <Sparkles className="h-3 w-3 text-clay-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                gartenscan Premium
              </span>
            </div>
            <h1 className="max-w-[90%] font-serif text-[34px] leading-[1.1] tracking-tight font-normal">
              Premium ist nur dann logisch, wenn es echte Probleme besser loest.
            </h1>
          </div>
          <p className="relative mt-6 max-w-[90%] text-[14px] leading-relaxed text-sage-200/85">
            Mehr Wert entsteht nicht durch mehr Bla-Bla, sondern durch bessere
            Priorisierung, Folgeaufgaben, Erinnerungen und den besseren naechsten
            Schritt.
          </p>
        </div>
      </section>

      <div className="my-8 space-y-4 px-5">
        {PROMISES.map((promise) => (
          <article
            key={promise.eyebrow}
            className="rounded-2xl border border-terra-500/20 bg-cream p-5 shadow-[var(--shadow-editorial)]"
          >
            <p className="eyebrow mb-3">{promise.eyebrow}</p>
            <p className="pull-quote">{promise.quote}</p>
            <p className="mt-3 text-[12px] leading-relaxed text-ink-muted">
              {promise.foot}
            </p>
          </article>
        ))}
      </div>

      <section className="px-5">
        <div className="rounded-[22px] border border-sage-200 bg-paper p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Was Premium konkret besser macht
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3">
            <ValueCard
              title="Nach dem Scan geht es weiter"
              body="Volle Plaene, bessere Auswahl zwischen bio, schnell und sicher und eine zweite Entscheidung nach der ersten Massnahme."
            />
            <ValueCard
              title="Der Verlauf wird nutzbar"
              body="Statt einer Liste alter Fotos bekommst du offene Faelle, Folgeaufgaben und Beobachtung ueber Zeit."
            />
            <ValueCard
              title="Der Coach hat Kontext"
              body="Fragen ohne Kontext sind nett. Entscheidungen mit deinem Garten, Wetter und Verlauf sind wertvoll."
            />
          </div>
        </div>
      </section>

      <section className="px-5 pt-10">
        <div className="mx-auto inline-flex w-full items-center rounded-full border border-sage-200 bg-paper p-1">
          {(["year", "month"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setInterval(item)}
              className={cn(
                "relative h-10 flex-1 rounded-full text-[13px] font-semibold transition-all",
                interval === item
                  ? "bg-forest-700 text-paper shadow"
                  : "text-ink-muted hover:text-forest-700"
              )}
            >
              {item === "year" ? "Jaehrlich" : "Monatlich"}
              {item === "year" && interval === "year" && (
                <Badge
                  tone="premium"
                  className="ml-2 !bg-clay-400 !px-1.5 !py-0 !text-[9px]"
                >
                  40% sparen
                </Badge>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3 px-5 pt-6">
        {(Object.keys(plans) as Tier[]).map((tier) => {
          const plan = plans[tier];
          const price = interval === "year" ? plan.yearly : plan.monthly;
          const isSelected = selected === tier;
          const isPremium = tier === "premium";
          const isPro = tier === "pro";

          return (
            <button
              key={tier}
              onClick={() => setSelected(tier)}
              className={cn(
                "relative w-full overflow-hidden rounded-[22px] text-left transition-all duration-300",
                isSelected
                  ? "bg-paper ring-2 ring-forest-700 shadow-[0_8px_28px_rgba(28,42,33,0.12)]"
                  : "bg-paper/70 ring-1 ring-sage-200",
                isPro && "bg-gradient-to-br from-paper to-paper-dim"
              )}
            >
              {isPremium && "badge" in plan && (
                <div className="absolute top-0 right-6 rounded-b-[10px] bg-clay-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-paper">
                  {plan.badge}
                </div>
              )}
              <div className="p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      {plan.tagline}
                    </p>
                    <h3
                      className={cn(
                        "mt-1 font-serif text-[26px] leading-tight font-normal",
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
                        <p className="mt-1 text-[11px] text-ink-muted">
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
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-[13px] text-forest-800"
                    >
                      <Check
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          isPro ? "text-clay-500" : "text-moss-500"
                        )}
                        strokeWidth={2.5}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {"missing" in plan &&
                    plan.missing?.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-[13px] text-ink-soft"
                      >
                        <span className="mt-0.5 inline-block h-4 w-4 shrink-0 text-center">
                          -
                        </span>
                        <span className="line-through">{feature}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </button>
          );
        })}
      </section>

      <section className="px-5 pt-8">
        <figure className="rounded-[20px] bg-paper-dim p-6">
          <blockquote className="font-serif text-[18px] leading-[1.45] text-forest-900 italic font-normal">
            "Der Unterschied ist nicht, dass die App mehr weiss. Der Unterschied
            ist, dass ich schneller die richtige Entscheidung treffe."
          </blockquote>
          <figcaption className="mt-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-moss-500 to-forest-700 text-[13px] font-semibold text-paper">
              AS
            </div>
            <div>
              <p className="text-[13px] font-semibold text-forest-900">
                Anna Schaefer
              </p>
              <p className="text-[11px] text-ink-muted">
                Premium-Nutzerin - Berlin
              </p>
            </div>
          </figcaption>
        </figure>
      </section>

      <section className="px-5 pt-8">
        <div className="flex items-center justify-around">
          {[
            { icon: ShieldCheck, label: "Keine Abofallen" },
            { icon: Zap, label: "Jederzeit kuendbar" },
            { icon: InfinityIcon, label: "14 Tage Rueckgabe" },
          ].map((trust) => (
            <div key={trust.label} className="flex flex-col items-center gap-1.5">
              <trust.icon className="h-5 w-5 text-forest-700" strokeWidth={1.5} />
              <span className="text-center text-[11px] text-ink-muted">
                {trust.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-sage-50 via-sage-50/95 to-transparent px-5 pt-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
        <div className="mx-auto max-w-lg space-y-2">
          <Button fullWidth size="lg">
            {selected === "free"
              ? "Weiter mit Free"
              : `7 Tage ${plans[selected].name} kostenlos testen`}
          </Button>
          <p className="text-center text-[11px] text-ink-muted">
            Keine Belastung bis zum Testende. Jederzeit kuendbar.
          </p>
        </div>
      </div>
    </div>
  );
}

function ValueCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[18px] bg-sage-50 p-4">
      <p className="text-[14px] font-semibold text-bark-900">{title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}
