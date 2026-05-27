# Phase C — Insekten, Nuetzlinge, Krankheiten, Schaeden

**Datum:** 2026-05-27
**Status:** Design, bereit fuer Implementation Plan
**Scope:** Erweiterung der Scan-Pipeline um die Triage-Kategorien `insect`, `beneficial`, `disease`, `damage` mit Claude-Vision-basiertem Match gegen die Content-Registry, plus zehn neue Content-Eintraege.

## Ziel und Begruendung

Die Live-App erkennt heute nur Pflanzen (und Unkraeuter, weil Pl@ntNet sie auch identifiziert). Alle anderen Triage-Kategorien werden in `analyzeImageService.ts:38` als `category_unsupported` abgewiesen, obwohl:

- Die Triage-Schicht (`ClaudeVisionTriageProvider`) bereits `insect` und `disease` als Kategorien liefert.
- Die Content-Registry bereits Schaedlinge (2), Nuetzlinge (1) und Krankheiten (3) enthaelt.
- Das `ContentEntry`-Schema seit Anfang an alle Kategorien (`PLANT | WEED | PEST | BENEFICIAL | DISEASE | DAMAGE`) unterstuetzt.

Phase C schaltet diesen Stack frei und baut die UX-Annahme, dass die App nur fuer Pflanzen ist, ab.

## Architektur

### Datenfluss

```
Foto -> Triage (Claude Vision)
          |
          +-- unclear/low_quality -> category_unsupported / low_quality
          |
          +-- plant -----------------> Pl@ntNet -> Content-Lookup -> matched_content_id
          |
          +-- insect | beneficial | disease | damage
                  |
                  +-> ClaudeMatchProvider (neu, kategorie-scoped)
                        |
                        +-> Top-3 Kandidaten -> Threshold-Vergleich -> ok | uncertain_match | no_match
```

### Routing-Tabelle

| Triage-Kategorie | Identifikations-Provider | Content-Scope                              |
| ---------------- | ------------------------ | ------------------------------------------ |
| `plant`          | Pl@ntNet (bestehend)     | PLANT + WEED (ueber scientificName)        |
| `insect`         | ClaudeMatch              | PEST + BENEFICIAL (Triage-Fehler tolerant) |
| `beneficial`     | ClaudeMatch              | BENEFICIAL + PEST (symmetrisch)            |
| `disease`        | ClaudeMatch              | DISEASE                                    |
| `damage`         | ClaudeMatch              | DISEASE + PEST (Symptom -> Ursache)        |
| `unclear`        | —                        | category_unsupported                       |

### Status-Wiederverwendung

Der bestehende `ScanStatus`-Set (`ok | uncertain_match | no_match | low_quality | category_unsupported | provider_error`) bleibt unveraendert. Top-3-Auswahl bei `uncertain_match` funktioniert generisch (gleicher Mechanismus wie bei Pflanzen, inkl. "Das ist es"-Button).

### Datenbank

Keine Schema-Migration. `scans.outcome` ist `jsonb`, neue Triage-Werte landen dort ohne DDL-Aenderung.

## Komponenten

### 1. Triage-Schema-Erweiterung

**Datei:** `src/domain/scan/ScanOutcome.ts:14`

```ts
export type TriageCategory =
  | 'plant'
  | 'insect'      // Tier, das eher Schaedling ist
  | 'beneficial'  // klar erkennbarer Nuetzling (NEU)
  | 'disease'     // klares Krankheitsbild
  | 'damage'      // Schaden ohne klare Ursache (NEU)
  | 'unclear';
```

**Datei:** `src/lib/providers/triage/claudeVision.ts`

System-Prompt erweitert um:

- `"insect"` = Tier, das nicht eindeutig nuetzlich ist (Schnecken, Wanzen, Larven, unbekannte Krabbeltiere)
- `"beneficial"` = eindeutig erkennbarer Nuetzling (Marienkaefer, Biene, Schwebfliege, Florfliege, Schmetterling, Spinne im Netz)
- `"disease"` = klares Pilz-/Bakterien-/Virusbild (Belag, definierte Flecken, typisches Symptom)
- `"damage"` = Schaden an Pflanze ohne erkennbares Tier und ohne klares Krankheitsbild (Frassspuren, vergilbte Blaetter, Welke, abgebrochene Triebe)

Plus Disambiguierungs-Regel: "Wenn Tier UND Schaden sichtbar, waehle Tier. Wenn unsicher zwischen insect/beneficial, waehle insect — der Match-Step korrigiert."

`ALLOWED_CATEGORIES`-Array erweitert. Token-Overhead vernachlaessigbar (~50 Tokens).

### 2. ClaudeMatchProvider (neu)

**Datei:** `src/lib/providers/identification/claudeMatch.ts`

Implementiert das bestehende `IdentificationProvider`-Interface, damit `analyzeImage` strukturell nichts Neues lernt.

**Konstruktor:**

```ts
new ClaudeMatchProvider({
  apiKey: string,
  scope: Category[],      // z.B. ['PEST', 'BENEFICIAL']
  model?: string,          // default: claude-haiku-4-5-20251001
  timeoutMs?: number,      // default: 15000
})
```

**System-Prompt-Struktur:**

```
Du identifizierst Garten-Subjekte (Insekten, Krankheiten, Schaeden).
Hier ist die Liste bekannter Eintraege:

[contentId] Name (scientificName)
  Merkmale: trait1; trait2; trait3
  Verwechslungsrisiko: name1, name2

[contentId] ...

Schaue dir das Bild an und waehle bis zu 3 passende Eintraege.
Antworte NUR mit JSON:
{ "candidates": [{ "contentId": "...", "confidence": 0.0-1.0, "reason": "..." }] }

Wenn nichts klar passt: { "candidates": [] }
```

**Content-Block-Generierung:** Aus `CONTENT_REGISTRY` gefiltert nach `scope`. Pro Eintrag: `id`, `name`, `scientificName`, erste 3 `traits`, `confusionRisk[].name`. Token-Budget: ~16 Eintraege × ~150 Tokens = ~2.5k Kontext-Tokens. Bei kuenftigem Wachstum auf 50+ ggf. Pre-Filter.

**Output-Mapping zu `DetectionCandidate`:**

```ts
{
  rank: 1..3,
  scientificName: content.scientificName,
  commonNames: [content.name, ...content.aliases],
  taxonomy: undefined,
  confidence: claudeOutput.confidence,
  matchedContentId: claudeOutput.contentId,  // direkt, kein scientificName-Lookup
}
```

**Hallucination-Guard:** Validierung verwirft Kandidaten, deren `contentId` nicht im Scope ist (still, ohne Provider-Error). Bei 0 validen Kandidaten -> `no_match`. `console.warn` mit erwarteter vs. erhaltener ID fuer Vercel-Debug.

**Confidence-Thresholds:** Die bestehenden Werte aus `analyzeImageService.ts:6-7` (`AUTO_OK_CONFIDENCE = 0.25`, `UNCERTAIN_MIN_CONFIDENCE = 0.05`) gelten unveraendert. Falls Claude systematisch anders calibriert, justieren wir nachgelagert provider-scoped — jetzt nicht.

### 3. Factory-Erweiterung

**Datei:** `src/lib/providers/identification/factory.ts`

Neue Funktion:

```ts
export function getIdentificationProviderFor(
  category: TriageCategory
): IdentificationProvider | null
```

Mapping nach Routing-Tabelle oben. `null` fuer `unclear`.

### 4. analyzeImageService-Routing

**Datei:** `src/lib/services/analyzeImageService.ts`

`AnalyzeImageInput` aendert sich:

```ts
interface AnalyzeImageInput {
  imageUrl: string;
  triage: TriageProvider;
  identificationFor: (category: TriageCategory) => IdentificationProvider | null;
  locale?: 'de' | 'en';
  maxCandidates?: number;
}
```

Statt `identification: IdentificationProvider` jetzt `identificationFor: (category) => IdentificationProvider | null`. Der `category !== 'plant'`-Check (Zeile 38) faellt weg. Stattdessen:

```ts
const identification = input.identificationFor(triage.category);
if (!identification) {
  return { status: 'category_unsupported', triage, candidates: [], reason: triage.reason };
}

let ident;
try {
  ident = await identification.identify({ imageUrl, locale, maxCandidates });
} catch (err) {
  return providerErrorOutcome(err, identification.name, triage);
}
// Sort + Threshold-Vergleich unveraendert
```

Aufruf-Seite (`src/app/api/scans/route.ts` o.ae.) reicht die Factory-Funktion durch, statt eine konkrete Provider-Instanz zu bauen.

### 5. UI-Anpassungen

**Datei:** `src/app/scan/[id]/page.tsx`

Zeile 205: `SavePlantPrompt` nur bei PLANT/WEED:

```tsx
{!scan.plantId &&
  (matchedEntry?.category === "PLANT" || matchedEntry?.category === "WEED") &&
  <SavePlantPrompt scanId={scan.id} />}
```

**Datei:** `src/components/features/scan/ScanResultStates.tsx`

- `CategoryUnsupportedState` (Zeile 32-82): Vereinfachen auf den `unclear`-Pfad. `insect`/`disease`-Branches raus, weil die jetzt durch die Pipeline laufen. Wording entschaerfen ("Wir konnten weder Pflanze noch Tier noch Schaden klar erkennen").
- `NoMatchState` (Zeile 84): Triage-aware. Neue Prop `triageCategory?: TriageCategory`. Branching im Titel/Body: `plant` -> "Pflanze nicht zugeordnet", `insect`/`beneficial` -> "Tier nicht in unserer Datenbank", `disease`/`damage` -> "Schaden nicht klar zuzuordnen". Coach-Prompt analog.

**Datei:** `src/components/features/scan/UncertainMatchState.tsx`

Beim Implementieren verifizieren: keine Pflanzen-spezifischen Properties auf `DetectionCandidate` (z.B. `taxonomy`-Pflichtfelder). Generischer Fix falls noetig.

**Out-of-Scope:** Garden-Speichern, History-Liste, ActionDecisionPanel, FollowUpActions, confusionRisk-/traits-/habitat-Sections — alle category-agnostisch, kein Eingriff.

### 6. Content-Erweiterung

Zehn neue `ContentEntry`-Files unter `src/content/`:

| # | Datei                              | Category   | Wissenschaftl. Name      |
| - | ---------------------------------- | ---------- | ------------------------ |
| 1 | `pests/spinnmilben.ts`             | PEST       | *Tetranychus urticae*    |
| 2 | `pests/buchsbaumzuensler.ts`       | PEST       | *Cydalima perspectalis*  |
| 3 | `pests/trauermuecken.ts`           | PEST       | *Sciaridae*              |
| 4 | `pests/wolllaeuse.ts`              | PEST       | *Pseudococcidae*         |
| 5 | `pests/dickmaulruessler.ts`        | PEST       | *Otiorhynchus sulcatus*  |
| 6 | `beneficials/florfliege.ts`        | BENEFICIAL | *Chrysoperla carnea*     |
| 7 | `beneficials/schwebfliege.ts`      | BENEFICIAL | *Syrphidae*              |
| 8 | `diseases/sternrusstau.ts`         | DISEASE    | *Diplocarpon rosae*      |
| 9 | `diseases/kraeuselkrankheit.ts`    | DISEASE    | *Taphrina deformans*     |
| 10| `diseases/grauschimmel.ts`         | DISEASE    | *Botrytis cinerea*       |

**Ergebnis nach Phase C:**

- PEST: 2 -> 7
- BENEFICIAL: 1 -> 3
- DISEASE: 3 -> 6

Gleiches `ContentEntry`-Schema (`src/domain/types.ts:96-117`), gleiche `SOURCES` aus `_shared.ts` (JKI, LFL, GPP, NABU, UBA decken alle Themen). `CONTENT_VERSION` bleibt `"2026-04-20"` (Bump nur bei expliziter Pflege-Welle). Registrierung in `src/content/index.ts`. Aufwand: ~30-45 min pro Eintrag mit Recherche.

## Error-Handling

`ClaudeMatchProvider` wirft `ProviderError` analog zu `ClaudeVisionTriageProvider`:

- `not_configured` — `ANTHROPIC_API_KEY` fehlt
- `rate_limit` — HTTP 429
- `timeout` — SDK-Timeout (15s)
- `upstream_error` — Netzwerk, Non-JSON, Schema-Bruch

Alle landen ueber `providerErrorOutcome` in `status: "provider_error"`.

**Halluzinierte contentIds:** Werden verworfen, nicht als Provider-Error gewertet. Bei 0 validen Kandidaten -> `no_match`. `console.warn` fuer Logs.

## Tests

| Test-Datei                                       | Was hinzukommt                                                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `tests/providers/claudeVision.test.ts`           | Fixtures fuer `beneficial`, `damage` (je 1-2 Cases)                                                                 |
| `tests/providers/claudeMatch.test.ts` *(neu)*    | Happy-Path, Top-3, leere Antwort -> no_match, ungueltige contentId -> verworfen, Timeout, Rate-Limit. SDK gemockt.  |
| `tests/services/analyzeImageService.test.ts`     | Pro Triage-Kategorie ein Routing-Test (insect/beneficial/disease/damage/unclear). `identificationFor`-Mock pro Case. |
| `tests/content/registry.test.ts` *(neu)*         | Smoke-Tests: keine doppelten ids, alle gueltigen categories, min 1 method, version gesetzt. Schuetzt vor Copy-Paste-Fehlern. |

**Nicht getestet:** Live-Calls gegen Anthropic, vollstaendige UI-Snapshots. Manuelle Verifikation am Ende der Implementation:

1. Dev-Server starten, je ein echtes Foto pro Triage-Kategorie hochladen.
2. DB-Outcome pruefen: `triage.category` korrekt, `identification`-Provider gewaehlt, `matchedContentId` gesetzt.
3. UI: `SavePlantPrompt` erscheint NICHT bei Pest/Disease/Beneficial, ABER bei Pflanze/Unkraut.

## Out-of-Scope

- Coach-LLM-Anbindung (eigene Spec).
- Phase E / Stripe / Paywall.
- Damage-Content-Eintraege (Routing geht ueber DISEASE+PEST).
- Pl@ntNet-Anpassungen, neue externe APIs.
- Content-Welle ueber +10 hinaus.
- Provider-spezifische Confidence-Schwellen (erst nach Live-Daten).
- Designerische Hero-Image-Anpassung fuer Nicht-Pflanzen-Scans.
