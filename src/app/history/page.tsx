import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { OnboardingGuard } from "@/components/features/onboarding/OnboardingGuard";
import { createClient } from "@/lib/supabase/server";
import { listHistory } from "@/lib/services/historyService";
import { createSignedReadUrl } from "@/lib/services/imageStorageService";

export const revalidate = 0;

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <OnboardingGuard>
        <AppShell>
          <div className="px-5 pt-8 safe-top">
            <EmptyState
              mark="journal"
              title="Noch keine Scans"
              body="Hier siehst du, was du erkannt hast — und wann."
              ctaLabel="Jetzt scannen"
              ctaHref="/scan/new"
            />
          </div>
        </AppShell>
      </OnboardingGuard>
    );
  }

  const items = await listHistory(user.id, 100);

  const grouped = new Map<string, typeof items>();
  for (const it of items) {
    const key = it.scan.createdAt.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(it);
  }

  const withUrls = await Promise.all(
    items.map(async (it) => ({
      ...it,
      signedImageUrl: await createSignedReadUrl(it.scan.imagePath, 3600),
    }))
  );
  const urlById = new Map(withUrls.map((u) => [u.scan.id, u.signedImageUrl]));

  return (
    <OnboardingGuard>
      <AppShell>
        <div className="px-5 pt-8 safe-top">
          <p className="eyebrow mb-2">Mein Verlauf</p>
          <h1 className="font-serif text-[32px] leading-tight tracking-tight text-bark-900">
            {items.length === 0
              ? "Noch keine Scans"
              : `${items.length} ${items.length === 1 ? "Scan" : "Scans"}`}
          </h1>
          <p className="text-[14px] text-ink-muted mt-2">Dein Gartenjahr in Fotos und Entscheidungen</p>
        </div>

        {items.length === 0 ? (
          <section className="px-5 pt-8">
            <EmptyState
              mark="journal"
              title="Hier wird's dein Journal."
              body="Jeder Scan landet hier — mit Foto, Datum und was wir erkannt haben."
              ctaLabel="Ersten Scan machen"
              ctaHref="/scan/new"
            />
          </section>
        ) : (
          <section className="px-5 pt-8 space-y-8">
            {Array.from(grouped.entries()).map(([month, scans]) => (
              <div key={month}>
                <h2 className="font-serif text-[20px] leading-tight text-bark-900 mb-3 capitalize">{month}</h2>
                <div className="space-y-2.5">
                  {scans.map(({ scan, matchedEntry }) => {
                    const top = scan.outcome.candidates[0];
                    const title = matchedEntry?.name ?? top?.commonNames[0] ?? top?.scientificName ?? "Unbekannt";
                    const subtitle =
                      scan.outcome.status === "ok" ? top ? `${Math.round(top.confidence * 100)} % sicher` : ""
                      : scan.outcome.status === "low_quality" ? "Bild zu unscharf"
                      : scan.outcome.status === "category_unsupported" ? "Kategorie noch nicht unterstützt"
                      : scan.outcome.status === "no_match" ? "Nicht zuordenbar"
                      : "Erkennung pausiert";

                    return (
                      <Link
                        key={scan.id}
                        href={`/scan/${scan.id}`}
                        className="flex items-center gap-3 rounded-[14px] bg-cream px-4 py-3 border border-clay-800/10 tap-press"
                      >
                        <div
                          className="h-14 w-14 shrink-0 rounded-[10px] bg-cover bg-center photo-graded"
                          style={{ backgroundImage: `url(${urlById.get(scan.id)})` }}
                          aria-hidden
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-bark-900 truncate">{title}</p>
                          <p className="text-[12px] text-ink-muted truncate">{subtitle}</p>
                        </div>
                        <span className="text-[11px] text-ink-muted shrink-0">
                          {scan.createdAt.toLocaleDateString("de-DE", { day: "2-digit", month: "short" })}
                        </span>
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
