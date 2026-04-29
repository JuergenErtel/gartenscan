# Garden-Persistence — Design Spec

**Datum:** 2026-04-29
**Status:** Draft, brainstormed
**Phase:** Garden-Persistence (kleine Baustelle #1 nach Pipeline-Repair + uncertain_match)

## Problem

Die Seiten `/garden` und `/garden/[plantId]` lesen heute aus statischen Mock-Daten
(`src/lib/mock/garden.ts`, `src/lib/mock/scans.ts`). Echte Scans aus der
DB werden nicht im Garten angezeigt. Konsequenz: nach erfolgreichem Scan
gibt es keinen Weg, die identifizierte Pflanze als „Pflanze in meinem Garten"
zu persistieren.

## Ziel

Eine echte `plants`-Tabelle, eine optionale Verknüpfung von Scans zu Pflanzen,
und ein Save-Flow nach erfolgreichen Scans. Die Garten-Seiten zeigen ab Phase 1
ausschließlich reale User-Daten, kein Mock mehr.

## Scope

**In:**
- DB-Tabelle `plants` mit RLS analog zu bestehenden Tabellen.
- Spalte `scans.plant_id` (nullable FK).
- Repository `plantRepository.ts` neben `scanRepository.ts`.
- API-Routes für Plant-Create und Scan-Assign.
- Save-Flow auf `/scan/[id]` als inline-CTA → eigene `/scan/[id]/save`-Page.
- Refactoring von `/garden` und `/garden/[plantId]` auf Real-Data.
- Vitest-Coverage für Repository und API.

**Out:**
- Plant edit (nickname/zone ändern), delete, Cover-Image tauschen.
- Nachträgliches Speichern alter Scans aus der History (Schema unterstützt es,
  UI dafür ist Phase-2).
- Plant-Verknüpfung mit `MOCK_TASKS` (DailyTask) — bleibt dead code.
- Coach-LLM-Kontext aus Plants.
- Health-Status der Pflanze (Identifikation ≠ Krankheits-Erkennung; ist
  Phase-C-Material).

## Antworten auf Brainstorming-Fragen

1. **Scan↔Plant-Flow:** Explizite Zuordnung nach jedem Scan. Save-Dialog mit
   zwei Pfaden: neue Pflanze anlegen oder zu bestehender hinzufügen.
2. **Health-Status:** Komplett raus für Phase 1. `/garden` zeigt eine flache
   Liste, keine Critical/Attention/Healthy-Sektionen.
3. **Plant-Felder:** Nickname (required) + Zone (optional, Freitext). Species,
   Latein-Name, Cover-Bild kommen automatisch aus dem auslösenden Scan.
4. **Re-Scan-Flow:** Save-Dialog hat zwei Pfade. „Bestehender Pflanze
   hinzufügen" filtert Pflanzen mit gleicher Art (`matched_content_id`) zuerst.
5. **Save-Pflicht:** Optional. `scans.plant_id` ist nullable, der CTA auf der
   Scan-Result-Page ist sichtbar aber überspringbar.

## DB-Schema

Neue Migration `supabase/migrations/20260429120000_garden_persistence.sql`:

```sql
create table public.plants (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  created_at          timestamptz not null default now(),
  nickname            text not null,
  species             text not null,
  latin_name          text,
  matched_content_id  text,
  cover_image_path    text not null,
  zone_label          text,
  origin_scan_id      uuid references public.scans(id) on delete set null
);

create index plants_user_created_idx on public.plants (user_id, created_at desc);
create index plants_user_content_idx on public.plants (user_id, matched_content_id);

alter table public.plants enable row level security;

create policy "own plants select" on public.plants
  for select using (auth.uid() = user_id);
create policy "own plants insert" on public.plants
  for insert with check (auth.uid() = user_id);
create policy "own plants update" on public.plants
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own plants delete" on public.plants
  for delete using (auth.uid() = user_id);

alter table public.scans
  add column plant_id uuid references public.plants(id) on delete set null;

create index scans_plant_idx on public.scans (plant_id) where plant_id is not null;
```

**Anmerkungen:**
- `plant_id` auf scans ist nullable. Loose Scans bleiben erlaubt (Identifikation
  ohne Garten-Save).
- `on delete set null` bei beiden FKs: Pflanze löschen lässt Scans als loose
  bestehen; Scan löschen entfernt nicht die Pflanze (auch wenn's der
  origin_scan war).
- `matched_content_id` redundant zur gleichnamigen Spalte auf `scans`, aber
  stabil über Re-Scans (notwendig für „same species"-Vorschlag).
- Keine `health_status`-Spalte (siehe Frage 2).
- Keine Cache-Spalten `last_scan_at`/`scan_count` — werden per JOIN/Aggregate
  berechnet. Falls später Performance-Probleme: simple `add column` + Trigger.

## Repository

Neue Datei `src/lib/services/plantRepository.ts`:

```ts
export interface Plant {
  id: string;
  userId: string;
  createdAt: Date;
  nickname: string;
  species: string;
  latinName: string | null;
  matchedContentId: string | null;
  coverImagePath: string;
  zoneLabel: string | null;
  originScanId: string | null;
}

export interface PlantWithStats extends Plant {
  scanCount: number;
  lastScanAt: Date | null;
}

export interface CreatePlantInput {
  userId: string;
  scanId: string;
  nickname: string;
  zoneLabel?: string;
}

export async function createPlantFromScan(input: CreatePlantInput): Promise<Plant>;
export async function attachScanToPlant(
  scanId: string, plantId: string, userId: string
): Promise<void>;
export async function listPlantsForUser(userId: string): Promise<PlantWithStats[]>;
export async function getPlantById(plantId: string, userId: string): Promise<Plant | null>;
export async function listPlantsForAssignment(
  userId: string, matchedContentId: string | null
): Promise<Plant[]>;
```

**Implementierungs-Notizen:**
- `createPlantFromScan`: lädt Scan (für `species`, `latin_name`,
  `matched_content_id`, `image_path`), inserted plant, dann
  `update scans.plant_id`. Bei Fehler im zweiten Schritt: plant rollback per
  `delete plants where id = ?`.
- `attachScanToPlant`: `update scans set plant_id = ? where id = ? and user_id = ?`.
  Plant-Ownership wird über separate Pre-Check-Query verifiziert (RLS schützt
  beim Service-Role-Client nicht).
- `listPlantsForUser`: zwei Queries (plants + Aggregat aus scans), in JS
  zusammengeführt. Pattern analog zu `listScansForUser`.
- `listPlantsForAssignment`: order by `(matched_content_id = ?) desc, created_at desc`.

**Erweiterung von `scanRepository.ts`:**
- `getScanById` und `listScansForUser` ergänzen `plantId` im StoredScan-Mapping.
- Neue Funktion `listScansForPlant(plantId, userId)` für die Detail-Page.

## API-Routes

**`POST /api/plants`** — neue Pflanze anlegen.
- Body: `{ scanId, nickname, zoneLabel? }`.
- Validierung: nickname trimmed length 1..80, zoneLabel max 80, scanId UUID-format.
- Logik: Scan laden, Ownership prüfen, `status === 'ok'` und
  `plant_id === null`. Wenn nicht erfüllt → 409. Sonst `createPlantFromScan`.
- Response: `201 { plantId }`.
- Fehler: 400 Validierung, 401 unauthenticated, 404 Scan nicht gefunden /
  cross-user, 409 Scan ist nicht im Save-fähigen Zustand (kein 'ok' oder hat
  schon plant_id).

**`POST /api/scans/[id]/assign`** — bestehender Pflanze zuordnen.
- Body: `{ plantId }`.
- Validierung: plantId UUID.
- Logik: Scan und Plant laden (beide eigene), Scan hat plant_id null und
  `status === 'ok'`, dann `attachScanToPlant`.
- Response: `200`.
- Fehler: 401 unauthenticated, 404 Scan/Plant nicht gefunden / cross-user,
  409 Scan-Zustand passt nicht.

**`GET /api/plants/assignable?contentId=...`** — Vorschlagsliste für Save-Sheet.
- Query: `contentId` (matched_content_id, optional).
- Response: `{ plants: { id, nickname, species, coverImagePath, sameSpecies }[] }`.
- Server-Order: `sameSpecies` zuerst, dann `created_at desc`.

**Bestehendes Pattern:** Stil exakt wie `src/app/api/scans/[id]/status/route.ts` —
`createClient()` → `supabase.auth.getUser()` für Authn, `NextResponse.json(...)`
für Response. Kein `revalidatePath` server-seitig: Cache-Invalidierung erfolgt
client-seitig per `router.refresh()` nach erfolgreichem fetch (analog zu
`UncertainMatchState`).

## UI

**Neue Komponenten:**

`src/components/features/plant/SavePlantPrompt.tsx` — Server-Component, inline-CTA
auf der Scan-Result-Page. Sichtbar wenn `scan.status === 'ok'` und
`scan.plant_id === null`. Eine Karte mit Sprout-Icon, Text „Diese Pflanze in
deinen Garten aufnehmen?", primärer Button → Link `/scan/[id]/save`.

`src/app/scan/[id]/save/page.tsx` — Server-Component, lädt Scan und
`listPlantsForAssignment(userId, scan.matched_content_id)`, rendert
`<SavePlantSheet>`.

`src/components/features/plant/SavePlantSheet.tsx` — Client-Component, zwei Pfade:
- **Tab „Neu hinzufügen" (Default):** Nickname (required, autofocus,
  Placeholder = species), Zone (optional). Speichern-Button → `POST /api/plants`,
  bei Erfolg `router.push('/scan/[id]')` + `router.refresh()`.
- **Tab „Bestehender Pflanze hinzufügen":** Liste der Vorschläge,
  Section-Header „Gleiche Art" zuerst (mit Match-Indicator), dann „Andere".
  Tap → `POST /api/scans/[id]/assign`, bei Erfolg navigation zurück.
  Bei leerer Liste: Tab gar nicht zeigen, nur „Neu hinzufügen".
- Layout mobile: full-screen-Sheet auf <640px, kein zentriertes Modal.
  Tab-Switch als zweispaltige Pille oben.

**Refactoring:**

`src/app/garden/page.tsx` — Server-Component:
- `createClient()` → `supabase.auth.getUser()` für userId, dann
  `listPlantsForUser(userId)`.
- Eine flache Sektion mit `<PlantTile>`-Grid (kein Health-Bucketing).
- Empty-State: bestehende `<EmptyState>`-Komponente, CTA → `/scan/new`.
- Header: `{plants.length} Pflanze(n)`. „4 Zonen"-Counter raus, Klimazonen-Pille
  (Mock „Zone 8a") bleibt.

`src/app/garden/[plantId]/page.tsx`:
- `getPlantById(plantId, userId)` + `listScansForPlant(plantId, userId)`.
- Cover-Image aus `plant.cover_image_path` via bestehender Storage-URL-Helper.
- Verlauf: alle Scans dieser Pflanze, neueste zuerst, via existierendem
  `<HistoryEntry>`.
- Stat-Bar: „Hinzugefügt" / „Scans" / „Zuletzt" aus `PlantWithStats`.
- `OnboardingGuard`-Wrapper bleibt.

**Mocks raus:**
- `src/lib/mock/garden.ts` und `src/lib/mock/scans.ts` werden gelöscht.
- `Plant` und `DailyTask`-Interfaces aus `src/lib/types.ts` entfernen
  (Plant kommt jetzt aus `plantRepository`, DailyTask ist faktisch dead-code).
- `WeatherSnapshot` bleibt — wird in `WeatherChip.tsx` und
  `lib/weather/openmeteo.ts` aktiv konsumiert.

## Tests

`src/lib/services/__tests__/plantRepository.test.ts`:
- `createPlantFromScan` happy path.
- `createPlantFromScan` mit Scan eines anderen Users → wirft.
- `createPlantFromScan` mit Scan der schon plant_id hat → wirft.
- `attachScanToPlant` happy path.
- `attachScanToPlant` cross-user → wirft.
- `listPlantsForUser` mit Aggregaten.
- `listPlantsForAssignment` Ordering.

`src/app/api/plants/__tests__/route.test.ts`:
- `POST /api/plants` happy path → 201.
- Ungültiger Nickname → 400.
- Cross-user Scan → 404.
- Scan mit plant_id → 409.

`src/app/api/scans/[id]/__tests__/assign.test.ts`:
- Happy path → 200.
- Plant cross-user → 404.

**Mocking:** `createServiceRoleClient()`-Mock-Builder, Pattern aus
bestehenden Tests übernehmen. Keine echte DB.

**Manuell verifiziert (nicht automatisiert):**
- RLS-Policies via Supabase Studio mit zweitem User.
- E2E auf gartenscan.de (siehe Migration & Rollout).

**Targets:** vitest aktuell 31 grün → ~40+ grün, `tsc --noEmit` sauber.

## Migration & Rollout

1. **Schema:** Migration-File in `supabase/migrations/`, manuell auf Supabase
   Studio (Dev + Prod) anwenden — gleiches Verfahren wie für die vorigen
   drei Migrations.
2. **Bestehende Scans:** kein Backfill. `plant_id = null` per `add column`
   default. Demo-Scans bleiben loose.
3. **Code-Rollout:** ein PR, kein Feature-Flag. `/garden` und
   `/garden/[plantId]` werden gleichzeitig auf Real-Data umgestellt, Mocks
   gelöscht.
4. **Smoke-Test auf Production:**
   - Scan → ok → CTA → Sheet → Nickname → speichern → Tile in `/garden`
     mit korrektem Cover.
   - Zweiter Scan derselben Art → Sheet → „Bestehender hinzufügen" → bestehende
     Pflanze gelistet mit „gleiche Art"-Indicator → tap → `/garden/[plantId]`
     hat zwei Verlaufseinträge.
   - Cover bleibt der Erst-Scan, nicht der jüngste.
   - Cross-User-Test mit zweitem Account.
5. **Pipeline-Update:** nach Smoke-Test grün, `pipeline-update` auf
   `Progress 96`, neue Todos „Phase C", „Phase D", „Coach-LLM mit
   Plant-Kontext".

## Offene Punkte / Risiken

- **Service-Role-Client umgeht RLS.** Repository muss in API-Layer immer
  `userId` als Filter setzen. Pattern existiert in `scanRepository`, dem
  folgen wir.
- **Atomic createPlantFromScan**: zwei Statements (insert plant + update scan).
  Bei Crash zwischen ihnen → verwaiste Plant. Wir nehmen das Risiko in Kauf
  und kompensieren mit Try/Catch + Rollback-Delete (best effort).
- **Demo-Scans (Wikimedia-URLs der alten MOCK_PLANTS) sind weg** ab Rollout.
  User der `/garden` heute öffnet sieht den Empty-State bis er was scannt.
  Akzeptiert.
- **`/garden/[plantId]/page.tsx` bekommt OnboardingGuard** — der ist auf der
  Mock-Variante schon drin, bleibt drauf.

## Aus Scope, ggf. Phase 2

- Plant edit: Nickname und Zone ändern können.
- Plant delete.
- Cover-Image tauschen (z.B. einen späteren Scan als Cover wählen).
- Nachträglich-Speichern eines loose-Scans aus der History.
- Plant ohne Scan anlegen (manuell, ohne Foto).
- Plant-zu-DailyTask-Verknüpfung (nach Phase D oder eigenes Phase).
