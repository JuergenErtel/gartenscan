import Image from "next/image";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { getContentById } from "@/content";
import { PersonalizedPlan } from "@/components/features/actions/PersonalizedPlan";
import { PersonalizedSafetyBanner } from "@/components/features/diagnosis/PersonalizedSafetyBanner";
import { OnboardingGuard } from "@/components/features/onboarding/OnboardingGuard";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { StatRow } from "@/components/ui/StatRow";
import { UrgencyIndicator } from "@/components/ui/UrgencyIndicator";
import type { EffortLevel, TreatmentMethod } from "@/domain/types";
import { getHistoryItem } from "@/lib/services/historyService";
import { createClient } from "@/lib/supabase/server";

export default async function ActionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const scanItem = user ? await getHistoryItem(user.id, id) : null;
  const entry = scanItem?.matchedEntry ?? getContentById(id);

  if (!entry) return notFound();

  const totalMin = entry.methods.reduce((sum, method) => sum + method.durationMin, 0);
  const primaryMethod = entry.methods[0];
  const backHref = scanItem ? `/scan/${scanItem.scan.id}` : `/scan/${entry.id}`;

  return (
    <OnboardingGuard>
      <div className="min-h-screen bg-linen pb-10">
        <ScreenHeader back={backHref} title="Handlungsempfehlung" />

        <section className="px-5 pt-6">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
              <Image
                src={entry.imageUrl}
                alt={entry.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">
                Fuer {entry.name}
              </p>
              <p className="truncate text-[15px] font-semibold text-bark-900">
                {primaryMethod ? primaryMethod.title : "Naechster sinnvoller Schritt"}
              </p>
            </div>
            <UrgencyIndicator urgency={entry.defaultUrgency} />
          </div>

          <div className="mt-6 rounded-lg bg-gradient-to-br from-bark-900 to-clay-800 p-6 text-paper">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-paper/10 px-3 py-1 eyebrow-on-dark">
              <Sparkles className="h-3 w-3" />
              Priorisiert statt ueberladen
            </div>
            <h1 className="mt-4 font-serif text-[30px] leading-[1.08] tracking-tight">
              Nicht alles machen. Das Richtige zuerst.
            </h1>
            <p className="mt-3 max-w-prose text-[14px] leading-relaxed text-sage-100/85">
              Die Reihenfolge ist auf Wirkung, Aufwand und Alltagstauglichkeit
              optimiert. Eine sauber umgesetzte erste Massnahme bringt oft mehr
              als drei halbherzige.
            </p>
          </div>
        </section>

        <section className="px-5 pt-6">
          <StatRow
            items={[
              { label: "Methoden", value: entry.methods.length.toString() },
              { label: "Zeit gesamt", value: `${totalMin} Min` },
              { label: "Aufwand", value: avgEffort(entry.methods) },
            ]}
          />
        </section>

        <section className="px-5 pt-6">
          <PersonalizedSafetyBanner entry={entry} />
        </section>

        {entry.prevention.length > 0 && (
          <section className="px-5 pt-6">
            <div className="rounded-md bg-sage-100/80 p-5">
              <p className="mb-2 eyebrow text-moss-600">
                Danach vorbeugen
              </p>
              <ul className="space-y-1.5">
                {entry.prevention.map((prevention, index) => (
                  <li
                    key={`${prevention}-${index}`}
                    className="flex gap-2 text-[13px] leading-relaxed text-bark-900"
                  >
                    <span className="shrink-0 text-moss-600">-</span>
                    <span>{prevention}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="px-5 pt-8">
          <PersonalizedPlan entry={entry} />
        </section>

        <section className="px-5 pt-8">
          <Button href="/app" fullWidth size="lg" variant="secondary">
            Zurueck zur Uebersicht
          </Button>
        </section>
      </div>
    </OnboardingGuard>
  );
}

function avgEffort(methods: TreatmentMethod[]): string {
  const map: Record<EffortLevel, number> = { EASY: 1, MEDIUM: 2, HARD: 3 };
  const avg =
    methods.reduce((sum, method) => sum + map[method.effort], 0) /
    Math.max(methods.length, 1);

  if (avg <= 1.4) return "Einfach";
  if (avg <= 2.3) return "Mittel";
  return "Aufwaendig";
}
