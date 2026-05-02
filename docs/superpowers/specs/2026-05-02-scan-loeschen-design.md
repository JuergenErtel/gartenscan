# Scan löschen (mit Cover-Conflict-Schutz)

**Datum:** 2026-05-02
**Status:** Spec — implementierungsbereit

## Motivation

Nutzer*innen können Scans erstellen, aber nicht mehr löschen. Schlecht
gelungene Aufnahmen, Fehlversuche oder Test-Scans sammeln sich im
Verlauf. Diese Spec ergänzt eine Lösch-Aktion auf der
Scan-Detail-Seite — als Geschwister zur soeben gelandeten
Pflanzen-Lösch-Funktion.

## Verhalten

### Was passiert beim Löschen

- Die Scan-Row wird entfernt.
- Über DB-Cascade kaskadieren `scan_candidates` und `scan_followups`
  automatisch mit.
- Storage-Bild des Scans wird best-effort entfernt.
- Pflanzen, die diesen Scan als `origin_scan_id` referenzieren, bleiben
  erhalten (FK ist `ON DELETE SET NULL`).

### Cover-Conflict (wichtig)

Wenn der Scan das **Coverbild einer Pflanze** ist (also
`plants.cover_image_path = scan.image_path` für denselben User), wird
das Löschen **blockiert**. Dem Nutzer wird klar gesagt: „Dieser Scan
ist das Coverbild deiner Pflanze ‚{nickname}'. Bitte erst dort ein
anderes Foto wählen oder die Pflanze löschen."

Begründung: Wenn wir den Scan löschen, bleibt der Cover-Pfad in
`plants.cover_image_path` als toter Link stehen — die Pflanze würde im
Garten ein 404-Bild zeigen. Auto-Replace (mit dem Bild eines anderen
Scans) wäre schöner, ist aber komplex und für den Edge-Case nicht den
Aufwand wert. Blockieren ist ehrlich und vorhersehbar.

### UX

- Auf der Scan-Detail-Seite (`/scan/[id]`) erscheint am Ende des
  scrollbaren Inhalts (vor dem fixed-bottom „Nächster Scan"-Button)
  ein dezenter destruktiver Text-Button **„Scan löschen"** im selben
  Stil wie der Plant-Delete-Button (`text-berry-700`, ~13px, kein
  Border).
- Tap öffnet ein Bottom-Sheet im App-Stil — identische Optik wie
  `DeletePlantSheet`.
- Sheet-Inhalt im **Normal-Fall**:
  - Titel: „Scan löschen?"
  - Body: „Dieser Scan wird unwiderruflich gelöscht."
  - Buttons: „Endgültig löschen" (destruktiv) + „Abbrechen"
- Sheet-Inhalt im **Cover-Conflict-Fall** (nach 409-Response):
  - Titel: „Nicht möglich"
  - Body: „Dieser Scan ist das Coverbild deiner Pflanze
    **{nickname}**. Bitte erst dort ein anderes Foto wählen oder die
    Pflanze löschen."
  - Buttons: nur „OK" (sekundär, schließt Sheet)
- Nach Erfolg: `router.push('/history')` + `router.refresh()`.

## Architektur

### Schicht 1 — Storage-Service
Bereits vorhanden (`deleteImages`), nichts zu tun.

### Schicht 2 — Scan-Repository

Datei: `src/lib/services/scanRepository.ts`

Neue Funktion:

```ts
export async function deleteScan(scanId: string, userId: string): Promise<void>
```

Reihenfolge:

1. Scan via `getScanById(scanId, userId)` laden — wirft `'scan not
   found'` wenn `null`.
2. **Cover-Check**: Query `plants` mit
   `cover_image_path = scan.imagePath AND user_id = userId`,
   `select('nickname').limit(1)`. Bei Treffer → wirft
   `'scan is plant cover:{nickname}'` (Doppelpunkt-Trennung trägt den
   Pflanzen-Namen mit).
3. `delete from scans where id = ? and user_id = ?` — kaskadiert auf
   `scan_candidates` und `scan_followups`.
4. Best-effort `deleteImages([scan.imagePath])`.

### Schicht 3 — API-Route

Datei: `src/app/api/scans/[id]/route.ts` — bereits vorhanden mit
`PATCH`-Handler (für `updateScanStatus`). Wir ergänzen einen
`DELETE`-Handler im selben File.

```ts
export async function DELETE(_req, ctx)
```

- 401 wenn kein User
- 400 wenn `id` invalid
- Ruft `deleteScan(id, user.id)` im Try/Catch
- Bei `'scan not found'` → 404 `{ error: 'scan_not_found' }`
- Bei `'scan is plant cover:'` → 409 `{ error: 'scan_is_plant_cover', plantNickname: '<extracted>' }`
- Sonst → 500
- Bei Erfolg: `revalidatePath('/history')` + 204

### Schicht 4 — UI

#### `DeleteScanSheet.tsx` (neu, Client-Component)

Pfad: `src/components/features/scan/DeleteScanSheet.tsx`

Props:

```ts
{
  scanId: string;
  onClose: () => void;
}
```

State:

- `pending: boolean`
- `error: string | null`
- `coverConflict: { plantNickname: string } | null` — wenn gesetzt,
  rendert das Sheet im Conflict-Modus

Render:

- Backdrop + Sheet wie `DeletePlantSheet`.
- Standard-Modus: Titel „Scan löschen?", Body „Dieser Scan wird
  unwiderruflich gelöscht.", zwei Buttons.
- Conflict-Modus: Titel „Nicht möglich", Body mit Pflanzen-Namen,
  einen einzigen sekundären „OK"-Button (`bg-sage-100`).
- Bei Tap auf „Endgültig löschen" → `fetch('/api/scans/${scanId}', { method: 'DELETE' })`. Bei 409 → State `coverConflict` setzen
  (kein Error-Banner). Bei 2xx → `router.push('/history')` +
  `router.refresh()`.

#### `ScanFooterActions.tsx` (neu, Client-Component)

Pfad: `src/components/features/scan/ScanFooterActions.tsx`

Props:

```ts
{
  scanId: string;
}
```

Render:

- Wrapper-Section mit `px-5 pt-6`.
- Text-Button „Scan löschen" (`text-berry-700`, kleines Padding,
  `tap-press`).
- Bei Tap: lokales `sheetOpen`-State → rendert `DeleteScanSheet`.

#### `app/scan/[id]/page.tsx` (modifiziert)

- Direkt vor dem fixed-bottom Button-Block (vor `<div className="fixed
  bottom-0 left-0 right-0 z-30 ...">`) einfügen:
  ```tsx
  <ScanFooterActions scanId={scan.id} />
  ```
- Wichtig: nur einfügen, wenn `matchedEntry` existiert und/oder der
  scrollbare Hauptinhalt gerendert wurde. Eigentlich harmlos in jedem
  Status (auch low_quality, no_match etc.), aber die Early-Returns
  rendern alternative Komponenten ohne Scroll-Footer — nur in den
  Standard-Render-Pfad einfügen.

## Datenmodell — keine Änderungen

Schema bleibt unangetastet. Relevante FKs:

- `scan_candidates.scan_id → scans.id ON DELETE CASCADE` ✓
- `scan_followups.scan_id → scans.id ON DELETE CASCADE` ✓
- `plants.origin_scan_id → scans.id ON DELETE SET NULL` — Pflanze
  bleibt erhalten, `origin_scan_id` wird NULL.
- `scans.plant_id → plants.id ON DELETE SET NULL` — irrelevant beim
  Scan-Delete.

## Edge Cases

- **Scan ist Plant-Cover** → blockiert, klare Message mit
  Pflanzen-Namen.
- **Scan in `uncertain_match`-Status** löschen ist erlaubt — kein
  Cover-Konflikt möglich, weil noch keine Pflanze entstanden ist.
- **Scan zwischenzeitig schon weg** → 404, Sheet zeigt Inline-Error,
  User navigiert manuell zurück.
- **Storage-Cleanup schlägt fehl** → DB ist sauber, Datei bleibt im
  Bucket. Geloggt, kein User-Impact.

## Out of Scope

- Bulk-Delete aus der `/history`-Liste (Wisch-zum-Löschen).
- Undo / Soft-Delete.
- Auto-Replace des Plant-Covers, wenn der Scan gelöscht wird.
- Lösch-Audit-Log.
