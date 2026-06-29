'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import type { AssignablePlant } from '@/lib/services/plantRepository';

interface Props {
  scanId: string;
  defaultNickname: string;
  candidatePlants: AssignablePlant[];
  signedCoverUrls: Record<string, string>;
}

type Tab = 'new' | 'existing';

export function SavePlantSheet({
  scanId,
  defaultNickname,
  candidatePlants,
  signedCoverUrls,
}: Props) {
  const router = useRouter();
  const hasExisting = candidatePlants.length > 0;
  const [tab, setTab] = useState<Tab>('new');
  const [nickname, setNickname] = useState(defaultNickname);
  const [zone, setZone] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitNew(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/plants', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          scanId,
          nickname: nickname.trim(),
          zoneLabel: zone.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? `Fehler ${res.status}`);
        setPending(false);
        return;
      }
      router.push(`/scan/${scanId}`);
      router.refresh();
    } catch {
      setError('Netzwerkfehler — bitte nochmal versuchen.');
      setPending(false);
    }
  }

  async function submitExisting(plantId: string) {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/scans/${scanId}/assign`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ plantId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? `Fehler ${res.status}`);
        setPending(false);
        return;
      }
      router.push(`/scan/${scanId}`);
      router.refresh();
    } catch {
      setError('Netzwerkfehler — bitte nochmal versuchen.');
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-linen pb-28">
      <header className="flex items-center gap-3 px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-3">
        <Link
          href={`/scan/${scanId}`}
          className="tap-press flex h-10 w-10 items-center justify-center rounded-full bg-cream/92"
        >
          <ArrowLeft className="h-5 w-5 text-bark-900" />
        </Link>
        <h1 className="font-serif text-[22px] text-bark-900">In den Garten</h1>
      </header>

      {hasExisting && (
        <div className="px-5 pt-2">
          <div className="grid grid-cols-2 gap-1 rounded-full bg-paper p-1">
            <button
              onClick={() => setTab('new')}
              className={`tap-press rounded-full py-2 text-[13px] font-semibold transition ${
                tab === 'new' ? 'bg-moss-600 text-cream' : 'text-bark-900'
              }`}
            >
              Neu
            </button>
            <button
              onClick={() => setTab('existing')}
              className={`tap-press rounded-full py-2 text-[13px] font-semibold transition ${
                tab === 'existing' ? 'bg-moss-600 text-cream' : 'text-bark-900'
              }`}
            >
              Bestehend
            </button>
          </div>
        </div>
      )}

      {tab === 'new' && (
        <form onSubmit={submitNew} className="px-5 pt-6 space-y-4">
          <div>
            <label className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Name dieser Pflanze
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={80}
              autoFocus
              required
              placeholder={defaultNickname}
              className="mt-2 w-full rounded-md border border-clay-800/15 bg-paper px-4 py-3 text-[15px] text-bark-900 placeholder:text-ink-muted/60 focus:outline-none focus:border-moss-500"
            />
          </div>
          <div>
            <label className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Zone (optional)
            </label>
            <input
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              maxLength={80}
              placeholder="z.B. Vorgarten, Hochbeet Süd"
              className="mt-2 w-full rounded-md border border-clay-800/15 bg-paper px-4 py-3 text-[15px] text-bark-900 placeholder:text-ink-muted/60 focus:outline-none focus:border-moss-500"
            />
          </div>
          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={pending || nickname.trim().length === 0}
            iconLeft={<Plus className="h-4 w-4" />}
          >
            {pending ? 'Speichert ...' : 'Pflanze anlegen'}
          </Button>
          {error && <p className="text-[12px] text-berry-700">{error}</p>}
        </form>
      )}

      {tab === 'existing' && hasExisting && (
        <div className="px-5 pt-6 space-y-2">
          {candidatePlants.map((p) => (
            <button
              key={p.id}
              onClick={() => submitExisting(p.id)}
              disabled={pending}
              className="tap-press flex w-full items-center gap-3 rounded-md border border-clay-800/10 bg-paper p-3 text-left disabled:opacity-50"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm">
                {signedCoverUrls[p.id] && (
                  <Image
                    src={signedCoverUrls[p.id]}
                    alt={p.nickname}
                    fill
                    unoptimized
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-[14px] font-semibold text-bark-900">
                  {p.nickname}
                </p>
                <p className="text-[12px] text-ink-muted">{p.species}</p>
              </div>
              {p.sameSpecies && (
                <span className="shrink-0 rounded-full bg-moss-100 px-2 py-0.5 text-[10px] font-semibold text-moss-700">
                  gleiche Art
                </span>
              )}
            </button>
          ))}
          {error && <p className="text-[12px] text-berry-700">{error}</p>}
        </div>
      )}
    </div>
  );
}
