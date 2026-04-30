import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, CalendarDays, Leaf, Camera } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UrgencyIndicator } from '@/components/ui/UrgencyIndicator';
import { formatRelativeDate } from '@/lib/utils';
import { OnboardingGuard } from '@/components/features/onboarding/OnboardingGuard';
import { createClient } from '@/lib/supabase/server';
import { getPlantById } from '@/lib/services/plantRepository';
import { listScansForPlant } from '@/lib/services/scanRepository';
import { createSignedReadUrl } from '@/lib/services/imageStorageService';
import { getScanCaseSummary } from '@/lib/scan/caseSummary';
import { getContentById } from '@/content';

export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ plantId: string }>;
}) {
  const { plantId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/app');

  const plant = await getPlantById(plantId, user.id);
  if (!plant) return notFound();

  const scans = await listScansForPlant(plant.id, user.id);
  const coverUrl = await createSignedReadUrl(plant.coverImagePath, 3600);

  const scanRows = await Promise.all(
    scans.map(async (s) => {
      const matchedEntry = s.matchedContentId
        ? getContentById(s.matchedContentId) ?? undefined
        : undefined;
      const summary = getScanCaseSummary(s, matchedEntry, undefined);
      const signedUrl = await createSignedReadUrl(s.imagePath, 3600);
      return { scan: s, summary, signedUrl };
    })
  );

  const lastScanAt = scans[0]?.createdAt;

  return (
    <OnboardingGuard>
      <div className="min-h-screen bg-sage-50 pb-20">
        <div className="relative h-[50vh] min-h-[380px] w-full overflow-hidden">
          <Image
            src={coverUrl}
            alt={plant.nickname}
            fill
            priority
            unoptimized
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
            <Stat label="Zone" value={plant.zoneLabel ?? '—'} />
            <Stat label="Scans" value={scans.length.toString()} />
            <Stat
              label="Zuletzt"
              value={lastScanAt ? formatRelativeDate(lastScanAt) : '—'}
            />
          </div>
        </section>

        <section className="px-5 pt-8">
          <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted mb-3">
            Über diese Pflanze
          </p>
          <div className="space-y-3">
            <InfoRow icon={CalendarDays} label="Hinzugefügt" value={formatRelativeDate(plant.createdAt)} />
            <InfoRow icon={Leaf} label="Art" value={plant.species} />
          </div>
        </section>

        {scanRows.length > 0 && (
          <section className="px-5 pt-8">
            <h2 className="font-serif text-[22px] leading-tight text-forest-900 font-normal mb-3">
              Verlauf dieser Pflanze
            </h2>
            <div className="space-y-3">
              {scanRows.map(({ scan, summary, signedUrl }) => (
                <Link
                  key={scan.id}
                  href={`/scan/${scan.id}`}
                  className="flex gap-3 rounded-[18px] bg-paper p-4 shadow-[var(--shadow-soft)] tap-press"
                >
                  <div
                    className="h-16 w-16 shrink-0 rounded-[12px] bg-cover bg-center photo-graded"
                    style={{ backgroundImage: `url(${signedUrl})` }}
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
                    <p className="mt-2 text-[11px] text-ink-muted">
                      {formatRelativeDate(scan.createdAt)}
                    </p>
                  </div>
                </Link>
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
