import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Leaf, Camera } from "lucide-react";
import { MOCK_PLANTS } from "@/lib/mock/garden";
import { MOCK_SCANS } from "@/lib/mock/scans";
import { Button } from "@/components/ui/Button";
import { HistoryEntry } from "@/components/features/history/HistoryEntry";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeDate } from "@/lib/utils";
import { OnboardingGuard } from "@/components/features/onboarding/OnboardingGuard";

const statusLabel = {
  HEALTHY: { label: "Gesund", tone: "success" as const },
  ATTENTION: { label: "Beobachten", tone: "warning" as const },
  CRITICAL: { label: "Kritisch", tone: "danger" as const },
  RECOVERING: { label: "Erholt sich", tone: "info" as const },
};

export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ plantId: string }>;
}) {
  const { plantId } = await params;
  const plant = MOCK_PLANTS.find((p) => p.id === plantId);
  if (!plant) return notFound();

  // Legacy demo: show all scans as history stream (plantId linkage belongs in DB)
  const scans = MOCK_SCANS.slice(0, 3);
  const status = statusLabel[plant.healthStatus];

  return (
    <OnboardingGuard>
    <div className="min-h-screen bg-sage-50 pb-20">
      <div className="relative h-[50vh] min-h-[380px] w-full overflow-hidden">
        <Image
          src={plant.photoUrl}
          alt={plant.nickname}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 500px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-900/30 via-transparent to-sage-50" />

        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-3">
          <Link
            href="/garden"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-paper/80 backdrop-blur-md active:scale-95 transition"
          >
            <ArrowLeft className="h-5 w-5 text-forest-700" />
          </Link>
        </div>

        <div className="absolute bottom-6 left-5 right-5">
          <Badge tone={status.tone}>{status.label}</Badge>
          <h1 className="font-serif text-[34px] leading-[1.1] tracking-tight text-paper drop-shadow-md font-normal mt-3">
            {plant.nickname}
          </h1>
          <p className="text-[14px] text-paper/90 mt-1 drop-shadow">
            {plant.species}
            {plant.latinName && (
              <span className="italic opacity-75"> · {plant.latinName}</span>
            )}
          </p>
        </div>
      </div>

      <section className="px-5 pt-6">
        <div className="grid grid-cols-3 gap-2 rounded-[16px] bg-paper p-1">
          <Stat label="Zone" value={plant.zoneLabel} />
          <Stat label="Scans" value={plant.scanCount.toString()} />
          <Stat
            label="Zuletzt"
            value={
              plant.lastScanAt ? formatRelativeDate(plant.lastScanAt) : "—"
            }
          />
        </div>
      </section>

      <section className="px-5 pt-8">
        <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted mb-3">
          Über diese Pflanze
        </p>
        <div className="space-y-3">
          <InfoRow icon={CalendarDays} label="Hinzugefügt" value={formatRelativeDate(plant.addedAt)} />
          <InfoRow icon={Leaf} label="Art" value={plant.species} />
        </div>
      </section>

      {scans.length > 0 && (
        <section className="px-5 pt-8">
          <h2 className="font-serif text-[22px] leading-tight text-forest-900 font-normal mb-3">
            Verlauf dieser Pflanze
          </h2>
          <div className="space-y-2.5">
            {scans.map((s) => (
              <HistoryEntry key={s.id} scan={s} />
            ))}
          </div>
        </section>
      )}

      <section className="px-5 pt-8">
        <Button
          href="/scan/new"
          fullWidth
          size="lg"
          iconLeft={<Camera className="h-5 w-5" />}
        >
          Neuen Scan machen
        </Button>
      </section>
    </div>
    </OnboardingGuard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-sage-50 text-center py-3 px-2">
      <p className="font-serif text-[15px] leading-none text-forest-900 truncate">
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider font-medium text-ink-muted mt-1">
        {label}
      </p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] bg-paper px-4 py-3">
      <Icon className="h-4 w-4 text-forest-700" strokeWidth={1.75} />
      <span className="text-[13px] text-ink-muted">{label}</span>
      <span className="ml-auto text-[14px] font-medium text-forest-900">
        {value}
      </span>
    </div>
  );
}
