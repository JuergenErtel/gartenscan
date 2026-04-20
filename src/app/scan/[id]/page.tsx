import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Share2,
  Plus,
  MessageCircle,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { UrgencyIndicator } from "@/components/ui/UrgencyIndicator";
import { Button } from "@/components/ui/Button";
import { ConfidenceBar } from "@/components/features/diagnosis/ConfidenceBar";
import { PersonalizedSafetyBanner } from "@/components/features/diagnosis/PersonalizedSafetyBanner";
import { PersonalizedPrimaryAction } from "@/components/features/diagnosis/PersonalizedPrimaryAction";
import { CategoryLabel } from "@/components/ui/CategoryIcon";
import { getContentById } from "@/content";
import { OnboardingGuard } from "@/components/features/onboarding/OnboardingGuard";

export default async function ScanResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ example?: string }>;
}) {
  const { id } = await params;
  const entry = getContentById(id);
  if (!entry) return notFound();

  // Deterministic pseudo-confidence for mock UI (production: from DetectionResult)
  const confidence = 0.89;
  const alternatives = entry.confusionRisk.slice(0, 2);

  return (
    <OnboardingGuard>
    <div className="min-h-screen bg-sage-50 pb-28">
      {/* Hero with photo */}
      <div className="relative h-[55vh] min-h-[400px] w-full overflow-hidden">
        <Image
          src={entry.imageUrl}
          alt={entry.name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 500px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-900/40 via-transparent to-sage-50" />

        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-3">
          <Link
            href="/app"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-paper/80 backdrop-blur-md active:scale-95 transition"
          >
            <ArrowLeft className="h-5 w-5 text-forest-700" />
          </Link>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-paper/80 backdrop-blur-md active:scale-95 transition">
            <Share2 className="h-4.5 w-4.5 text-forest-700" strokeWidth={1.75} />
          </button>
        </div>

        <div className="absolute bottom-6 left-5 right-5">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge
              tone="outline"
              className="!bg-paper/85 !backdrop-blur !border-paper/40"
            >
              <CategoryLabel category={entry.category} />
            </Badge>
            {entry.safety.toxicToChildren && (
              <Badge
                tone="danger"
                icon={<AlertTriangle className="h-3 w-3" />}
              >
                Giftig
              </Badge>
            )}
            {entry.safety.invasive && (
              <Badge tone="warning">Invasiv</Badge>
            )}
          </div>
          <h1 className="font-serif text-[32px] leading-[1.1] tracking-tight text-paper drop-shadow-md font-normal">
            {entry.name}
          </h1>
          <p className="italic text-[14px] text-paper/85 mt-1 drop-shadow">
            {entry.scientificName}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-paper/90 backdrop-blur px-3 py-1.5">
            <ConfidenceBar value={confidence} />
            <span className="text-[11px] text-ink-muted">Sicher erkannt</span>
          </div>
        </div>
      </div>

      {/* Urgency banner */}
      <section className="px-5 -mt-4 relative z-10">
        <UrgencyIndicator urgency={entry.defaultUrgency} variant="banner" />
      </section>

      {/* Summary – human-readable description */}
      <section className="px-5 pt-6">
        <p className="font-serif text-[19px] leading-[1.45] text-forest-900 font-normal">
          {entry.description}
        </p>
      </section>

      {/* Tabs */}
      <section className="px-5 pt-8">
        <div className="flex gap-6 border-b border-sage-200">
          <div className="border-b-2 border-forest-700 pb-2.5 text-[14px] font-semibold text-forest-900">
            Was tun?
          </div>
          <span className="pb-2.5 text-[14px] font-medium text-ink-muted">
            Details
          </span>
          <span className="pb-2.5 text-[14px] font-medium text-ink-muted">
            Quellen
          </span>
        </div>
      </section>

      {/* Safety warnings – personalized to user profile */}
      <section className="px-5 pt-6">
        <PersonalizedSafetyBanner entry={entry} />
      </section>

      {/* Primary action – personalized */}
      <PersonalizedPrimaryAction entry={entry} />

      {/* Traits – real identification features */}
      <section className="px-5 pt-8">
        <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted mb-3">
          Erkennungsmerkmale
        </p>
        <div className="rounded-[16px] bg-paper-dim p-5 space-y-2">
          {entry.traits.map((t, i) => (
            <div key={i} className="flex gap-2 text-[14px] leading-relaxed">
              <span className="text-forest-700 font-bold shrink-0">·</span>
              <span className="text-forest-900">{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Knowledge card */}
      <section className="px-5 pt-6">
        <div className="rounded-[20px] bg-paper-dim p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen
              className="h-4 w-4 text-forest-700"
              strokeWidth={1.75}
            />
            <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted">
              Habitat & Saison
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-forest-900">
            {entry.habitat}
          </p>
          <div className="mt-3 flex gap-1.5 flex-wrap">
            {entry.seasons.map((s) => (
              <span
                key={s}
                className="inline-block rounded-full bg-paper border border-sage-200 px-2 py-0.5 text-[11px] text-forest-800"
              >
                {seasonLabel(s)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="px-5 pt-8 space-y-3">
        <Button
          fullWidth
          size="lg"
          iconLeft={<Plus className="h-5 w-5" />}
        >
          Zu meinem Garten hinzufügen
        </Button>
        <Button
          href="/coach"
          fullWidth
          size="lg"
          variant="secondary"
          iconLeft={<MessageCircle className="h-5 w-5" />}
        >
          Frag den Gartencoach
        </Button>
      </section>

      {/* Confusion risk */}
      {alternatives.length > 0 && (
        <section className="px-5 pt-8">
          <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted mb-3">
            Verwechselbar mit
          </p>
          <div className="space-y-2">
            {alternatives.map((a) => (
              <div
                key={a.name}
                className="rounded-[12px] bg-paper px-4 py-3 border border-sage-200/60"
              >
                <p className="text-[13px] font-semibold text-forest-900 mb-0.5">
                  {a.name}
                </p>
                <p className="text-[12px] text-ink-muted leading-snug">
                  {a.note}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sources */}
      <section className="px-5 pt-8">
        <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted mb-3">
          Quellen · Content-Qualität:{" "}
          <span className="text-moss-600">
            {entry.contentConfidence === "HIGH" ? "Hoch" : "Mittel"}
          </span>
        </p>
        <div className="space-y-2">
          {entry.sources.map((s) => (
            <a
              key={s.title}
              href={s.url ?? "#"}
              target={s.url ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-[12px] bg-paper px-4 py-3 border border-sage-200/60 text-[12px] text-forest-800 hover:border-forest-700/30 transition"
            >
              <span className="text-[10px] uppercase tracking-wider font-semibold text-ink-muted px-1.5 py-0.5 rounded bg-sage-100 shrink-0">
                {s.type === "scientific"
                  ? "Wissenschaft"
                  : s.type === "official"
                    ? "Offiziell"
                    : s.type === "expert"
                      ? "Experte"
                      : "Community"}
              </span>
              <span className="flex-1 min-w-0 truncate">{s.title}</span>
              {s.url && <ExternalLink className="h-3.5 w-3.5 shrink-0" />}
            </a>
          ))}
        </div>
      </section>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-5 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3 bg-gradient-to-t from-sage-50 via-sage-50/95 to-transparent">
        <div className="mx-auto max-w-lg">
          <Button
            href={`/scan/${entry.id}/actions`}
            fullWidth
            size="lg"
            iconRight={<ArrowRight className="h-4 w-4" />}
          >
            Maßnahmenplan öffnen
          </Button>
        </div>
      </div>
    </div>
    </OnboardingGuard>
  );
}

function seasonLabel(s: string): string {
  return { SPRING: "Frühling", SUMMER: "Sommer", AUTUMN: "Herbst", WINTER: "Winter" }[s] ?? s;
}
