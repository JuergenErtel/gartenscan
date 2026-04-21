import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { TodayHero } from "@/components/features/dashboard/TodayHero";
import { TaskCard } from "@/components/features/dashboard/TaskCard";
import { WeatherChip } from "@/components/features/dashboard/WeatherChip";
import { PlantTile } from "@/components/features/garden/PlantTile";
import { Button } from "@/components/ui/Button";
import { MOCK_PLANTS, MOCK_TASKS } from "@/lib/mock/garden";
import { fetchWeatherForPLZ } from "@/lib/weather/openmeteo";
import { USER_PROFILE } from "@/lib/profile";
import { Sparkles, ArrowRight, Bell } from "lucide-react";
import { OnboardingGuard } from "@/components/features/onboarding/OnboardingGuard";

export const revalidate = 1800; // refresh weather every 30 min

export default async function DashboardPage() {
  const heroTask = MOCK_TASKS[0];
  const heroPlant = MOCK_PLANTS.find((p) => p.id === heroTask.plantId);
  const otherTasks = MOCK_TASKS.slice(1);
  const attentionPlants = MOCK_PLANTS.slice(0, 6);

  const weather = await fetchWeatherForPLZ(USER_PROFILE.postalCode);

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 11 ? "Guten Morgen" : hour < 18 ? "Hallo" : "Guten Abend";

  return (
    <OnboardingGuard>
      <AppShell>
      <div className="px-5 pt-6 pb-2 safe-top">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-[13px] text-ink-muted mb-1">{greeting},</p>
            <h1 className="font-serif text-[32px] leading-tight tracking-tight text-forest-900 font-normal">
              {USER_PROFILE.name}
            </h1>
          </div>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-paper shadow-[0_2px_10px_rgba(28,42,33,0.05)] active:scale-95 transition">
            <Bell className="h-4.5 w-4.5 text-forest-700" strokeWidth={1.75} />
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-berry-500 ring-2 ring-paper" />
          </button>
        </div>
        {weather && (
          <div className="mt-3">
            <WeatherChip weather={weather} />
          </div>
        )}
      </div>

      {weather?.alert && (
        <div className="mx-5 mt-4 flex items-center gap-3 rounded-[16px] bg-gradient-to-br from-sky-100 to-paper border border-sky-300/40 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-300/30">
            <span className="text-base">
              {weather.alert.type === "frost"
                ? "❄"
                : weather.alert.type === "storm"
                  ? "🌬"
                  : weather.alert.type === "heat"
                    ? "☀"
                    : "☔"}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-forest-900 leading-snug">
              {weather.alert.message}
            </p>
            <p className="text-[11px] text-ink-muted">
              in ~{weather.alert.inHours} Std.
              {weather.location && ` · ${weather.location}`}
            </p>
          </div>
          <Link
            href="/coach"
            className="text-[12px] font-semibold text-forest-700 shrink-0"
          >
            Plan ansehen
          </Link>
        </div>
      )}

      <section className="px-5 mt-6">
        <TodayHero task={heroTask} plant={heroPlant} />
      </section>

      <section className="mt-8">
        <div className="px-5 flex items-center justify-between mb-3">
          <h2 className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted">
            Diese Woche · {otherTasks.length}
          </h2>
          <Link
            href="/history"
            className="text-[12px] font-semibold text-forest-700 flex items-center gap-0.5"
          >
            Alle <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto scroll-hidden px-5 pb-2">
          {otherTasks.map((t) => (
            <TaskCard key={t.id} task={t} />
          ))}
          <div className="min-w-[20px]" />
        </div>
      </section>

      <section className="mt-10 px-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif text-[22px] leading-tight text-forest-900">
              Mein Garten
            </h2>
            <p className="text-[12px] text-ink-muted mt-0.5">
              {MOCK_PLANTS.length} Pflanzen · 2 brauchen Aufmerksamkeit
            </p>
          </div>
          <Link
            href="/garden"
            className="text-[12px] font-semibold text-forest-700 flex items-center gap-0.5"
          >
            Alle <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {attentionPlants.map((p) => (
            <PlantTile key={p.id} plant={p} />
          ))}
        </div>
      </section>

      <section className="mt-10 px-5">
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-bark-900 to-clay-800 p-6 text-paper">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-sage-200/10 blur-2xl" />
          <div className="absolute -right-16 bottom-0 h-32 w-32 rounded-full bg-clay-500/10 blur-2xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cream/10 backdrop-blur px-3 py-1 mb-4">
              <Sparkles className="h-3 w-3 text-sun-500/90" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-sun-500/90">
                April im Garten
              </span>
            </div>
            <h3 className="font-serif text-[24px] leading-tight tracking-tight mb-2 font-normal">
              Die 5 wichtigsten Arbeiten für diesen Monat
            </h3>
            <p className="text-[13px] leading-relaxed text-cream/85 mb-5 max-w-[90%]">
              Von Obstbaumschnitt bis Aussaat der Frühgemüse – was in deiner
              Klimazone jetzt wirklich dran ist.
            </p>
            <Button
              href="/coach"
              variant="ghost"
              size="sm"
              className="!bg-paper !text-forest-900 hover:!bg-paper/90"
              iconRight={<ArrowRight className="h-4 w-4" />}
            >
              Lesen
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-8 px-5">
        <Link
          href="/premium"
          className="tap-press group flex items-center gap-4 rounded-[18px] bg-cream border border-clay-500/30 p-4 hover:border-clay-500/50 transition"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-bark-900 to-clay-800 text-cream">
            <Sparkles className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-bark-900">
              Premium 7 Tage kostenlos
            </p>
            <p className="text-[12px] text-ink-muted">
              Unbegrenzte Scans · Wetterwarnungen · Expertenchat
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-clay-800 group-hover:translate-x-0.5 transition" />
        </Link>
      </section>
    </AppShell>
    </OnboardingGuard>
  );
}
