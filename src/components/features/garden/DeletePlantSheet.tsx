'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  plantId: string;
  plantNickname: string;
  scanCount: number;
  onClose: () => void;
}

export function DeletePlantSheet({
  plantId,
  plantNickname,
  scanCount,
  onClose,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/plants/${plantId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? `Fehler ${res.status}`);
        setPending(false);
        return;
      }
      router.push('/garden');
      router.refresh();
    } catch {
      setError('Netzwerkfehler — bitte nochmal versuchen.');
      setPending(false);
    }
  }

  function handleBackdrop() {
    if (pending) return;
    onClose();
  }

  const scanLabel = scanCount === 1 ? 'zugehörigen Scan' : `zugehörigen Scans`;

  return (
    <>
      <div
        onClick={handleBackdrop}
        className="fixed inset-0 z-40 bg-bark-900/50 backdrop-blur-sm animate-in fade-in duration-200"
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[24px] bg-paper px-5 pt-3 pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-[0_-8px_32px_rgba(28,42,33,0.18)] animate-in slide-in-from-bottom duration-300"
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-sage-200" aria-hidden />

        <h2 className="mt-5 font-serif text-[22px] leading-tight text-forest-900">
          {plantNickname} löschen?
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          Diese Pflanze und alle <span className="font-semibold text-bark-900">{scanCount}</span>{' '}
          {scanLabel} werden unwiderruflich gelöscht.
        </p>

        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="tap-press w-full rounded-[14px] bg-berry-600 px-6 py-3.5 text-[15px] font-semibold text-paper transition disabled:opacity-50"
          >
            {pending ? 'Lösche ...' : 'Endgültig löschen'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="tap-press w-full rounded-[14px] bg-sage-100 px-6 py-3.5 text-[15px] font-semibold text-forest-800 transition disabled:opacity-50"
          >
            Abbrechen
          </button>
        </div>

        {error && (
          <p className="mt-3 text-center text-[12px] text-berry-700">
            {error}
          </p>
        )}
      </div>
    </>
  );
}
