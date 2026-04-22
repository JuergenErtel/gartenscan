import Image from "next/image";
import { notFound } from "next/navigation";
import { Bell, Share2, Sparkles } from "lucide-react";
import { getContentById } from "@/content";
import { PersonalizedPlan } from "@/components/features/actions/PersonalizedPlan";
import { PersonalizedSafetyBanner } from "@/components/features/diagnosis/PersonalizedSafetyBanner";
import { OnboardingGuard } from "@/components/features/onboarding/OnboardingGuard";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
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
      <div className="min-h-screen bg-sage-50 pb-10">
        <ScreenHeader
          back={backHref}
          title="Handlungsempfehlung"
          right={
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-paper active:scale-95 transition">
              <Share2 className="h-4 w-4 text-forest-700" strokeWidth={1.75} />
            </button>
          }
        />

        <section className="px-5 pt-6">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px]">
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
              <p className="truncate text-[15px] font-semibold text-forest-900">
                {primaryMethod ? primaryMethod.title : "Naechster sinnvoller Schritt"}
              </p>
            </div>
            <UrgencyIndicator urgency={entry.defaultUrgency} />
          </div>

          <div className="mt-6 rounded-[24px] bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 p-6 text-paper">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-paper/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sage-100">
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
          <div className="grid grid-cols-3 gap-2 rounded-[16px] bg-paper p-1">
            <StatBlock label="Methoden" value={entry.methods.length.toString()} />
            <StatBlock label="Zeit gesamt" value={`${totalMin} Min`} />
            <StatBlock label="Aufwand" value={avgEffort(entry.methods)} />
          </div>
        </section>

        <section className="px-5 pt-6">
          <PersonalizedSafetyBanner entry={entry} />
        </section>

        {entry.prevention.length > 0 && (
          <section className="px-5 pt-6">
            <div className="rounded-[16px] bg-sage-100/80 p-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-moss-600">
                Danach vorbeugen
              </p>
              <ul className="space-y-1.5">
                {entry.prevention.map((prevention, index) => (
                  <li
                    key={`${prevention}-${index}`}
                    className="flex gap-2 text-[13px] leading-relaxed text-forest-900"
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

        <section className="px-5 pt-2">
          <button className="group flex w-full items-center gap-3 rounded-[18px] border border-sage-200 bg-paper p-4 transition hover:border-forest-700/30">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100">
              <Bell className="h-4.5 w-4.5 text-sky-400" strokeWidth={1.75} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[14px] font-semibold text-forest-900">
                Folgebehandlung merken
              </p>
              <p className="text-[12px] text-ink-muted">
                Sinnvoll, wenn du in 3 bis 7 Tagen nachfassen musst
              </p>
            </div>
            <span className="relative inline-flex h-6 w-11 shrink-0 rounded-full bg-sage-200 transition group-hover:bg-moss-500">
              <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-paper shadow transition group-hover:translate-x-5" />
            </span>
          </button>
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

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-sage-50 py-3 text-center">
      <p className="font-serif text-[16px] leading-none text-forest-900">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
        {label}
      </p>
    </div>
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
