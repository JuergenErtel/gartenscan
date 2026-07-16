'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { isValidPLZ } from '@/lib/weather/plz';
import { updateLocation } from '@/app/app/actions';

interface LocationSheetProps {
  open: boolean;
  initialPlz: string | null;
  onClose: () => void;
}

export function LocationSheet({ open, initialPlz, onClose }: LocationSheetProps) {
  const [plz, setPlz] = useState(initialPlz ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (open) {
      setPlz(initialPlz ?? '');
      setError(null);
    }
  }, [open, initialPlz]);

  if (!open) return null;

  const canSave = isValidPLZ(plz.trim()) && !pending;

  async function handleSave() {
    setPending(true);
    setError(null);
    try {
      const result = await updateLocation(plz.trim());
      if (result.ok) {
        onClose();
      } else {
        setError(result.error);
      }
    } catch {
      setError("Speichern fehlgeschlagen — bitte nochmal versuchen.");
    } finally {
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
        aria-labelledby="location-dialog-title"
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-xl bg-paper px-5 pt-3 pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-[0_-8px_32px_rgba(28,42,33,0.18)] animate-in slide-in-from-bottom duration-300"
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-sage-200" aria-hidden />

        <h2 id="location-dialog-title" className="mt-5 font-serif text-[22px] leading-tight text-forest-900">
          Standort setzen
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          Deine PLZ bestimmt Wetter und Frost-/Hitze-Warnungen.
        </p>

        <input
          value={plz}
          onChange={(e) => setPlz(e.target.value.replace(/\D/g, '').slice(0, 5))}
          inputMode="numeric"
          maxLength={5}
          placeholder="z. B. 10115"
          aria-label="Postleitzahl"
          className="mt-4 w-full rounded-md border border-sage-200 bg-cream px-4 py-3 text-[16px] tabular-nums text-bark-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700/30"
        />
        {error && <p className="mt-2 text-[13px] text-berry-700">{error}</p>}

        <div className="mt-6 space-y-2">
          <Button type="button" onClick={handleSave} disabled={!canSave} variant="editorial" fullWidth>
            {pending ? 'Speichere …' : 'Speichern'}
          </Button>
          <Button type="button" onClick={onClose} disabled={pending} variant="ghost" fullWidth>
            Abbrechen
          </Button>
        </div>
      </div>
    </>
  );
}
