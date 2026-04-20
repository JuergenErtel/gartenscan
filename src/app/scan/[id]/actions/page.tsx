import { notFound } from "next/navigation";
import Image from "next/image";
import { Bell, Share2 } from "lucide-react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { PersonalizedPlan } from "@/components/features/actions/PersonalizedPlan";
import { PersonalizedSafetyBanner } from "@/components/features/diagnosis/PersonalizedSafetyBanner";
import { Button } from "@/components/ui/Button";
import { UrgencyIndicator } from "@/components/ui/UrgencyIndicator";
import { getContentById } from "@/content";
import type { EffortLevel, TreatmentMethod } from "@/domain/types";
import { OnboardingGuard } from "@/components/features/onboarding/OnboardingGuard";

export default async function ActionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = getContentById(id);
  if (!entry) return notFound();

  const totalMin = entry.methods.reduce((s, m) => s + m.durationMin, 0);

  return (
    <OnboardingGuard>
    <div className="min-h-screen bg-sage-50 pb-10">
      <ScreenHeader
        back={`/scan/${entry.id}`}
        title="Maßnahmenplan"
        right={
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-paper active:scale-95 transition">
            <Share2
              className="h-4 w-4 text-forest-700"
              strokeWidth={1.75}
            />
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
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">
              Für
            </p>
            <p className="font-semibold text-[15px] text-forest-900 truncate">
              {entry.name}
            </p>
          </div>
          <UrgencyIndicator urgency={entry.defaultUrgency} />
        </div>

        <h1 className="font-serif text-[28px] leading-[1.1] tracking-tight text-forest-900 font-normal mt-6">
          {entry.methods.length} Methoden, sortiert nach Wirksamkeit und Stil.
        </h1>
        <p className="text-[14px] text-ink-muted leading-relaxed mt-3 max-w-prose">
          Wähle die Methode, die zu deinem Garten passt. Du musst nicht alle
          durchziehen – eine gut umgesetzte Maßnahme reicht oft.
        </p>
      </section>

      <section className="px-5 pt-6">
        <div className="grid grid-cols-3 gap-2 rounded-[16px] bg-paper p-1">
          <StatBlock label="Methoden" value={entry.methods.length.toString()} />
          <StatBlock label="Zeit gesamt" value={`${totalMin} Min`} />
          <StatBlock label="Aufwand" value={avgEffort(entry.methods)} />
        </div>
      </section>

      {/* Safety warnings – personalized */}
      <section className="px-5 pt-6">
        <PersonalizedSafetyBanner entry={entry} />
      </section>

      {/* Prevention card */}
      {entry.prevention.length > 0 && (
        <section className="px-5 pt-6">
          <div className="rounded-[16px] bg-sage-100/80 p-5">
            <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-moss-600 mb-2">
              Prävention – damit es nicht wiederkommt
            </p>
            <ul className="space-y-1.5">
              {entry.prevention.map((p, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-[13px] leading-relaxed text-forest-900"
                >
                  <span className="text-moss-600 shrink-0">·</span>
                  <span>{p}</span>
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
        <button className="w-full flex items-center gap-3 rounded-[18px] bg-paper border border-sage-200 p-4 hover:border-forest-700/30 transition group">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100">
            <Bell
              className="h-4.5 w-4.5 text-sky-400"
              strokeWidth={1.75}
            />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[14px] font-semibold text-forest-900">
              Erinnerung setzen
            </p>
            <p className="text-[12px] text-ink-muted">
              Wir erinnern dich, wenn die nächste Behandlung fällig ist
            </p>
          </div>
          <span className="relative inline-flex h-6 w-11 shrink-0 rounded-full bg-sage-200 transition group-hover:bg-moss-500">
            <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-paper shadow transition group-hover:translate-x-5" />
          </span>
        </button>
      </section>

      <section className="px-5 pt-8">
        <Button href="/app" fullWidth size="lg" variant="secondary">
          Zurück zur Übersicht
        </Button>
      </section>
    </div>
    </OnboardingGuard>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-sage-50 text-center py-3">
      <p className="font-serif text-[16px] leading-none text-forest-900">
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider font-medium text-ink-muted mt-1">
        {label}
      </p>
    </div>
  );
}

function avgEffort(methods: TreatmentMethod[]): string {
  const map: Record<EffortLevel, number> = { EASY: 1, MEDIUM: 2, HARD: 3 };
  const avg =
    methods.reduce((s, m) => s + map[m.effort], 0) / Math.max(methods.length, 1);
  if (avg <= 1.4) return "Einfach";
  if (avg <= 2.3) return "Mittel";
  return "Aufwändig";
}
