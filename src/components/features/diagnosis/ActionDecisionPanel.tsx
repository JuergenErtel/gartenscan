"use client";

import { AlertTriangle, ArrowRight, Clock3, Heart, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { UrgencyIndicator } from "@/components/ui/UrgencyIndicator";
import { useProfile } from "@/hooks/useProfile";
import { generateRecommendationPlan } from "@/domain/recommendations/engine";
import type {
  ActionTimeframe,
  ContentEntry,
  Significance,
  TreatmentMethod,
  Urgency,
} from "@/domain/types";

export function ActionDecisionPanel({
  entry,
  scanId,
}: {
  entry: ContentEntry;
  scanId: string;
}) {
  const { profile, loading } = useProfile();
  const plan =
    profile && !loading ? generateRecommendationPlan(entry, profile) : null;

  const recommended = plan
    ? [...plan.nowActions, ...plan.thisWeekActions, ...plan.longTermActions]
    : entry.methods.map((method, index) => ({
        method,
        priority: entry.methods.length - index,
        recommended: true,
      }));

  const primary = recommended[0]?.method ?? entry.methods[0];
  const alternatives = recommended
    .slice(1)
    .map((item) => item.method)
    .filter((method, index, array) => array.findIndex((item) => item.id === method.id) === index)
    .slice(0, 2);

  if (!primary) return null;

  const warnings =
    plan?.warnings.length
      ? plan.warnings
      : entry.safety.notes
        ? [entry.safety.notes]
        : [];

  const summary = plan?.summary ?? buildSummary(entry);
  const coachPrompt = encodeURIComponent(
    `Ich habe ${entry.name} erkannt. Hilf mir zu entscheiden, welche Massnahme fuer mich am sinnvollsten ist: bio, schnell oder haustierfreundlich.`
  );

  return (
    <section className="px-5 pt-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-clay-800" strokeWidth={1.75} />
        <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted">
          Was jetzt zaehlt
        </p>
      </div>

      <div className="rounded-[24px] bg-gradient-to-br from-bark-900 to-clay-800 p-5 text-cream shadow-[var(--shadow-editorial-lg)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-[28px] leading-[1.08] tracking-tight">
              Nicht nur erkannt. Direkt einschaetzbar.
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-cream/82">
              {summary}
            </p>
          </div>
          <UrgencyIndicator
            urgency={entry.defaultUrgency}
            className="!bg-paper/12 !text-paper"
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <DecisionFact
            label="Problemstufe"
            value={significanceLabel(entry.significance)}
            detail={significanceDetail(entry.significance)}
          />
          <DecisionFact
            label="Handlungsbedarf"
            value={urgencyTitle(entry.defaultUrgency)}
            detail={urgencyDetail(entry.defaultUrgency)}
          />
          <DecisionFact
            label="Bester Einstieg"
            value={`${primary.durationMin} Min`}
            detail={timeframeLabel(primary.timeframe)}
          />
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="mt-4 space-y-2">
          {warnings.slice(0, 2).map((warning, index) => (
            <div
              key={`${warning}-${index}`}
              className="rounded-[18px] border border-berry-500/20 bg-berry-100/85 p-4"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0 text-berry-600"
                  strokeWidth={1.75}
                />
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-berry-600">
                    Darauf achten
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-bark-900">
                    {warning}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 rounded-[24px] bg-paper p-5 shadow-[var(--shadow-editorial)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-moss-600">
              Erste sinnvolle Massnahme
            </p>
            <h3 className="mt-2 font-serif text-[24px] leading-tight text-bark-900">
              {primary.title}
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
              {primary.description}
            </p>
          </div>
          <div className="rounded-full bg-sage-100 px-3 py-1.5 text-[12px] font-semibold text-forest-900">
            {primary.durationMin} Min
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="outline" icon={<Clock3 className="h-3 w-3" />}>
            {timeframeLabel(primary.timeframe)}
          </Badge>
          {primary.style.includes("ORGANIC") && (
            <Badge tone="success" icon={<Leaf className="h-3 w-3" />}>
              Bio moeglich
            </Badge>
          )}
          {primary.safeForPets && (
            <Badge tone="info" icon={<Heart className="h-3 w-3" />}>
              Haustierfreundlich
            </Badge>
          )}
          {primary.safeForChildren && (
            <Badge tone="info" icon={<ShieldCheck className="h-3 w-3" />}>
              Kindersicherer Weg
            </Badge>
          )}
        </div>

        <ol className="mt-5 space-y-3">
          {primary.steps.slice(0, 3).map((step, index) => (
            <li key={`${primary.id}-${index}`} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-100 text-[12px] font-semibold text-forest-900">
                {index + 1}
              </span>
              <p className="pt-1 text-[14px] leading-relaxed text-bark-900">
                {step}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex flex-col gap-3">
          <Button
            href={`/scan/${scanId}/actions`}
            fullWidth
            size="lg"
            iconRight={<ArrowRight className="h-4 w-4" />}
          >
            Komplette Handlungsempfehlung oeffnen
          </Button>
          <Button
            href={`/coach?q=${coachPrompt}`}
            fullWidth
            size="md"
            variant="secondary"
          >
            Bio, schnell oder haustierfreundlich vergleichen
          </Button>
        </div>
      </div>

      {alternatives.length > 0 && (
        <div className="mt-4 rounded-[22px] bg-cream p-5">
          <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted">
            Weitere sinnvolle Wege
          </p>
          <div className="mt-3 space-y-2.5">
            {alternatives.map((method) => (
              <AlternativeMethodCard key={method.id} method={method} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function DecisionFact({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[18px] bg-paper/10 p-4 backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-cream/65">
        {label}
      </p>
      <p className="mt-1 font-serif text-[20px] leading-tight text-paper">
        {value}
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-cream/72">
        {detail}
      </p>
    </div>
  );
}

function AlternativeMethodCard({ method }: { method: TreatmentMethod }) {
  return (
    <div className="rounded-[16px] border border-clay-800/10 bg-paper p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-[15px] font-semibold text-bark-900">
            {method.title}
          </h4>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
            {method.description}
          </p>
        </div>
        <span className="rounded-full bg-sage-100 px-2.5 py-1 text-[11px] font-semibold text-forest-900">
          {method.durationMin} Min
        </span>
      </div>
    </div>
  );
}

function buildSummary(entry: ContentEntry): string {
  switch (entry.significance) {
    case "DANGEROUS":
      return "Das ist nicht nur interessant, sondern akut relevant. Warte nicht zu lange mit der ersten Massnahme.";
    case "HARMFUL":
      return "Das Problem ist real und wird ohne Gegenmassnahme meist eher groesser als kleiner.";
    case "NUISANCE":
      return "Nicht dramatisch, aber es stoert oder breitet sich aus, wenn du es laufen laesst.";
    case "BENEFIT":
      return "Gute Nachricht: Das ist eher nuetzlich als problematisch. Es geht vor allem um richtiges Einordnen und Pflegen.";
    case "NEUTRAL":
      return "Kein akutes Problem. Du musst hier vor allem einordnen statt eingreifen.";
  }
}

function significanceLabel(significance: Significance): string {
  switch (significance) {
    case "DANGEROUS":
      return "Kritisch";
    case "HARMFUL":
      return "Problematisch";
    case "NUISANCE":
      return "Laestig";
    case "BENEFIT":
      return "Nuetzlich";
    case "NEUTRAL":
      return "Unkritisch";
  }
}

function significanceDetail(significance: Significance): string {
  switch (significance) {
    case "DANGEROUS":
      return "kann Schaden oder Risiko schnell vergroessern";
    case "HARMFUL":
      return "sollte nicht einfach ignoriert werden";
    case "NUISANCE":
      return "entscheidest du nach Anspruch und Flaeche";
    case "BENEFIT":
      return "eher schuetzen als bekaempfen";
    case "NEUTRAL":
      return "meist reicht beobachten";
  }
}

function urgencyTitle(urgency: Urgency): string {
  switch (urgency) {
    case "IMMEDIATE":
      return "Heute handeln";
    case "THIS_WEEK":
      return "Diese Woche";
    case "MONITOR":
      return "Beobachten";
    case "GONE":
      return "Kein Eingriff";
  }
}

function urgencyDetail(urgency: Urgency): string {
  switch (urgency) {
    case "IMMEDIATE":
      return "jetzt eingreifen, bevor es kippt";
    case "THIS_WEEK":
      return "bald angehen, damit es nicht eskaliert";
    case "MONITOR":
      return "nur handeln, wenn es mehr wird";
    case "GONE":
      return "eher pflegen als behandeln";
  }
}

function timeframeLabel(timeframe: ActionTimeframe): string {
  switch (timeframe) {
    case "NOW":
      return "Jetzt";
    case "THIS_WEEK":
      return "Diese Woche";
    case "LONG_TERM":
      return "Langfristig";
    case "SEASONAL":
      return "Saisonal";
  }
}
