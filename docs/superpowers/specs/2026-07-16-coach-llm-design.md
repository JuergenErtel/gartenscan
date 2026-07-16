# Coach-LLM — Design-Spec

**Datum:** 2026-07-16
**Status:** Freigegeben (User-Entscheidungen: geerdeter Single-Call, Sonnet 4.6, kein Streaming, Free-Limit 3/Tag sofort, Verlauf nur im Session-State)

## Problem

Der Coach ist als Kernfeature beworben, aber `src/lib/mock/coach.ts` ist ein Keyword-Matcher mit sechs vorgefertigten Antworten und erfundenem Initial-Content („Blattläuse an deiner Rose", Citations `plant_rose`/`plant_hortensie`, die es in der `CONTENT_REGISTRY` nicht gibt). Das Kontext-Badge „Dein Garten, Muenchen, April" ist hartcodiert. Der Coach kennt weder Garten noch Scans des Users.

## Ziel (v1)

Fundiertes Q&A: Der Coach kennt Profil, Gartenpflanzen, offene Fälle und Wetter des Users sowie den kuratierten Content-Katalog, antwortet auf Deutsch mit validierten Quellen-Chips. Konversation lebt nur im Client-Session-State. Free-Limit 3 Nachrichten/Tag wird serverseitig durchgesetzt.

**Nicht in v1:** Verlauf-Persistenz, Streaming, 7-Tage-Plan-Generator, proaktive Erstanalyse beim Öffnen.

## Architektur: Geerdeter Single-Call

```
Client (src/app/coach/page.tsx)
  │  POST /api/coach { messages: [{role, content}] }   ← letzte ≤10 Turns
  ▼
Route Handler (src/app/api/coach/route.ts, Muster: /api/scans)
  ├─ Auth (supabase.auth.getUser → 401 'unauthenticated')
  ├─ Tages-Limit: getEntitlements(FREE) → coachMessagesPerDay=3
  │    coach_usage-Zähler; bei Überschreitung → 402 { error: 'limit_reached', limit }
  ├─ Grounding laden (parallel):
  │    getProfile · listHistory(6)+getScanCaseSummary · listPlantsForUser
  │    · fetchWeatherForPLZ(profile.postal_code) · Content-Scope (s. u.)
  ├─ 1× anthropic.messages.create (claude-sonnet-4-6, max_tokens 1000, timeout 20s)
  │    → JSON { reply: string, citations: string[] }
  ├─ Citations gegen erlaubte ID-Liste gefiltert (Anti-Halluzination wie ClaudeMatchProvider)
  └─ Response 200: { reply, citations: [{id, name, category}], usage: {used, limit} }
```

### Content-Scope (welche Katalog-Einträge in den Prompt kommen)

1. Alle Einträge, die über `matchedContentId` der offenen Fälle und der Gartenpflanzen referenziert sind.
2. Plus `searchContent(<letzte User-Nachricht>)`-Treffer, Top 3.
3. Dedupe; kompakte Serialisierung pro Eintrag: `id`, `name`, `category`, `significance`, Methoden als Titel + `style` + `safeForChildren`/`safeForPets`, `prevention`-Stichpunkte. Keine Volltexte (Token-Budget: Grounding gesamt ≲ 4k Tokens).

### System-Prompt-Regeln (deutsch)

- Berate NUR auf Basis des gelieferten Kontexts; bei fehlendem Wissen ehrlich sagen und ggf. Scan empfehlen.
- Kinder-/Haustier-Situation und Lösungsstil (`ORGANIC`/`BALANCED`/`EFFECTIVE`) des Profils beachten.
- Kurz und strukturiert (2–6 Sätze bzw. knappe Nummernliste), keine Floskeln.
- `citations`: nur IDs aus der mitgelieferten erlaubten Liste; leer, wenn keine Quelle passt.
- Antwortformat: NUR JSON `{ "reply": "...", "citations": ["id", ...] }`.

### Fehlerbehandlung

- Anthropic 429 → 429 `{ error: 'rate_limit' }`; sonstige Provider-Fehler → 502 `{ error: 'upstream_error' }`.
- JSON-Parse-Fehler: 1 Retry-freier Fallback — `reply` = Rohtext ohne Code-Fences, `citations: []`.
- Client: 402 → Limit-Banner mit Link `/premium`; andere Fehler → freundliche Chat-Fehlermeldung, Eingabe bleibt erhalten.

## DB-Migration

Tabelle `coach_usage` analog `scan_usage`:

```sql
create table coach_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  messages_used int not null default 0,
  primary key (user_id, day)
);
-- RLS: Nutzer liest nur eigene Zeilen; Schreiben nur via RPC (security definer)
create function increment_coach_usage(p_user_id uuid, p_day date) returns int ...
```

Limit-Prüfung nutzt das vorhandene `featureGate`/`policy.ts` (`FREE.coachMessagesPerDay = 3`). Zählung: erst nach erfolgreichem Claude-Call inkrementieren (fehlgeschlagene Anfragen kosten kein Kontingent).

## Client-Umbau (`src/app/coach/page.tsx`)

- `sendMessage`: `setTimeout(900)` + `findCoachResponse` raus; `fetch('/api/coach', {method:'POST', body: {messages}})` rein. `TypingIndicator` bleibt während des Requests.
- Quellen-Chips rendern `citations[{id, name, category}]` aus der Route-Antwort (kein `CONTENT_REGISTRY`-Import ins Client-Bundle; `plant_`-Prefix-Logik entfällt).
- Initial-Nachricht: ehrliche, neutrale Begrüßung (kennt keine erfundenen Fälle); Suggestions bleiben statisch.
- Kontext-Badge „Dein Garten, Muenchen, April" wird entfernt.
- `?q=`-Deep-Link-Verhalten bleibt.
- Usage-Anzeige: nach jeder Antwort dezent „X von 3 heute" (aus `usage` der Response).

## Aufräumen

- `src/lib/mock/coach.ts`: `COACH_RESPONSES` + `findCoachResponse` + erfundene `COACH_INITIAL` löschen. `COACH_SUGGESTIONS` und neutrale Begrüßung ziehen um nach `src/lib/coach/constants.ts` (kein „mock" mehr im Pfad).

## Neue/geänderte Dateien

- Neu `supabase/migrations/<ts>_coach_usage.sql`
- Neu `src/lib/coach/prompt.ts` — `buildCoachSystemPrompt(context)`, `buildContentScope(...)` (pure, getestet)
- Neu `src/lib/coach/parse.ts` — `parseCoachResponse(raw, allowedIds)` (pure, getestet)
- Neu `src/lib/services/coachUsageService.ts` — `getCoachUsageToday`, `incrementCoachUsage`
- Neu `src/app/api/coach/route.ts` — dünner Orchestrator
- Neu `src/lib/coach/constants.ts` — Suggestions + Begrüßung
- Ändern `src/app/coach/page.tsx` — fetch, Fehler-/Limit-States, Citations, Badge raus
- Ändern `src/lib/supabase/types.ts` — `coach_usage`-Tabelle ergänzen (WICHTIG: generierte Typen immer mitpflegen)
- Löschen/Leeren `src/lib/mock/coach.ts`
- Tests: `tests/coach/prompt.test.ts`, `tests/coach/parse.test.ts`, `tests/services/coachUsageService.test.ts`

## Modell & Kosten

`claude-sonnet-4-6` ($3/$15 pro MTok). Pro Nachricht ≈ 2–4k Input + ≤1k Output ⇒ ~1,5–3 Cent. Bei 3 Nachrichten/Tag Free-Limit unkritisch. Kein Prompt-Caching in v1 (Grounding ändert sich pro Request; System-Regeln allein liegen unter der 2048-Token-Cache-Mindestgrenze von Sonnet 4.6 — bei Bedarf später optimieren).

## Sicherheit

- Auth vor jedem teuren Schritt (Limit-Check vor Grounding + Claude-Call).
- Citation-Whitelist verhindert erfundene Quellen.
- User-Content (Pflanzennamen etc.) ist eigener Content; System-Prompt weist Claude an, Anweisungen in Nutzerdaten zu ignorieren.
- `max_tokens` 1000 + Tages-Limit als Kosten-Deckel.

## Erfolgskriterien

1. Frage zu eigener Pflanze/offenem Fall → Antwort referenziert die echten Daten mit korrektem Quellen-Chip.
2. Frage außerhalb des Wissens → ehrliches „weiß ich nicht" + ggf. Scan-Empfehlung, keine Halluzination.
3. 4. Nachricht des Tages (FREE) → 402 + Limit-Banner, kein Claude-Call.
4. `tsc`, alle Vitest-Tests, `next build` grün; mobile Prüfung bei 390px.
