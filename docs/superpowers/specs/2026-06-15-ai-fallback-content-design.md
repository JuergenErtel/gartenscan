# KI-Fallback für erkannte Arten ohne kuratierten Eintrag — Design

**Datum:** 2026-06-15
**Status:** Freigegeben (Brainstorming)
**Branch:** `feat/ai-fallback-content`

## Problem

Pl@ntNet erkennt eine Art (z. B. *Lepidium coronopus*, Niederliegender
Krähenfuß) zuverlässig und zeigt den Namen an. Existiert für diese Art aber
kein kuratierter Eintrag in `src/content/`, bleibt `matchedContentId` leer und
die Ergebnisseite zeigt nur einen statischen Platzhaltertext
(`src/app/scan/[id]/page.tsx:298-306`) — **keine Maßnahmen, keine Pflegetipps**.
Der Nutzer erlebt die App in diesem Zustand „wie einen reinen Scanner" und
weicht auf Google aus.

Das betrifft jede erkannte Art ohne kuratierten Eintrag, nicht nur eine
einzelne Spezies.

## Ziel

Wenn eine Art sicher erkannt wurde, aber kein kuratierter Eintrag existiert,
zeigt die App eine **leichtgewichtige, klar als KI-generiert gekennzeichnete**
Basis-Einordnung mit 2–4 konkreten Maßnahmen — statt einer leeren Seite.

## Nicht-Ziele (YAGNI)

- Keine vollständige, eintragsäquivalente Generierung (Methoden mit
  Schrittlisten, Vorbeugung, Verwechslungsrisiken, Quellen). Bewusst
  leichtgewichtig.
- Kein Fallback bei `no_match` / `uncertain_match` — dort ist die Art selbst
  unsicher; KI-Maßnahmen auf einen Rateversuch wären riskant.
- Keine generierten Inhalte für Insekten/Krankheiten (ClaudeMatch-Pfad): Ohne
  Match gibt es dort gar keinen Artnamen als Basis.
- Kein Ersetzen oder Anreichern bestehender kuratierter Einträge.

## Auslöser-Bedingung

Der Fallback greift **ausschließlich** wenn alle Bedingungen erfüllt sind:

1. `scan.outcome.status === "ok"`
2. `scan.outcome.candidates[0].scientificName` ist vorhanden
3. `scan.outcome.candidates[0].matchedContentId` fehlt (kein kuratierter Eintrag)

In allen anderen Fällen bleibt das Verhalten der Ergebnisseite unverändert.

## Datenmodell

Neuer Typ (in `src/domain/scan/` oder `src/domain/types.ts`):

```ts
interface AiFallbackTip {
  title: string;   // kurze Maßnahmen-Überschrift
  text: string;    // 1–2 Sätze Erläuterung
}

interface AiFallbackContent {
  summary: string;        // 1–2 Sätze: was ist die Art, Relevanz im Garten
  tips: AiFallbackTip[];  // 2–4 konkrete Maßnahmen/Tipps
  caution?: string;       // optionaler Vorsichts-/Sicherheitshinweis
  generatedAt: string;    // ISO-Zeitstempel
  model: string;          // verwendetes Claude-Modell
}
```

**Persistenz:** neue `jsonb`-Spalte `ai_fallback` (nullable) auf der Tabelle
`scans` (Supabase-Migration unter `supabase/migrations/`). Der Cache wird einmal
gefüllt und bei jedem weiteren Öffnen direkt gelesen — konsistenter Text, keine
Mehrfachkosten.

`StoredScan` wird um ein optionales Feld `aiFallback?: AiFallbackContent`
erweitert; `getScanById` liest die Spalte mit, `saveScan` setzt sie initial auf
`null`.

## Service

Neue Datei `src/lib/services/aiFallbackService.ts`:

```
getOrCreateAiFallback(scan: StoredScan, userId: string)
  : Promise<AiFallbackContent | null>
```

Ablauf:

1. **Guard:** Auslöser-Bedingung prüfen. Nicht erfüllt → `null`.
2. **Cache-Hit:** `scan.aiFallback` vorhanden → direkt zurückgeben.
3. **Generierung:** Anthropic-Client (Modell `claude-haiku-4-5-20251001`,
   Timeout 15 s — analog `ClaudeMatchProvider`). Bei fehlendem
   `ANTHROPIC_API_KEY` → `null`.
4. **Parsen & Validieren:** Code-Fences strippen, JSON parsen, Felder prüfen
   (summary nicht leer, `tips` auf 2–4 begrenzen, leere Tips verwerfen). Bei
   ungültiger Antwort → `null`.
5. **Persistieren:** `saveAiFallback(scanId, userId, content)` schreibt die
   `ai_fallback`-Spalte. Danach Objekt zurückgeben.

**Fehlerverhalten:** Jeder Fehler (Timeout, Rate-Limit, Parse-Fehler, kein
Key) führt zu `return null` — niemals zu einer Exception, die die
Ergebnisseite bricht. Fehlschläge werden **nicht** persistiert; bei erneutem
Öffnen wird neu versucht (selten, da nur bei tatsächlichem Seitenaufruf).

## Prompt & Sicherheits-Leitplanken

**Eingabe an Claude:** wissenschaftlicher Name, deutsche Namen
(`commonNames`), Triage-Kategorie.

**System-Prompt (Deutsch) verlangt:**

- Kurze, sachliche Einordnung der Art (1–2 Sätze).
- 2–4 konkrete, umsetzbare Maßnahmen. **Mechanische/kulturelle/organische
  Methoden bevorzugen** (konsistent mit dem organisch geprägten Bestandscontent).
- Optional **genau einen** Vorsichts-/Sicherheitshinweis (Giftigkeit,
  Hautreizung, Verwechslung).
- **Keine konkreten Chemie-Produktnamen.** Chemische Mittel nur generisch
  erwähnen und mit Hinweis „Etikett beachten / Fachberatung einholen".
- Nur gültiges JSON gemäß `AiFallbackContent` (ohne `generatedAt`/`model`,
  die setzt der Service), kein Fließtext davor/danach.

`max_tokens` ≈ 600.

## UI

Neue Komponente `src/components/features/scan/AiFallbackPanel.tsx`, gerendert
im `!matchedEntry`-Zweig der Ergebnisseite (ersetzt den Platzhalter-Block
`page.tsx:298-306`):

- **Badge „KI-generiert · nicht redaktionell geprüft"** — visuell klar
  abgegrenzt vom grünen „Redaktionell geprüft"-Badge (z. B. neutraler/warnender
  Ton), damit der Unterschied zur kuratierten Qualität sofort sichtbar ist.
- Einordnung (`summary`).
- Maßnahmen-Liste (`tips`) im Stil der bestehenden Karten/Tokens.
- Vorsicht-Callout, falls `caution` gesetzt.

**Streaming:** Die Ergebnisseite ist eine async Server-Component. Das Panel
wird in `<Suspense>` mit einem schlanken Skeleton gekapselt, sodass
Hero/Bild/Name sofort laden und das (ggf. 2–3 s dauernde) Panel nachstreamt.
Die Generierung läuft in einer async Teilkomponente, die
`getOrCreateAiFallback` awaitet.

**Graceful Degradation:** Liefert der Service `null` (nicht anwendbar oder
Generierung fehlgeschlagen), wird der **bestehende Platzhaltertext**
angezeigt — der heutige Zustand bleibt als sichere Untergrenze erhalten.

## Architektur-Übersicht

```
ScanResultPage (server)
  └─ matchedEntry? ─ nein ─▶ <Suspense fallback=Skeleton>
                               AiFallbackSection (async)
                                 └─ aiFallbackService.getOrCreateAiFallback()
                                      ├─ Guard / Cache (scanRepository)
                                      ├─ Anthropic (Haiku, 15s)
                                      └─ saveAiFallback (scanRepository)
                                 └─ <AiFallbackPanel/>  | Platzhalter (null)
```

## Fehlerbehandlung — Zusammenfassung

| Fall | Verhalten |
|------|-----------|
| Bedingung nicht erfüllt | `null` → Platzhalter (bzw. kuratierter Pfad) |
| Cache vorhanden | sofort gerendert |
| Kein API-Key | `null` → Platzhalter |
| Timeout / Rate-Limit / Upstream | `null` → Platzhalter, nicht gecacht |
| Ungültiges/leeres JSON | `null` → Platzhalter, nicht gecacht |

## Tests (Vitest)

- **Guard-Logik:** Fallback nur bei `ok` + `scientificName` + kein Match;
  alle anderen Kombinationen → `null` (ohne Anthropic-Aufruf).
- **Parsing/Validierung:** Code-Fences strippen; halluziniertes/leeres JSON
  ablehnen; `tips` auf 2–4 begrenzen; leere Tips verwerfen.
- **Service mit Mocks:** gemocktes Anthropic + gemocktes Repository —
  Cache-Hit gibt gespeicherten Inhalt zurück (kein Anthropic-Aufruf);
  Cache-Miss generiert und persistiert genau einmal.
- Kein React-Komponenten-Testframework im Projekt → UI wird manuell mobil
  geprüft (Telefon-Viewport).

## Betroffene/neue Dateien

- **Neu:** `src/lib/services/aiFallbackService.ts`
- **Neu:** `src/components/features/scan/AiFallbackPanel.tsx`
- **Neu:** Supabase-Migration `supabase/migrations/<ts>_scans_ai_fallback.sql`
- **Neu:** Tests unter `tests/services/aiFallbackService.test.ts`
- **Ändern:** `src/domain/scan/ScanOutcome.ts` (`StoredScan.aiFallback`),
  ggf. `src/domain/types.ts` (Typen)
- **Ändern:** `src/lib/services/scanRepository.ts`
  (`getScanById` liest Spalte, neue `saveAiFallback`)
- **Ändern:** `src/app/scan/[id]/page.tsx` (Suspense-Sektion statt Platzhalter)

## Offene Punkte für die Planung

- Exakter Migrationspfad/Generator in diesem Supabase-Setup verifizieren.
- Badge-Farbgebung im bestehenden Design-Token-System festlegen.
