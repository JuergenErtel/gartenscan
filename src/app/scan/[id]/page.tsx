import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft, Share2, MessageCircle, AlertTriangle, BookOpen, ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { UrgencyIndicator } from "@/components/ui/UrgencyIndicator";
import { Button } from "@/components/ui/Button";
import { CategoryLabel } from "@/components/ui/CategoryIcon";
import { OnboardingGuard } from "@/components/features/onboarding/OnboardingGuard";
import { createClient } from "@/lib/supabase/server";
import { getHistoryItem } from "@/lib/services/historyService";
import { createSignedReadUrl } from "@/lib/services/imageStorageService";
import {
  LowQualityState, CategoryUnsupportedState, NoMatchState, ProviderErrorState,
} from "@/components/features/scan/ScanResultStates";
import { cn } from "@/lib/utils";

export default async function ScanResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/app");

  const item = await getHistoryItem(user.id, id);
  if (!item) return notFound();

  const { scan, matchedEntry } = item;

  if (scan.outcome.status === "low_quality") {
    return <OnboardingGuard><LowQualityState reason={scan.outcome.reason} /></OnboardingGuard>;
  }
  if (scan.outcome.status === "category_unsupported") {
    return <OnboardingGuard><CategoryUnsupportedState category={scan.outcome.triage?.category} /></OnboardingGuard>;
  }
  if (scan.outcome.status === "no_match") {
    return <OnboardingGuard><NoMatchState /></OnboardingGuard>;
  }
  if (scan.outcome.status === "provider_error") {
    return <OnboardingGuard><ProviderErrorState reason={scan.outcome.reason} /></OnboardingGuard>;
  }

  // status === 'ok' — zeige Editorial-Hero
  const primary = scan.outcome.candidates[0];
  const confidence = primary.confidence;
  const signedImageUrl = await createSignedReadUrl(scan.imagePath, 3600);

  const heroName = matchedEntry?.name ?? primary.commonNames[0] ?? primary.scientificName;
  const heroDescription =
    matchedEntry?.description ??
    "Wir haben noch keine redaktionelle Beschreibung zu dieser Art — demnächst.";

  return (
    <OnboardingGuard>
      <div className="min-h-screen bg-linen pb-28">
        <div className="relative h-[280px] overflow-hidden">
          <Image
            src={signedImageUrl}
            alt={heroName}
            fill
            priority
            unoptimized
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-cover photo-graded"
          />
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_50%,rgba(58,37,21,0.25)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-bark-900/40" />

          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-3">
            <Link href="/app" className="tap-press flex h-10 w-10 items-center justify-center rounded-full bg-cream/92 backdrop-blur-md">
              <ArrowLeft className="h-5 w-5 text-bark-900" />
            </Link>
            <button className="tap-press flex h-10 w-10 items-center justify-center rounded-full bg-cream/92 backdrop-blur-md">
              <Share2 className="h-4.5 w-4.5 text-bark-900" strokeWidth={1.75} />
            </button>
          </div>

          <div
            className="absolute top-[calc(max(env(safe-area-inset-top),1rem)+52px)] left-4 anim-bloom"
            style={{ animationDelay: "200ms" }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-cream/92 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-bark-900">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  confidence >= 0.75 ? "bg-moss-500"
                  : confidence >= 0.50 ? "bg-sun-500"
                  : "bg-berry-500"
                )}
              />
              {Math.round(confidence * 100)} % sicher
            </span>
          </div>
        </div>

        <div
          className="relative -mt-7 rounded-t-[28px] bg-cream pt-6 pb-6 px-5 shadow-[0_-8px_24px_rgba(58,37,21,0.06)] anim-bloom"
          style={{ animationDelay: "400ms" }}
        >
          {matchedEntry && (
            <p className="eyebrow mb-2">
              <CategoryLabel category={matchedEntry.category} />
            </p>
          )}
          <h1 className="font-serif text-[28px] leading-tight text-bark-900 mb-1">{heroName}</h1>
          <p className="latin-name text-[13px] mb-3">{primary.scientificName}</p>
          <p className="pull-quote mt-3 mb-2">{heroDescription}</p>

          {matchedEntry && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {matchedEntry.safety.toxicToChildren && (
                <Badge tone="danger" icon={<AlertTriangle className="h-3 w-3" />}>Giftig</Badge>
              )}
              <UrgencyIndicator urgency={matchedEntry.defaultUrgency} />
            </div>
          )}
        </div>

        {matchedEntry && (
          <>
            <section className="px-5 -mt-4 relative z-10">
              <UrgencyIndicator urgency={matchedEntry.defaultUrgency} variant="banner" />
            </section>

            <section className="px-5 pt-8">
              <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted mb-3">
                Erkennungsmerkmale
              </p>
              <div className="rounded-[16px] bg-cream p-5 space-y-2">
                {matchedEntry.traits.map((t, i) => (
                  <div key={i} className="flex gap-2 text-[14px] leading-relaxed">
                    <span className="text-clay-800 font-bold shrink-0">·</span>
                    <span className="text-bark-900">{t}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="px-5 pt-6">
              <div className="rounded-[20px] bg-cream p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4 text-clay-800" strokeWidth={1.75} />
                  <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted">
                    Habitat & Saison
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed text-bark-900">{matchedEntry.habitat}</p>
              </div>
            </section>

            <section className="px-5 pt-8 space-y-3">
              <Button href="/coach" fullWidth size="lg" variant="secondary" iconLeft={<MessageCircle className="h-5 w-5" />}>
                Frag den Gartencoach
              </Button>
            </section>
          </>
        )}

        {!matchedEntry && (
          <div className="px-5 pt-6">
            <div className="rounded-[16px] bg-cream p-5 text-[13px] text-bark-900/75">
              Wir haben diese Art im System, aber noch keine redaktionelle Seite.
              Sobald wir Details ergänzt haben, erscheinen sie hier automatisch.
            </div>
          </div>
        )}

        {scan.outcome.candidates.length > 1 && (
          <section className="px-5 pt-8">
            <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted mb-3">
              Weitere Möglichkeiten
            </p>
            <div className="space-y-2">
              {scan.outcome.candidates.slice(1).map((c) => (
                <div key={c.rank} className="rounded-[12px] bg-cream px-4 py-3 border border-clay-800/10">
                  <p className="text-[13px] font-semibold text-bark-900 mb-0.5">
                    {c.commonNames[0] ?? c.scientificName}
                  </p>
                  <p className="text-[12px] text-ink-muted leading-snug">
                    {c.scientificName} · {Math.round(c.confidence * 100)} %
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="fixed bottom-0 left-0 right-0 z-30 px-5 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3 bg-gradient-to-t from-linen via-linen/95 to-transparent">
          <div className="mx-auto max-w-lg">
            <Button href="/scan/new" fullWidth size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>
              Nächster Scan
            </Button>
          </div>
        </div>
      </div>
    </OnboardingGuard>
  );
}
