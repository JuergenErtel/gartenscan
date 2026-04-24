'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { DetectionCandidate } from '@/domain/scan/ScanOutcome';

interface Props {
  scanId: string;
  candidate: DetectionCandidate;
  imageUrl: string;
}

type PendingAction = 'confirm' | 'reject' | null;

export function UncertainMatchState({ scanId, candidate, imageUrl }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);

  const heroName = candidate.commonNames[0] ?? candidate.scientificName;
  const confidencePct = Math.round(candidate.confidence * 100);

  async function submit(action: 'confirm' | 'reject') {
    setPending(action);
    setError(null);
    try {
      const res = await fetch(`/api/scans/${scanId}/status`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.status === 409) {
        setError('Dieser Scan wurde bereits eingeordnet.');
        router.refresh();
        return;
      }
      if (res.status === 401 || res.status === 403) {
        router.push('/app');
        return;
      }
      if (!res.ok) {
        throw new Error(`status ${res.status}`);
      }

      router.refresh();
    } catch {
      setError('Konnte nicht speichern, bitte nochmal versuchen.');
      setPending(null);
    }
  }

  return (
    <div className="min-h-screen bg-linen pb-28">
      <div className="relative h-[280px] overflow-hidden">
        <Image
          src={imageUrl}
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
          <Link
            href="/app"
            className="tap-press flex h-10 w-10 items-center justify-center rounded-full bg-cream/92 backdrop-blur-md"
          >
            <ArrowLeft className="h-5 w-5 text-bark-900" />
          </Link>
        </div>

        <div className="absolute top-[calc(max(env(safe-area-inset-top),1rem)+52px)] left-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-cream/92 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-bark-900">
            <span className="h-1.5 w-1.5 rounded-full bg-berry-500" />
            Nur {confidencePct} % sicher
          </span>
        </div>
      </div>

      <div className="relative -mt-7 rounded-t-[28px] bg-cream pt-6 pb-6 px-5 shadow-[0_-8px_24px_rgba(58,37,21,0.06)]">
        <p className="eyebrow mb-2">Vermutung, nicht bestätigt</p>
        <h1 className="font-serif text-[28px] leading-tight text-bark-900 mb-1">
          {heroName}
        </h1>
        <p className="latin-name text-[13px] mb-3">{candidate.scientificName}</p>
        <p className="pull-quote mt-3 mb-2">
          Unsere Erkennung ist hier nicht sicher genug für ein Urteil. Deine Bestätigung hilft, den nächsten Scan besser zu führen.
        </p>
      </div>

      <div className="px-5 pt-6">
        <div className="rounded-[18px] border border-clay-800/15 bg-paper p-5">
          <p className="mb-4 text-[13px] leading-relaxed text-bark-900">
            Ist das die Pflanze, die du fotografiert hast?
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => submit('confirm')}
              disabled={pending !== null}
              fullWidth
              iconLeft={<Check className="h-4 w-4" />}
            >
              {pending === 'confirm' ? 'Speichert ...' : 'Das ist es'}
            </Button>
            <Button
              onClick={() => submit('reject')}
              disabled={pending !== null}
              variant="secondary"
              fullWidth
              iconLeft={<X className="h-4 w-4" />}
            >
              {pending === 'reject' ? 'Speichert ...' : 'Stimmt nicht'}
            </Button>
          </div>
          {error && (
            <p className="mt-3 text-[12px] text-berry-700">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
