import Link from 'next/link';
import { Sprout, ArrowRight } from 'lucide-react';

interface Props {
  scanId: string;
}

export function SavePlantPrompt({ scanId }: Props) {
  return (
    <section className="px-5 pt-6">
      <Link
        href={`/scan/${scanId}/save`}
        className="tap-press flex items-center gap-3 rounded-[18px] border border-moss-300 bg-paper p-4"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-moss-100">
          <Sprout className="h-5 w-5 text-moss-700" strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-bark-900">
            Diese Pflanze in deinen Garten aufnehmen
          </p>
          <p className="text-[12px] text-ink-muted leading-snug mt-0.5">
            Mit einem Tippen speichern und später den Verlauf sehen
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-bark-900" strokeWidth={1.75} />
      </Link>
    </section>
  );
}
