import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { OnboardingGuard } from "@/components/features/onboarding/OnboardingGuard";
import { EmptyState } from "@/components/ui/EmptyState";
import { UrgencyIndicator } from "@/components/ui/UrgencyIndicator";
import { createSignedReadUrl } from "@/lib/services/imageStorageService";
import { listHistory } from "@/lib/services/historyService";
import { getScanCaseSummary } from "@/lib/scan/caseSummary";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <OnboardingGuard>
        <AppShell>
          <div className="safe-top px-5 pt-8">
            <EmptyState
              mark="journal"
              title="Noch keine Scans"
              body="Hier siehst du spaeter nicht nur, was erkannt wurde, sondern auch was du als Naechstes tun solltest."
              ctaLabel="Jetzt scannen"
              ctaHref="/scan/new"
            />
          </div>
        </AppShell>
      </OnboardingGuard>
    );
  }

  const items = await listHistory(user.id, 100);
  const summaries = items.map((item) => ({
    item,
    summary: getScanCaseSummary(item.scan, item.matchedEntry, item.followUp),
  }));
  const actionable = summaries.filter(({ summary }) => summary.actionable);
  const urgent = summaries.filter(({ summary }) => summary.urgency === "IMMEDIATE");

  const grouped = new Map<string, typeof items>();
  for (const item of items) {
    const key = item.scan.createdAt.toLocaleDateString("de-DE", {
      month: "long",
      year: "numeric",
    });
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  }

  const withUrls = await Promise.all(
    items.map(async (item) => ({
      ...item,
      signedImageUrl: await createSignedReadUrl(item.scan.imagePath, 3600),
    }))
  );
  const urlById = new Map(withUrls.map((item) => [item.scan.id, item.signedImageUrl]));

  return (
    <OnboardingGuard>
      <AppShell>
        <div className="safe-top px-5 pt-8">
          <p className="eyebrow mb-2">Verlauf</p>
          <h1 className="font-serif text-[32px] leading-tight tracking-tight text-bark-900">
            Gartenjournal statt Ablage
          </h1>
          <p className="mt-2 text-[14px] text-ink-muted">
            Hier entscheidet sich, ob aus einem Scan ein einmaliger Moment oder
            ein dauerhaft nuetzliches Werkzeug wird.
          </p>
        </div>

        <section className="px-5 pt-6">
          <div className="grid grid-cols-3 gap-2 rounded-[18px] bg-paper p-1">
            <JournalStat label="Scans" value={String(items.length)} />
            <JournalStat label="Offen" value={String(actionable.length)} />
            <JournalStat label="Akut" value={String(urgent.length)} />
          </div>
        </section>

        {items.length === 0 ? (
          <section className="px-5 pt-8">
            <EmptyState
              mark="journal"
              title="Hier wird dein Journal."
              body="Jeder Fall landet hier mit Foto, Dringlichkeit und naechstem Schritt."
              ctaLabel="Ersten Scan machen"
              ctaHref="/scan/new"
            />
          </section>
        ) : (
          <section className="px-5 pt-8 space-y-8">
            {Array.from(grouped.entries()).map(([month, scans]) => (
              <div key={month}>
                <h2 className="mb-3 font-serif text-[20px] leading-tight capitalize text-bark-900">
                  {month}
                </h2>
                <div className="space-y-3">
                  {scans.map(({ scan, matchedEntry, followUp }) => {
                    const summary = getScanCaseSummary(scan, matchedEntry, followUp);

                    return (
                      <Link
                        key={scan.id}
                        href={`/scan/${scan.id}`}
                        className="flex gap-3 rounded-[18px] bg-paper p-4 shadow-[var(--shadow-soft)] tap-press"
                      >
                        <div
                          className="h-16 w-16 shrink-0 rounded-[12px] bg-cover bg-center photo-graded"
                          style={{ backgroundImage: `url(${urlById.get(scan.id)})` }}
                          aria-hidden
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-[15px] font-semibold text-bark-900">
                                {summary.title}
                              </p>
                              <p className="mt-0.5 text-[12px] text-ink-muted">
                                {summary.subtitle}
                              </p>
                            </div>
                            <UrgencyIndicator urgency={summary.urgency} />
                          </div>
                          <p className="mt-2 text-[13px] leading-relaxed text-bark-900">
                            Naechster Schritt: {summary.nextStep}
                          </p>
                          <p className="mt-2 text-[11px] text-ink-muted">
                            {scan.createdAt.toLocaleDateString("de-DE", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        )}
      </AppShell>
    </OnboardingGuard>
  );
}

function JournalStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[14px] bg-sage-50 py-3 text-center">
      <p className="font-serif text-[18px] leading-none text-bark-900">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
        {label}
      </p>
    </div>
  );
}
