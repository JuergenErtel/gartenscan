# Design Spec — Foundation & Real Plant Scan (A+B)

**Datum:** 2026-04-21
**Scope:** Sub-Projekte **A** (Foundation: Auth + Persistenz + echter Bildupload) und **B** (Echter Pflanzen-Vision-Provider) — gemeinsam als ein Spec, weil voneinander abhängig.
**Nicht in diesem Spec:** C (Insekten/Krankheiten), D (Recommendation Engine), E (Stripe/Paywall-Enforcement).

---

## 1. Zielbild

Der erste echte End-to-End-Pflanzen-Scan:

1. Nutzer fotografiert oder lädt ein Bild hoch.
2. Server klassifiziert Kategorie + Bildqualität (Claude Vision Triage).
3. Bei klar erkennbarer Pflanze: Pl@ntNet identifiziert Art(en) mit Confidence.
4. Ergebnis wird in Supabase gespeichert und im bestehenden Editorial-Hero-Screen gerendert — jetzt mit echten Daten.
5. History ist echt und persistiert über Browser-Sessions hinweg.

Alles andere bleibt für diesen Spec außen vor.

## 2. Entscheidungen-Protokoll

| # | Entscheidung | Begründung |
|---|---|---|
| 1 | **Supabase** (EU Frankfurt) für Auth + Postgres + Storage | Ein Provider statt drei; EU-Region; Row-Level-Security passt zu bestehender Policy-Struktur. |
| 2 | **Pl@ntNet** als Primär-Vision-Provider | Pflanzen-spezialisiert, EU, kostenloses Tier (500 req/day), strukturierte Taxonomie. |
| 3 | **Claude Vision** ausschließlich als Pre-Triage (Kategorie + Bildqualität) | Schützt Pl@ntNet-Quota, liefert ehrliche Fehlerzustände, ein Call pro Scan (~0,005 €). |
| 4 | **Anonymous Auth first**, Email-Upgrade optional später | Keine Reibung vor erstem Scan; RLS-Policies bleiben beim Upgrade stabil. |
| 5 | **localStorage-Reset** — keine Migration | Keine produktiven User-Daten; Migration wäre verschwendet. |
| 6 | **Auto-Triage**, kein Kategorie-Picker | Claude-Call liefert Kategorie + Qualität gemeinsam; ehrlichste UX. |
| 7 | **Usage-Counter-Schema mitbauen, kein Enforcement** | Counter zählt ab Tag 1, Enforcement-Schalter wird in E umgelegt. |
| 8 | **Onboarding-DemoPicker bleibt**, echter Scan nur unter `/scan/new` | Editorial-Intro bewahren; echter Moment-of-Truth in der App. |

## 3. Architektur

```
┌─────────────────────────────────────────────────────────────┐
│  UI (Client Components)                                     │
│  /scan/new · /scan/[id] · /app · /history                   │
└──────────┬──────────────────────────────────────────────────┘
           │ server-actions / fetch
┌──────────▼──────────────────────────────────────────────────┐
│  Server Actions & Route Handlers                            │
│  POST /api/scans   → analyzeImageService.run()              │
│  GET  /api/scans   → historyService.list()                  │
│  GET  /api/scans/[id] → historyService.get()                │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│  Services  (src/lib/services/)                              │
│  analyzeImageService · scanRepository · historyService      │
│  usageCounterService · imageStorageService · profileRepository │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│  Providers  (src/lib/providers/)                            │
│  triage:  ClaudeVisionTriageProvider                        │
│  plants:  PlantNetProvider (behind IdentificationProvider)  │
│  tests:   MockIdentificationProvider                        │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│  Supabase (auth · postgres · storage) · Anthropic · Pl@ntNet │
└─────────────────────────────────────────────────────────────┘
```

### Schichtregeln

- **UI kennt nur Services**, nie direkt Provider oder externe APIs.
- **Services kennen Provider und Repositories**, aber keine HTTP-Request-Details (die bleiben im Provider gekapselt).
- **Provider kennen nur Interfaces und ihre konkrete API** — keine DB, keine Auth-Logik.
- Alle externen API-Calls laufen **server-seitig**. API-Keys werden nie an den Client ausgeliefert.

## 4. End-to-End Datenfluss

1. Client wählt/fotografiert Bild — clientseitige Validierung (MIME `image/*`, max. 10 MB, min. 512 px längere Kante).
2. Client komprimiert via Canvas auf max. 1600 px längere Kante, JPEG quality 0,85.
3. Client ruft Server Action `createScan(file, meta)` auf.
4. Server stellt Supabase-Session sicher (signiert anonym ein, falls nicht vorhanden — idempotent).
5. Server lädt Bild in Bucket `scan-images`, Pfad `{userId}/{scanId}.jpg`.
6. Server erzeugt signed URL (24 h TTL) für Provider-Call.
7. Server ruft `analyzeImageService.run(imageUrl, userId, scanId)`:
   - `ClaudeVisionTriageProvider.classify(imageUrl)` → `{ category, quality, reason }`
   - Wenn `quality !== 'acceptable'` → `status = 'low_quality'`, speichern, Exit.
   - Wenn `category !== 'plant'` → `status = 'category_unsupported'`, speichern, Exit.
   - Sonst `PlantNetProvider.identify(imageUrl)` → Kandidaten.
   - Wenn `candidates.length === 0` oder `maxConfidence < 0.25` → `status = 'no_match'`.
   - Sonst `status = 'ok'`.
8. Server speichert `scans`-Row + `scan_candidates`-Rows + inkrementiert `scan_usage`.
9. Server gibt `scanId` zurück.
10. Client navigiert auf `/scan/[id]` (Server Component lädt Daten frisch).

### Provider-Interface

```ts
// src/lib/providers/identification/types.ts
export interface IdentificationProvider {
  readonly name: string;
  identify(input: IdentificationInput): Promise<IdentificationResult>;
}

export interface IdentificationInput {
  imageUrl: string;              // signed URL (von Supabase Storage)
  locale: 'de' | 'en';
  maxCandidates: number;         // default 3
}

export interface IdentificationResult {
  candidates: DetectionCandidate[];
  rawProvider: string;
}
```

Für Phase C kommt ein analoges `InsectIdentificationProvider`-Interface daneben — selbe Form, eigener externer Provider.

### Fehler-Klassen

```ts
// src/lib/providers/errors.ts
export type ProviderErrorKind =
  | 'not_configured'    // fehlender API-Key
  | 'timeout'           // > 8 s
  | 'rate_limit'        // 429 vom Provider
  | 'upstream_error'    // 5xx oder Schema-Mismatch
  | 'invalid_input';    // Bild nicht ladbar / korrupt

export class ProviderError extends Error {
  constructor(
    public kind: ProviderErrorKind,
    public provider: string,
    message: string,
    public cause?: unknown
  ) { super(message); }
}
```

Timeouts: Triage 6 s, Pl@ntNet 8 s. Keine Retries in A+B.

## 5. Datenmodell (Supabase)

### Tabellen

```sql
-- profiles: App-spezifische User-Daten (1:1 mit auth.users)
create table public.profiles (
  id                       uuid primary key references auth.users(id) on delete cascade,
  created_at               timestamptz not null default now(),
  is_anonymous             boolean not null default true,
  email                    text,
  garden_type              text,
  experience               text,
  interests                text[] not null default '{}',
  pets_children            text[] not null default '{}',
  solution_preference      text,
  completed_onboarding_at  timestamptz
);

create table public.entitlements (
  user_id                  uuid primary key references auth.users(id) on delete cascade,
  plan                     text not null default 'free',
  source                   text not null default 'default',
  updated_at               timestamptz not null default now(),
  stripe_customer_id       text,
  stripe_subscription_id   text,
  current_period_end       timestamptz
);

create table public.scans (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  created_at               timestamptz not null default now(),
  image_path               text not null,
  image_meta               jsonb,
  triage_category          text,
  triage_quality           text,
  triage_reason            text,
  provider                 text,
  provider_raw             jsonb,
  status                   text not null,
  matched_content_id       text
);

create table public.scan_candidates (
  id                       uuid primary key default gen_random_uuid(),
  scan_id                  uuid not null references public.scans(id) on delete cascade,
  rank                     int not null,
  scientific_name          text not null,
  common_names             text[] not null default '{}',
  taxonomy                 jsonb,
  confidence               numeric(4,3) not null,
  content_id               text
);

create table public.scan_usage (
  user_id                  uuid not null references auth.users(id) on delete cascade,
  year_month               text not null,
  scans_used               int not null default 0,
  primary key (user_id, year_month)
);

create index scans_user_created_idx   on public.scans (user_id, created_at desc);
create index scan_candidates_scan_idx on public.scan_candidates (scan_id, rank);
```

### Row-Level-Security

```sql
alter table public.profiles         enable row level security;
alter table public.entitlements     enable row level security;
alter table public.scans            enable row level security;
alter table public.scan_candidates  enable row level security;
alter table public.scan_usage       enable row level security;

create policy "own profile"        on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own entitlement"    on public.entitlements
  for select using (auth.uid() = user_id);

create policy "own scans select"   on public.scans
  for select using (auth.uid() = user_id);
create policy "own scans insert"   on public.scans
  for insert with check (auth.uid() = user_id);

create policy "own candidates"     on public.scan_candidates
  for select using (exists (
    select 1 from public.scans s where s.id = scan_id and s.user_id = auth.uid()
  ));

create policy "own usage"          on public.scan_usage
  for select using (auth.uid() = user_id);
```

Writes auf `entitlements`, `scan_candidates`, `scan_usage` und auf `scans.provider_raw` laufen **ausschließlich über die Service-Role** (Server-Code), daher keine Insert-/Update-Policies für den Client.

### Supabase Storage

- Bucket `scan-images` — **privat**.
- Path-Convention: `{userId}/{scanId}.jpg`.
- Upload nur Server-side via Service-Role-Key.
- Read via signed URL: 24 h TTL für Provider-Call, 1 h TTL für UI-Rendering.
- Keine öffentliche Auslieferung.

### Domain-Type-Mapping

| Domain-Type (`src/domain/`) | DB |
|---|---|
| `GardenProfile` | `profiles` Row |
| `DetectionCandidate` | `scan_candidates` Row |
| `Scan` / `DetectionResult` | Join `scans` + `scan_candidates` |
| `SubscriptionEntitlement` | `entitlements` Row |

### ENV-Variablen

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...           # nur server
PLANTNET_API_KEY=                       # leer ok → provider_error-State
ANTHROPIC_API_KEY=...
```

`.env.example` wird angelegt. `.env.local` bleibt gitignored.

## 6. UI-Zustände je `DetectionResult.status`

| Status | Trigger | UI |
|---|---|---|
| `ok` | Pl@ntNet liefert ≥ 1 Kandidat mit `confidence ≥ 0.25` | Bestehender Editorial-Hero mit echten Daten; Glass-Confidence-Pill (Ampel) |
| `low_quality` | Triage `quality !== 'acceptable'` | `ErrorState` mit botanical Mark + italic Hint + **Retry** |
| `category_unsupported` | Triage `category !== 'plant'` | `ErrorState` mit ehrlicher Botschaft („Insekten-Erkennung kommt bald") + Retry |
| `no_match` | `candidates.length === 0` oder `maxConfidence < 0.25` | `ErrorState` „Nicht sicher zuordenbar" + Tipp + Retry |
| `provider_error` | `ProviderError` jeglicher Art | `ErrorState` „Erkennung gerade nicht verfügbar" + Retry + (dev-only) Detail-Toggle |

### Confidence-Ampel

- grün (`moss`) ≥ 0,75
- gelb (`sun`) 0,50–0,75
- rot (`berry`) 0,25–0,50
- unter 0,25 → `no_match`, Kandidaten erscheinen nicht

## 7. Frontend-Refactors

| Datei | Aktion |
|---|---|
| `src/app/scan/new/page.tsx` | **Neu schreiben**: echter File-Input mit `capture="environment"`, Canvas-Kompression, Server-Action-Call. DemoPicker entfällt. |
| `src/app/onboarding/scan/page.tsx` | **Minimal-Refactor**: DemoPicker bleibt, Demo-Resultat kommt aus Seed-Content (kein Provider-Call). |
| `src/app/scan/[id]/page.tsx` | **Refactor** zur Server Component: lädt via `historyService.get(scanId)`; rendert UI-Zustand je `status`. |
| `src/app/app/page.tsx` (History-Abschnitt) | **Refactor**: `historyService.list(userId)` statt `MOCK_SCANS`. |
| `src/lib/providers/MockVisionProvider.ts` | **Umbenennen** zu `MockIdentificationProvider.ts`, nur noch als Test-Fixture. |
| `src/lib/providers/vision.ts` | **Ersetzen** durch `src/lib/providers/identification/factory.ts`. |
| `src/lib/mock/scans.ts` | **Löschen**. |
| `src/lib/mock/garden.ts` | **Bleibt** (Garden außerhalb A+B). |
| `src/lib/storage/profile.ts` | **Ersetzen** durch `src/lib/services/profileRepository.ts` (Supabase). |
| `src/hooks/useOnboarding.ts` | **Refactor**: lokaler Zustand während Flow, Persist-Call am Ende → `profileRepository.save()`. |
| `src/components/features/onboarding/OnboardingGuard.tsx` | **Refactor** zur Server-Kontrolle: liest `profiles.completed_onboarding_at`. Kein Flash mehr. |
| `src/lib/profile.ts` (hardcoded `USER_PROFILE`) | **Löschen**. |

### Neue Dateien

```
src/lib/supabase/client.ts           — Browser-Client (anon key, cookies)
src/lib/supabase/server.ts           — Server-Client (cookies via next/headers)
src/lib/supabase/service-role.ts     — Service-Role-Client (nur server, nie im Client-Bundle)
src/lib/supabase/middleware.ts       — Session-Refresh
middleware.ts (root)                 — delegiert an supabase/middleware

src/lib/services/analyzeImageService.ts
src/lib/services/scanRepository.ts
src/lib/services/historyService.ts
src/lib/services/usageCounterService.ts
src/lib/services/imageStorageService.ts
src/lib/services/profileRepository.ts

src/lib/providers/identification/types.ts
src/lib/providers/identification/factory.ts
src/lib/providers/identification/plantnet.ts
src/lib/providers/identification/mock.ts
src/lib/providers/triage/types.ts
src/lib/providers/triage/claudeVision.ts
src/lib/providers/errors.ts

src/app/api/scans/route.ts           — GET (Liste), POST (create via FormData)
src/app/api/scans/[id]/route.ts      — GET (Detail)

supabase/migrations/20260421_init.sql
```

### Feature-Flag-Strategie

**Kein `ENABLE_REAL_SCAN`-Flag.** Fehlender `PLANTNET_API_KEY` wirft `ProviderError: not_configured`, der UI zeigt `provider_error`. Weniger Schalter = weniger Zustände.

## 8. Scope-Abgrenzung — bewusst NICHT in A+B

- Keine Insekten-/Krankheits-API — Phase C
- Keine Recommendation Engine, keine LLM-Descriptions — Phase D
- Kein Stripe, keine Paywall-UI, kein Usage-Enforcement — Phase E
- Kein Garten-Persistence, keine echten Tasks, kein Coach-LLM
- Kein Email-Upgrade-UI für Anonymous-User
- Kein Image-Retention-Lifecycle (Löschroutine für alte Bilder)
- Kein SEO, keine PWA-Offline-Fähigkeit
- Kein `gardens`/`plants`-DB-Schema
- Kein `recommendations`- oder `coach_messages`-DB-Schema

## 9. Test-Strategie

- **Unit-Tests (Vitest):**
  - `PlantNetProvider` mit gemocktem `fetch` gegen Response-Fixtures (Happy + 4 Fehler-Pfade)
  - `ClaudeVisionTriageProvider` mit gemocktem Anthropic-SDK
  - `analyzeImageService` — `ok` + `low_quality` + `category_unsupported` + `no_match` + `provider_error`
  - `scanRepository` — save + load mit Supabase-Test-Client
  - `usageCounterService` — Increment + Monatsgrenzen
- **Integrations-Test (Playwright):** 1 End-to-End-Flow mit `MockIdentificationProvider` gegen lokale Supabase: Scan-Upload → Ergebnis-Seite → History-Liste.
- **Keine UI-Komponenten-Tests in A+B** — Visual-Polish ist stabil, UI-States manuell verifiziert auf iPhone-14-Viewport.

## 10. Rollout

1. Supabase-Projekt anlegen (manuell, einmalig), EU Frankfurt, ENV-Vars in Vercel hinterlegen.
2. Migration lokal ausführen (`supabase db reset`), dann auf Staging, dann Prod.
3. Code-PR mergen → Vercel deployt.
4. Smoke-Test auf Prod: Onboarding (Demo bleibt) → `/scan/new` ohne Key → `provider_error` korrekt. Mit Key → echter Scan, Ergebnis in History.
5. Danach Phase C/D/E je eigener Spec.

## 11. Dokumentation

- Dieser Spec: `docs/superpowers/specs/2026-04-21-foundation-real-plant-scan-design.md`
- `README.md` Abschnitt „Environment" wird um Supabase + Pl@ntNet + Anthropic ergänzt.
- Keine weiteren User-facing Docs.
