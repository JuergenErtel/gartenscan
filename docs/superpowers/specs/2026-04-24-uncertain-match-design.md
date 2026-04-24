# Uncertain Match — UI-Zwischenzustand für niedrige Pl@ntNet-Confidence

**Datum:** 2026-04-24
**Topic:** `uncertain-match`
**Autor:** Brainstorming-Session mit Juergen

## Problem

Pl@ntNet liefert bei realistischen Garten-Schnappschüssen oft niedrige Confidence-Scores. Empirischer Datenpunkt vom 2026-04-24: ein Gartenfoto → Top-Kandidat "Kleines Habichtskraut" mit Score 0.1012. Der heutige Flow filtert alles unter `MIN_CONFIDENCE = 0.25` hart aus → `no_match` → Nutzer sieht keinen Vorschlag, bekommt nur Tipps.

Das verschenkt Information: der Top-Vorschlag ist möglicherweise richtig, aber die Confidence-Schwelle erlaubt keine Entscheidung.

## Ziel

Einen UI-Zwischenzustand einführen, der den Top-Kandidaten transparent als **unsichere Vermutung** anzeigt und dem Nutzer die Entscheidung gibt. Bestätigt der Nutzer, wird der Scan zu `ok` upgegradet. Lehnt er ab, fällt er zurück in den bestehenden `no_match`-Flow.

Nebennutzen: die DB-Spur (wie oft confirm vs. reject vs. auto-ok) bildet später die Basis für ein datengetriebenes Threshold-Tuning.

## Status-Modell

`ScanStatus` wächst von 5 auf 6 Werte:

```
'ok' | 'low_quality' | 'category_unsupported' | 'no_match' | 'uncertain_match' | 'provider_error'
```

### Schwellen in `analyzeImageService.ts`

```ts
const AUTO_OK_CONFIDENCE = 0.25;
const UNCERTAIN_MIN_CONFIDENCE = 0.10;
```

### Entscheidungslogik

```
Pl@ntNet-Response → sortiert nach confidence desc
top = candidates[0]

if (top.confidence >= 0.25) → status = 'ok',
                              candidates = filter(>= 0.25).slice(0, 3)
if (top.confidence >= 0.10) → status = 'uncertain_match',
                              candidates = [top]        // nur Top-1
else                         → status = 'no_match',
                              candidates = []
```

### Status-Transitions (einseitig, einmalig)

```
uncertain_match ──"Das ist es"──▶ ok
uncertain_match ──"Stimmt nicht"─▶ no_match
```

Guard per SQL: `UPDATE ... WHERE status = 'uncertain_match'`. Einmal verlassen, nicht rückkehrbar.

## Backend

### 1. Service-Layer

**`src/lib/services/analyzeImageService.ts`** — Umbau der bestehenden `MIN_CONFIDENCE`-Logik:

- Konstanten neu: `AUTO_OK_CONFIDENCE = 0.25`, `UNCERTAIN_MIN_CONFIDENCE = 0.10`.
- Pl@ntNet-Kandidaten nach Confidence sortieren.
- Drei Branches statt zwei (siehe Entscheidungslogik oben).
- Bei `uncertain_match`: nur Top-1 persistieren, Top-2/3 werden verworfen (bewusst — die UI braucht nur den Top, und wir wollen keine Fehlleitung durch alternative niedrige Vorschläge).

**`src/lib/services/scanRepository.ts`** — neue Funktion:

```ts
export async function updateScanStatus(
  scanId: string,
  userId: string,
  newStatus: 'ok' | 'no_match'
): Promise<StoredScan | null>
```

Implementierung:

```sql
UPDATE scans
SET status = $newStatus
WHERE id = $scanId
  AND user_id = $userId
  AND status = 'uncertain_match'
RETURNING *
```

Wenn `RETURNING` leer ist (Scan existiert nicht, gehört nicht dem User, oder ist nicht mehr `uncertain_match`) → Funktion returned `null` → Route-Handler antwortet 409.

### 2. API-Route

**`src/app/api/scans/[id]/status/route.ts`** (neu) — ein POST-Endpoint, zwei Aktionen:

```ts
POST /api/scans/:id/status
Body: { action: 'confirm' | 'reject' }

200: { scan: StoredScan }  // geupdatete Zeile
401: { error: 'unauthorized' }
409: { error: 'invalid_transition' }  // Scan nicht im uncertain_match-Status
404: { error: 'not_found' }
```

Mapping: `action='confirm'` → `newStatus='ok'`; `action='reject'` → `newStatus='no_match'`.

Auth-Check: `supabase.auth.getUser()` wie in bestehenden `/api/scans/*`-Routes; ohne User → 401.

Keine Usage-Counter-Inkrement (Confirm/Reject sind Gratis-Operations, kein Scan-Verbrauch).

## Frontend

### 1. Neue Komponente `UncertainMatchState`

**Datei:** `src/components/features/scan/UncertainMatchState.tsx` (Client-Component).

**Props:**

```ts
{
  scanId: string;
  candidate: DetectionCandidate;
  imageUrl: string;
}
```

**Layout** — Hybrid aus `ok`-Hero und ehrlicher Unsicherheit:

- **Hero-Sektion** (wie `ok`-Page): Bild, Confidence-Badge (bleibt rot bei ~10 %), Kandidat-Name + Sci-Name.
- **Gedämpfte Signale**: Kein "Redaktionell geprüft"-Marker, kein UrgencyIndicator, keine Urgency-Banner.
- **Entscheidungs-Block** direkt unter dem Hero: Überschrift "Wir sind uns nicht sicher", Body "Unsere Erkennung ist hier nicht sicher genug für ein Urteil. Deine Bestätigung hilft uns, den nächsten Scan besser zu führen.", zwei Buttons nebeneinander: `[Das ist es]` (primary) und `[Stimmt nicht]` (secondary).
- **Keine Tipps-Liste, kein Quick-Plan** — Unterscheidung zum `NoMatchState` (dort kommen die Tipps).

**Interaktions-Flow:**

1. User klickt Button → beide Buttons werden disabled, geklickter Button zeigt Spinner.
2. Fetch `POST /api/scans/${scanId}/status` mit `{ action: 'confirm' | 'reject' }`.
3. **Erfolg (200):** `router.refresh()` — Server-Component rendert neu, sieht neuen Status `ok` oder `no_match`, zeigt entsprechende UI.
4. **409 Conflict:** Inline-Message "Dieser Scan wurde bereits eingeordnet" + `router.refresh()` um aktuellen Zustand zu zeigen.
5. **Netzwerk-Fehler:** Inline-Error "Konnte nicht speichern, bitte nochmal"; Buttons wieder aktiv.
6. **401/403:** Redirect auf `/app`.

### 2. Routing in `/scan/[id]/page.tsx`

Zusätzliche `if`-Branch nach den anderen Non-ok-States:

```tsx
if (scan.outcome.status === "uncertain_match") {
  const primary = scan.outcome.candidates[0];
  const signedImageUrl = await createSignedReadUrl(scan.imagePath, 3600);
  return (
    <OnboardingGuard>
      <UncertainMatchState
        scanId={scan.id}
        candidate={primary}
        imageUrl={signedImageUrl}
      />
    </OnboardingGuard>
  );
}
```

Die `signedImageUrl`-Erzeugung wandert hoch, damit sie im `uncertain_match`-Branch verfügbar ist. Für die Error-Branches (`low_quality`, `category_unsupported`, `no_match`, `provider_error`) wird sie nicht verwendet — der zusätzliche Signier-Call ist lightweight genug, um das hinzunehmen.

### 3. Dashboard/History-Mapping

**`src/lib/scan/caseSummary.ts`** — neuer Eintrag für `uncertain_match`:

```ts
case "uncertain_match":
  return {
    title: "Bestätigung offen",
    subtitle: "Wartet auf deine Rückmeldung",
    nextStep: "Tippe den Scan an und bestätige oder verwirf den Vorschlag",
    urgency: "MONITOR",
  };
```

Dashboard zeigt den Scan mit gelbem Punkt (konsistent mit `MONITOR`-Urgency-Mapping).

## Tests

**Erwartetes Delta:** +10 Tests. Total vorher 27 → nachher ~37 grün.

### Unit-Tests

- `tests/services/analyzeImage.test.ts` — +3 Tests:
  - Top-Score 0.30 → `status: 'ok'`, candidates gefiltert >= 0.25
  - Top-Score 0.15 → `status: 'uncertain_match'`, candidates = [top] (length 1)
  - Top-Score 0.05 → `status: 'no_match'`, candidates = []

- `tests/services/scanRepository.test.ts` (ggf. neue Datei) — +2 Tests:
  - `updateScanStatus` mit Scan im Status `uncertain_match` → Update erfolgt, returned Row
  - Transition-Guard: Scan bereits `ok` → `updateScanStatus` returned `null`

### Integration-/Route-Tests

- `tests/api/scans-status.test.ts` (neu) — +4 Tests:
  - 200 bei `confirm` auf `uncertain_match`-Scan
  - 200 bei `reject` auf `uncertain_match`-Scan
  - 409 bei confirm auf Scan der bereits `ok` ist
  - 401 ohne Auth-Session

### Component-Tests

- `tests/components/UncertainMatchState.test.tsx` (neu) — +1 Test:
  - Button-Klick triggert `fetch` mit korrektem Body und ruft `router.refresh` nach erfolgreicher Response

## Error-Handling

| Fehlerfall | Verhalten |
|-----------|-----------|
| Netzwerk-Fehler beim Button-Click | Inline-Error-Message, Buttons bleiben klickbar |
| 409 (paralleler Tab hat bereits entschieden) | Message "Bereits eingeordnet" + `router.refresh()` |
| 401 (Session abgelaufen) | Redirect auf `/app` |
| Pl@ntNet timeout / Error | Weiterhin `provider_error` (unverändert) |

## Migration & Compatibility

- **Keine DB-Migration nötig.** `scans.status` ist `text`, akzeptiert den neuen Wert ohne Schema-Änderung.
- **Kein RLS-Update.** `UPDATE` ist für den Owner bereits erlaubt (gleiche Policy wie Insert).
- **Bestehende Scans** bleiben auf ihrem Status. Nur neue Scans ab Deploy können `uncertain_match` werden.
- **Rollback:** `UNCERTAIN_MIN_CONFIDENCE = 0.25` (gleich wie `AUTO_OK_CONFIDENCE`) deaktiviert den Codepfad faktisch. Bestehende `uncertain_match`-Zeilen können manuell per SQL auf `no_match` geflippt werden.

## Bewusst NICHT enthalten (Out of Scope)

- Kein Analytics-Event-Tracking für Confirm/Reject (DB-Spur via `scans.status` reicht als MVP-Telemetrie).
- Kein Lerneffekt-Loop ins Modell — nur Datensammlung für spätere Threshold-Tuning.
- Keine Top-2/Top-3-Alternativen im Reject-Flow. Reject = fall-through zum bestehenden `NoMatchState`.
- Kein Optimistic UI — `router.refresh()` ist einfacher und für diesen Flow schnell genug (~200 ms Server-Roundtrip).

## Offene Punkte für Planning

- Exakter Dateiname der API-Route bestätigen (`status/route.ts` vs. eigene für confirm/reject).
- Ob `caseSummary.ts` noch weitere Stellen (z.B. Dashboard-Card) mit dem neuen Status abgleichen muss.
- Ob es in bestehenden Tests Mocking-Setup-Änderungen braucht (neuer Status in Test-Fixtures).

Diese Punkte landen im Implementation-Plan, nicht im Spec.
