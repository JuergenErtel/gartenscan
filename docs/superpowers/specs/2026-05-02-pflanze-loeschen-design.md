# Pflanze löschen (mit Scan-Kaskade)

**Datum:** 2026-05-02
**Status:** Spec — implementierungsbereit

## Motivation

Bisher können Nutzer*innen Pflanzen in den Garten aufnehmen, aber nicht
mehr entfernen. Die Detail-Seite (`/garden/[plantId]`) hat keine
Lösch-Aktion. Eine Pflanze, die versehentlich angelegt wurde oder real
nicht mehr im Garten steht, bleibt für immer in der Übersicht.

Diese Spec ergänzt eine destruktive Lösch-Aktion mit klarer
Bestätigung und Cascade-Verhalten auf zugehörige Scans.

## Verhalten

### Was passiert beim Löschen

- Die Pflanzen-Row wird entfernt.
- **Alle Scans dieser Pflanze** (`scans.plant_id = ?`) werden ebenfalls
  gelöscht — keine verwaisten Einträge in der globalen Scan-Historie.
- Über DB-Cascade kaskadieren `scan_candidates` und `scan_followups`
  automatisch mit.
- Storage-Bilder (Cover + alle Scan-Bilder) werden best-effort aus dem
  Bucket `scan-images` entfernt.

### UX

- Auf der Detail-Seite erscheint unterhalb von „Neuen Scan machen" ein
  dezenter destruktiver Text-Button **„Pflanze löschen"** (kleiner als
  der Primärbutton, in `text-berry-700`, ohne Fläche/Border).
- Tap öffnet ein **Bottom-Sheet** im App-Stil (`bg-paper`,
  `rounded-t-[24px]`, slide-up von unten, Backdrop mit Blur).
- Sheet-Inhalt:
  - Drag-Indicator oben
  - Titel: „**{nickname} löschen?**"
  - Body: „Diese Pflanze und alle **{n}** zugehörigen Scans werden
    unwiderruflich gelöscht."
  - Buttons: „Abbrechen" (sekundär) + „Endgültig löschen" (destruktiv,
    `bg-berry-600 text-paper`)
- Während des Löschens zeigt der Bestätigungs-Button „Lösche ..." und
  ist disabled. Backdrop-Tap schließt das Sheet in diesem Zustand
  nicht.
- Nach Erfolg: Navigation zurück nach `/garden` mit `router.refresh()`.
- Bei Fehler: Inline-Error-Zeile im Sheet, User bleibt auf der Seite.

## Architektur

### Schicht 1 — Storage-Service

Datei: `src/lib/services/imageStorageService.ts`

Neue Funktion:

```ts
export async function deleteImages(paths: string[]): Promise<void>
```

- Ruft `supabase.storage.from('scan-images').remove(paths)` auf.
- Best-Effort: Fehler werden über `console.error` geloggt, aber **nicht
  geworfen**. Begründung: verwaiste Storage-Files sind harmlos
  (höchstens kosmetisch), während eine geworfene Exception nach
  erfolgreichem DB-Delete den User mit „Fehler" konfrontieren würde,
  obwohl die Pflanze faktisch weg ist.
- Bei leerer Liste: no-op (kein Storage-Call).

### Schicht 2 — Plant-Repository

Datei: `src/lib/services/plantRepository.ts`

Neue Funktion:

```ts
export async function deletePlantCascade(
  plantId: string,
  userId: string
): Promise<void>
```

Reihenfolge:

1. Plant via `getPlantById(plantId, userId)` laden — gibt `null` zurück
   wenn Pflanze nicht existiert oder nicht dem User gehört → in dem
   Fall werfen wir `Error('plant not found')`.
2. Alle Scans der Pflanze fetchen:
   ```sql
   select id, image_path
   from scans
   where plant_id = ? and user_id = ?
   ```
3. **DB-Delete (atomar genug)**:
   - `delete from scans where plant_id = ? and user_id = ?` — kaskadiert
     auf `scan_candidates`, `scan_followups`.
   - `delete from plants where id = ? and user_id = ?`.
4. **Storage-Cleanup (best-effort)**:
   - Pfad-Set bauen aus allen Scan-`image_path`s + `plant.coverImagePath`
     (Set zur Deduplikation, da Cover meist identisch mit dem
     Origin-Scan-Image ist).
   - `deleteImages([...set])`.

Auth-Modell: `userId` ist Pflicht-Parameter und wird in jedem WHERE
mitgegeben. Service-Role-Client wird wie bei den bestehenden
Repository-Funktionen verwendet.

### Schicht 3 — API-Route

Datei: `src/app/api/plants/[id]/route.ts` (neu)

```ts
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
)
```

- `createClient()` für Auth → `supabase.auth.getUser()`.
- 401 wenn kein User.
- `deletePlantCascade(id, user.id)` aufrufen.
- Bei „plant not found" → 404 mit `{ error: 'plant_not_found' }`.
- Bei Erfolg → 204 No Content.
- `revalidatePath('/garden')` vor Response.

### Schicht 4 — UI

#### `PlantActions.tsx` (neu, Client-Component)

Pfad: `src/components/features/garden/PlantActions.tsx`

Props:

```ts
{
  plantId: string;
  plantNickname: string;
  scanCount: number;
}
```

Render:

- Primary-Button „Neuen Scan machen" (`href="/scan/new"`, mit
  Camera-Icon — wie bisher).
- Darunter: Text-Button „Pflanze löschen" (`text-berry-700`, ~13px,
  vertikal padded, `tap-press`, kein Border/Fläche).
- Bei Tap: lokales State `sheetOpen = true` → rendert
  `<DeletePlantSheet />`.

#### `DeletePlantSheet.tsx` (neu, Client-Component)

Pfad: `src/components/features/garden/DeletePlantSheet.tsx`

Props:

```ts
{
  plantId: string;
  plantNickname: string;
  scanCount: number;
  onClose: () => void;
}
```

State:

- `pending: boolean`
- `error: string | null`

Render:

- Backdrop: `fixed inset-0 z-40 bg-bark-900/50 backdrop-blur-sm`,
  onClick = onClose (nur wenn `!pending`).
- Sheet: `fixed bottom-0 left-0 right-0 z-50 bg-paper rounded-t-[24px]
  pb-[max(env(safe-area-inset-bottom),1rem)]`, animiert per
  `animate-in slide-in-from-bottom`.
- Drag-Indicator oben mittig (kleine sage-200 Bar).
- Titel, Body, Button-Pair: gestapelt (full-width), destruktiv oben,
  „Abbrechen" darunter — auf 360px-Breite lesbarer als 50/50, und
  „Endgültig löschen" mit längerem Label braucht die volle Breite.
- Bei Tap auf „Endgültig löschen":
  ```ts
  setPending(true);
  const res = await fetch(`/api/plants/${plantId}`, { method: 'DELETE' });
  if (!res.ok) { setError('...'); setPending(false); return; }
  router.push('/garden');
  router.refresh();
  ```

#### `app/garden/[plantId]/page.tsx` (modifiziert)

- Bestehender Footer-Block (`<section>` mit dem Scan-Button) wird
  ersetzt durch:
  ```tsx
  <PlantActions
    plantId={plant.id}
    plantNickname={plant.nickname}
    scanCount={scans.length}
  />
  ```
- Scan-Anzahl ist bereits im Server-Component verfügbar — kein
  zusätzlicher Datenfetch nötig.

## Datenmodell — keine Änderungen

Schema bleibt unangetastet. FK-Verhalten heute:

- `scans.plant_id → plants.id ON DELETE SET NULL` — wir nutzen das
  **nicht**, weil wir Scans aktiv löschen wollen, nicht detachen.
- `scan_candidates.scan_id → scans.id ON DELETE CASCADE` ✓
- `scan_followups.scan_id → scans.id ON DELETE CASCADE` ✓
- `plants.origin_scan_id → scans.id ON DELETE SET NULL` — irrelevant
  beim Plant-Delete.

## Edge Cases

- **Race: Plant zwischendurch schon weg** — API gibt 404, Sheet zeigt
  Inline-Error. User kann manuell zurück zu `/garden` navigieren.
- **Storage-Cleanup schlägt teilweise fehl** — DB ist sauber, einzelne
  Files bleiben im Bucket. Geloggt, kein User-Impact.
- **Pflanze hat 0 Scans** (theoretisch unmöglich, da Pflanzen immer aus
  Scan entstehen) — funktioniert trotzdem: Storage-Pfad-Set enthält
  nur den Cover-Path.
- **Backdrop-Tap während Pending** — wird ignoriert, damit der User
  einen laufenden Delete nicht durch versehentliches Tap-Outside
  abbricht (visuell, der Request läuft eh weiter).

## Out of Scope

- Undo / Soft-Delete: zu viel Komplexität für den ersten Wurf, kann
  später als Snackbar mit „Rückgängig" ergänzt werden.
- Bulk-Delete mehrerer Pflanzen aus der Garten-Übersicht.
- Lösch-Audit-Log.
