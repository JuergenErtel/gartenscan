# Scan löschen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to execute task-by-task.

**Goal:** Nutzer*innen können einzelne Scans samt Storage-Bild über die Scan-Detail-Seite löschen — mit Cover-Conflict-Schutz für Pflanzen, deren Cover dieser Scan ist.

**Architecture:** Spiegelt das Plant-Delete-Pattern. Repo-Funktion (`deleteScan`) mit Cover-Check, neuer `DELETE`-Handler im bestehenden `scans/[id]/route.ts`, Bottom-Sheet mit Conflict-Modus, Client-Footer-Wrapper auf Scan-Detail-Seite. `deleteImages` und `collectUniqueImagePaths` werden aus Plant-Delete weiterverwendet.

**Tech Stack:** Next.js 16, React 19, Supabase, Tailwind v4.

---

## File Structure

**Erstellt:**
- `src/components/features/scan/DeleteScanSheet.tsx` — Bottom-Sheet mit Standard- und Conflict-Modus
- `src/components/features/scan/ScanFooterActions.tsx` — Client-Wrapper mit Trigger-Button

**Modifiziert:**
- `src/lib/services/scanRepository.ts` — neue `deleteScan(scanId, userId)`
- `src/app/api/scans/[id]/route.ts` — neuer `DELETE`-Handler im selben File
- `src/app/scan/[id]/page.tsx` — `<ScanFooterActions>` einfügen vor dem fixed-bottom Button

**Test-Strategie:** Wie beim Plant-Delete — keine DB-Tests (Repo-Funktionen mit Supabase werden in diesem Repo nicht getestet). TS + Build sind das Quality-Gate. Manuelle Verifikation am Ende.

---

## Task 1: deleteScan im Scan-Repository

**Files:**
- Modify: `src/lib/services/scanRepository.ts`

- [ ] **Step 1: Imports ergänzen**

In `src/lib/services/scanRepository.ts` nach den bestehenden Imports oben ergänzen:

```typescript
import { deleteImages } from '@/lib/services/imageStorageService';
```

- [ ] **Step 2: Funktion am Datei-Ende anhängen**

```typescript
export async function deleteScan(scanId: string, userId: string): Promise<void> {
  const scan = await getScanById(scanId, userId);
  if (!scan) throw new Error('scan not found');

  const supabase = createServiceRoleClient();

  const { data: coverPlants, error: coverErr } = await supabase
    .from('plants')
    .select('nickname')
    .eq('cover_image_path', scan.imagePath)
    .eq('user_id', userId)
    .limit(1);

  if (coverErr) {
    throw new Error(`deleteScan cover-check: ${coverErr.message}`);
  }

  if (coverPlants && coverPlants.length > 0) {
    const nickname = coverPlants[0].nickname;
    throw new Error(`scan is plant cover:${nickname}`);
  }

  const { error: scanDelErr } = await supabase
    .from('scans')
    .delete()
    .eq('id', scanId)
    .eq('user_id', userId);

  if (scanDelErr) {
    throw new Error(`deleteScan scan-delete: ${scanDelErr.message}`);
  }

  if (scan.imagePath) {
    await deleteImages([scan.imagePath]);
  }
}
```

- [ ] **Step 3: TypeScript-Check + Tests**

```bash
npx tsc --noEmit
npm test
```

Beide müssen sauber durchlaufen.

- [ ] **Step 4: Commit**

```powershell
git add src/lib/services/scanRepository.ts
git commit -m "scan(delete): add deleteScan with plant-cover guard"
```

---

## Task 2: DELETE-Handler in /api/scans/[id]/route.ts

**Files:**
- Modify: `src/app/api/scans/[id]/route.ts`

- [ ] **Step 1: Imports prüfen**

Aktuell hat das File mit hoher Wahrscheinlichkeit schon `NextResponse`, `createClient` etc. importiert (für PATCH). Falls noch nicht da, ergänzen:
- `revalidatePath` aus `next/cache`
- `deleteScan` aus `@/lib/services/scanRepository`

- [ ] **Step 2: DELETE-Handler ergänzen**

Ans Datei-Ende anhängen (nach dem PATCH-Handler):

```typescript
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  if (typeof id !== 'string' || id.length === 0) {
    return NextResponse.json({ error: 'invalid_scan_id' }, { status: 400 });
  }

  try {
    await deleteScan(id, user.id);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    if (msg.includes('scan not found')) {
      return NextResponse.json({ error: 'scan_not_found' }, { status: 404 });
    }
    if (msg.startsWith('scan is plant cover:')) {
      const plantNickname = msg.slice('scan is plant cover:'.length);
      return NextResponse.json(
        { error: 'scan_is_plant_cover', plantNickname },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'internal_error', detail: msg }, { status: 500 });
  }

  revalidatePath('/history');
  return new NextResponse(null, { status: 204 });
}
```

- [ ] **Step 3: TS + Build**

```bash
npx tsc --noEmit
npm run build
```

Build muss durch und neue Methode unter `/api/scans/[id]` zeigen.

- [ ] **Step 4: Commit**

```powershell
git add 'src/app/api/scans/[id]/route.ts'
git commit -m "api(scans): add DELETE handler with cover-conflict mapping"
```

---

## Task 3: DeleteScanSheet Bottom-Sheet

**Files:**
- Create: `src/components/features/scan/DeleteScanSheet.tsx`

- [ ] **Step 1: Component erstellen**

```tsx
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
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[24px] bg-paper px-5 pt-3 pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-[0_-8px_32px_rgba(28,42,33,0.18)] animate-in slide-in-from-bottom duration-300"
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
                className="tap-press w-full rounded-[14px] bg-sage-100 px-6 py-3.5 text-[15px] font-semibold text-forest-800 transition"
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
              <p className="mt-3 text-center text-[12px] text-berry-700">{error}</p>
            )}
          </>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: TS-Check + Commit**

```bash
npx tsc --noEmit
git add 'src/components/features/scan/DeleteScanSheet.tsx'
git commit -m "scan(delete): add DeleteScanSheet with cover-conflict mode"
```

---

## Task 4: ScanFooterActions Client-Wrapper

**Files:**
- Create: `src/components/features/scan/ScanFooterActions.tsx`

- [ ] **Step 1: Component erstellen**

```tsx
'use client';

import { useState } from 'react';
import { DeleteScanSheet } from './DeleteScanSheet';

interface Props {
  scanId: string;
}

export function ScanFooterActions({ scanId }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <section className="px-5 pt-6">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="tap-press w-full py-3 text-center text-[13px] font-medium text-berry-700 transition"
        >
          Scan löschen
        </button>
      </section>

      {sheetOpen && (
        <DeleteScanSheet scanId={scanId} onClose={() => setSheetOpen(false)} />
      )}
    </>
  );
}
```

- [ ] **Step 2: TS-Check + Commit**

```bash
npx tsc --noEmit
git add 'src/components/features/scan/ScanFooterActions.tsx'
git commit -m "scan(detail): add ScanFooterActions wrapper"
```

---

## Task 5: Scan-Detail-Seite verdrahten

**Files:**
- Modify: `src/app/scan/[id]/page.tsx`

- [ ] **Step 1: Import ergänzen**

In `src/app/scan/[id]/page.tsx` zu den Komponenten-Imports oben:

```typescript
import { ScanFooterActions } from "@/components/features/scan/ScanFooterActions";
```

- [ ] **Step 2: Einfügen vor dem fixed-bottom Block**

Im JSX, **direkt vor** diesem Block (Zeile ~324):

```tsx
<div className="fixed bottom-0 left-0 right-0 z-30 px-5 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3 bg-gradient-to-t from-linen via-linen/95 to-transparent">
```

einfügen:

```tsx
<ScanFooterActions scanId={scan.id} />
```

Die Komponente landet im scrollbaren Bereich, knapp über dem fixed CTA-Bar. `pb-28` auf dem Wrapper-Div sorgt schon für Platz.

- [ ] **Step 3: TS + Build + Commit**

```bash
npx tsc --noEmit
npm run build
git add 'src/app/scan/[id]/page.tsx'
git commit -m "scan(detail): wire ScanFooterActions into footer"
```

---

## Task 6: Push + Live-Verifikation

- [ ] **Step 1: Push**

```bash
git push origin main
```

Vercel deployt automatisch (1–2 Min).

- [ ] **Step 2: Live-Test**

Auf Mobile-Viewport:
1. `/history` öffnen → einen Scan antippen → Detail-Seite öffnet
2. Bis ans Ende scrollen → „Scan löschen" als kleiner berry-roter Text-Button sichtbar (über dem fixed „Nächster Scan" Button)
3. Tap → Bottom-Sheet erscheint mit „Scan löschen?"
4. „Endgültig löschen" → Sheet schließt, redirect zu `/history`, Scan ist weg

Cover-Conflict-Test:
1. Eine Pflanze aus einem Scan speichern
2. Genau diesen Scan (der jetzt das Cover ist) löschen wollen
3. Sheet sollte „Nicht möglich" zeigen mit Pflanzen-Name + nur „OK"-Button
