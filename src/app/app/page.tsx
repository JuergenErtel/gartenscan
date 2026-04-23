import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CloudRain,
  Clock3,
  ScanLine,
  ShieldCheck,
  Snowflake,
  Sparkles,
  SunMedium,
  Wind,
} from "lucide-react";
import { OnboardingGuard } from "@/components/features/onboarding/OnboardingGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { UrgencyIndicator } from "@/components/ui/UrgencyIndicator";
import { WeatherChip } from "@/components/features/dashboard/WeatherChip";
import { listHistory } from "@/lib/services/historyService";
import { getScanCaseSummary } from "@/lib/scan/caseSummary";
import { getProfile } from "@/lib/services/profileRepository";
import { createClient } from "@/lib/supabase/server";
import { fetchWeatherForPLZ } from "@/lib/weather/openmeteo";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profileRow = user ? await getProfile(user.id) : null;
  const displayName = profileRow?.email?.split("@")[0] ?? "Gaertner:in";
  const history = user ? await listHistory(user.id, 6) : [];

  const summarizedHistory = history.map((item) => ({
    item,
    summary: getScanCaseSummary(item.scan, item.matchedEntry, item.followUp),
  }));
  const actionableHistory = summarizedHistory.filter(
    ({ summary }) => summary.actionable
  );
  const urgentHistory = summarizedHistory.filter(
    ({ summary }) => summary.urgency === "IMMEDIATE"
  );
  const primaryOpenCase = actionableHistory[0];
  const recentCases = history.slice(0, 3);

  const weather = await fetchWeatherForPLZ("80331");

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 11 ? "Guten Morgen" : hour < 18 ? "Hallo" : "Guten Abend";

  return (
    <OnboardingGuard>
      <AppShell>
        <div className="safe-top px-5 pt-6 pb-2">
          <div className="mb-1 flex items-start justify-between">
            <div>
              <p className="mb-1 text-[13px] text-ink-muted">{greeting},</p>
              <h1 className="font-serif text-[32px] leading-tight tracking-tight text-forest-900 font-normal">
                {displayName}
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

        <section className="px-5 mt-5">
          <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-bark-900 via-clay-800 to-bark-900 p-6 text-cream shadow-[var(--shadow-editorial-lg)]">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sage-200/10 blur-2xl" />
            <div className="absolute -left-6 bottom-0 h-24 w-24 rounded-full bg-clay-500/10 blur-2xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-paper/10 px-3 py-1">
                <Sparkles className="h-3 w-3 text-sun-500/90" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sun-500/90">
                  Soforthilfe
                </span>
              </div>
              <h2 className="mt-4 font-serif text-[30px] leading-[1.05] tracking-tight">
                Foto rein. Antwort und Massnahme raus.
              </h2>
              <p className="mt-3 max-w-[34ch] text-[14px] leading-relaxed text-cream/82">
                Der Wert der App ist nicht die Erkennung. Der Wert ist, dass du
                schneller weisst, ob du handeln musst und womit du anfangen
                solltest.
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2.5">
                <HomeMetric
                  label="Offene Faelle"
                  value={String(actionableHistory.length)}
                />
                <HomeMetric
                  label="Akut heute"
                  value={String(urgentHistory.length)}
                />
                <HomeMetric
                  label="Scans im Journal"
                  value={String(history.length)}
                />
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button
                  href="/scan/new"
                  size="lg"
                  className="sm:flex-1 !bg-paper !text-bark-900 hover:!bg-paper/90"
                  iconLeft={<ScanLine className="h-4 w-4" />}
                >
                  Jetzt Problem scannen
                </Button>
                <Button
                  href="/history"
                  size="lg"
                  variant="ghost"
                  className="sm:flex-1 !bg-paper/10 !text-paper hover:!bg-paper/15"
                >
                  Verlauf mit naechstem Schritt
                </Button>
              </div>
            </div>
          </div>
        </section>

        {weather?.alert && (
          <div className="mx-5 mt-4 flex items-center gap-3 rounded-[16px] border border-sky-300/40 bg-gradient-to-br from-sky-100 to-paper px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-300/30">
              <span className="text-base text-forest-700">
                {weather.alert.type === "frost"
                  ? <Snowflake className="h-4.5 w-4.5" />
                  : weather.alert.type === "storm"
                    ? <Wind className="h-4.5 w-4.5" />
                    : weather.alert.type === "heat"
                      ? <SunMedium className="h-4.5 w-4.5" />
                      : <CloudRain className="h-4.5 w-4.5" />}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold leading-snug text-forest-900">
                {weather.alert.message}
              </p>
              <p className="text-[11px] text-ink-muted">
                in ca. {weather.alert.inHours} Std.
                {weather.location ? ` - ${weather.location}` : ""}
              </p>
            </div>
            <Link
              href="/coach"
              className="shrink-0 text-[12px] font-semibold text-forest-700"
            >
              Plan ansehen
            </Link>
          </div>
        )}

        <section className="mt-6 px-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-[24px] leading-tight text-forest-900">
                Jetzt relevant
              </h2>
              <p className="mt-1 text-[12px] text-ink-muted">
                Nur echte Faelle aus deinem Verlauf. Keine eingebauten Muster.
              </p>
            </div>
            {primaryOpenCase && (
              <Link
                href="/history"
                className="flex items-center gap-0.5 text-[12px] font-semibold text-forest-700"
              >
                Verlauf <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {primaryOpenCase ? (
            <Link
              href={`/scan/${primaryOpenCase.item.scan.id}`}
              className="group block overflow-hidden rounded-[24px] bg-forest-900 p-6 text-paper shadow-[0_12px_40px_rgba(28,42,33,0.2)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sage-200/90">
                    Offener Fall
                  </p>
                  <h3 className="mt-2 font-serif text-[28px] leading-[1.08] tracking-tight">
                    {primaryOpenCase.summary.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-sage-200/80">
                    {primaryOpenCase.summary.subtitle}
                  </p>
                </div>
                <UrgencyIndicator
                  urgency={primaryOpenCase.summary.urgency}
                  className="!bg-paper/12 !text-paper"
                />
              </div>

              <div className="mt-5 rounded-[18px] bg-paper/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper/10">
                    <Clock3 className="h-4.5 w-4.5 text-sun-500/90" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sage-200/70">
                      Naechster Schritt
                    </p>
                    <p className="mt-1 text-[14px] leading-relaxed text-paper">
                      {primaryOpenCase.summary.nextStep}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-paper">
                Fall oeffnen
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ) : (
            <div className="rounded-[20px] border border-sage-200/70 bg-paper p-5">
              <p className="text-[13px] leading-relaxed text-bark-900">
                Solange noch keine echten Scans vorliegen, bleibt dieser Bereich
                bewusst leer. Das Dashboard zeigt hier keine Beispiel- oder
                Demo-Faelle.
              </p>
              <div className="mt-4">
                <Button href="/scan/new" size="md">
                  Ersten echten Fall scannen
                </Button>
              </div>
            </div>
          )}
        </section>

        <section className="mt-8 px-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-[24px] leading-tight text-forest-900">
                Zuletzt erkannt
              </h2>
              <p className="mt-1 text-[12px] text-ink-muted">
                Nicht nur Historie. Dein naechster sinnvoller Schritt.
              </p>
            </div>
            <Link
              href="/history"
              className="flex items-center gap-0.5 text-[12px] font-semibold text-forest-700"
            >
              Alles <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentCases.length > 0 ? (
            <div className="space-y-3">
              {recentCases.map((item) => {
                const summary = getScanCaseSummary(
                  item.scan,
                  item.matchedEntry,
                  item.followUp
                );

                return (
                  <Link
                    key={item.scan.id}
                    href={`/scan/${item.scan.id}`}
                    className="block rounded-[20px] bg-paper p-5 shadow-[var(--shadow-soft)] transition hover:shadow-[var(--shadow-card)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                          Letzter Fall
                        </p>
                        <h3 className="mt-1 text-[18px] font-semibold text-bark-900">
                          {summary.title}
                        </h3>
                        <p className="mt-1 text-[12px] text-ink-muted">
                          {summary.subtitle}
                        </p>
                        <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                          Naechster Schritt: {summary.nextStep}
                        </p>
                      </div>
                      <UrgencyIndicator urgency={summary.urgency} />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[20px] border border-sage-200/70 bg-paper p-5">
              <p className="text-[13px] leading-relaxed text-bark-900">
                Dein Journal ist noch leer. Genau deshalb wirkt das Produkt noch
                nicht unverzichtbar. Nach dem ersten echten Fall beginnt hier der
                Wiederkehrnutzen.
              </p>
              <div className="mt-4">
                <Button href="/scan/new" size="md">
                  Ersten Problemfall festhalten
                </Button>
              </div>
            </div>
          )}
        </section>

        <section className="mt-10 px-5">
          <div className="rounded-[24px] border border-sage-200/70 bg-paper p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sage-100">
                <ShieldCheck className="h-5 w-5 text-moss-600" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Coach mit echtem Grund
                </p>
                <h3 className="mt-1 font-serif text-[24px] leading-tight text-bark-900">
                  Bio, schnell oder haustierfreundlich?
                </h3>
                <p className="mt-2 max-w-[34ch] text-[14px] leading-relaxed text-ink-muted">
                  Genau an diesen Abwaegungen wird die App im Alltag wertvoll. Der
                  Coach muss helfen, nicht nur texten.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge tone="outline">7-Tage-Plan</Badge>
                  <Badge tone="outline">Bio zuerst</Badge>
                  <Badge tone="outline">Haustiere beachten</Badge>
                </div>
                <div className="mt-5">
                  <Button href="/coach" size="md" iconRight={<ArrowRight className="h-4 w-4" />}>
                    Coach oeffnen
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 px-5">
          <Link
            href="/premium"
            className="tap-press group flex items-center gap-4 rounded-[18px] border border-clay-500/30 bg-cream p-4 transition hover:border-clay-500/50"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-bark-900 to-clay-800 text-cream">
              <Sparkles className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-bark-900">
                Premium: aus Erkennung wird Begleitung
              </p>
              <p className="text-[12px] text-ink-muted">
                Mehr Verlauf, mehr Folgeaufgaben, mehr konkrete Hilfe bei echten Faellen
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-clay-800 transition group-hover:translate-x-0.5" />
          </Link>
        </section>
      </AppShell>
    </OnboardingGuard>
  );
}

function HomeMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] bg-paper/10 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sage-100/70">
        {label}
      </p>
      <p className="mt-1 font-serif text-[24px] leading-tight text-paper">
        {value}
      </p>
    </div>
  );
}
