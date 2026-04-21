# Foundation & Real Plant Scan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mock-Pflanzen-App auf echte End-to-End-Pipeline heben — Supabase-Persistenz + Anonymous Auth + echter Bildupload + Pl@ntNet-Identifikation mit Claude-Vision-Triage.

**Architecture:** Saubere Provider/Service-Schichtung. UI → Server Actions / Route Handlers → Services → Provider → externe APIs. Anonymous-Session via `@supabase/ssr`-Middleware. Scan-Outcomes haben fünf klar definierte Stati (`ok | low_quality | category_unsupported | no_match | provider_error`), jeder mit eigenem UI-Zustand.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript 5.7 · Supabase (Postgres + Auth + Storage, EU Frankfurt) · Pl@ntNet API · Anthropic SDK (Claude Vision) · Vitest · `@supabase/ssr` · `@supabase/supabase-js`.

**Spec:** `docs/superpowers/specs/2026-04-21-foundation-real-plant-scan-design.md`

**Testing-Abweichung vom Spec:** Der Spec sah zusätzlich einen Playwright-End-to-End-Test vor. Wir lassen ihn bewusst aus — er würde ein lokales Supabase-Setup (Docker) plus ein Test-Storage-Bucket erfordern und für A+B mehr Config-Arbeit erzeugen als Wert liefern. Die 22 Vitest-Unit-Tests decken Provider + Services ab, und der manuelle Smoke-Test in Task 38 prüft alle 5 Status-Pfade gegen die reale Pipeline. Playwright wird in Phase C nachgezogen, sobald es mehrere Provider-Routings zu testen gibt.

---

## File Structure

### Neu angelegt

```
supabase/migrations/20260421120000_init.sql           — Schema + RLS + Bucket

src/lib/supabase/client.ts                            — Browser-Client
src/lib/supabase/server.ts                            — Server-Component-Client
src/lib/supabase/service-role.ts                      — Admin-Client (nie im Client-Bundle)
src/lib/supabase/middleware.ts                        — Session-Refresh + Anon-Sign-In
src/lib/supabase/types.ts                             — DB-Typen (generiert durch supabase-gen)
middleware.ts                                         — Next.js-Root-Middleware delegiert an supabase/middleware

src/lib/providers/errors.ts                           — ProviderError-Klasse
src/lib/providers/identification/types.ts             — IdentificationProvider-Interface
src/lib/providers/identification/factory.ts           — pickt Provider via ENV
src/lib/providers/identification/plantnet.ts          — PlantNetProvider (real)
src/lib/providers/identification/mock.ts              — MockIdentificationProvider (Tests)
src/lib/providers/triage/types.ts                     — TriageProvider-Interface
src/lib/providers/triage/claudeVision.ts              — Claude-Vision-Triage

src/lib/services/analyzeImageService.ts               — Orchestration (Triage → ID → Persist)
src/lib/services/scanRepository.ts                    — Save/Load scans + scan_candidates
src/lib/services/historyService.ts                    — List/Get für UI
src/lib/services/usageCounterService.ts               — scan_usage Upsert
src/lib/services/imageStorageService.ts               — Upload + Signed URLs
src/lib/services/profileRepository.ts                 — profiles Save/Load

src/domain/scan/ScanOutcome.ts                        — Neue Domain-Types (status, candidates, triage)

src/lib/image/compress.ts                             — Client-seitige Canvas-Kompression

src/app/api/scans/route.ts                            — GET (Liste) + POST (create via FormData)
src/app/api/scans/[id]/route.ts                       — GET (Detail)

vitest.config.ts                                      — Test-Konfiguration
vitest.setup.ts                                       — Globale Mocks

.env.example                                          — ENV-Template

tests/providers/plantnet.test.ts
tests/providers/claudeVision.test.ts
tests/providers/mock-identification.test.ts
tests/services/analyzeImageService.test.ts
tests/services/usageCounterService.test.ts
tests/fixtures/plantnet-response.json
tests/fixtures/claude-triage-response.json
```

### Ersetzt / umgebaut

```
src/lib/providers/vision.ts                           → gelöscht (ersetzt durch identification/factory.ts)
src/lib/providers/MockVisionProvider.ts               → gelöscht (Logik nach identification/mock.ts)
src/lib/storage/profile.ts                            → gelöscht (ersetzt durch profileRepository)
src/lib/mock/scans.ts                                 → gelöscht
src/lib/profile.ts (USER_PROFILE)                     → gelöscht
src/domain/identification/VisionProvider.ts           → gelöscht (legacy)
src/hooks/useOnboarding.ts                            → refactor auf profileRepository
src/hooks/useOnboardingGuard.ts                       → refactor auf Supabase-Session
src/components/features/onboarding/OnboardingGuard.tsx → Server Component (liest profiles-Row)
src/app/scan/new/page.tsx                             → File-Input + echter Scan
src/app/scan/[id]/page.tsx                            → Server Component, UUID-basiert
src/app/app/page.tsx                                  → USER_PROFILE raus, echter Name aus profiles
src/app/history/page.tsx                              → MOCK_SCANS raus, historyService.list()
src/app/onboarding/scan/page.tsx                      → Demo-Logik bleibt, aber kein Mock-Scan-Link mehr
```

### Unberührt

```
src/content/**                                        — Seed-Content bleibt Quelle der Wahrheit
src/domain/types.ts                                   — GardenProfile, ContentEntry etc. bleiben
src/domain/entitlements/                              — FeatureGate + Policy bleiben (in E genutzt)
src/domain/analytics/                                 — Tracking bleibt
src/lib/mock/garden.ts                                — Garden-Mock ist außerhalb von A+B
src/components/features/**                            — Visuelle Komponenten bleiben
src/app/onboarding/{welcome,use-cases,garden,trust,premium}/ — Onboarding-Screens unberührt bis auf persist
```

---

## Phase 1 — Tooling & Setup

### Task 1: Dependencies installieren

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime deps**

```bash
npm install @supabase/ssr@latest @supabase/supabase-js@latest @anthropic-ai/sdk@latest
```

- [ ] **Step 2: Install dev deps**

```bash
npm install -D vitest@latest @vitest/ui@latest jsdom@latest @types/jsdom@latest
```

- [ ] **Step 3: Verify `package.json`**

Run: `cat package.json`
Expected: dependencies enthalten `@supabase/ssr`, `@supabase/supabase-js`, `@anthropic-ai/sdk`; devDependencies enthalten `vitest`, `@vitest/ui`, `jsdom`.

- [ ] **Step 4: Add test scripts to package.json**

Edit `package.json` scripts-block to:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add supabase, anthropic, vitest deps"
```

---

### Task 2: Vitest Setup

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `tests/sanity.test.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.test.ts'],
    globals: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
```

- [ ] **Step 2: Create `vitest.setup.ts`**

```ts
// Placeholder for future global test setup (env stubs, fetch polyfills, etc.)
```

- [ ] **Step 3: Create `tests/sanity.test.ts`**

```ts
import { describe, it, expect } from 'vitest';

describe('sanity', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: Run the test**

Run: `npm test`
Expected: `1 passed`

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts vitest.setup.ts tests/sanity.test.ts
git commit -m "chore: add vitest config with sanity test"
```

---

### Task 3: ENV Template

**Files:**
- Create: `.env.example`
- Modify: `.gitignore` (verify `.env.local` is ignored)

- [ ] **Step 1: Create `.env.example`**

```bash
# Supabase (EU Frankfurt)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Pl@ntNet — plants identification
# Sign up at https://my.plantnet.org/. Leave empty in dev → provider_error shown.
PLANTNET_API_KEY=
PLANTNET_PROJECT=weurope

# Anthropic — used for Claude Vision pre-triage
ANTHROPIC_API_KEY=
```

- [ ] **Step 2: Verify `.gitignore`**

Run: `grep -E "^\.env(\.local)?$" .gitignore`
Expected: `.env*.local` or similar line exists. If not, append `.env*.local` to `.gitignore`.

- [ ] **Step 3: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: add .env.example template"
```

---

### Task 4: Supabase-Projekt anlegen (manuelle Vorarbeit, keine Code-Änderung)

**Manuell durch den User / Dev auszuführen vor Task 6:**

1. Auf https://supabase.com Projekt anlegen, Region **Europe (Frankfurt) eu-central-1**.
2. Aus Settings → API: `Project URL`, `anon` Key, `service_role` Key kopieren.
3. Lokal `.env.local` anlegen mit den drei Keys aus Schritt 2.
4. Für Vercel-Deploy: dieselben drei Keys als ENV-Variablen in Vercel-Projekt-Settings hinterlegen (alle Environments: Production, Preview, Development).

**Keine Commits nötig.** Plan-Execution kann erst weiterlaufen, wenn `.env.local` gesetzt ist.

- [ ] **Step 1: Bestätige `.env.local` vorhanden**

Run: `test -f .env.local && echo "OK" || echo "MISSING"`
Expected: `OK`. Wenn `MISSING`: Task 4 manuelle Schritte erledigen und erneut prüfen.

---

## Phase 2 — Datenmodell & Migrations

### Task 5: Migration-SQL schreiben

**Files:**
- Create: `supabase/migrations/20260421120000_init.sql`

- [ ] **Step 1: Create migration file**

```sql
-- gartenscan initial schema (A+B: Foundation + Real Plant Scan)

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

-- Row Level Security
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

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('scan-images', 'scan-images', false)
on conflict (id) do nothing;

-- Storage-RLS: kein Client-Upload (nur Service-Role), Client liest via signed URL
-- → keine Policies nötig, da private Bucket + kein Client-Schreibpfad existiert.

-- Auto-create profile + entitlement on auth user insert
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, is_anonymous)
  values (new.id, coalesce((new.raw_user_meta_data->>'is_anonymous')::boolean, new.is_anonymous, true));

  insert into public.entitlements (user_id, plan, source)
  values (new.id, 'free', 'default');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260421120000_init.sql
git commit -m "feat(db): initial schema + RLS + auth-trigger"
```

---

### Task 6: Migration anwenden

**Files:** _keine_ — nur Runtime-Operation.

- [ ] **Step 1: Supabase CLI installieren (falls noch nicht da)**

Run: `npx supabase --version`
Expected: Version-String. Wenn nicht installiert: `npm install -D supabase` im Projekt.

- [ ] **Step 2: Projekt linken**

Run: `npx supabase link --project-ref <project-ref-aus-supabase-url>`

(project-ref ist der Subdomain-Teil von `NEXT_PUBLIC_SUPABASE_URL` — z.B. `abc123xyz.supabase.co` → `abc123xyz`)

Expected: „Linked project …"

- [ ] **Step 3: Migration pushen**

Run: `npx supabase db push`
Expected: Output listet Migration und meldet „Applying migration 20260421120000_init.sql… done".

- [ ] **Step 4: Verify via SQL**

In Supabase Dashboard → SQL Editor ausführen:

```sql
select table_name from information_schema.tables
where table_schema = 'public'
order by table_name;
```

Expected: 5 Zeilen — `entitlements`, `profiles`, `scan_candidates`, `scan_usage`, `scans`.

- [ ] **Step 5: RLS prüfen**

```sql
select tablename, rowsecurity from pg_tables where schemaname = 'public';
```

Expected: alle 5 Tabellen haben `rowsecurity = true`.

- [ ] **Step 6: Kein Code-Commit nötig.**

---

## Phase 3 — Domain-Types

### Task 7: Neue ScanOutcome-Domain-Types

**Files:**
- Create: `src/domain/scan/ScanOutcome.ts`

Das bestehende `DetectionResult` (domain/types.ts) ist an `ContentEntry.id` gekoppelt und passt nicht zum Pl@ntNet-Datenmodell. Wir führen parallel neue Typen ein. `DetectionResult` + `CandidateMatch` bleiben zunächst für Legacy-Code, werden aber von keinem neuen Code mehr konsumiert und in Task 31 entfernt.

- [ ] **Step 1: Create file**

```ts
/**
 * ScanOutcome — neues Domain-Modell für die reale Scan-Pipeline.
 * Ersetzt das legacy DetectionResult (das an ContentEntry.id gekoppelt war).
 */

export type ScanStatus =
  | 'ok'
  | 'low_quality'
  | 'category_unsupported'
  | 'no_match'
  | 'provider_error';

export type TriageCategory = 'plant' | 'insect' | 'disease' | 'unclear';
export type TriageQuality = 'acceptable' | 'blurry' | 'no_subject';

export interface TriageResult {
  category: TriageCategory;
  quality: TriageQuality;
  reason?: string;
}

export interface DetectionTaxonomy {
  family?: string;
  genus?: string;
  species?: string;
}

export interface DetectionCandidate {
  rank: number;                        // 1-based
  scientificName: string;
  commonNames: string[];               // best-effort, kann leer sein
  taxonomy?: DetectionTaxonomy;
  confidence: number;                  // 0..1
  matchedContentId?: string;           // gesetzt wenn scientificName in src/content matcht
}

export interface ScanOutcome {
  status: ScanStatus;
  triage?: TriageResult;
  candidates: DetectionCandidate[];
  provider?: string;                   // "plantnet" | "mock" | undefined (bei Fehler)
  reason?: string;                     // nutzerlesbare Begründung für low_quality / category_unsupported / no_match
}

export interface StoredScan {
  id: string;
  userId: string;
  createdAt: Date;
  imagePath: string;
  imageMeta?: { width?: number; height?: number; bytes?: number; mime?: string };
  outcome: ScanOutcome;
  matchedContentId?: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/domain/scan/ScanOutcome.ts
git commit -m "feat(domain): add ScanOutcome types for real pipeline"
```

---

## Phase 4 — Supabase-Client-Infrastruktur

### Task 8: Supabase-Typen generieren (vorgezogen)

**Files:**
- Create: `src/lib/supabase/types.ts`

- [ ] **Step 1: Generate types**

Run: `npx supabase gen types typescript --linked > src/lib/supabase/types.ts`

Expected: File contains `export type Database = { public: { Tables: { ... } } }` mit allen 5 Tabellen.

- [ ] **Step 2: Commit**

```bash
git add src/lib/supabase/types.ts
git commit -m "feat(supabase): generate DB types"
```

---

### Task 9: Browser-Client

**Files:**
- Create: `src/lib/supabase/client.ts`

- [ ] **Step 1: Create file**

```ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/supabase/client.ts
git commit -m "feat(supabase): browser client"
```

---

### Task 10: Server-Component-Client

**Files:**
- Create: `src/lib/supabase/server.ts`

- [ ] **Step 1: Create file**

```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component that cannot set cookies — middleware handles it.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/supabase/server.ts
git commit -m "feat(supabase): server-component client"
```

---

### Task 11: Service-Role-Client (server-only admin)

**Files:**
- Create: `src/lib/supabase/service-role.ts`

- [ ] **Step 1: Create file**

```ts
import 'server-only';
import { createClient as createSbClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Service-Role-Client — bypassed RLS.
 * NEVER import this in client or shared module.
 */
export function createServiceRoleClient() {
  return createSbClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/supabase/service-role.ts
git commit -m "feat(supabase): service-role client"
```

---

### Task 12: Middleware (Session-Refresh + Anonymous Sign-In)

**Files:**
- Create: `src/lib/supabase/middleware.ts`
- Create: `middleware.ts` (root)

- [ ] **Step 1: Create `src/lib/supabase/middleware.ts`**

```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './types';

/**
 * Routes, die eine Anonymous-Session brauchen.
 * Landing/Marketing-Seiten signen den User NICHT automatisch ein.
 */
const APP_PREFIXES = ['/app', '/scan', '/history', '/coach', '/onboarding', '/garden', '/premium', '/api/scans'];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const needsSession = APP_PREFIXES.some((p) => pathname.startsWith(p));

  if (!user && needsSession) {
    await supabase.auth.signInAnonymously();
  }

  return response;
}
```

- [ ] **Step 2: Create root `middleware.ts`**

```ts
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     * - public image extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

- [ ] **Step 3: Smoke-Test im Dev-Server**

Run: `npm run dev`, öffne http://localhost:3000/app im Browser.
Expected: Kein Crash. Dev-Tools → Application → Cookies: `sb-<project-ref>-auth-token` gesetzt.

Run: In Supabase Dashboard → Authentication → Users: neuer anonymer User erscheint.

Run: In SQL Editor:
```sql
select id, is_anonymous from public.profiles order by created_at desc limit 3;
```
Expected: Neue Row mit `is_anonymous = true` für den gerade angelegten User.

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/middleware.ts middleware.ts
git commit -m "feat(supabase): middleware with anonymous auth for app routes"
```

---

**REVIEW-CHECKPOINT 1:** Nach Phase 4. Stand: Supabase-Schema live, Middleware signed anonyme User ein, DB-Client-Infrastruktur steht. Vor Fortsetzung manueller Smoke-Test wie in Task 12 Step 3.

---

## Phase 5 — Provider-Schicht

### Task 13: ProviderError-Klasse

**Files:**
- Create: `src/lib/providers/errors.ts`

- [ ] **Step 1: Create file**

```ts
export type ProviderErrorKind =
  | 'not_configured'
  | 'timeout'
  | 'rate_limit'
  | 'upstream_error'
  | 'invalid_input';

export class ProviderError extends Error {
  constructor(
    public readonly kind: ProviderErrorKind,
    public readonly provider: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

export function isProviderError(err: unknown): err is ProviderError {
  return err instanceof ProviderError;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/providers/errors.ts
git commit -m "feat(providers): ProviderError base class"
```

---

### Task 14: Identification-Interface

**Files:**
- Create: `src/lib/providers/identification/types.ts`

- [ ] **Step 1: Create file**

```ts
import type { DetectionCandidate } from '@/domain/scan/ScanOutcome';

export interface IdentificationInput {
  imageUrl: string;
  locale: 'de' | 'en';
  maxCandidates: number;
}

export interface IdentificationResult {
  candidates: DetectionCandidate[];
  providerRaw: unknown;
}

export interface IdentificationProvider {
  readonly name: string;
  identify(input: IdentificationInput): Promise<IdentificationResult>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/providers/identification/types.ts
git commit -m "feat(providers): identification interface"
```

---

### Task 15: MockIdentificationProvider (deterministic, for tests)

**Files:**
- Create: `src/lib/providers/identification/mock.ts`
- Create: `tests/providers/mock-identification.test.ts`

- [ ] **Step 1: Write failing test**

`tests/providers/mock-identification.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { MockIdentificationProvider } from '@/lib/providers/identification/mock';

describe('MockIdentificationProvider', () => {
  it('returns candidates with decreasing confidence', async () => {
    const provider = new MockIdentificationProvider();
    const result = await provider.identify({
      imageUrl: 'https://example.com/fixture.jpg',
      locale: 'de',
      maxCandidates: 3,
    });

    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.candidates.length).toBeLessThanOrEqual(3);
    expect(result.candidates[0].rank).toBe(1);
    expect(result.candidates[0].confidence).toBeGreaterThan(0);

    for (let i = 1; i < result.candidates.length; i++) {
      expect(result.candidates[i].confidence).toBeLessThan(
        result.candidates[i - 1].confidence
      );
    }
  });

  it('returns deterministic results for same input', async () => {
    const provider = new MockIdentificationProvider();
    const a = await provider.identify({ imageUrl: 'x', locale: 'de', maxCandidates: 2 });
    const b = await provider.identify({ imageUrl: 'x', locale: 'de', maxCandidates: 2 });
    expect(a.candidates[0].scientificName).toBe(b.candidates[0].scientificName);
  });
});
```

- [ ] **Step 2: Run test — expect fail**

Run: `npm test -- tests/providers/mock-identification.test.ts`
Expected: FAIL („Cannot find module…").

- [ ] **Step 3: Create `src/lib/providers/identification/mock.ts`**

```ts
import { CONTENT_REGISTRY } from '@/content';
import type { DetectionCandidate } from '@/domain/scan/ScanOutcome';
import type {
  IdentificationProvider,
  IdentificationInput,
  IdentificationResult,
} from './types';

/**
 * Deterministic mock — picks CONTENT_REGISTRY entries based on URL hash.
 * Used in Vitest tests, never in production code paths.
 */
export class MockIdentificationProvider implements IdentificationProvider {
  readonly name = 'mock';

  async identify(input: IdentificationInput): Promise<IdentificationResult> {
    const plants = CONTENT_REGISTRY.filter((c) => c.category === 'PLANT' || c.category === 'WEED');
    if (plants.length === 0) {
      return { candidates: [], providerRaw: { note: 'empty registry' } };
    }

    const hash = simpleHash(input.imageUrl);
    const picked = plants[hash % plants.length];
    const others = plants.filter((c) => c.id !== picked.id);

    const candidates: DetectionCandidate[] = [];
    candidates.push({
      rank: 1,
      scientificName: picked.scientificName,
      commonNames: [picked.name, ...picked.aliases],
      confidence: 0.85,
      matchedContentId: picked.id,
    });

    const n = Math.max(0, Math.min(input.maxCandidates - 1, others.length, 2));
    for (let i = 0; i < n; i++) {
      const c = others[(hash + i + 1) % others.length];
      candidates.push({
        rank: i + 2,
        scientificName: c.scientificName,
        commonNames: [c.name, ...c.aliases],
        confidence: Math.max(0.05, 0.85 - 0.3 - i * 0.15),
        matchedContentId: c.id,
      });
    }

    return { candidates, providerRaw: { mock: true, seed: hash } };
  }
}

function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}
```

- [ ] **Step 4: Run test — expect pass**

Run: `npm test -- tests/providers/mock-identification.test.ts`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/providers/identification/mock.ts tests/providers/mock-identification.test.ts
git commit -m "feat(providers): MockIdentificationProvider with tests"
```

---

### Task 16: PlantNetProvider

**Files:**
- Create: `src/lib/providers/identification/plantnet.ts`
- Create: `tests/fixtures/plantnet-response.json`
- Create: `tests/providers/plantnet.test.ts`

Pl@ntNet API: `POST https://my-api.plantnet.org/v2/identify/{project}?api-key={key}` mit `multipart/form-data`-Body: Feld `images` (Bild-URL oder Binary), Feld `organs` (z.B. `leaf`, default akzeptiert `auto`).

Wir senden einen **URL-Referenz-Request** (Pl@ntNet akzeptiert `images` als URL-String via form-field `images`). Alternativ: Bild als Buffer runterladen + hochladen. Für A+B nutzen wir URL-Modus — einfacher.

- [ ] **Step 1: Create fixture `tests/fixtures/plantnet-response.json`**

Echtes (vereinfachtes) Response-Format — diese Struktur ist die Grundlage für den Parser:

```json
{
  "query": { "project": "weurope", "images": ["..."], "organs": ["auto"] },
  "results": [
    {
      "score": 0.8912,
      "species": {
        "scientificNameWithoutAuthor": "Solanum lycopersicum",
        "scientificNameAuthorship": "L.",
        "scientificName": "Solanum lycopersicum L.",
        "genus": { "scientificNameWithoutAuthor": "Solanum" },
        "family": { "scientificNameWithoutAuthor": "Solanaceae" },
        "commonNames": ["Tomate", "Garden Tomato"]
      },
      "gbif": { "id": "2930139" }
    },
    {
      "score": 0.0412,
      "species": {
        "scientificNameWithoutAuthor": "Solanum melongena",
        "scientificName": "Solanum melongena L.",
        "genus": { "scientificNameWithoutAuthor": "Solanum" },
        "family": { "scientificNameWithoutAuthor": "Solanaceae" },
        "commonNames": ["Aubergine"]
      }
    }
  ],
  "version": "2023-11-20 (7.3)",
  "remainingIdentificationRequests": 499
}
```

- [ ] **Step 2: Write failing test `tests/providers/plantnet.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PlantNetProvider } from '@/lib/providers/identification/plantnet';
import { ProviderError } from '@/lib/providers/errors';
import fixture from '../fixtures/plantnet-response.json';

describe('PlantNetProvider', () => {
  const fetchSpy = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchSpy);
    fetchSpy.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps PlantNet response to DetectionCandidates', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify(fixture), { status: 200 })
    );

    const provider = new PlantNetProvider({ apiKey: 'k', project: 'weurope' });
    const result = await provider.identify({
      imageUrl: 'https://example.com/tomato.jpg',
      locale: 'de',
      maxCandidates: 3,
    });

    expect(result.candidates).toHaveLength(2);
    expect(result.candidates[0]).toMatchObject({
      rank: 1,
      scientificName: 'Solanum lycopersicum',
      confidence: 0.8912,
      taxonomy: { family: 'Solanaceae', genus: 'Solanum' },
    });
    expect(result.candidates[0].commonNames).toContain('Tomate');
  });

  it('caps candidates at maxCandidates', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify(fixture), { status: 200 })
    );

    const provider = new PlantNetProvider({ apiKey: 'k', project: 'weurope' });
    const result = await provider.identify({
      imageUrl: 'https://example.com/x.jpg',
      locale: 'de',
      maxCandidates: 1,
    });

    expect(result.candidates).toHaveLength(1);
  });

  it('throws ProviderError on 401', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }));

    const provider = new PlantNetProvider({ apiKey: 'bad', project: 'weurope' });
    await expect(
      provider.identify({ imageUrl: 'https://x/y.jpg', locale: 'de', maxCandidates: 3 })
    ).rejects.toMatchObject({ kind: 'upstream_error', provider: 'plantnet' });
  });

  it('throws ProviderError on 429', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('Too Many Requests', { status: 429 }));

    const provider = new PlantNetProvider({ apiKey: 'k', project: 'weurope' });
    await expect(
      provider.identify({ imageUrl: 'https://x/y.jpg', locale: 'de', maxCandidates: 3 })
    ).rejects.toMatchObject({ kind: 'rate_limit' });
  });

  it('throws ProviderError on timeout', async () => {
    fetchSpy.mockImplementationOnce(() =>
      new Promise((_, reject) =>
        setTimeout(() => reject(Object.assign(new Error('abort'), { name: 'AbortError' })), 10)
      )
    );

    const provider = new PlantNetProvider({ apiKey: 'k', project: 'weurope', timeoutMs: 5 });
    await expect(
      provider.identify({ imageUrl: 'https://x/y.jpg', locale: 'de', maxCandidates: 3 })
    ).rejects.toMatchObject({ kind: 'timeout' });
  });

  it('throws not_configured when apiKey missing', async () => {
    const provider = new PlantNetProvider({ apiKey: '', project: 'weurope' });
    await expect(
      provider.identify({ imageUrl: 'https://x/y.jpg', locale: 'de', maxCandidates: 3 })
    ).rejects.toMatchObject({ kind: 'not_configured' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run test — expect fail**

Run: `npm test -- tests/providers/plantnet.test.ts`
Expected: FAIL.

- [ ] **Step 4: Create `src/lib/providers/identification/plantnet.ts`**

```ts
import { CONTENT_REGISTRY } from '@/content';
import { ProviderError } from '@/lib/providers/errors';
import type { DetectionCandidate } from '@/domain/scan/ScanOutcome';
import type {
  IdentificationInput,
  IdentificationProvider,
  IdentificationResult,
} from './types';

interface PlantNetOpts {
  apiKey: string;
  project: string;
  timeoutMs?: number;
}

interface PlantNetResponse {
  results: Array<{
    score: number;
    species: {
      scientificNameWithoutAuthor: string;
      genus?: { scientificNameWithoutAuthor?: string };
      family?: { scientificNameWithoutAuthor?: string };
      commonNames?: string[];
    };
  }>;
}

// Lookup: scientific name (lowercase) → content.id
const CONTENT_BY_SCIENTIFIC_NAME = new Map(
  CONTENT_REGISTRY.map((c) => [c.scientificName.toLowerCase(), c.id])
);

export class PlantNetProvider implements IdentificationProvider {
  readonly name = 'plantnet';

  constructor(private readonly opts: PlantNetOpts) {}

  async identify(input: IdentificationInput): Promise<IdentificationResult> {
    if (!this.opts.apiKey) {
      throw new ProviderError('not_configured', this.name, 'PLANTNET_API_KEY not set');
    }

    const url = new URL(`https://my-api.plantnet.org/v2/identify/${this.opts.project}`);
    url.searchParams.set('api-key', this.opts.apiKey);
    url.searchParams.set('images', input.imageUrl);
    url.searchParams.set('organs', 'auto');
    url.searchParams.set('lang', input.locale);

    const controller = new AbortController();
    const timeoutMs = this.opts.timeoutMs ?? 8000;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let res: Response;
    try {
      res = await fetch(url.toString(), { method: 'GET', signal: controller.signal });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new ProviderError('timeout', this.name, `plantnet timeout ${timeoutMs}ms`, err);
      }
      throw new ProviderError('upstream_error', this.name, 'network error', err);
    } finally {
      clearTimeout(timer);
    }

    if (res.status === 429) {
      throw new ProviderError('rate_limit', this.name, 'plantnet rate limit');
    }
    if (!res.ok) {
      throw new ProviderError(
        'upstream_error',
        this.name,
        `plantnet http ${res.status}`
      );
    }

    let payload: PlantNetResponse;
    try {
      payload = (await res.json()) as PlantNetResponse;
    } catch (err) {
      throw new ProviderError('upstream_error', this.name, 'invalid json', err);
    }

    const candidates: DetectionCandidate[] = (payload.results ?? [])
      .slice(0, input.maxCandidates)
      .map((r, i) => {
        const sciName = r.species.scientificNameWithoutAuthor;
        return {
          rank: i + 1,
          scientificName: sciName,
          commonNames: r.species.commonNames ?? [],
          taxonomy: {
            family: r.species.family?.scientificNameWithoutAuthor,
            genus: r.species.genus?.scientificNameWithoutAuthor,
            species: sciName,
          },
          confidence: r.score,
          matchedContentId: CONTENT_BY_SCIENTIFIC_NAME.get(sciName.toLowerCase()),
        };
      });

    return { candidates, providerRaw: payload };
  }
}
```

- [ ] **Step 5: Run test — expect pass**

Run: `npm test -- tests/providers/plantnet.test.ts`
Expected: 6 passed.

- [ ] **Step 6: Commit**

```bash
git add src/lib/providers/identification/plantnet.ts tests/providers/plantnet.test.ts tests/fixtures/plantnet-response.json
git commit -m "feat(providers): PlantNetProvider with URL-identify + error mapping"
```

---

### Task 17: Identification-Factory

**Files:**
- Create: `src/lib/providers/identification/factory.ts`

- [ ] **Step 1: Create file**

```ts
import { PlantNetProvider } from './plantnet';
import { MockIdentificationProvider } from './mock';
import type { IdentificationProvider } from './types';

export function getIdentificationProvider(): IdentificationProvider {
  const forceMock = process.env.IDENTIFICATION_PROVIDER === 'mock';
  if (forceMock || !process.env.PLANTNET_API_KEY) {
    // Used by tests and local dev without API key.
    // In production an empty key causes PlantNetProvider to throw 'not_configured' — which is fine,
    // because the UI shows 'provider_error'. BUT we want the mock only in explicit test mode.
    if (forceMock) return new MockIdentificationProvider();
    return new PlantNetProvider({
      apiKey: '',
      project: process.env.PLANTNET_PROJECT ?? 'weurope',
    });
  }

  return new PlantNetProvider({
    apiKey: process.env.PLANTNET_API_KEY,
    project: process.env.PLANTNET_PROJECT ?? 'weurope',
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/providers/identification/factory.ts
git commit -m "feat(providers): identification factory"
```

---

### Task 18: Triage-Interface

**Files:**
- Create: `src/lib/providers/triage/types.ts`

- [ ] **Step 1: Create file**

```ts
import type { TriageResult } from '@/domain/scan/ScanOutcome';

export interface TriageInput {
  imageUrl: string;
  locale: 'de' | 'en';
}

export interface TriageProvider {
  readonly name: string;
  classify(input: TriageInput): Promise<TriageResult>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/providers/triage/types.ts
git commit -m "feat(providers): triage interface"
```

---

### Task 19: ClaudeVisionTriageProvider

**Files:**
- Create: `src/lib/providers/triage/claudeVision.ts`
- Create: `tests/fixtures/claude-triage-response.json`
- Create: `tests/providers/claudeVision.test.ts`

Wir instruieren Claude so, dass es JSON mit `{ category, quality, reason }` zurückgibt. Claude Haiku 4.5 ist für diese simple Klassifikation ausreichend und kostengünstig (~0,003 €/Bild bei 1600px-Komprimierung).

- [ ] **Step 1: Create fixture `tests/fixtures/claude-triage-response.json`**

```json
{
  "id": "msg_01",
  "type": "message",
  "role": "assistant",
  "model": "claude-haiku-4-5-20251001",
  "content": [
    {
      "type": "text",
      "text": "{\"category\":\"plant\",\"quality\":\"acceptable\",\"reason\":null}"
    }
  ],
  "stop_reason": "end_turn"
}
```

- [ ] **Step 2: Write failing test `tests/providers/claudeVision.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClaudeVisionTriageProvider } from '@/lib/providers/triage/claudeVision';

// vi.mock is hoisted — use vi.hoisted() so the mock factory can reference the spy.
const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }));

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = { create: createMock };
    },
  };
});

describe('ClaudeVisionTriageProvider', () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it('parses a valid JSON response for a plant', async () => {
    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: '{"category":"plant","quality":"acceptable"}' }],
    });

    const provider = new ClaudeVisionTriageProvider({ apiKey: 'k' });
    const result = await provider.classify({
      imageUrl: 'https://example.com/plant.jpg',
      locale: 'de',
    });

    expect(result.category).toBe('plant');
    expect(result.quality).toBe('acceptable');
  });

  it('maps blurry-quality result', async () => {
    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: '{"category":"unclear","quality":"blurry","reason":"Bild ist unscharf"}' }],
    });

    const provider = new ClaudeVisionTriageProvider({ apiKey: 'k' });
    const result = await provider.classify({
      imageUrl: 'https://example.com/blurry.jpg',
      locale: 'de',
    });

    expect(result.quality).toBe('blurry');
    expect(result.reason).toBe('Bild ist unscharf');
  });

  it('throws not_configured when apiKey missing', async () => {
    const provider = new ClaudeVisionTriageProvider({ apiKey: '' });
    await expect(
      provider.classify({ imageUrl: 'x', locale: 'de' })
    ).rejects.toMatchObject({ kind: 'not_configured' });
  });

  it('throws upstream_error on non-JSON response', async () => {
    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'I think this is a rose.' }],
    });

    const provider = new ClaudeVisionTriageProvider({ apiKey: 'k' });
    await expect(
      provider.classify({ imageUrl: 'x', locale: 'de' })
    ).rejects.toMatchObject({ kind: 'upstream_error' });
  });
});
```

- [ ] **Step 3: Run test — expect fail**

Run: `npm test -- tests/providers/claudeVision.test.ts`
Expected: FAIL.

- [ ] **Step 4: Create `src/lib/providers/triage/claudeVision.ts`**

```ts
import Anthropic from '@anthropic-ai/sdk';
import { ProviderError } from '@/lib/providers/errors';
import type {
  TriageCategory,
  TriageQuality,
  TriageResult,
} from '@/domain/scan/ScanOutcome';
import type { TriageInput, TriageProvider } from './types';

const SYSTEM_PROMPT = `Du klassifizierst Fotos für eine Garten-App. Antworte NUR mit einem gültigen JSON-Objekt, kein Fließtext davor oder danach.

Schema:
{
  "category": "plant" | "insect" | "disease" | "unclear",
  "quality": "acceptable" | "blurry" | "no_subject",
  "reason": string | null
}

Regeln:
- "plant" = ganze Pflanze, Blatt, Blüte, Frucht, Stängel — auch Unkräuter.
- "insect" = Insekten, Spinnen, Schnecken, sonstige Tiere.
- "disease" = Krankheitssymptom, Schaden, Belag, Verfärbung ohne erkennbare Pflanzenart.
- "unclear" = nichts von obigem eindeutig erkennbar.
- "quality": "blurry" bei Unschärfe; "no_subject" bei keinem erkennbaren Motiv; sonst "acceptable".
- "reason": kurze deutsche Begründung bei quality != "acceptable" oder category = "unclear", sonst null.`;

const ALLOWED_CATEGORIES: readonly TriageCategory[] = ['plant', 'insect', 'disease', 'unclear'];
const ALLOWED_QUALITY: readonly TriageQuality[] = ['acceptable', 'blurry', 'no_subject'];

interface Opts {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
}

export class ClaudeVisionTriageProvider implements TriageProvider {
  readonly name = 'claude-vision';

  constructor(private readonly opts: Opts) {}

  async classify(input: TriageInput): Promise<TriageResult> {
    if (!this.opts.apiKey) {
      throw new ProviderError('not_configured', this.name, 'ANTHROPIC_API_KEY not set');
    }

    const client = new Anthropic({
      apiKey: this.opts.apiKey,
      timeout: this.opts.timeoutMs ?? 6000,
    });

    let msg;
    try {
      msg = await client.messages.create({
        model: this.opts.model ?? 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'url', url: input.imageUrl },
              },
              {
                type: 'text',
                text: 'Klassifiziere dieses Foto.',
              },
            ],
          },
        ],
      });
    } catch (err) {
      // @ts-expect-error SDK error shape
      const status = err?.status;
      if (status === 429) {
        throw new ProviderError('rate_limit', this.name, 'anthropic rate limit', err);
      }
      throw new ProviderError('upstream_error', this.name, 'anthropic call failed', err);
    }

    const textBlock = msg.content.find((c: { type: string }) => c.type === 'text') as
      | { type: 'text'; text: string }
      | undefined;
    if (!textBlock) {
      throw new ProviderError('upstream_error', this.name, 'no text block in response');
    }

    let parsed: { category?: string; quality?: string; reason?: string | null };
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      throw new ProviderError('upstream_error', this.name, `non-JSON response: ${textBlock.text.slice(0, 80)}`);
    }

    const category = ALLOWED_CATEGORIES.includes(parsed.category as TriageCategory)
      ? (parsed.category as TriageCategory)
      : 'unclear';
    const quality = ALLOWED_QUALITY.includes(parsed.quality as TriageQuality)
      ? (parsed.quality as TriageQuality)
      : 'acceptable';

    return {
      category,
      quality,
      reason: parsed.reason ?? undefined,
    };
  }
}
```

- [ ] **Step 5: Run test — expect pass**

Run: `npm test -- tests/providers/claudeVision.test.ts`
Expected: 4 passed.

- [ ] **Step 6: Commit**

```bash
git add src/lib/providers/triage/claudeVision.ts tests/providers/claudeVision.test.ts tests/fixtures/claude-triage-response.json
git commit -m "feat(providers): ClaudeVisionTriageProvider with tests"
```

---

## Phase 6 — Services

### Task 20: imageStorageService

**Files:**
- Create: `src/lib/services/imageStorageService.ts`

- [ ] **Step 1: Create file**

```ts
import 'server-only';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

const BUCKET = 'scan-images';

export interface UploadedImage {
  path: string;                  // "{userId}/{scanId}.jpg"
  bytes: number;
  mime: string;
}

export async function uploadScanImage(params: {
  userId: string;
  scanId: string;
  buffer: Buffer;
  mime: string;
}): Promise<UploadedImage> {
  const supabase = createServiceRoleClient();
  const path = `${params.userId}/${params.scanId}.jpg`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, params.buffer, {
      contentType: params.mime,
      upsert: false,
    });

  if (error) {
    throw new Error(`storage upload failed: ${error.message}`);
  }

  return { path, bytes: params.buffer.byteLength, mime: params.mime };
}

export async function createSignedReadUrl(path: string, expiresInSeconds: number): Promise<string> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data) {
    throw new Error(`signed url failed: ${error?.message ?? 'unknown'}`);
  }
  return data.signedUrl;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/services/imageStorageService.ts
git commit -m "feat(services): imageStorageService"
```

---

### Task 21: usageCounterService + Tests

**Files:**
- Create: `src/lib/services/usageCounterService.ts`
- Create: `tests/services/usageCounterService.test.ts`

- [ ] **Step 1: Write failing test `tests/services/usageCounterService.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { currentYearMonth, incrementScanUsage } from '@/lib/services/usageCounterService';

// vi.mock is hoisted — use vi.hoisted() so the mock factory can reference the spy.
const { rpcMock } = vi.hoisted(() => ({ rpcMock: vi.fn() }));

vi.mock('@/lib/supabase/service-role', () => ({
  createServiceRoleClient: () => ({
    rpc: rpcMock,
  }),
}));

describe('usageCounterService', () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it('currentYearMonth returns YYYY-MM', () => {
    expect(currentYearMonth(new Date('2026-04-21T10:00:00Z'))).toBe('2026-04');
    expect(currentYearMonth(new Date('2026-12-31T23:59:00Z'))).toBe('2026-12');
    expect(currentYearMonth(new Date('2027-01-01T00:00:00Z'))).toBe('2027-01');
  });

  it('incrementScanUsage calls rpc with user + month', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: null });
    await incrementScanUsage('user-1', new Date('2026-04-21T10:00:00Z'));
    expect(rpcMock).toHaveBeenCalledWith('increment_scan_usage', {
      p_user_id: 'user-1',
      p_year_month: '2026-04',
    });
  });
});
```

- [ ] **Step 2: Run test — expect fail**

Run: `npm test -- tests/services/usageCounterService.test.ts`
Expected: FAIL.

- [ ] **Step 3: Create `src/lib/services/usageCounterService.ts`**

```ts
import 'server-only';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

export function currentYearMonth(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export async function incrementScanUsage(userId: string, now: Date = new Date()): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.rpc('increment_scan_usage', {
    p_user_id: userId,
    p_year_month: currentYearMonth(now),
  });
  if (error) {
    throw new Error(`increment_scan_usage failed: ${error.message}`);
  }
}
```

- [ ] **Step 4: Run test — expect pass**

Run: `npm test -- tests/services/usageCounterService.test.ts`
Expected: 2 passed.

- [ ] **Step 5: Add SQL function migration**

Create new migration file `supabase/migrations/20260421121000_increment_scan_usage.sql`:

```sql
create or replace function public.increment_scan_usage(
  p_user_id uuid,
  p_year_month text
) returns void
language plpgsql
security definer
as $$
begin
  insert into public.scan_usage (user_id, year_month, scans_used)
  values (p_user_id, p_year_month, 1)
  on conflict (user_id, year_month)
  do update set scans_used = public.scan_usage.scans_used + 1;
end;
$$;
```

- [ ] **Step 6: Push migration**

Run: `npx supabase db push`
Expected: Migration applied.

- [ ] **Step 7: Commit**

```bash
git add src/lib/services/usageCounterService.ts tests/services/usageCounterService.test.ts supabase/migrations/20260421121000_increment_scan_usage.sql
git commit -m "feat(services): usageCounterService + increment_scan_usage RPC"
```

---

### Task 22: scanRepository

**Files:**
- Create: `src/lib/services/scanRepository.ts`

- [ ] **Step 1: Create file**

```ts
import 'server-only';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import type { ScanOutcome, StoredScan } from '@/domain/scan/ScanOutcome';

export interface SaveScanInput {
  userId: string;
  scanId: string;
  imagePath: string;
  imageMeta: { width?: number; height?: number; bytes?: number; mime?: string };
  outcome: ScanOutcome;
}

export async function saveScan(input: SaveScanInput): Promise<void> {
  const supabase = createServiceRoleClient();

  const { error: scanErr } = await supabase.from('scans').insert({
    id: input.scanId,
    user_id: input.userId,
    image_path: input.imagePath,
    image_meta: input.imageMeta,
    triage_category: input.outcome.triage?.category,
    triage_quality: input.outcome.triage?.quality,
    triage_reason: input.outcome.triage?.reason ?? null,
    provider: input.outcome.provider ?? null,
    provider_raw: (input.outcome.candidates.length > 0 ? { candidates: input.outcome.candidates } : null) as unknown as Record<string, unknown> | null,
    status: input.outcome.status,
    matched_content_id: input.outcome.candidates[0]?.matchedContentId ?? null,
  });
  if (scanErr) throw new Error(`saveScan: ${scanErr.message}`);

  if (input.outcome.candidates.length > 0) {
    const rows = input.outcome.candidates.map((c) => ({
      scan_id: input.scanId,
      rank: c.rank,
      scientific_name: c.scientificName,
      common_names: c.commonNames,
      taxonomy: c.taxonomy ?? null,
      confidence: c.confidence,
      content_id: c.matchedContentId ?? null,
    }));
    const { error: candErr } = await supabase.from('scan_candidates').insert(rows);
    if (candErr) throw new Error(`saveScan candidates: ${candErr.message}`);
  }
}

export async function getScanById(scanId: string, userId: string): Promise<StoredScan | null> {
  const supabase = createServiceRoleClient();

  const { data: scan, error: scanErr } = await supabase
    .from('scans')
    .select('*')
    .eq('id', scanId)
    .eq('user_id', userId)
    .maybeSingle();

  if (scanErr) throw new Error(`getScanById: ${scanErr.message}`);
  if (!scan) return null;

  const { data: cands, error: candErr } = await supabase
    .from('scan_candidates')
    .select('*')
    .eq('scan_id', scanId)
    .order('rank', { ascending: true });
  if (candErr) throw new Error(`getScanById candidates: ${candErr.message}`);

  return {
    id: scan.id,
    userId: scan.user_id,
    createdAt: new Date(scan.created_at),
    imagePath: scan.image_path,
    imageMeta: (scan.image_meta ?? undefined) as StoredScan['imageMeta'],
    matchedContentId: scan.matched_content_id ?? undefined,
    outcome: {
      status: scan.status as ScanOutcome['status'],
      provider: scan.provider ?? undefined,
      triage: scan.triage_category
        ? {
            category: scan.triage_category as NonNullable<ScanOutcome['triage']>['category'],
            quality: (scan.triage_quality ?? 'acceptable') as NonNullable<ScanOutcome['triage']>['quality'],
            reason: scan.triage_reason ?? undefined,
          }
        : undefined,
      reason: scan.triage_reason ?? undefined,
      candidates: (cands ?? []).map((c) => ({
        rank: c.rank,
        scientificName: c.scientific_name,
        commonNames: c.common_names,
        taxonomy: (c.taxonomy ?? undefined) as { family?: string; genus?: string; species?: string } | undefined,
        confidence: Number(c.confidence),
        matchedContentId: c.content_id ?? undefined,
      })),
    },
  };
}

export async function listScansForUser(userId: string, limit = 50): Promise<StoredScan[]> {
  const supabase = createServiceRoleClient();

  const { data: scans, error } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`listScansForUser: ${error.message}`);
  if (!scans || scans.length === 0) return [];

  // Für Listen brauchen wir nicht alle Kandidaten eines jeden Scans — nur den Top-Kandidaten
  // (gespeichert als scan.matched_content_id + rank-1-Kandidat).
  const scanIds = scans.map((s) => s.id);
  const { data: topCands } = await supabase
    .from('scan_candidates')
    .select('*')
    .in('scan_id', scanIds)
    .eq('rank', 1);

  const topByScan = new Map((topCands ?? []).map((c) => [c.scan_id, c]));

  return scans.map((scan) => {
    const topCand = topByScan.get(scan.id);
    return {
      id: scan.id,
      userId: scan.user_id,
      createdAt: new Date(scan.created_at),
      imagePath: scan.image_path,
      imageMeta: (scan.image_meta ?? undefined) as StoredScan['imageMeta'],
      matchedContentId: scan.matched_content_id ?? undefined,
      outcome: {
        status: scan.status as ScanOutcome['status'],
        provider: scan.provider ?? undefined,
        candidates: topCand
          ? [{
              rank: 1,
              scientificName: topCand.scientific_name,
              commonNames: topCand.common_names,
              taxonomy: (topCand.taxonomy ?? undefined) as { family?: string; genus?: string; species?: string } | undefined,
              confidence: Number(topCand.confidence),
              matchedContentId: topCand.content_id ?? undefined,
            }]
          : [],
      },
    };
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/services/scanRepository.ts
git commit -m "feat(services): scanRepository save/get/list"
```

---

### Task 23: historyService

**Files:**
- Create: `src/lib/services/historyService.ts`

Thin wrapper um `scanRepository`, liefert UI-freundliche Views inklusive Content-Auflösung.

- [ ] **Step 1: Create file**

```ts
import 'server-only';
import { getContentById } from '@/content';
import { listScansForUser, getScanById } from './scanRepository';
import type { ContentEntry } from '@/domain/types';
import type { StoredScan } from '@/domain/scan/ScanOutcome';

export interface HistoryScanView {
  scan: StoredScan;
  matchedEntry?: ContentEntry;
}

export async function listHistory(userId: string, limit = 50): Promise<HistoryScanView[]> {
  const scans = await listScansForUser(userId, limit);
  return scans.map((s) => ({
    scan: s,
    matchedEntry: s.matchedContentId ? getContentById(s.matchedContentId) ?? undefined : undefined,
  }));
}

export async function getHistoryItem(userId: string, scanId: string): Promise<HistoryScanView | null> {
  const scan = await getScanById(scanId, userId);
  if (!scan) return null;
  return {
    scan,
    matchedEntry: scan.matchedContentId ? getContentById(scan.matchedContentId) ?? undefined : undefined,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/services/historyService.ts
git commit -m "feat(services): historyService"
```

---

### Task 24: profileRepository

**Files:**
- Create: `src/lib/services/profileRepository.ts`

- [ ] **Step 1: Create file**

```ts
import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { GardenProfile } from '@/domain/types';

type ProfileRow = {
  id: string;
  created_at: string;
  is_anonymous: boolean;
  email: string | null;
  garden_type: string | null;
  experience: string | null;
  interests: string[];
  pets_children: string[];
  solution_preference: string | null;
  completed_onboarding_at: string | null;
};

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(`getProfile: ${error.message}`);
  return (data ?? null) as ProfileRow | null;
}

export async function updateProfile(userId: string, patch: Partial<GardenProfile>): Promise<void> {
  const supabase = await createClient();
  const row: Partial<ProfileRow> = {};

  // Map GardenProfile → ProfileRow columns.
  // Felder, die GardenProfile kennt aber profiles-Row nicht hat (postalCode, name etc.),
  // werden in A+B ignoriert — können in späterer Migration ergänzt werden.
  if (patch.experience) row.experience = patch.experience;
  if (patch.solutionStyle) {
    row.solution_preference =
      patch.solutionStyle === 'ORGANIC' ? 'organic'
      : patch.solutionStyle === 'BALANCED' ? 'mixed'
      : 'fast_acting';
  }
  if (patch.useCases) row.interests = patch.useCases.map((u) => u.toLowerCase());
  if (patch.areas) row.garden_type = patch.areas[0]?.toLowerCase() ?? null;

  const pets: string[] = [];
  if (patch.hasChildren) pets.push('children');
  if (patch.hasPets) pets.push('pets');
  if (pets.length > 0 || patch.hasChildren === false || patch.hasPets === false) {
    row.pets_children = pets;
  }

  if (patch.onboardingCompletedAt) row.completed_onboarding_at = patch.onboardingCompletedAt.toISOString();

  const { error } = await supabase.from('profiles').update(row).eq('id', userId);
  if (error) throw new Error(`updateProfile: ${error.message}`);
}

export async function markOnboardingComplete(userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ completed_onboarding_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw new Error(`markOnboardingComplete: ${error.message}`);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/services/profileRepository.ts
git commit -m "feat(services): profileRepository"
```

---

### Task 25: analyzeImageService + Tests

**Files:**
- Create: `src/lib/services/analyzeImageService.ts`
- Create: `tests/services/analyzeImageService.test.ts`

- [ ] **Step 1: Write failing test `tests/services/analyzeImageService.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest';
import { analyzeImage } from '@/lib/services/analyzeImageService';
import { ProviderError } from '@/lib/providers/errors';
import type { IdentificationProvider } from '@/lib/providers/identification/types';
import type { TriageProvider } from '@/lib/providers/triage/types';
import type { TriageResult } from '@/domain/scan/ScanOutcome';

function makeTriage(result: TriageResult): TriageProvider {
  return { name: 'triage', classify: vi.fn().mockResolvedValue(result) };
}

function makeId(result: Awaited<ReturnType<IdentificationProvider['identify']>> | Error): IdentificationProvider {
  return {
    name: 'id',
    identify: vi.fn().mockImplementation(async () => {
      if (result instanceof Error) throw result;
      return result;
    }),
  };
}

describe('analyzeImageService', () => {
  it('ok: plant + acceptable quality + candidates present', async () => {
    const triage = makeTriage({ category: 'plant', quality: 'acceptable' });
    const id = makeId({
      candidates: [{ rank: 1, scientificName: 'Rosa', commonNames: [], confidence: 0.8 }],
      providerRaw: {},
    });

    const outcome = await analyzeImage({ imageUrl: 'u', triage, identification: id });

    expect(outcome.status).toBe('ok');
    expect(outcome.candidates).toHaveLength(1);
    expect(outcome.provider).toBe('id');
    expect(outcome.triage?.category).toBe('plant');
  });

  it('low_quality: triage flags blurry', async () => {
    const triage = makeTriage({ category: 'plant', quality: 'blurry', reason: 'zu unscharf' });
    const id = makeId({ candidates: [], providerRaw: null });

    const outcome = await analyzeImage({ imageUrl: 'u', triage, identification: id });

    expect(outcome.status).toBe('low_quality');
    expect(outcome.candidates).toEqual([]);
    expect(id.identify).not.toHaveBeenCalled();
  });

  it('category_unsupported: triage says insect', async () => {
    const triage = makeTriage({ category: 'insect', quality: 'acceptable' });
    const id = makeId({ candidates: [], providerRaw: null });

    const outcome = await analyzeImage({ imageUrl: 'u', triage, identification: id });

    expect(outcome.status).toBe('category_unsupported');
    expect(outcome.triage?.category).toBe('insect');
    expect(id.identify).not.toHaveBeenCalled();
  });

  it('no_match: empty candidates', async () => {
    const triage = makeTriage({ category: 'plant', quality: 'acceptable' });
    const id = makeId({ candidates: [], providerRaw: {} });

    const outcome = await analyzeImage({ imageUrl: 'u', triage, identification: id });

    expect(outcome.status).toBe('no_match');
  });

  it('no_match: max confidence below 0.25', async () => {
    const triage = makeTriage({ category: 'plant', quality: 'acceptable' });
    const id = makeId({
      candidates: [{ rank: 1, scientificName: 'Rosa', commonNames: [], confidence: 0.2 }],
      providerRaw: {},
    });

    const outcome = await analyzeImage({ imageUrl: 'u', triage, identification: id });

    expect(outcome.status).toBe('no_match');
    expect(outcome.candidates).toHaveLength(0);
  });

  it('provider_error: triage throws not_configured', async () => {
    const triage: TriageProvider = {
      name: 't',
      classify: vi.fn().mockRejectedValue(new ProviderError('not_configured', 't', 'no key')),
    };
    const id = makeId({ candidates: [], providerRaw: null });

    const outcome = await analyzeImage({ imageUrl: 'u', triage, identification: id });

    expect(outcome.status).toBe('provider_error');
    expect(id.identify).not.toHaveBeenCalled();
  });

  it('provider_error: identification throws', async () => {
    const triage = makeTriage({ category: 'plant', quality: 'acceptable' });
    const id = makeId(new ProviderError('timeout', 'plantnet', 'too slow'));

    const outcome = await analyzeImage({ imageUrl: 'u', triage, identification: id });

    expect(outcome.status).toBe('provider_error');
    expect(outcome.reason).toContain('timeout');
  });
});
```

- [ ] **Step 2: Run test — expect fail**

Run: `npm test -- tests/services/analyzeImageService.test.ts`
Expected: FAIL.

- [ ] **Step 3: Create `src/lib/services/analyzeImageService.ts`**

```ts
import { ProviderError } from '@/lib/providers/errors';
import type { IdentificationProvider } from '@/lib/providers/identification/types';
import type { TriageProvider } from '@/lib/providers/triage/types';
import type { ScanOutcome } from '@/domain/scan/ScanOutcome';

const MIN_CONFIDENCE = 0.25;

export interface AnalyzeImageInput {
  imageUrl: string;
  triage: TriageProvider;
  identification: IdentificationProvider;
  locale?: 'de' | 'en';
  maxCandidates?: number;
}

export async function analyzeImage(input: AnalyzeImageInput): Promise<ScanOutcome> {
  const locale = input.locale ?? 'de';
  const maxCandidates = input.maxCandidates ?? 3;

  // Phase 1: Triage
  let triage;
  try {
    triage = await input.triage.classify({ imageUrl: input.imageUrl, locale });
  } catch (err) {
    return providerErrorOutcome(err, input.triage.name);
  }

  if (triage.quality !== 'acceptable') {
    return {
      status: 'low_quality',
      triage,
      candidates: [],
      reason: triage.reason,
    };
  }

  if (triage.category !== 'plant') {
    return {
      status: 'category_unsupported',
      triage,
      candidates: [],
      reason: triage.reason,
    };
  }

  // Phase 2: Identification
  let ident;
  try {
    ident = await input.identification.identify({
      imageUrl: input.imageUrl,
      locale,
      maxCandidates,
    });
  } catch (err) {
    return providerErrorOutcome(err, input.identification.name, triage);
  }

  const qualified = ident.candidates.filter((c) => c.confidence >= MIN_CONFIDENCE);
  if (qualified.length === 0) {
    return {
      status: 'no_match',
      triage,
      candidates: [],
      provider: input.identification.name,
    };
  }

  return {
    status: 'ok',
    triage,
    candidates: qualified,
    provider: input.identification.name,
  };
}

function providerErrorOutcome(
  err: unknown,
  provider: string,
  triage?: ScanOutcome['triage']
): ScanOutcome {
  const kind = err instanceof ProviderError ? err.kind : 'upstream_error';
  const message = err instanceof Error ? err.message : String(err);
  return {
    status: 'provider_error',
    triage,
    candidates: [],
    provider,
    reason: `${kind}: ${message}`,
  };
}
```

- [ ] **Step 4: Run test — expect pass**

Run: `npm test -- tests/services/analyzeImageService.test.ts`
Expected: 7 passed.

- [ ] **Step 5: Full test suite**

Run: `npm test`
Expected: alle Tests grün — Sanity (1) + Mock-Identification (2) + PlantNet (6) + ClaudeVision (4) + usageCounter (2) + analyzeImage (7) = 22 passed.

- [ ] **Step 6: Commit**

```bash
git add src/lib/services/analyzeImageService.ts tests/services/analyzeImageService.test.ts
git commit -m "feat(services): analyzeImageService orchestration with tests"
```

---

**REVIEW-CHECKPOINT 2:** Nach Phase 6. Stand: Provider + Services vollständig, alle Unit-Tests grün. Vor Fortsetzung: Testlauf prüfen.

---

## Phase 7 — API-Routes

### Task 26: POST/GET `/api/scans`

**Files:**
- Create: `src/app/api/scans/route.ts`

- [ ] **Step 1: Create file**

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import { analyzeImage } from '@/lib/services/analyzeImageService';
import { saveScan } from '@/lib/services/scanRepository';
import { listHistory } from '@/lib/services/historyService';
import { uploadScanImage, createSignedReadUrl } from '@/lib/services/imageStorageService';
import { incrementScanUsage } from '@/lib/services/usageCounterService';
import { getIdentificationProvider } from '@/lib/providers/identification/factory';
import { ClaudeVisionTriageProvider } from '@/lib/providers/triage/claudeVision';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const history = await listHistory(user.id);
  return NextResponse.json({ items: history });
}

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('image');
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'no image' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'image too large' }, { status: 413 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'invalid mime' }, { status: 415 });
  }

  const scanId = randomUUID();
  const buffer = Buffer.from(await file.arrayBuffer());

  const uploaded = await uploadScanImage({
    userId: user.id,
    scanId,
    buffer,
    mime: file.type,
  });

  const signedUrl = await createSignedReadUrl(uploaded.path, 60 * 60 * 24);

  const triage = new ClaudeVisionTriageProvider({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' });
  const identification = getIdentificationProvider();

  const outcome = await analyzeImage({
    imageUrl: signedUrl,
    triage,
    identification,
  });

  await saveScan({
    userId: user.id,
    scanId,
    imagePath: uploaded.path,
    imageMeta: { bytes: uploaded.bytes, mime: uploaded.mime },
    outcome,
  });
  await incrementScanUsage(user.id).catch((e) => console.error('usage increment failed', e));

  return NextResponse.json({ scanId, status: outcome.status });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/scans/route.ts
git commit -m "feat(api): POST/GET /api/scans"
```

---

### Task 27: GET `/api/scans/[id]`

**Files:**
- Create: `src/app/api/scans/[id]/route.ts`

- [ ] **Step 1: Create file**

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getHistoryItem } from '@/lib/services/historyService';

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const item = await getHistoryItem(user.id, id);
  if (!item) return NextResponse.json({ error: 'not found' }, { status: 404 });

  return NextResponse.json(item);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/scans/[id]/route.ts
git commit -m "feat(api): GET /api/scans/[id]"
```

---

## Phase 8 — Frontend-Refactors

### Task 28: Client-seitige Bildkompression

**Files:**
- Create: `src/lib/image/compress.ts`

- [ ] **Step 1: Create file**

```ts
/**
 * Komprimiert eine Image-File auf max. 1600px längere Kante, JPEG quality 0.85.
 * Läuft im Browser via Canvas.
 */
export async function compressImageFile(file: File, maxEdge = 1600, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file);

  const ratio = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const targetW = Math.round(bitmap.width * ratio);
  const targetH = Math.round(bitmap.height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context unavailable');
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('canvas.toBlob failed'))),
      'image/jpeg',
      quality
    );
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/image/compress.ts
git commit -m "feat(image): client-side canvas compression"
```

---

### Task 29: `/scan/new` — echter File-Input

**Files:**
- Modify: `src/app/scan/new/page.tsx` (komplette Neufassung)

- [ ] **Step 1: Replace file content**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, ImageIcon, Loader2 } from "lucide-react";
import { compressImageFile } from "@/lib/image/compress";
import { Button } from "@/components/ui/Button";
import { OnboardingGuard } from "@/components/features/onboarding/OnboardingGuard";

type Phase = "pick" | "uploading" | "analyzing" | "error";

export default function ScanNewPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("pick");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setPhase("error");
      setErrorMsg("Bitte wähle ein Bild.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setPhase("error");
      setErrorMsg("Das Bild ist zu groß (max. 20 MB).");
      return;
    }

    try {
      setPhase("uploading");
      const compressed = await compressImageFile(file);

      const form = new FormData();
      form.append("image", compressed, "scan.jpg");

      setPhase("analyzing");
      const res = await fetch("/api/scans", { method: "POST", body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "unknown" }));
        throw new Error(body.error ?? `http ${res.status}`);
      }
      const { scanId } = (await res.json()) as { scanId: string };
      router.push(`/scan/${scanId}`);
    } catch (err) {
      setPhase("error");
      setErrorMsg(err instanceof Error ? err.message : "Unbekannter Fehler.");
    }
  }

  return (
    <OnboardingGuard>
      <div className="min-h-screen bg-linen">
        <div className="px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-3">
          <Link
            href="/app"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cream shadow-[0_2px_10px_rgba(58,37,21,0.05)]"
          >
            <ArrowLeft className="h-5 w-5 text-bark-900" />
          </Link>
        </div>

        <div className="px-5 pt-8">
          <p className="eyebrow mb-2">Neuer Scan</p>
          <h1 className="font-serif text-[28px] leading-tight text-bark-900">
            Was soll ich mir ansehen?
          </h1>
          <p className="pull-quote mt-4">
            Ein klares Foto von Blatt, Blüte oder Frucht funktioniert am besten.
          </p>
        </div>

        {phase === "pick" && (
          <div className="px-5 pt-8 space-y-3">
            <label className="block">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                }}
              />
              <div className="tap-press flex items-center gap-3 rounded-[18px] bg-bark-900 text-cream px-5 py-4 cursor-pointer">
                <Camera className="h-5 w-5" />
                <span className="text-[15px] font-semibold">Foto aufnehmen</span>
              </div>
            </label>

            <label className="block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                }}
              />
              <div className="tap-press flex items-center gap-3 rounded-[18px] bg-cream text-bark-900 border border-clay-800/20 px-5 py-4 cursor-pointer">
                <ImageIcon className="h-5 w-5" />
                <span className="text-[15px] font-semibold">Aus Mediathek wählen</span>
              </div>
            </label>
          </div>
        )}

        {(phase === "uploading" || phase === "analyzing") && (
          <div className="px-5 pt-16 flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-clay-800 animate-spin" />
            <p className="mt-4 font-serif italic text-[16px] text-bark-900">
              {phase === "uploading" ? "Bild wird hochgeladen …" : "Analyse läuft …"}
            </p>
          </div>
        )}

        {phase === "error" && (
          <div className="px-5 pt-10">
            <div className="rounded-[20px] bg-cream border border-berry-500/40 p-5">
              <p className="eyebrow mb-2 text-berry-500">Hat nicht geklappt</p>
              <p className="text-[14px] text-bark-900 mb-4">
                {errorMsg ?? "Bitte versuch es erneut."}
              </p>
              <Button onClick={() => { setPhase("pick"); setErrorMsg(null); }}>
                Erneut versuchen
              </Button>
            </div>
          </div>
        )}
      </div>
    </OnboardingGuard>
  );
}
```

- [ ] **Step 2: Smoke-Test**

Run: `npm run dev`. Navigate to http://localhost:3000/scan/new. Pick an image. Expected: ohne Pl@ntNet-Key → landet auf `/scan/<uuid>` mit `provider_error`-State; mit Key → landet auf `/scan/<uuid>` mit echten Kandidaten.

- [ ] **Step 3: Commit**

```bash
git add src/app/scan/new/page.tsx
git commit -m "feat(scan): replace demo picker with real file upload"
```

---

### Task 30: `/scan/[id]` Refactor — Server Component, UUID-basiert

**Files:**
- Modify: `src/app/scan/[id]/page.tsx` (komplette Neufassung)
- Create: `src/components/features/scan/ScanResultStates.tsx`

Die Route ändert ihre Semantik: `id` ist jetzt eine Scan-UUID, nicht mehr eine Content-ID. Wir rendern abhängig von `outcome.status`. Für `status === 'ok'` mit `matchedEntry` nutzen wir das bestehende Hero-Layout; sonst zeigen wir den `ErrorState`-Komponenten-Variante.

- [ ] **Step 1: Create `src/components/features/scan/ScanResultStates.tsx`**

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { BotanicalIcon } from "@/components/ui/BotanicalIcon";

export function LowQualityState({ reason }: { reason?: string }) {
  return (
    <GenericErrorFrame
      eyebrow="Bild nicht klar genug"
      title="Magst du es nochmal versuchen?"
      body={reason ?? "Eine Nahaufnahme von Blatt, Blüte oder Frucht funktioniert am besten."}
      mark="compass"
    />
  );
}

export function CategoryUnsupportedState({ category }: { category?: string }) {
  const label =
    category === "insect" ? "Insekt"
    : category === "disease" ? "Schadbild"
    : "Das";
  return (
    <GenericErrorFrame
      eyebrow="Noch nicht erkannt"
      title={`${label} erkennen wir bald.`}
      body="Wir starten mit Pflanzen. Insekten- und Krankheits-Erkennung folgen als nächstes."
      mark="insect"
    />
  );
}

export function NoMatchState() {
  return (
    <GenericErrorFrame
      eyebrow="Unsicher"
      title="Wir konnten diese Pflanze nicht sicher zuordnen."
      body="Ein zweites Foto aus näherer Perspektive hilft oft — besonders von Blatt oder Blüte."
      mark="leaf"
    />
  );
}

export function ProviderErrorState({ reason }: { reason?: string }) {
  return (
    <GenericErrorFrame
      eyebrow="Erkennung pausiert"
      title="Gerade nicht verfügbar."
      body="Bitte versuche es in ein paar Minuten nochmal. Falls das wiederholt passiert, melde dich."
      mark="shovel"
      detail={reason}
    />
  );
}

function GenericErrorFrame({
  eyebrow,
  title,
  body,
  mark,
  detail,
}: {
  eyebrow: string;
  title: string;
  body: string;
  mark: Parameters<typeof BotanicalIcon>[0]["name"];
  detail?: string;
}) {
  return (
    <div className="min-h-screen bg-linen pb-28">
      <div className="px-5 pt-[max(env(safe-area-inset-top),3rem)]">
        <div className="flex justify-center mt-8 mb-8">
          <BotanicalIcon name={mark} framed size={72} />
        </div>
        <p className="eyebrow text-center mb-2">{eyebrow}</p>
        <h1 className="font-serif italic text-[26px] leading-tight text-bark-900 text-center mb-4">
          {title}
        </h1>
        <p className="text-[15px] text-bark-900/75 leading-relaxed text-center max-w-sm mx-auto">
          {body}
        </p>

        {detail && process.env.NODE_ENV === "development" && (
          <pre className="mt-6 mx-auto max-w-sm rounded-[12px] bg-cream border border-clay-800/15 p-3 text-[11px] text-bark-900/70 whitespace-pre-wrap">
            {detail}
          </pre>
        )}

        <div className="mt-10 flex flex-col gap-3 max-w-sm mx-auto">
          <Button href="/scan/new" fullWidth>Erneut versuchen</Button>
          <Link href="/app" className="text-center text-[13px] text-ink-muted py-2">
            Zurück zum Garten
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `src/app/scan/[id]/page.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft, Share2, Plus, MessageCircle, AlertTriangle, BookOpen, ArrowRight, ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { UrgencyIndicator } from "@/components/ui/UrgencyIndicator";
import { Button } from "@/components/ui/Button";
import { CategoryLabel } from "@/components/ui/CategoryIcon";
import { OnboardingGuard } from "@/components/features/onboarding/OnboardingGuard";
import { createClient } from "@/lib/supabase/server";
import { getHistoryItem } from "@/lib/services/historyService";
import { createSignedReadUrl } from "@/lib/services/imageStorageService";
import {
  LowQualityState, CategoryUnsupportedState, NoMatchState, ProviderErrorState,
} from "@/components/features/scan/ScanResultStates";
import { cn } from "@/lib/utils";

export default async function ScanResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/app");

  const item = await getHistoryItem(user.id, id);
  if (!item) return notFound();

  const { scan, matchedEntry } = item;

  if (scan.outcome.status === "low_quality") {
    return <OnboardingGuard><LowQualityState reason={scan.outcome.reason} /></OnboardingGuard>;
  }
  if (scan.outcome.status === "category_unsupported") {
    return <OnboardingGuard><CategoryUnsupportedState category={scan.outcome.triage?.category} /></OnboardingGuard>;
  }
  if (scan.outcome.status === "no_match") {
    return <OnboardingGuard><NoMatchState /></OnboardingGuard>;
  }
  if (scan.outcome.status === "provider_error") {
    return <OnboardingGuard><ProviderErrorState reason={scan.outcome.reason} /></OnboardingGuard>;
  }

  // status === 'ok' — zeige Editorial-Hero
  const primary = scan.outcome.candidates[0];
  const confidence = primary.confidence;
  const signedImageUrl = await createSignedReadUrl(scan.imagePath, 3600);

  const heroName = matchedEntry?.name ?? primary.commonNames[0] ?? primary.scientificName;
  const heroDescription =
    matchedEntry?.description ??
    "Wir haben noch keine redaktionelle Beschreibung zu dieser Art — demnächst.";

  return (
    <OnboardingGuard>
      <div className="min-h-screen bg-linen pb-28">
        <div className="relative h-[280px] overflow-hidden">
          <Image
            src={signedImageUrl}
            alt={heroName}
            fill
            priority
            unoptimized
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-cover photo-graded"
          />
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_50%,rgba(58,37,21,0.25)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-bark-900/40" />

          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-3">
            <Link href="/app" className="tap-press flex h-10 w-10 items-center justify-center rounded-full bg-cream/92 backdrop-blur-md">
              <ArrowLeft className="h-5 w-5 text-bark-900" />
            </Link>
            <button className="tap-press flex h-10 w-10 items-center justify-center rounded-full bg-cream/92 backdrop-blur-md">
              <Share2 className="h-4.5 w-4.5 text-bark-900" strokeWidth={1.75} />
            </button>
          </div>

          <div
            className="absolute top-[calc(max(env(safe-area-inset-top),1rem)+52px)] left-4 anim-bloom"
            style={{ animationDelay: "200ms" }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-cream/92 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-bark-900">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  confidence >= 0.75 ? "bg-moss-500"
                  : confidence >= 0.50 ? "bg-sun-500"
                  : "bg-berry-500"
                )}
              />
              {Math.round(confidence * 100)} % sicher
            </span>
          </div>
        </div>

        <div
          className="relative -mt-7 rounded-t-[28px] bg-cream pt-6 pb-6 px-5 shadow-[0_-8px_24px_rgba(58,37,21,0.06)] anim-bloom"
          style={{ animationDelay: "400ms" }}
        >
          {matchedEntry && (
            <p className="eyebrow mb-2">
              <CategoryLabel category={matchedEntry.category} />
            </p>
          )}
          <h1 className="font-serif text-[28px] leading-tight text-bark-900 mb-1">{heroName}</h1>
          <p className="latin-name text-[13px] mb-3">{primary.scientificName}</p>
          <p className="pull-quote mt-3 mb-2">{heroDescription}</p>

          {matchedEntry && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {matchedEntry.safety.toxicToChildren && (
                <Badge tone="danger" icon={<AlertTriangle className="h-3 w-3" />}>Giftig</Badge>
              )}
              <UrgencyIndicator urgency={matchedEntry.defaultUrgency} />
            </div>
          )}
        </div>

        {matchedEntry && (
          <>
            <section className="px-5 -mt-4 relative z-10">
              <UrgencyIndicator urgency={matchedEntry.defaultUrgency} variant="banner" />
            </section>

            <section className="px-5 pt-8">
              <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted mb-3">
                Erkennungsmerkmale
              </p>
              <div className="rounded-[16px] bg-cream p-5 space-y-2">
                {matchedEntry.traits.map((t, i) => (
                  <div key={i} className="flex gap-2 text-[14px] leading-relaxed">
                    <span className="text-clay-800 font-bold shrink-0">·</span>
                    <span className="text-bark-900">{t}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="px-5 pt-6">
              <div className="rounded-[20px] bg-cream p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4 text-clay-800" strokeWidth={1.75} />
                  <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted">
                    Habitat & Saison
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed text-bark-900">{matchedEntry.habitat}</p>
              </div>
            </section>

            <section className="px-5 pt-8 space-y-3">
              <Button href="/coach" fullWidth size="lg" variant="secondary" iconLeft={<MessageCircle className="h-5 w-5" />}>
                Frag den Gartencoach
              </Button>
            </section>
          </>
        )}

        {!matchedEntry && (
          <div className="px-5 pt-6">
            <div className="rounded-[16px] bg-cream p-5 text-[13px] text-bark-900/75">
              Wir haben diese Art im System, aber noch keine redaktionelle Seite.
              Sobald wir Details ergänzt haben, erscheinen sie hier automatisch.
            </div>
          </div>
        )}

        {scan.outcome.candidates.length > 1 && (
          <section className="px-5 pt-8">
            <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted mb-3">
              Weitere Möglichkeiten
            </p>
            <div className="space-y-2">
              {scan.outcome.candidates.slice(1).map((c) => (
                <div key={c.rank} className="rounded-[12px] bg-cream px-4 py-3 border border-clay-800/10">
                  <p className="text-[13px] font-semibold text-bark-900 mb-0.5">
                    {c.commonNames[0] ?? c.scientificName}
                  </p>
                  <p className="text-[12px] text-ink-muted leading-snug">
                    {c.scientificName} · {Math.round(c.confidence * 100)} %
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="fixed bottom-0 left-0 right-0 z-30 px-5 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3 bg-gradient-to-t from-linen via-linen/95 to-transparent">
          <div className="mx-auto max-w-lg">
            <Button href="/scan/new" fullWidth size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>
              Nächster Scan
            </Button>
          </div>
        </div>
      </div>
    </OnboardingGuard>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/scan/[id]/page.tsx src/components/features/scan/ScanResultStates.tsx
git commit -m "feat(scan): scan/[id] as Server Component with real data + error states"
```

---

### Task 31: OnboardingGuard als Server Component

**Files:**
- Modify: `src/components/features/onboarding/OnboardingGuard.tsx`
- Delete: `src/hooks/useOnboardingGuard.ts`

- [ ] **Step 1: Replace `OnboardingGuard.tsx`**

```tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side Guard: wenn das Profil onboarding nicht abgeschlossen hat und der
 * User sich nicht bereits auf einer /onboarding-Route befindet, redirect auf Welcome.
 */
export async function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") ?? "";

  if (!user) {
    // Middleware sollte eine anonyme Session anlegen — wenn nicht, zurück zu /.
    return <>{children}</>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("completed_onboarding_at")
    .eq("id", user.id)
    .maybeSingle();

  const isOnOnboardingRoute = pathname.startsWith("/onboarding");
  const completed = !!profile?.completed_onboarding_at;

  if (!completed && !isOnOnboardingRoute) {
    redirect("/onboarding/welcome");
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: Propagate pathname via middleware header**

Edit `src/lib/supabase/middleware.ts` — vor dem finalen `return response` ergänzen:

```ts
  response.headers.set('x-pathname', request.nextUrl.pathname);
```

- [ ] **Step 3: Delete `src/hooks/useOnboardingGuard.ts`**

```bash
rm src/hooks/useOnboardingGuard.ts
```

- [ ] **Step 4: Verify no remaining imports**

Run: `grep -r "useOnboardingGuard" src/`
Expected: keine Treffer.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/onboarding/OnboardingGuard.tsx src/hooks/useOnboardingGuard.ts src/lib/supabase/middleware.ts
git commit -m "refactor(onboarding): guard as server component + middleware pathname header"
```

---

### Task 32: `useOnboarding` auf Supabase umstellen

**Files:**
- Modify: `src/hooks/useOnboarding.ts`
- Create: `src/app/api/onboarding/complete/route.ts`

- [ ] **Step 1: Create `src/app/api/onboarding/complete/route.ts`**

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateProfile, markOnboardingComplete } from '@/lib/services/profileRepository';
import type { GardenProfile } from '@/domain/types';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const body = (await req.json()) as { profile: Partial<GardenProfile> };
  await updateProfile(user.id, body.profile);
  await markOnboardingComplete(user.id);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Replace `src/hooks/useOnboarding.ts`**

Die lokale `onboardingStorage` bleibt für den Step-by-Step-Zustand _während_ des Flows (reines UI-Zustandsmanagement, nicht persistenz). Nur der Completion-Step schreibt in die DB.

```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  trackOnboardingCompleted,
  trackTrialStarted,
} from "@/domain/analytics/onboarding";
import type {
  GardenProfile,
  OnboardingState,
  OnboardingStep,
} from "@/domain/types";

const STEP_ORDER: OnboardingStep[] = ["WELCOME", "USE_CASES", "GARDEN", "TRUST", "SCAN", "PREMIUM"];

const STEP_ROUTES: Record<OnboardingStep, string> = {
  WELCOME: "/onboarding/welcome",
  USE_CASES: "/onboarding/use-cases",
  GARDEN: "/onboarding/garden",
  TRUST: "/onboarding/trust",
  SCAN: "/onboarding/scan",
  PREMIUM: "/onboarding/premium",
  DONE: "/app",
};

function nextStep(current: OnboardingStep): OnboardingStep {
  const i = STEP_ORDER.indexOf(current);
  if (i < 0 || i >= STEP_ORDER.length - 1) return "DONE";
  return STEP_ORDER[i + 1];
}

function emptyState(current: OnboardingStep = "WELCOME"): OnboardingState {
  return { currentStep: current, completedSteps: [], profile: {}, startedAt: new Date() };
}

const SESSION_KEY = "gartenscan:onboarding:session:v2";

function readSession(): OnboardingState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingState;
    return { ...parsed, startedAt: new Date(parsed.startedAt) };
  } catch {
    return null;
  }
}

function writeSession(state: OnboardingState) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
}

function clearSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}

async function completeOnboarding(profile: Partial<GardenProfile>) {
  const res = await fetch("/api/onboarding/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile }),
  });
  if (!res.ok) throw new Error(`onboarding/complete http ${res.status}`);
}

export interface UseOnboardingResult {
  state: OnboardingState | null;
  loading: boolean;
  advance: (currentStep: OnboardingStep, data: Partial<GardenProfile>) => void;
  goBack: () => void;
  skipToComplete: (pathTaken: "skipped_scan" | "skipped_paywall" | "skipped_both") => void;
  submitPaywall: (email: string) => void;
}

export function useOnboarding(): UseOnboardingResult {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existing = readSession();
    if (existing) {
      setState(existing);
    } else {
      const fresh = emptyState();
      writeSession(fresh);
      setState(fresh);
    }
    setLoading(false);
  }, []);

  const advance = useCallback(
    (currentStep: OnboardingStep, data: Partial<GardenProfile>) => {
      const base = readSession() ?? emptyState(currentStep);
      const next = nextStep(currentStep);
      const updated: OnboardingState = {
        ...base,
        currentStep: next,
        completedSteps: Array.from(new Set([...(base.completedSteps ?? []), currentStep])),
        profile: { ...base.profile, ...data },
      };
      writeSession(updated);
      setState(updated);
      router.push(STEP_ROUTES[next]);
    },
    [router]
  );

  const goBack = useCallback(() => router.back(), [router]);

  const skipToComplete = useCallback(
    (pathTaken: "skipped_scan" | "skipped_paywall" | "skipped_both") => {
      const base = readSession() ?? emptyState();
      void completeOnboarding(base.profile).then(() => {
        trackOnboardingCompleted(pathTaken);
        clearSession();
        router.replace("/app");
      });
    },
    [router]
  );

  const submitPaywall = useCallback(
    (email: string) => {
      const base = readSession() ?? emptyState();
      void completeOnboarding({ ...base.profile }).then(() => {
        trackTrialStarted(email.split("@")[1] ?? "unknown");
        trackOnboardingCompleted("full");
        clearSession();
        router.replace("/app");
      });
    },
    [router]
  );

  return { state, loading, advance, goBack, skipToComplete, submitPaywall };
}
```

- [ ] **Step 3: Verify `waitlistStorage` + `extractEmailDomain` imports**

Run: `grep -n "waitlistStorage\|extractEmailDomain" src/hooks/useOnboarding.ts`
Expected: keine Treffer (Imports entfernt).

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useOnboarding.ts src/app/api/onboarding/complete/route.ts
git commit -m "refactor(onboarding): persist via Supabase API, sessionStorage for in-flow state"
```

---

### Task 33: Dashboard `/app` — Name aus profiles statt USER_PROFILE

**Files:**
- Modify: `src/app/app/page.tsx`

- [ ] **Step 1: Swap USER_PROFILE for profile-based fallback**

In `src/app/app/page.tsx`:

Replace the import line
```ts
import { USER_PROFILE } from "@/lib/profile";
```
with
```ts
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/services/profileRepository";
```

Replace the `export const revalidate = 1800;` block and the function start (everything up to `const now = new Date();`) with:

```ts
export const revalidate = 0; // per-user, don't cache

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profileRow = user ? await getProfile(user.id) : null;
  const displayName = profileRow?.email?.split("@")[0] ?? "Gärtner:in";

  const heroTask = MOCK_TASKS[0];
  const heroPlant = MOCK_PLANTS.find((p) => p.id === heroTask.plantId);
  const otherTasks = MOCK_TASKS.slice(1);
  const attentionPlants = MOCK_PLANTS.slice(0, 6);

  const weather = await fetchWeatherForPLZ("80331");

  const now = new Date();
```

Replace the `{USER_PROFILE.name}` JSX expression with `{displayName}`.

- [ ] **Step 2: Verify no USER_PROFILE references remain in this file**

Run: `grep -n "USER_PROFILE" src/app/app/page.tsx`
Expected: no hits.

- [ ] **Step 3: Commit**

```bash
git add src/app/app/page.tsx
git commit -m "refactor(dashboard): use profile from Supabase instead of USER_PROFILE mock"
```

---

### Task 34: History-Page auf echte Scans umstellen

**Files:**
- Modify: `src/app/history/page.tsx` (komplette Neufassung)

- [ ] **Step 1: Replace file content**

```tsx
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { OnboardingGuard } from "@/components/features/onboarding/OnboardingGuard";
import { createClient } from "@/lib/supabase/server";
import { listHistory } from "@/lib/services/historyService";
import { createSignedReadUrl } from "@/lib/services/imageStorageService";

export const revalidate = 0;

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <OnboardingGuard>
        <AppShell>
          <div className="px-5 pt-8 safe-top">
            <EmptyState
              mark="journal"
              title="Noch keine Scans"
              body="Hier siehst du, was du erkannt hast — und wann."
              ctaLabel="Jetzt scannen"
              ctaHref="/scan/new"
            />
          </div>
        </AppShell>
      </OnboardingGuard>
    );
  }

  const items = await listHistory(user.id, 100);

  const grouped = new Map<string, typeof items>();
  for (const it of items) {
    const key = it.scan.createdAt.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(it);
  }

  // Pre-resolve signed image URLs in parallel
  const withUrls = await Promise.all(
    items.map(async (it) => ({
      ...it,
      signedImageUrl: await createSignedReadUrl(it.scan.imagePath, 3600),
    }))
  );
  const urlById = new Map(withUrls.map((u) => [u.scan.id, u.signedImageUrl]));

  return (
    <OnboardingGuard>
      <AppShell>
        <div className="px-5 pt-8 safe-top">
          <p className="eyebrow mb-2">Mein Verlauf</p>
          <h1 className="font-serif text-[32px] leading-tight tracking-tight text-bark-900">
            {items.length === 0
              ? "Noch keine Scans"
              : `${items.length} ${items.length === 1 ? "Scan" : "Scans"}`}
          </h1>
          <p className="text-[14px] text-ink-muted mt-2">Dein Gartenjahr in Fotos und Entscheidungen</p>
        </div>

        {items.length === 0 ? (
          <section className="px-5 pt-8">
            <EmptyState
              mark="journal"
              title="Hier wird's dein Journal."
              body="Jeder Scan landet hier — mit Foto, Datum und was wir erkannt haben."
              ctaLabel="Ersten Scan machen"
              ctaHref="/scan/new"
            />
          </section>
        ) : (
          <section className="px-5 pt-8 space-y-8">
            {Array.from(grouped.entries()).map(([month, scans]) => (
              <div key={month}>
                <h2 className="font-serif text-[20px] leading-tight text-bark-900 mb-3 capitalize">{month}</h2>
                <div className="space-y-2.5">
                  {scans.map(({ scan, matchedEntry }) => {
                    const top = scan.outcome.candidates[0];
                    const title = matchedEntry?.name ?? top?.commonNames[0] ?? top?.scientificName ?? "Unbekannt";
                    const subtitle =
                      scan.outcome.status === "ok" ? top ? `${Math.round(top.confidence * 100)} % sicher` : ""
                      : scan.outcome.status === "low_quality" ? "Bild zu unscharf"
                      : scan.outcome.status === "category_unsupported" ? "Kategorie noch nicht unterstützt"
                      : scan.outcome.status === "no_match" ? "Nicht zuordenbar"
                      : "Erkennung pausiert";

                    return (
                      <Link
                        key={scan.id}
                        href={`/scan/${scan.id}`}
                        className="flex items-center gap-3 rounded-[14px] bg-cream px-4 py-3 border border-clay-800/10 tap-press"
                      >
                        <div
                          className="h-14 w-14 shrink-0 rounded-[10px] bg-cover bg-center photo-graded"
                          style={{ backgroundImage: `url(${urlById.get(scan.id)})` }}
                          aria-hidden
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-bark-900 truncate">{title}</p>
                          <p className="text-[12px] text-ink-muted truncate">{subtitle}</p>
                        </div>
                        <span className="text-[11px] text-ink-muted shrink-0">
                          {scan.createdAt.toLocaleDateString("de-DE", { day: "2-digit", month: "short" })}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        )}
      </AppShell>
    </OnboardingGuard>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/history/page.tsx
git commit -m "refactor(history): render real scans from historyService"
```

---

### Task 35: Onboarding-Scan-Seite bereinigen

**Files:**
- Modify: `src/app/onboarding/scan/page.tsx`

Der DemoPicker bleibt, aber wir entfernen den letzten `getContentById`-Lookup — der ist unkritisch. Da der Demo-Ergebnis-View bereits aus `CompactResultView` + fest zugeordneten `contentId`s kommt, ist kein großer Refactor nötig. Wir ändern nur den Zeilentext „Echte Foto-Erkennung startet in Kürze" — der ist jetzt falsch.

- [ ] **Step 1: Edit `src/app/onboarding/scan/page.tsx`**

Replace:
```tsx
              <p className="mt-6 text-center text-[12px] text-ink-muted/80">
                Echte Foto-Erkennung startet in Kürze.
              </p>
```
with:
```tsx
              <p className="mt-6 text-center text-[12px] text-ink-muted/80">
                Beispiel-Scan. Deinen eigenen machst du gleich in der App.
              </p>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/onboarding/scan/page.tsx
git commit -m "refactor(onboarding): update demo-picker footnote"
```

---

## Phase 9 — Cleanup

### Task 36: Legacy-Mock-Dateien entfernen

**Files:**
- Delete: `src/lib/mock/scans.ts`
- Delete: `src/lib/profile.ts`
- Delete: `src/lib/providers/MockVisionProvider.ts`
- Delete: `src/lib/providers/vision.ts`
- Delete: `src/lib/storage/profile.ts`
- Delete: `src/domain/identification/VisionProvider.ts`
- Potentially delete: `src/lib/storage/waitlist.ts` if unused outside `useOnboarding`

- [ ] **Step 1: Search for active usage**

Run: `grep -rn "from \"@/lib/mock/scans\"\|from \"@/lib/profile\"\|MockVisionProvider\|getVisionProvider\|profileStorage\|onboardingStorage\|from \"@/domain/identification/VisionProvider\"" src/`

Expected (was noch übrig sein darf): KEINE Treffer. Wenn welche auftauchen — anpassen, bevor gelöscht wird.

- [ ] **Step 2: Delete files**

```bash
rm src/lib/mock/scans.ts
rm src/lib/profile.ts
rm src/lib/providers/MockVisionProvider.ts
rm src/lib/providers/vision.ts
rm src/lib/storage/profile.ts
rm src/domain/identification/VisionProvider.ts
```

- [ ] **Step 3: Check for leftover waitlist import**

Run: `grep -rn "waitlistStorage\|extractEmailDomain" src/`
If the only remaining users are inside `src/lib/storage/waitlist.ts` itself (self-referencing), keep it. If it's used in `premium`-Route or similar, keep it. If it's fully orphaned, delete it.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds. If there are TS-Errors about missing imports, fix them (likely legacy imports in files we didn't touch).

- [ ] **Step 5: Verify tests still pass**

Run: `npm test`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove legacy mock storage and VisionProvider layer"
```

---

### Task 37: README ENV-Abschnitt

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Append ENV section to `README.md`**

Anfügen (oder ersetzen eines bestehenden ENV-Abschnitts):

````markdown
## Environment

Copy `.env.example` to `.env.local` and fill:

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL (EU Frankfurt) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Never expose to client. Used for storage writes + RPC. |
| `PLANTNET_API_KEY` | server | Pl@ntNet. Leave empty → `/scan/new` shows `provider_error`. |
| `PLANTNET_PROJECT` | server | Default `weurope` (West-European flora) |
| `ANTHROPIC_API_KEY` | server | Claude Vision for image pre-triage |

### First-time setup

```bash
# 1. Install deps
npm install

# 2. Copy env
cp .env.example .env.local
# Fill in values from Supabase dashboard and Pl@ntNet / Anthropic

# 3. Run migrations
npx supabase link --project-ref <your-ref>
npx supabase db push

# 4. Dev
npm run dev
```

### Tests

```bash
npm test          # run all tests once
npm run test:watch
```
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: document env setup, supabase migration, tests"
```

---

### Task 38: Smoke-Test

**Files:** keine — manueller Check.

- [ ] **Step 1: Smoke-Test lokal**

Run: `npm run dev`

Check list (alle OK):
1. Landing `/` lädt ohne Crash, **keine** anonyme Session erzeugt (Supabase Dashboard → Users).
2. `/app` lädt, erzeugt anonymen User, redirected auf `/onboarding/welcome` (da Profil ohne `completed_onboarding_at`).
3. Onboarding komplett durchlaufen (welcome → use-cases → garden → trust → scan-demo → premium). Nach Abschluss steht `completed_onboarding_at` in `profiles` (SQL-Check).
4. `/scan/new` zeigt File-Input + Kamera-Trigger. Bild hochladen:
   - **Mit ANTHROPIC + PLANTNET keys:** erfolgreiche Identifikation → `/scan/<uuid>` mit `ok`-Hero.
   - **Ohne PLANTNET key:** erwartet `provider_error`-State.
   - **Mit blurrem Bild (z.B. sehr unscharf):** `low_quality`-State.
   - **Mit Insekt-Bild:** `category_unsupported`-State.
5. `/history` zeigt den Scan als erste Zeile mit echtem Foto.
6. DB-Check:
   ```sql
   select id, user_id, status, matched_content_id from public.scans order by created_at desc limit 3;
   select scan_id, rank, scientific_name, confidence from public.scan_candidates order by scan_id, rank limit 6;
   select user_id, year_month, scans_used from public.scan_usage;
   ```
   Expected: Scan-Zeilen vorhanden, Top-Kandidat in `scan_candidates`, `scan_usage` Counter steht ≥ 1.

- [ ] **Step 2: Smoke-Test auf Staging-Deploy**

```bash
git push
# warten auf Vercel-Deploy
```

Dann auf Staging-URL dieselben 6 Checks durchgehen. ENV-Vars müssen in Vercel gesetzt sein (Task 4).

- [ ] **Step 3: Bei Erfolg: Memory aktualisieren**

Der executierende Agent sollte NACH erfolgreichem Smoke-Test einen Memory-Eintrag schreiben, der den Stand dokumentiert (siehe `memory/`-Konvention). Aber nicht Teil dieses Plans — das passiert durch den User oder nachgelagerten Prozess.

- [ ] **Step 4: Kein Commit (Smoke-Test ist Manual QA).**

---

## Rollback-Strategie (falls etwas im Deploy bricht)

1. Vercel Deployment „Redeploy previous" (ein Klick).
2. Supabase-Migration ist **nicht-destruktiv** — Tables und Bucket bleiben. Kein Rollback nötig, außer die Logic dreht später doch noch.
3. ENV-Vars in Vercel unberührt lassen, nur Code revertieren.

---

## Verbindung zu Phase C/D/E

- **Phase C (Insekten/Krankheiten):** fügt `InsectIdentificationProvider` + `DiseaseIdentificationProvider` hinzu, `analyzeImageService` routet auf Basis `triage.category`. Schema unverändert.
- **Phase D (Recommendation Engine):** eigene Tabelle `recommendations` + LLM-basierte Beschreibungen für nicht-Seed-Content-Matches. Nutzt `scans.provider_raw` + `matched_content_id`.
- **Phase E (Paywall/Enforcement):** FeatureGate wird in `/api/scans` POST aktiviert, liest `entitlements`-Row + vergleicht mit `scan_usage`. Stripe-Webhook schreibt in `entitlements`.
