'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  scanId: string;
  onClose: () => void;
}

interface CoverConflict {
  plantNickname: string;
}

export function DeleteScanSheet({ scanId, onClose }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverConflict, setCoverConflict] = useState<CoverConflict | null>(null);

  async function handleDelete() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/scans/${scanId}`, { method: 'DELETE' });
      if (res.status === 409) {
        const data = await res.json().catch(() => null);
        const nickname = typeof data?.plantNickname === 'string' ? data.plantNickname : '?';
        setCoverConflict({ plantNickname: nickname });
        setPending(false);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? `Fehler ${res.status}`);
        setPending(false);
        return;
      }
      router.push('/history');
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
        aria-labelledby="delete-scan-dialog-title"
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-xl bg-paper px-5 pt-3 pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-[0_-8px_32px_rgba(28,42,33,0.18)] animate-in slide-in-from-bottom duration-300"
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-sage-200" aria-hidden />

        {coverConflict ? (
          <>
            <h2 id="delete-scan-dialog-title" className="mt-5 font-serif text-[22px] leading-tight text-forest-900">
              Nicht möglich
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
              Dieser Scan ist das Coverbild deiner Pflanze{' '}
              <span className="font-semibold text-bark-900">{coverConflict.plantNickname}</span>.
              Bitte erst dort ein anderes Foto wählen oder die Pflanze löschen.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={onClose}
                className="tap-press w-full rounded-md bg-sage-100 px-6 py-3.5 text-[15px] font-semibold text-forest-800 transition"
              >
                OK
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="delete-scan-dialog-title" className="mt-5 font-serif text-[22px] leading-tight text-forest-900">
              Scan löschen?
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
              Dieser Scan wird unwiderruflich gelöscht.
            </p>

            <div className="mt-6 space-y-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="tap-press w-full rounded-md bg-berry-600 px-6 py-3.5 text-[15px] font-semibold text-paper transition disabled:opacity-50"
              >
                {pending ? 'Lösche ...' : 'Endgültig löschen'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={pending}
                className="tap-press w-full rounded-md bg-sage-100 px-6 py-3.5 text-[15px] font-semibold text-forest-800 transition disabled:opacity-50"
              >
                Abbrechen
              </button>
            </div>

            {error && (
              <p className="mt-3 text-center text-[12px] text-berry-700">{error}</p>
            )}
          </>
        )}
      </div>
    </>
  );
}
