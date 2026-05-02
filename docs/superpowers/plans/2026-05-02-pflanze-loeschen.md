# Pflanze löschen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nutzer*innen können eine Pflanze samt aller zugehörigen Scans (DB + Storage-Bilder) über die Garten-Detail-Seite löschen — mit Bottom-Sheet-Bestätigung im App-Stil.

**Architecture:** Storage-Helper (`deleteImages`) + Repository-Funktion (`deletePlantCascade`) + API-Route (`DELETE /api/plants/[id]`) als Backend-Schichten. Im Frontend wird der Footer der Detail-Seite in eine Client-Component (`PlantActions`) extrahiert, die einen `DeletePlantSheet` öffnet. Cascade: Scan-Rows werden manuell gelöscht (FK ist `set null`), `scan_candidates` und `scan_followups` kaskadieren via DB-Cascade.

**Tech Stack:** Next.js 16 App Router, React 19 Client Components, Supabase (DB + Storage), Vitest, Tailwind v4, lucide-react Icons.

---

## File Structure

**Erstellt:**
- `src/lib/services/imageStoragePaths.ts` — pure Helper für Pfad-Dedup (testbar)
- `tests/services/imageStoragePaths.test.ts` — Unit-Test für den Helper
- `src/app/api/plants/[id]/route.ts` — `DELETE`-Handler
- `src/components/features/garden/PlantActions.tsx` — Client-Component (Scan-Button + Lösch-Button)
- `src/components/features/garden/DeletePlantSheet.tsx` — Bottom-Sheet mit Bestätigung

**Modifiziert:**
- `src/lib/services/imageStorageService.ts` — neue `deleteImages(paths)`-Funktion
- `src/lib/services/plantRepository.ts` — neue `deletePlantCascade(plantId, userId)`-Funktion
- `src/app/garden/[plantId]/page.tsx` — Footer durch `<PlantActions />` ersetzen

**Notiz zur Test-Strategie:** Die bestehende Codebase testet nur reine Helper (z.B. `mergePlantsWithStats`). Repository-Funktionen, die direkt gegen Supabase laufen, und API-Routes haben keine Tests. Dieses Muster folgt der Plan: Task 1 nutzt TDD für den reinen Helper; alle anderen Tasks nutzen Lint + Typecheck + manuelle Browser-Verifikation als Qualitätsgate (so wie alle anderen Features in diesem Repo).

---

## Task 1: Pfad-Dedup-Helper (TDD)

**Files:**
- Create: `src/lib/services/imageStoragePaths.ts`
- Test: `tests/services/imageStoragePaths.test.ts`

Begründung: Der `deletePlantCascade` muss eine Liste von Storage-Pfaden bauen (alle Scan-Bilder + Cover-Bild), wobei das Cover meist identisch mit einem Scan-Pfad ist. Wir extrahieren das Dedup als reine Funktion, damit es testbar ist.

- [ ] **Step 1: Test schreiben**

Datei `tests/services/imageStoragePaths.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { collectUniqueImagePaths } from '@/lib/services/imageStoragePaths';

describe('collectUniqueImagePaths', () => {
  it('returns unique paths from scans plus cover', () => {
    const result = collectUniqueImagePaths(
      ['u1/a.jpg', 'u1/b.jpg', 'u1/c.jpg'],
      'u1/d.jpg'
    );
    expect(result.sort()).toEqual(['u1/a.jpg', 'u1/b.jpg', 'u1/c.jpg', 'u1/d.jpg']);
  });

  it('dedupes when cover is also a scan path', () => {
    const result = collectUniqueImagePaths(
      ['u1/a.jpg', 'u1/b.jpg'],
      'u1/a.jpg'
    );
    expect(result.sort()).toEqual(['u1/a.jpg', 'u1/b.jpg']);
  });

  it('handles empty scan list', () => {
    const result = collectUniqueImagePaths([], 'u1/cover.jpg');
    expect(result).toEqual(['u1/cover.jpg']);
  });

  it('drops empty / falsy paths', () => {
    const result = collectUniqueImagePaths(['u1/a.jpg', ''], '');
    expect(result).toEqual(['u1/a.jpg']);
  });
});
```

- [ ] **Step 2: Test laufen lassen, Failure verifizieren**

Run: `npm test -- imageStoragePaths`
Expected: FAIL — Module `@/lib/services/imageStoragePaths` existiert nicht.

- [ ] **Step 3: Helper implementieren**

Datei `src/lib/services/imageStoragePaths.ts`:

```typescript
export function collectUniqueImagePaths(
  scanImagePaths: string[],
  coverImagePath: string
): string[] {
  const set = new Set<string>();
  for (const p of scanImagePaths) {
    if (p) set.add(p);
  }
  if (coverImagePath) set.add(coverImagePath);
  return [...set];
}
```

- [ ] **Step 4: Tests laufen lassen, Pass verifizieren**

Run: `npm test -- imageStoragePaths`
Expected: PASS — alle 4 Tests grün.

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/imageStoragePaths.ts tests/services/imageStoragePaths.test.ts
git commit -m "garden(delete): add pure helper for storage path dedup"
```

---

## Task 2: deleteImages im Storage-Service

**Files:**
- Modify: `src/lib/services/imageStorageService.ts`

- [ ] **Step 1: Funktion ergänzen**

Am Ende von `src/lib/services/imageStorageService.ts` anhängen:

```typescript
export async function deleteImages(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const supabase = createServiceRoleClient();
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) {
    console.error(`storage delete failed for ${paths.length} path(s): ${error.message}`);
  }
}
```

Kontext (zum Verständnis): `BUCKET` ist bereits oben in der Datei als Konstante `'scan-images'` definiert. `createServiceRoleClient` ist ebenfalls bereits importiert. Best-Effort: Fehler werden geloggt, nicht geworfen — Begründung steht in der Spec.

- [ ] **Step 2: Typecheck + Lint**

Run: `npm run lint`
Expected: keine neuen Fehler. (Wenn `npm run lint` warnt, dass `console.error` verboten ist, prüfe ob es im Repo schon andere `console.error`-Aufrufe gibt — wenn ja, ist es ok; wenn nein, ESLint-Hinweise des Repos befolgen.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/services/imageStorageService.ts
git commit -m "storage(images): add deleteImages best-effort helper"
```

---

## Task 3: deletePlantCascade im Plant-Repository

**Files:**
- Modify: `src/lib/services/plantRepository.ts`

- [ ] **Step 1: Imports ergänzen**

In `src/lib/services/plantRepository.ts` ganz oben — nach den bestehenden Imports — hinzufügen:

```typescript
import { deleteImages } from '@/lib/services/imageStorageService';
import { collectUniqueImagePaths } from '@/lib/services/imageStoragePaths';
```

- [ ] **Step 2: Cascade-Funktion am Datei-Ende anhängen**

```typescript
export async function deletePlantCascade(
  plantId: string,
  userId: string
): Promise<void> {
  const plant = await getPlantById(plantId, userId);
  if (!plant) throw new Error('plant not found');

  const supabase = createServiceRoleClient();

  const { data: scanRows, error: scanFetchErr } = await supabase
    .from('scans')
    .select('id, image_path')
    .eq('plant_id', plantId)
    .eq('user_id', userId);

  if (scanFetchErr) {
    throw new Error(`deletePlantCascade scan-fetch: ${scanFetchErr.message}`);
  }

  const scanImagePaths = (scanRows ?? [])
    .map((r) => r.image_path as string)
    .filter((p) => typeof p === 'string' && p.length > 0);

  const { error: scanDelErr } = await supabase
    .from('scans')
    .delete()
    .eq('plant_id', plantId)
    .eq('user_id', userId);

  if (scanDelErr) {
    throw new Error(`deletePlantCascade scan-delete: ${scanDelErr.message}`);
  }

  const { error: plantDelErr } = await supabase
    .from('plants')
    .delete()
    .eq('id', plantId)
    .eq('user_id', userId);

  if (plantDelErr) {
    throw new Error(`deletePlantCascade plant-delete: ${plantDelErr.message}`);
  }

  const allPaths = collectUniqueImagePaths(scanImagePaths, plant.coverImagePath);
  await deleteImages(allPaths);
}
```

Begründung der Reihenfolge: erst Scans (kaskadiert auf `scan_candidates` + `scan_followups`), dann Plant. Wenn Plant-Delete fehlschlägt, sind die Scans schon weg — das ist akzeptabel, weil eine zweite Lösch-Aktion die noch verwaiste Pflanze sauber entfernt (es bleiben dann keine Scan-Children mehr). Storage-Cleanup als letzter, best-effort Schritt.

- [ ] **Step 3: Typecheck + Lint**

Run: `npm run lint`
Expected: keine neuen Fehler.

- [ ] **Step 4: Tests laufen lassen (Regression)**

Run: `npm test`
Expected: Alle Tests grün — wir haben nur **erweitert**, keine bestehenden Funktionen geändert.

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/plantRepository.ts
git commit -m "garden(delete): cascade delete plant + scans + storage"
```

---

## Task 4: DELETE-API-Route

**Files:**
- Create: `src/app/api/plants/[id]/route.ts`

- [ ] **Step 1: Route-Datei erstellen**

```typescript
import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { deletePlantCascade } from '@/lib/services/plantRepository';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  if (typeof id !== 'string' || id.length === 0) {
    return NextResponse.json({ error: 'invalid_plant_id' }, { status: 400 });
  }

  try {
    await deletePlantCascade(id, user.id);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    if (msg.includes('plant not found')) {
      return NextResponse.json({ error: 'plant_not_found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'internal_error', detail: msg }, { status: 500 });
  }

  revalidatePath('/garden');
  return new NextResponse(null, { status: 204 });
}
```

Notiz: Pattern (`createClient`, Auth-Check, Try/Catch, Error-Mapping) folgt exakt `src/app/api/plants/route.ts`.

- [ ] **Step 2: Typecheck + Lint**

Run: `npm run lint`
Expected: keine neuen Fehler.

- [ ] **Step 3: Build-Verifikation**

Run: `npm run build`
Expected: Build geht durch, neue Route `DELETE /api/plants/[id]` wird in der Routen-Liste angezeigt.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/plants/[id]/route.ts
git commit -m "api(plants): add DELETE /api/plants/[id]"
```

---

## Task 5: DeletePlantSheet Client-Component

**Files:**
- Create: `src/components/features/garden/DeletePlantSheet.tsx`

- [ ] **Step 1: Sheet-Komponente erstellen**

```tsx
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
```

Notizen zur Konsistenz mit dem Repo:
- `tap-press` ist eine bestehende Tailwind-Utility-Klasse (genutzt überall in `SavePlantSheet.tsx` etc.).
- Farben (`bg-berry-600`, `text-forest-900`, `bg-sage-100` etc.) entsprechen dem bestehenden Token-Set.
- `animate-in slide-in-from-bottom` wird von Tailwind v4 / `tailwindcss-animate`-Konventionen unterstützt — falls nicht verfügbar (anhand des Output-Builds prüfen), fallback auf `transition-transform translate-y-0` mit initial `translate-y-full` via `useEffect`-State. Erst beim Bauen verifizieren.

- [ ] **Step 2: Lint + Typecheck**

Run: `npm run lint`
Expected: keine neuen Fehler.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/garden/DeletePlantSheet.tsx
git commit -m "garden(delete): add DeletePlantSheet bottom sheet"
```

---

## Task 6: PlantActions Client-Component

**Files:**
- Create: `src/components/features/garden/PlantActions.tsx`

- [ ] **Step 1: Component erstellen**

```tsx
'use client';

import { useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DeletePlantSheet } from './DeletePlantSheet';

interface Props {
  plantId: string;
  plantNickname: string;
  scanCount: number;
}

export function PlantActions({ plantId, plantNickname, scanCount }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
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

      <section className="px-5 pt-3">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="tap-press w-full py-3 text-center text-[13px] font-medium text-berry-700 transition"
        >
          Pflanze löschen
        </button>
      </section>

      {sheetOpen && (
        <DeletePlantSheet
          plantId={plantId}
          plantNickname={plantNickname}
          scanCount={scanCount}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Lint + Typecheck**

Run: `npm run lint`
Expected: keine neuen Fehler.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/garden/PlantActions.tsx
git commit -m "garden(detail): add PlantActions client wrapper"
```

---

## Task 7: Detail-Seite verdrahten

**Files:**
- Modify: `src/app/garden/[plantId]/page.tsx`

- [ ] **Step 1: Import ergänzen**

In den bestehenden Import-Block oben in `src/app/garden/[plantId]/page.tsx` hinzufügen:

```typescript
import { PlantActions } from '@/components/features/garden/PlantActions';
```

Und entfernen: `Camera` aus dem `lucide-react`-Import (wird im Footer nicht mehr direkt gebraucht). Konkret: aus

```typescript
import { ArrowLeft, CalendarDays, Leaf, Camera } from 'lucide-react';
```

machen:

```typescript
import { ArrowLeft, CalendarDays, Leaf } from 'lucide-react';
```

`Button` bleibt importiert nur falls noch woanders genutzt — im Originalcode wird `Button` nur im jetzt zu ersetzenden Footer verwendet, daher ebenfalls den `Button`-Import entfernen:

```typescript
import { Button } from '@/components/ui/Button';
```

→ diese Zeile löschen.

- [ ] **Step 2: Footer ersetzen**

Im JSX, ersetze diesen Block (aktuell die letzten Zeilen vor dem schließenden Wrapper-Div):

```tsx
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
```

durch:

```tsx
<PlantActions
  plantId={plant.id}
  plantNickname={plant.nickname}
  scanCount={scans.length}
/>
```

- [ ] **Step 3: Lint + Typecheck**

Run: `npm run lint`
Expected: keine neuen Fehler. (Falls Lint anmeckert, dass `Button` oder `Camera` unused — nochmal prüfen, ob die Imports oben wirklich entfernt wurden.)

- [ ] **Step 4: Build-Verifikation**

Run: `npm run build`
Expected: Build geht durch.

- [ ] **Step 5: Commit**

```bash
git add src/app/garden/[plantId]/page.tsx
git commit -m "garden(detail): wire PlantActions into footer"
```

---

## Task 8: Manuelle Browser-Verifikation

**Files:** keine

- [ ] **Step 1: Dev-Server starten**

Run: `npm run dev`
Expected: Server läuft auf `http://localhost:3000`.

- [ ] **Step 2: Mobile-Viewport öffnen**

Browser auf iPhone-Viewport (z.B. 390×844) stellen — gartenscan ist mobile-first, alle Lösch-UX-Entscheidungen wurden für 360–390px getroffen.

- [ ] **Step 3: Golden Path durchspielen**

1. Anmelden, in `/garden` navigieren — sicherstellen, dass mindestens **eine Pflanze mit ≥1 Scan** existiert. Wenn nicht: einen neuen Scan machen, in den Garten speichern.
2. Auf die Pflanze tappen → Detail-Seite öffnet.
3. Nach unten scrollen → unter „Neuen Scan machen" muss „Pflanze löschen" als dezenter berry-roter Text-Link erscheinen.
4. Tap → Bottom-Sheet slidet von unten ein, Backdrop dimmt. Titel zeigt den Pflanzennamen, Body zeigt korrekte Scan-Anzahl mit deutschem Singular/Plural („1 zugehörigen Scan" / „3 zugehörigen Scans").
5. „Abbrechen" → Sheet schließt, Pflanze unverändert.
6. Erneut „Pflanze löschen" → „Endgültig löschen" tappen.
7. Erwartet: Button zeigt kurz „Lösche ...", dann Redirect nach `/garden`. Pflanze ist aus der Liste verschwunden.

- [ ] **Step 4: Datenkonsistenz prüfen**

In Supabase Studio (oder via SQL):

```sql
-- Sollte 0 zurückgeben für die gelöschte plant_id:
select count(*) from plants where id = '<gelöschte plant id>';
select count(*) from scans where plant_id = '<gelöschte plant id>';
-- scan_candidates / scan_followups sollten ebenfalls weg sein:
select count(*) from scan_candidates where scan_id in (...alte scan-ids...);
```

Storage: `scan-images` Bucket öffnen, prüfen dass die Pfade `<userId>/<scanId>.jpg` der gelöschten Scans nicht mehr existieren.

- [ ] **Step 5: Edge-Case — Backdrop während Pending**

Optional: Während eines langsamen Lösch-Requests (z.B. mit DevTools-Throttling auf „Slow 3G") versuchen, auf den Backdrop zu tappen. Sheet darf **nicht** schließen, solange `pending = true`.

- [ ] **Step 6: Pipeline-Update**

Nach erfolgreicher Verifikation:

```powershell
pipeline-update -Slug gartenscanner `
  -Progress <neuer-Wert> `
  -Summary "Pflanze löschen live: Cascade-Delete (DB + Storage), Bottom-Sheet-Bestätigung im App-Stil" `
  -Todos @("<verbleibende Phase-D/E-Items>")
```

Genauen Progress-Wert und verbleibende Todos passend zum aktuellen Pipeline-Stand wählen.

---

## Self-Review Checklist (für den Plan-Autor)

- ✅ Spec-Coverage: Storage-Helper (Task 2), Repo-Cascade (Task 3), API-Route (Task 4), Sheet (Task 5), Actions-Wrapper (Task 6), Detail-Seite-Integration (Task 7) — alle Spec-Sektionen abgedeckt.
- ✅ Edge-Cases adressiert: Plant-not-found (404 in Route + Error-Anzeige im Sheet), Storage-Best-Effort (Task 2), Pending-Backdrop-Lock (Task 5), Singular/Plural (Task 5/8).
- ✅ Keine Placeholders, alle Code-Blöcke vollständig.
- ✅ Type-Konsistenz: `plantId`/`plantNickname`/`scanCount` einheitlich über Sheet ↔ Actions ↔ Page.
- ✅ Reihenfolge erlaubt frühe Commits + Validierung; jeder Commit lässt Build/Lint grün.
