'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { DetectionCandidate } from '@/domain/scan/ScanOutcome';

interface Props {
  scanId: string;
  candidates: DetectionCandidate[];
  imageUrl: string;
}

type Pending = { action: 'confirm'; rank: number } | { action: 'reject' } | null;

export function UncertainMatchState({ scanId, candidates, imageUrl }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<Pending>(null);
  const [error, setError] = useState<string | null>(null);

  const top = candidates[0];
  const topName = top?.commonNames[0] ?? top?.scientificName ?? '';
  const topConfidencePct = top ? Math.round(top.confidence * 100) : 0;

  async function submit(payload: { action: 'confirm'; rank: number } | { action: 'reject' }) {
    setPending(payload);
    setError(null);
    try {
      const res = await fetch(`/api/scans/${scanId}/status`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(
          payload.action === 'confirm'
            ? { action: 'confirm', selectedRank: payload.rank }
            : { action: 'reject' }
        ),
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
          alt={topName}
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
          <Badge
            tone="outline"
            className="gap-2 border-transparent bg-cream/92 px-3 text-[10px] font-bold normal-case tracking-normal text-bark-900 backdrop-blur-md"
            icon={<span className="h-1.5 w-1.5 rounded-full bg-berry-500" />}
          >
            Nur {topConfidencePct} % sicher
          </Badge>
        </div>
      </div>

      <div className="relative -mt-7 rounded-t-xl bg-cream pt-6 pb-4 px-5 shadow-[0_-8px_24px_rgba(58,37,21,0.06)]">
        <p className="eyebrow mb-2 text-terra-500">Vermutung, nicht bestätigt</p>
        <h1 className="font-serif text-[28px] leading-tight text-bark-900 mb-1">
          Welche Pflanze passt am ehesten?
        </h1>
        <p className="pull-quote mt-3 mb-1">
          Unsere Erkennung ist nicht sicher genug für ein Urteil. Wähl den passenden Kandidaten — oder verwirf den Vorschlag.
        </p>
      </div>

      <div className="px-5 pt-4">
        <div className="space-y-2.5">
          {candidates.map((cand) => {
            const isPending =
              pending?.action === 'confirm' && pending.rank === cand.rank;
            const otherPending = pending !== null && !isPending;
            const label = cand.commonNames[0] ?? cand.scientificName;
            return (
              <button
                key={cand.rank}
                type="button"
                onClick={() => submit({ action: 'confirm', rank: cand.rank })}
                disabled={pending !== null}
                className={cn(
                  'tap-press w-full rounded-lg border bg-paper px-4 py-4 text-left transition',
                  isPending
                    ? 'border-forest-700 ring-2 ring-forest-700/30'
                    : 'border-clay-800/15 hover:border-forest-700/40',
                  otherPending && 'opacity-50'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold text-bark-900">
                      {label}
                    </p>
                    <p className="latin-name text-[12px] mt-0.5">
                      {cand.scientificName}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[12px] font-semibold text-ink-muted tabular-nums">
                      {Math.round(cand.confidence * 100)} %
                    </span>
                    <span
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full',
                        isPending
                          ? 'bg-forest-700 text-paper'
                          : 'bg-sage-100 text-forest-700'
                      )}
                    >
                      <Check className="h-4 w-4" strokeWidth={2.25} />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-lg border border-clay-800/15 bg-cream p-4">
          <p className="mb-3 text-[13px] leading-relaxed text-bark-900">
            Keine davon passt?
          </p>
          <Button
            onClick={() => submit({ action: 'reject' })}
            disabled={pending !== null}
            variant="secondary"
            fullWidth
            iconLeft={<X className="h-4 w-4" />}
          >
            {pending?.action === 'reject' ? 'Speichert ...' : 'Vorschlag verwerfen'}
          </Button>
        </div>

        {error && (
          <p className="mt-3 text-[12px] text-berry-700">{error}</p>
        )}
      </div>
    </div>
  );
}
