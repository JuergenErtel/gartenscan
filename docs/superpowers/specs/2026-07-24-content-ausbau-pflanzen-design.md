# Spec: Content-Ausbau – 12 neue Pflanzen-Einträge

**Datum:** 2026-07-24
**Slug:** content-ausbau-pflanzen
**Status:** freigegeben (Design)

## Ziel

Content-Katalog von 26 → 38 Einträgen ausbauen, Schwerpunkt **Pflanzen**
(6 → 18). Motivation: Die App ist scan-first — mehr Pflanzen-Einträge
verbessern die Trefferabdeckung beim Scannen, die „Verwechslungsrisiko"-
Verkettung und die Coach-Citation-Basis. Qualität pro Eintrag bleibt auf dem
Niveau der bestehenden Einträge (z. B. `tomate`, `rose`) — kein Füllmaterial.

## Umfang: 12 neue Pflanzen

Bewusst so gewählt, dass sie (a) in deutschen Gärten sehr häufig und gut
scanbar sind und (b) an vorhandene Schädlings-/Krankheits-Einträge andocken.

**Ziergehölze / Hecke**
1. Lavendel — *Lavandula angustifolia* — `plant_lavendel`
2. Buchsbaum — *Buxus sempervirens* — `plant_buchsbaum` (↔ `buchsbaumzuensler`)
3. Kirschlorbeer — *Prunus laurocerasus* — `plant_kirschlorbeer` (Toxizität Hund/Kind)
4. Thuja / Lebensbaum — *Thuja occidentalis* — `plant_thuja`

**Essbares**
5. Erdbeere — *Fragaria × ananassa* — `plant_erdbeere` (↔ `grauschimmel`)
6. Apfel — *Malus domestica* — `plant_apfel`
7. Zucchini — *Cucurbita pepo* — `plant_zucchini` (↔ `echter_mehltau`)
8. Basilikum — *Ocimum basilicum* — `plant_basilikum`

**Blüher / Balkon**
9. Geranie / Pelargonie — *Pelargonium* — `plant_geranie` (Katzen-Toxizität)
10. Sonnenblume — *Helianthus annuus* — `plant_sonnenblume`
11. Tulpe — *Tulipa* — `plant_tulpe` (Zwiebel-Toxizität für Haustiere)
12. Funkie / Hosta — *Hosta* — `plant_funkie` (↔ `schnecken`)

## Vertrag pro Eintrag

Jeder Eintrag ist ein vollständiges `ContentEntry` (`src/domain/types.ts:96`)
im Stil der bestehenden Pflanzen-Dateien:

- Deutscher redaktioneller Ton, `significance: "BENEFIT"`,
  `defaultUrgency: "GONE"` (Nutzpflanzen).
- `id` = `plant_<slug>`, eindeutig; ≥ 2 `traits`, ≥ 1 `confusionRisk`,
  ≥ 2 `methods` (mit vollständigen `steps` + korrekten Enum-Feldern),
  ≥ 3 `prevention`.
- **Korrekte Sicherheit/Toxizität** in `safety` — besonders Kirschlorbeer
  (Blätter/Samen giftig, `toxicToChildren: true`), Tulpen-Zwiebel und
  Geranie/Pelargonie (`toxicToPets`).
- `sources`: echte Teilmenge aus `_shared.ts` (JKI, GPP, LfL, NABU, BZL,
  DWD, UBA) — keine erfundenen Quellen.
- `contentConfidence` ehrlich: `HIGH` nur bei belastbarer, breit belegter
  Pflege; sonst `MEDIUM`.
- `imageUrl`: Wikimedia-Commons-URL wie bisher; **jede URL per HTTP geprüft**,
  dass sie auflöst (2xx).
- `version: CONTENT_VERSION`, `category: "PLANT"`.

## Registrierung & Test

- Alle 12 in `src/content/index.ts` importieren und in `CONTENT_REGISTRY`
  aufnehmen (Abschnitt „Plants").
- `tests/content/registry.test.ts`: PLANT-Zielzahl ergänzen
  (`CONTENT_STATS.byCategory.PLANT >= 18`), analog zu den Phase-C-Zählungen.

## Nicht in Scope

- Neue Schädlinge / Krankheiten / Unkräuter / Nützlinge (spätere Runde).
- Schema-Änderungen an `ContentEntry` / Sub-Typen.
- Bild-Upload nach Supabase Storage (weiter Wikimedia-Hotlink).
- Redaktionelle `editorialQuote`/`latinName`-Felder (nicht Teil des Schemas).

## Abschluss-Gate

`npx tsc --noEmit && npx vitest run && npx next build` — alles grün.
Danach `pipeline-update` (Progress-Sprung), sofern gewünscht.
