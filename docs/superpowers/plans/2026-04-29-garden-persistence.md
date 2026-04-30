# Garden Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace mock data on `/garden` and `/garden/[plantId]` with real `plants` table; let users save successful scans to their garden.

**Architecture:** Postgres `plants` table with nullable FK from `scans.plant_id`. Service-Role-Repository (`plantRepository.ts`) mirrors existing `scanRepository.ts`. Three API routes for plant-create, scan-assign, and assignable-list. Inline CTA on `/scan/[id]` opens a dedicated `/scan/[id]/save` page (mobile full-screen sheet) with two tabs: new plant vs. add to existing.

**Tech Stack:** Next.js 15 App Router (Server Components + Client Components), Supabase (Postgres + Storage + Auth), TypeScript strict, Tailwind, Vitest 4.

**Spec:** `docs/superpowers/specs/2026-04-29-garden-persistence-design.md`

---

## File Structure

**Create:**
- `supabase/migrations/20260429120000_garden_persistence.sql` — new plants table + scans.plant_id
- `src/lib/services/plantRepository.ts` — server-only DB ops
- `src/components/features/plant/SavePlantPrompt.tsx` — inline CTA on scan result
- `src/components/features/plant/SavePlantSheet.tsx` — client-component save form (two tabs)
- `src/app/scan/[id]/save/page.tsx` — server entry that loads scan + assignable plants
- `src/app/api/plants/route.ts` — POST plant create
- `src/app/api/plants/assignable/route.ts` — GET assignable list
- `src/app/api/scans/[id]/assign/route.ts` — POST scan-to-plant assignment
- `tests/services/plantRepository.test.ts` — pure-function unit tests

**Modify:**
- `src/lib/services/scanRepository.ts` — add `plantId` to StoredScan mapping, add `listScansForPlant()`
- `src/domain/scan/ScanOutcome.ts` — add `plantId?: string` to `StoredScan`
- `src/app/scan/[id]/page.tsx` — render `<SavePlantPrompt>` when `status='ok'` and `plantId` is null
- `src/app/garden/page.tsx` — full rewrite, server-component reading from `listPlantsForUser()`
- `src/app/garden/[plantId]/page.tsx` — full rewrite, real plant + scan history
- `src/lib/types.ts` — remove `Plant` and `DailyTask` interfaces

**Delete:**
- `src/lib/mock/garden.ts`
- `src/lib/mock/scans.ts`

---

## Task 1: Database Schema Migration

**Files:**
- Create: `supabase/migrations/20260429120000_garden_persistence.sql`

- [ ] **Step 1: Write the migration SQL**

Create `supabase/migrations/20260429120000_garden_persistence.sql`:

```sql
-- garden persistence: plants table + scan->plant link

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

- [ ] **Step 2: Apply migration to Dev Supabase**

Open Supabase Studio for the dev project, paste the SQL into the SQL Editor, run it. Verify:
- `select * from public.plants limit 1` works (returns 0 rows, no error).
- `select column_name from information_schema.columns where table_name='scans' and column_name='plant_id'` returns one row.
- `select policyname from pg_policies where tablename='plants'` returns 4 rows.

- [ ] **Step 3: Commit migration file**

```bash
git add supabase/migrations/20260429120000_garden_persistence.sql
git commit -m "db(garden): add plants table + scans.plant_id"
```

---

## Task 2: Domain Type Update

**Files:**
- Modify: `src/domain/scan/ScanOutcome.ts`

- [ ] **Step 1: Add `plantId` to StoredScan**

In `src/domain/scan/ScanOutcome.ts`, modify the `StoredScan` interface (currently lines 46-54):

```ts
export interface StoredScan {
  id: string;
  userId: string;
  createdAt: Date;
  imagePath: string;
  imageMeta?: { width?: number; height?: number; bytes?: number; mime?: string };
  outcome: ScanOutcome;
  matchedContentId?: string;
  plantId?: string;
}
```

- [ ] **Step 2: Run typecheck — expect failures in scanRepository**

Run: `npx tsc --noEmit`
Expected: TypeScript should compile cleanly because `plantId` is optional. If anything errors, fix before continuing.

- [ ] **Step 3: Commit**

```bash
git add src/domain/scan/ScanOutcome.ts
git commit -m "domain(scan): add plantId to StoredScan"
```

---

## Task 3: scanRepository — wire plant_id through and add listScansForPlant

**Files:**
- Modify: `src/lib/services/scanRepository.ts`

- [ ] **Step 1: Map `plant_id` in `getScanById` and `listScansForUser`**

In `src/lib/services/scanRepository.ts`, both `getScanById` (returning a `StoredScan`) and `listScansForUser` (mapping rows to `StoredScan[]`) currently omit `plantId`. Add it.

In `getScanById`, in the returned object after `matchedContentId`:

```ts
    matchedContentId: scan.matched_content_id ?? undefined,
    plantId: scan.plant_id ?? undefined,
```

In `listScansForUser`, in the `scans.map((scan) => ({ ... }))` block:

```ts
      matchedContentId: scan.matched_content_id ?? undefined,
      plantId: scan.plant_id ?? undefined,
```

- [ ] **Step 2: Add `listScansForPlant`**

Append to `src/lib/services/scanRepository.ts`:

```ts
export async function listScansForPlant(
  plantId: string,
  userId: string
): Promise<StoredScan[]> {
  const supabase = createServiceRoleClient();

  const { data: scans, error } = await supabase
    .from('scans')
    .select('*')
    .eq('plant_id', plantId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`listScansForPlant: ${error.message}`);
  if (!scans || scans.length === 0) return [];

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
      plantId: scan.plant_id ?? undefined,
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

- [ ] **Step 3: Verify typecheck and tests still pass**

Run: `npx tsc --noEmit && npm test`
Expected: tsc clean, all existing tests still pass (likely 31).

- [ ] **Step 4: Commit**

```bash
git add src/lib/services/scanRepository.ts
git commit -m "scan(repo): expose plantId, add listScansForPlant"
```

---

## Task 4: plantRepository — types + pure helper with unit tests

The repository will have one pure helper that's worth testing in isolation: `mergePlantsWithStats`. We TDD that, then add the DB-bound functions in the next task (which we don't unit-test, matching existing repo conventions).

**Files:**
- Create: `src/lib/services/plantRepository.ts`
- Create: `tests/services/plantRepository.test.ts`

- [ ] **Step 1: Write failing test for `mergePlantsWithStats`**

Create `tests/services/plantRepository.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { mergePlantsWithStats } from '@/lib/services/plantRepository';
import type { Plant } from '@/lib/services/plantRepository';

const basePlant: Plant = {
  id: 'p1',
  userId: 'u1',
  createdAt: new Date('2026-04-01T00:00:00Z'),
  nickname: 'Hortensie am Zaun',
  species: 'Bauernhortensie',
  latinName: 'Hydrangea macrophylla',
  matchedContentId: 'plant_hortensie',
  coverImagePath: 'u1/scan-x.jpg',
  zoneLabel: null,
  originScanId: 's1',
};

describe('plantRepository.mergePlantsWithStats', () => {
  it('joins scan aggregates onto plants', () => {
    const plants: Plant[] = [
      { ...basePlant, id: 'p1' },
      { ...basePlant, id: 'p2', nickname: 'Rose' },
    ];
    const aggregates = new Map([
      ['p1', { count: 3, lastScanAt: new Date('2026-04-15T10:00:00Z') }],
      ['p2', { count: 1, lastScanAt: new Date('2026-04-10T10:00:00Z') }],
    ]);

    const result = mergePlantsWithStats(plants, aggregates);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 'p1',
      scanCount: 3,
      lastScanAt: new Date('2026-04-15T10:00:00Z'),
    });
    expect(result[1]).toMatchObject({
      id: 'p2',
      scanCount: 1,
      lastScanAt: new Date('2026-04-10T10:00:00Z'),
    });
  });

  it('returns zero counts for plants without scans', () => {
    const plants: Plant[] = [{ ...basePlant, id: 'p1' }];
    const aggregates = new Map<string, { count: number; lastScanAt: Date }>();

    const result = mergePlantsWithStats(plants, aggregates);

    expect(result).toEqual([
      expect.objectContaining({ id: 'p1', scanCount: 0, lastScanAt: null }),
    ]);
  });

  it('preserves plant order from input array', () => {
    const plants: Plant[] = [
      { ...basePlant, id: 'a' },
      { ...basePlant, id: 'b' },
      { ...basePlant, id: 'c' },
    ];
    const result = mergePlantsWithStats(plants, new Map());
    expect(result.map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });
});
```

- [ ] **Step 2: Run test — expect import failure**

Run: `npm test -- plantRepository`
Expected: FAIL with module-not-found error for `@/lib/services/plantRepository`.

- [ ] **Step 3: Create plantRepository with types and pure helper**

Create `src/lib/services/plantRepository.ts`:

```ts
import 'server-only';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

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

export interface PlantScanAggregate {
  count: number;
  lastScanAt: Date;
}

export function mergePlantsWithStats(
  plants: Plant[],
  aggregates: Map<string, PlantScanAggregate>
): PlantWithStats[] {
  return plants.map((p) => {
    const agg = aggregates.get(p.id);
    return {
      ...p,
      scanCount: agg?.count ?? 0,
      lastScanAt: agg?.lastScanAt ?? null,
    };
  });
}

interface PlantRow {
  id: string;
  user_id: string;
  created_at: string;
  nickname: string;
  species: string;
  latin_name: string | null;
  matched_content_id: string | null;
  cover_image_path: string;
  zone_label: string | null;
  origin_scan_id: string | null;
}

function rowToPlant(row: PlantRow): Plant {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: new Date(row.created_at),
    nickname: row.nickname,
    species: row.species,
    latinName: row.latin_name,
    matchedContentId: row.matched_content_id,
    coverImagePath: row.cover_image_path,
    zoneLabel: row.zone_label,
    originScanId: row.origin_scan_id,
  };
}

// DB-bound functions are added in Task 5.
```

Note the trailing comment is a deliberate pause point — DB ops come in Task 5.

- [ ] **Step 4: Run test — expect pass**

Run: `npm test -- plantRepository`
Expected: 3 PASS for `mergePlantsWithStats`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/plantRepository.ts tests/services/plantRepository.test.ts
git commit -m "plant(repo): add Plant types and mergePlantsWithStats helper"
```

---

## Task 5: plantRepository — DB operations

**Files:**
- Modify: `src/lib/services/plantRepository.ts`

- [ ] **Step 1: Add `createPlantFromScan`**

Append (replacing the trailing comment from Task 4):

```ts
export async function createPlantFromScan(input: CreatePlantInput): Promise<Plant> {
  const supabase = createServiceRoleClient();

  const { data: scanRow, error: scanErr } = await supabase
    .from('scans')
    .select('id, user_id, status, plant_id, image_path, matched_content_id')
    .eq('id', input.scanId)
    .eq('user_id', input.userId)
    .maybeSingle();

  if (scanErr) throw new Error(`createPlantFromScan scan-fetch: ${scanErr.message}`);
  if (!scanRow) throw new Error('createPlantFromScan: scan not found');
  if (scanRow.status !== 'ok') throw new Error('createPlantFromScan: scan status is not ok');
  if (scanRow.plant_id) throw new Error('createPlantFromScan: scan already has a plant');

  let species = 'Unbekannte Art';
  let latinName: string | null = null;
  const { data: cand } = await supabase
    .from('scan_candidates')
    .select('scientific_name, common_names')
    .eq('scan_id', scanRow.id)
    .eq('rank', 1)
    .maybeSingle();
  if (cand) {
    species = cand.common_names?.[0] ?? cand.scientific_name;
    latinName = cand.scientific_name;
  }

  const { data: insertedRow, error: insErr } = await supabase
    .from('plants')
    .insert({
      user_id: input.userId,
      nickname: input.nickname,
      species,
      latin_name: latinName,
      matched_content_id: scanRow.matched_content_id ?? null,
      cover_image_path: scanRow.image_path,
      zone_label: input.zoneLabel ?? null,
      origin_scan_id: scanRow.id,
    })
    .select('*')
    .single();

  if (insErr || !insertedRow) {
    throw new Error(`createPlantFromScan insert: ${insErr?.message ?? 'unknown'}`);
  }

  const plant = rowToPlant(insertedRow as PlantRow);

  const { error: updErr } = await supabase
    .from('scans')
    .update({ plant_id: plant.id })
    .eq('id', scanRow.id)
    .eq('user_id', input.userId);

  if (updErr) {
    await supabase.from('plants').delete().eq('id', plant.id);
    throw new Error(`createPlantFromScan link-scan: ${updErr.message}`);
  }

  return plant;
}
```

Note: the candidate lookup runs whether or not `matched_content_id` is set. We always have a top candidate at status='ok' (otherwise the scan wouldn't be in `ok` state).

- [ ] **Step 2: Add `attachScanToPlant`**

Append:

```ts
export async function attachScanToPlant(
  scanId: string,
  plantId: string,
  userId: string
): Promise<void> {
  const supabase = createServiceRoleClient();

  const { data: plant, error: plantErr } = await supabase
    .from('plants')
    .select('id')
    .eq('id', plantId)
    .eq('user_id', userId)
    .maybeSingle();

  if (plantErr) throw new Error(`attachScanToPlant plant-fetch: ${plantErr.message}`);
  if (!plant) throw new Error('attachScanToPlant: plant not found');

  const { data: updated, error: updErr } = await supabase
    .from('scans')
    .update({ plant_id: plantId })
    .eq('id', scanId)
    .eq('user_id', userId)
    .is('plant_id', null)
    .eq('status', 'ok')
    .select('id')
    .maybeSingle();

  if (updErr) throw new Error(`attachScanToPlant update: ${updErr.message}`);
  if (!updated) throw new Error('attachScanToPlant: scan not eligible');
}
```

- [ ] **Step 3: Add `listPlantsForUser`**

Append:

```ts
export async function listPlantsForUser(userId: string): Promise<PlantWithStats[]> {
  const supabase = createServiceRoleClient();

  const { data: plantRows, error: plantErr } = await supabase
    .from('plants')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (plantErr) throw new Error(`listPlantsForUser plants: ${plantErr.message}`);
  if (!plantRows || plantRows.length === 0) return [];

  const plants = (plantRows as PlantRow[]).map(rowToPlant);

  const { data: scanRows, error: scanErr } = await supabase
    .from('scans')
    .select('plant_id, created_at')
    .eq('user_id', userId)
    .not('plant_id', 'is', null);

  if (scanErr) throw new Error(`listPlantsForUser scans: ${scanErr.message}`);

  const aggregates = new Map<string, PlantScanAggregate>();
  for (const row of scanRows ?? []) {
    if (!row.plant_id) continue;
    const existing = aggregates.get(row.plant_id);
    const ts = new Date(row.created_at);
    if (existing) {
      existing.count += 1;
      if (ts > existing.lastScanAt) existing.lastScanAt = ts;
    } else {
      aggregates.set(row.plant_id, { count: 1, lastScanAt: ts });
    }
  }

  return mergePlantsWithStats(plants, aggregates);
}
```

- [ ] **Step 4: Add `getPlantById` and `listPlantsForAssignment`**

Append:

```ts
export async function getPlantById(
  plantId: string,
  userId: string
): Promise<Plant | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .eq('id', plantId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(`getPlantById: ${error.message}`);
  if (!data) return null;
  return rowToPlant(data as PlantRow);
}

export interface AssignablePlant {
  id: string;
  nickname: string;
  species: string;
  coverImagePath: string;
  sameSpecies: boolean;
}

export async function listPlantsForAssignment(
  userId: string,
  matchedContentId: string | null
): Promise<AssignablePlant[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('plants')
    .select('id, nickname, species, cover_image_path, matched_content_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`listPlantsForAssignment: ${error.message}`);
  if (!data) return [];

  const items = data.map((r) => ({
    id: r.id,
    nickname: r.nickname,
    species: r.species,
    coverImagePath: r.cover_image_path,
    sameSpecies: matchedContentId !== null && r.matched_content_id === matchedContentId,
  }));

  return items.sort((a, b) => {
    if (a.sameSpecies !== b.sameSpecies) return a.sameSpecies ? -1 : 1;
    return 0;
  });
}
```

- [ ] **Step 5: Verify typecheck and tests**

Run: `npx tsc --noEmit && npm test`
Expected: tsc clean, all tests still pass (the 3 from Task 4 stay green).

- [ ] **Step 6: Commit**

```bash
git add src/lib/services/plantRepository.ts
git commit -m "plant(repo): add DB ops (create/attach/list/getById/assignable)"
```

---

## Task 6: API — POST /api/plants

**Files:**
- Create: `src/app/api/plants/route.ts`

- [ ] **Step 1: Write the route handler**

Create `src/app/api/plants/route.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPlantFromScan } from '@/lib/services/plantRepository';

interface Body {
  scanId?: unknown;
  nickname?: unknown;
  zoneLabel?: unknown;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const scanId = typeof body.scanId === 'string' ? body.scanId : null;
  const rawNickname = typeof body.nickname === 'string' ? body.nickname.trim() : '';
  const rawZone = typeof body.zoneLabel === 'string' ? body.zoneLabel.trim() : '';

  if (!scanId) {
    return NextResponse.json({ error: 'invalid_scan_id' }, { status: 400 });
  }
  if (rawNickname.length < 1 || rawNickname.length > 80) {
    return NextResponse.json({ error: 'invalid_nickname' }, { status: 400 });
  }
  if (rawZone.length > 80) {
    return NextResponse.json({ error: 'invalid_zone' }, { status: 400 });
  }

  try {
    const plant = await createPlantFromScan({
      userId: user.id,
      scanId,
      nickname: rawNickname,
      zoneLabel: rawZone.length === 0 ? undefined : rawZone,
    });
    return NextResponse.json({ plantId: plant.id }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    if (msg.includes('scan not found')) {
      return NextResponse.json({ error: 'scan_not_found' }, { status: 404 });
    }
    if (msg.includes('status is not ok') || msg.includes('already has a plant')) {
      return NextResponse.json({ error: 'invalid_state' }, { status: 409 });
    }
    return NextResponse.json({ error: 'internal_error', detail: msg }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/plants/route.ts
git commit -m "api(plants): POST /api/plants creates plant from scan"
```

---

## Task 7: API — POST /api/scans/[id]/assign

**Files:**
- Create: `src/app/api/scans/[id]/assign/route.ts`

- [ ] **Step 1: Write the route handler**

Create `src/app/api/scans/[id]/assign/route.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { attachScanToPlant } from '@/lib/services/plantRepository';

interface Body {
  plantId?: unknown;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: scanId } = await ctx.params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  const plantId = body && typeof body.plantId === 'string' ? body.plantId : null;
  if (!plantId) {
    return NextResponse.json({ error: 'invalid_plant_id' }, { status: 400 });
  }

  try {
    await attachScanToPlant(scanId, plantId, user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    if (msg.includes('plant not found')) {
      return NextResponse.json({ error: 'plant_not_found' }, { status: 404 });
    }
    if (msg.includes('not eligible')) {
      return NextResponse.json({ error: 'invalid_state' }, { status: 409 });
    }
    return NextResponse.json({ error: 'internal_error', detail: msg }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/scans/[id]/assign/route.ts
git commit -m "api(scans): POST /api/scans/[id]/assign links scan to plant"
```

---

## Task 8: API — GET /api/plants/assignable

**Files:**
- Create: `src/app/api/plants/assignable/route.ts`

- [ ] **Step 1: Write the route handler**

Create `src/app/api/plants/assignable/route.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listPlantsForAssignment } from '@/lib/services/plantRepository';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const url = new URL(req.url);
  const contentId = url.searchParams.get('contentId');

  const plants = await listPlantsForAssignment(user.id, contentId);
  return NextResponse.json({ plants });
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/plants/assignable/route.ts
git commit -m "api(plants): GET /api/plants/assignable returns assignable list"
```

---

## Task 9: SavePlantPrompt — inline CTA on scan result

**Files:**
- Create: `src/components/features/plant/SavePlantPrompt.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/features/plant/SavePlantPrompt.tsx`:

```tsx
import Link from 'next/link';
import { Sprout, ArrowRight } from 'lucide-react';

interface Props {
  scanId: string;
}

export function SavePlantPrompt({ scanId }: Props) {
  return (
    <section className="px-5 pt-6">
      <Link
        href={`/scan/${scanId}/save`}
        className="tap-press flex items-center gap-3 rounded-[18px] border border-moss-300 bg-paper p-4"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-moss-100">
          <Sprout className="h-5 w-5 text-moss-700" strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-bark-900">
            Diese Pflanze in deinen Garten aufnehmen
          </p>
          <p className="text-[12px] text-ink-muted leading-snug mt-0.5">
            Mit einem Tippen speichern und später den Verlauf sehen
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-bark-900" strokeWidth={1.75} />
      </Link>
    </section>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/plant/SavePlantPrompt.tsx
git commit -m "ui(plant): add SavePlantPrompt inline CTA"
```

---

## Task 10: SavePlantSheet — client save form (two tabs)

**Files:**
- Create: `src/components/features/plant/SavePlantSheet.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/features/plant/SavePlantSheet.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Sprout, Plus } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import type { AssignablePlant } from '@/lib/services/plantRepository';

interface Props {
  scanId: string;
  defaultNickname: string;
  candidatePlants: AssignablePlant[];
  signedCoverUrls: Record<string, string>; // plantId -> signed URL
}

type Tab = 'new' | 'existing';

export function SavePlantSheet({
  scanId,
  defaultNickname,
  candidatePlants,
  signedCoverUrls,
}: Props) {
  const router = useRouter();
  const hasExisting = candidatePlants.length > 0;
  const [tab, setTab] = useState<Tab>('new');
  const [nickname, setNickname] = useState(defaultNickname);
  const [zone, setZone] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitNew(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/plants', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          scanId,
          nickname: nickname.trim(),
          zoneLabel: zone.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? `Fehler ${res.status}`);
        setPending(false);
        return;
      }
      router.push(`/scan/${scanId}`);
      router.refresh();
    } catch {
      setError('Netzwerkfehler — bitte nochmal versuchen.');
      setPending(false);
    }
  }

  async function submitExisting(plantId: string) {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/scans/${scanId}/assign`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ plantId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? `Fehler ${res.status}`);
        setPending(false);
        return;
      }
      router.push(`/scan/${scanId}`);
      router.refresh();
    } catch {
      setError('Netzwerkfehler — bitte nochmal versuchen.');
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-linen pb-28">
      <header className="flex items-center gap-3 px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-3">
        <Link
          href={`/scan/${scanId}`}
          className="tap-press flex h-10 w-10 items-center justify-center rounded-full bg-cream/92"
        >
          <ArrowLeft className="h-5 w-5 text-bark-900" />
        </Link>
        <h1 className="font-serif text-[22px] text-bark-900">
          In den Garten
        </h1>
      </header>

      {hasExisting && (
        <div className="px-5 pt-2">
          <div className="grid grid-cols-2 gap-1 rounded-full bg-paper p-1">
            <button
              onClick={() => setTab('new')}
              className={`tap-press rounded-full py-2 text-[13px] font-semibold transition ${
                tab === 'new'
                  ? 'bg-moss-600 text-cream'
                  : 'text-bark-900'
              }`}
            >
              Neu
            </button>
            <button
              onClick={() => setTab('existing')}
              className={`tap-press rounded-full py-2 text-[13px] font-semibold transition ${
                tab === 'existing'
                  ? 'bg-moss-600 text-cream'
                  : 'text-bark-900'
              }`}
            >
              Bestehend
            </button>
          </div>
        </div>
      )}

      {tab === 'new' && (
        <form onSubmit={submitNew} className="px-5 pt-6 space-y-4">
          <div>
            <label className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Name dieser Pflanze
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={80}
              autoFocus
              required
              placeholder={defaultNickname}
              className="mt-2 w-full rounded-[14px] border border-clay-800/15 bg-paper px-4 py-3 text-[15px] text-bark-900 placeholder:text-ink-muted/60 focus:outline-none focus:border-moss-500"
            />
          </div>
          <div>
            <label className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Zone (optional)
            </label>
            <input
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              maxLength={80}
              placeholder="z.B. Vorgarten, Hochbeet Süd"
              className="mt-2 w-full rounded-[14px] border border-clay-800/15 bg-paper px-4 py-3 text-[15px] text-bark-900 placeholder:text-ink-muted/60 focus:outline-none focus:border-moss-500"
            />
          </div>
          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={pending || nickname.trim().length === 0}
            iconLeft={<Plus className="h-4 w-4" />}
          >
            {pending ? 'Speichert ...' : 'Pflanze anlegen'}
          </Button>
          {error && <p className="text-[12px] text-berry-700">{error}</p>}
        </form>
      )}

      {tab === 'existing' && hasExisting && (
        <div className="px-5 pt-6 space-y-2">
          {candidatePlants.map((p) => (
            <button
              key={p.id}
              onClick={() => submitExisting(p.id)}
              disabled={pending}
              className="tap-press flex w-full items-center gap-3 rounded-[16px] border border-clay-800/10 bg-paper p-3 text-left disabled:opacity-50"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px]">
                {signedCoverUrls[p.id] && (
                  <Image
                    src={signedCoverUrls[p.id]}
                    alt={p.nickname}
                    fill
                    unoptimized
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-[14px] font-semibold text-bark-900">
                  {p.nickname}
                </p>
                <p className="text-[12px] text-ink-muted">{p.species}</p>
              </div>
              {p.sameSpecies && (
                <span className="shrink-0 rounded-full bg-moss-100 px-2 py-0.5 text-[10px] font-semibold text-moss-700">
                  gleiche Art
                </span>
              )}
            </button>
          ))}
          {error && <p className="text-[12px] text-berry-700">{error}</p>}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/plant/SavePlantSheet.tsx
git commit -m "ui(plant): add SavePlantSheet client component"
```

---

## Task 11: /scan/[id]/save — server entry page

**Files:**
- Create: `src/app/scan/[id]/save/page.tsx`

- [ ] **Step 1: Write the server page**

Create `src/app/scan/[id]/save/page.tsx`:

```tsx
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getScanById } from '@/lib/services/scanRepository';
import { listPlantsForAssignment } from '@/lib/services/plantRepository';
import { createSignedReadUrl } from '@/lib/services/imageStorageService';
import { SavePlantSheet } from '@/components/features/plant/SavePlantSheet';
import { OnboardingGuard } from '@/components/features/onboarding/OnboardingGuard';
import { getContentById } from '@/content';

export default async function SavePlantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/app');

  const scan = await getScanById(id, user.id);
  if (!scan) return notFound();
  if (scan.outcome.status !== 'ok' || scan.plantId) {
    redirect(`/scan/${id}`);
  }

  const top = scan.outcome.candidates[0];
  if (!top) return notFound();

  const matchedEntry = scan.matchedContentId
    ? getContentById(scan.matchedContentId)
    : null;
  const defaultNickname =
    matchedEntry?.name ?? top.commonNames[0] ?? top.scientificName;

  const candidatePlants = await listPlantsForAssignment(
    user.id,
    scan.matchedContentId ?? null
  );

  const signedCoverUrls: Record<string, string> = {};
  for (const p of candidatePlants) {
    signedCoverUrls[p.id] = await createSignedReadUrl(p.coverImagePath, 3600);
  }

  return (
    <OnboardingGuard>
      <SavePlantSheet
        scanId={id}
        defaultNickname={defaultNickname}
        candidatePlants={candidatePlants}
        signedCoverUrls={signedCoverUrls}
      />
    </OnboardingGuard>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/app/scan/[id]/save/page.tsx
git commit -m "scan(save): add /scan/[id]/save server page"
```

---

## Task 12: Wire SavePlantPrompt into /scan/[id]/page.tsx

**Files:**
- Modify: `src/app/scan/[id]/page.tsx`

- [ ] **Step 1: Add import**

Open `src/app/scan/[id]/page.tsx`, add to the imports near the top (alongside other component imports):

```tsx
import { SavePlantPrompt } from "@/components/features/plant/SavePlantPrompt";
```

- [ ] **Step 2: Render the prompt before the FollowUpActions section**

Find the `matchedEntry` branch (currently around line 188-296, the `{matchedEntry ? (` block). Inside that block, immediately after `<FollowUpActions scanId={scan.id} initialFollowUp={followUp} />` (currently line 198), add:

```tsx
            {!scan.plantId && <SavePlantPrompt scanId={scan.id} />}
```

The conditional ensures the CTA disappears once the user has saved or assigned the scan.

- [ ] **Step 3: Verify typecheck and visually inspect**

Run: `npx tsc --noEmit`
Expected: clean.

Optional: `npm run dev` and open a known-ok scan in the browser. The CTA card should appear below FollowUpActions.

- [ ] **Step 4: Commit**

```bash
git add src/app/scan/[id]/page.tsx
git commit -m "scan(result): show SavePlantPrompt for unsaved ok scans"
```

---

## Task 13: Refactor /garden/page.tsx — real plants

**Files:**
- Modify: `src/app/garden/page.tsx`

- [ ] **Step 1: Rewrite the page from scratch**

Replace the entire contents of `src/app/garden/page.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { Plus, MapPin } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PlantTile } from '@/components/features/garden/PlantTile';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { OnboardingGuard } from '@/components/features/onboarding/OnboardingGuard';
import { createClient } from '@/lib/supabase/server';
import { listPlantsForUser } from '@/lib/services/plantRepository';
import { createSignedReadUrl } from '@/lib/services/imageStorageService';

export default async function GardenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/app');

  const plants = await listPlantsForUser(user.id);

  const tiles = await Promise.all(
    plants.map(async (p) => ({
      id: p.id,
      nickname: p.nickname,
      species: p.species,
      latinName: p.latinName ?? undefined,
      photoUrl: await createSignedReadUrl(p.coverImagePath, 3600),
      addedAt: p.createdAt,
      zoneLabel: p.zoneLabel ?? '',
      healthStatus: 'HEALTHY' as const,
      lastScanAt: p.lastScanAt ?? undefined,
      scanCount: p.scanCount,
    }))
  );

  return (
    <OnboardingGuard>
      <AppShell>
        <div className="px-5 pt-8 safe-top">
          <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted mb-2">
            Mein Garten
          </p>
          <h1 className="font-serif text-[32px] leading-tight tracking-tight text-forest-900 font-normal">
            {plants.length === 0
              ? 'Noch keine Pflanzen'
              : `${plants.length} ${plants.length === 1 ? 'Pflanze' : 'Pflanzen'}`}
          </h1>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-paper/70 border border-sage-200/60 backdrop-blur px-3 py-1.5">
            <MapPin className="h-3.5 w-3.5 text-moss-600" strokeWidth={1.75} />
            <span className="text-[12px] text-forest-800">
              Zone 8a · mittlere Feuchtigkeit
            </span>
          </div>
        </div>

        {plants.length === 0 ? (
          <section className="px-5 pt-8">
            <EmptyState
              mark="seedling"
              title="Dein Garten ist noch leer"
              body="Scanne deine erste Pflanze, um sie hier zu sehen."
              ctaLabel="Erste Pflanze scannen"
              ctaHref="/scan/new"
            />
          </section>
        ) : (
          <>
            <section className="px-5 pt-8">
              <div className="grid grid-cols-2 gap-3">
                {tiles.map((p) => (
                  <PlantTile key={p.id} plant={p} />
                ))}
              </div>
            </section>

            <section className="px-5 pt-8">
              <Button
                href="/scan/new"
                variant="secondary"
                fullWidth
                size="lg"
                iconLeft={<Plus className="h-5 w-5" />}
              >
                Pflanze hinzufügen
              </Button>
            </section>
          </>
        )}
      </AppShell>
    </OnboardingGuard>
  );
}
```

The `healthStatus: 'HEALTHY' as const` is an interim shim so `<PlantTile>` keeps its current prop signature. Phase C will replace `<PlantTile>` to drop the field.

- [ ] **Step 2: Verify typecheck and visually inspect**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/app/garden/page.tsx
git commit -m "garden(page): replace mocks with real plants from DB"
```

---

## Task 14: Refactor /garden/[plantId]/page.tsx — real plant + history

**Background note:** The existing `<HistoryEntry>` component takes `ScanHistoryItem` from
`src/lib/mock/scans` (which we delete in Task 15) and is only consumed here. Rather
than rewrite its prop signature, we inline a row component on this page —
the same approach `/history/page.tsx` uses.

**Files:**
- Modify: `src/app/garden/[plantId]/page.tsx`
- Delete: `src/components/features/history/HistoryEntry.tsx` (handled in Task 15 cleanup)

- [ ] **Step 1: Rewrite the page**

Replace the entire contents of `src/app/garden/[plantId]/page.tsx`:

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, CalendarDays, Leaf, Camera } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UrgencyIndicator } from '@/components/ui/UrgencyIndicator';
import { formatRelativeDate } from '@/lib/utils';
import { OnboardingGuard } from '@/components/features/onboarding/OnboardingGuard';
import { createClient } from '@/lib/supabase/server';
import { getPlantById } from '@/lib/services/plantRepository';
import { listScansForPlant } from '@/lib/services/scanRepository';
import { createSignedReadUrl } from '@/lib/services/imageStorageService';
import { getScanCaseSummary } from '@/lib/scan/caseSummary';
import { getContentById } from '@/content';

export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ plantId: string }>;
}) {
  const { plantId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/app');

  const plant = await getPlantById(plantId, user.id);
  if (!plant) return notFound();

  const scans = await listScansForPlant(plant.id, user.id);
  const coverUrl = await createSignedReadUrl(plant.coverImagePath, 3600);

  const scanRows = await Promise.all(
    scans.map(async (s) => {
      const matchedEntry = s.matchedContentId
        ? getContentById(s.matchedContentId) ?? undefined
        : undefined;
      const summary = getScanCaseSummary(s, matchedEntry, undefined);
      const signedUrl = await createSignedReadUrl(s.imagePath, 3600);
      return { scan: s, summary, signedUrl };
    })
  );

  const lastScanAt = scans[0]?.createdAt;

  return (
    <OnboardingGuard>
      <div className="min-h-screen bg-sage-50 pb-20">
        <div className="relative h-[50vh] min-h-[380px] w-full overflow-hidden">
          <Image
            src={coverUrl}
            alt={plant.nickname}
            fill
            priority
            unoptimized
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-900/30 via-transparent to-sage-50" />

          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-3">
            <Link
              href="/garden"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-paper/80 backdrop-blur-md active:scale-95 transition"
            >
              <ArrowLeft className="h-5 w-5 text-forest-700" />
            </Link>
          </div>

          <div className="absolute bottom-6 left-5 right-5">
            <h1 className="font-serif text-[34px] leading-[1.1] tracking-tight text-paper drop-shadow-md font-normal mt-3">
              {plant.nickname}
            </h1>
            <p className="text-[14px] text-paper/90 mt-1 drop-shadow">
              {plant.species}
              {plant.latinName && (
                <span className="italic opacity-75"> · {plant.latinName}</span>
              )}
            </p>
          </div>
        </div>

        <section className="px-5 pt-6">
          <div className="grid grid-cols-3 gap-2 rounded-[16px] bg-paper p-1">
            <Stat label="Zone" value={plant.zoneLabel ?? '—'} />
            <Stat label="Scans" value={scans.length.toString()} />
            <Stat
              label="Zuletzt"
              value={lastScanAt ? formatRelativeDate(lastScanAt) : '—'}
            />
          </div>
        </section>

        <section className="px-5 pt-8">
          <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted mb-3">
            Über diese Pflanze
          </p>
          <div className="space-y-3">
            <InfoRow icon={CalendarDays} label="Hinzugefügt" value={formatRelativeDate(plant.createdAt)} />
            <InfoRow icon={Leaf} label="Art" value={plant.species} />
          </div>
        </section>

        {scanRows.length > 0 && (
          <section className="px-5 pt-8">
            <h2 className="font-serif text-[22px] leading-tight text-forest-900 font-normal mb-3">
              Verlauf dieser Pflanze
            </h2>
            <div className="space-y-3">
              {scanRows.map(({ scan, summary, signedUrl }) => (
                <Link
                  key={scan.id}
                  href={`/scan/${scan.id}`}
                  className="flex gap-3 rounded-[18px] bg-paper p-4 shadow-[var(--shadow-soft)] tap-press"
                >
                  <div
                    className="h-16 w-16 shrink-0 rounded-[12px] bg-cover bg-center photo-graded"
                    style={{ backgroundImage: `url(${signedUrl})` }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold text-bark-900">
                          {summary.title}
                        </p>
                        <p className="mt-0.5 text-[12px] text-ink-muted">
                          {summary.subtitle}
                        </p>
                      </div>
                      <UrgencyIndicator urgency={summary.urgency} />
                    </div>
                    <p className="mt-2 text-[11px] text-ink-muted">
                      {formatRelativeDate(scan.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="px-5 pt-8">
          <Button
            href="/scan/new"
            fullWidth
            size="lg"
            iconLeft={<Camera className="h-5 w-5" />}
          >
            Neuen Scan machen
          </Button>
        </section>
      </div>
    </OnboardingGuard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-sage-50 text-center py-3 px-2">
      <p className="font-serif text-[15px] leading-none text-forest-900 truncate">
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider font-medium text-ink-muted mt-1">
        {label}
      </p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] bg-paper px-4 py-3">
      <Icon className="h-4 w-4 text-forest-700" strokeWidth={1.75} />
      <span className="text-[13px] text-ink-muted">{label}</span>
      <span className="ml-auto text-[14px] font-medium text-forest-900">
        {value}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: clean. The page no longer imports `<HistoryEntry>`, so it doesn't break when that file is deleted in Task 15.

- [ ] **Step 3: Commit**

```bash
git add src/app/garden/[plantId]/page.tsx
git commit -m "garden(detail): replace mocks with real plant + inline scan history"
```

---

## Task 15: Delete mock files + dead components + clean up types

**Files:**
- Delete: `src/lib/mock/garden.ts`
- Delete: `src/lib/mock/scans.ts`
- Delete: `src/components/features/history/HistoryEntry.tsx` (no longer imported anywhere after Task 14)
- Modify: `src/lib/types.ts`
- Modify: `src/components/features/garden/PlantTile.tsx`

- [ ] **Step 1: Delete the mocks and HistoryEntry**

```bash
rm src/lib/mock/garden.ts src/lib/mock/scans.ts src/components/features/history/HistoryEntry.tsx
```

Verify HistoryEntry is gone-safe: `grep -rn "HistoryEntry" src` should return zero hits after the deletion (Task 14 already removed the import).

- [ ] **Step 2: Remove unused types from types.ts**

Open `src/lib/types.ts`. Remove the `Plant` interface (currently lines 43-55) and the `DailyTask` interface (currently lines 57-69). Keep `WeatherSnapshot` (consumed by `WeatherChip.tsx` and `lib/weather/openmeteo.ts`).

After removal, the imports section at the top can also drop unused symbols. Verify only `EffortLevel`, `MethodType`, `ActionTimeframe`, `Urgency` are still consumed by `Method` and `Recommendation`.

- [ ] **Step 3: Verify typecheck — expect failures from PlantTile**

Run: `npx tsc --noEmit`
Expected: errors. The `<PlantTile>` component imports `Plant` from `@/lib/types`. We need to either:
- (a) move the `Plant` type back into `PlantTile.tsx` as a local interface,
- (b) export a frontend-shaped Plant from somewhere else.

Pick (a). Open `src/components/features/garden/PlantTile.tsx`, replace the `import type { Plant }` line with a local interface that mirrors what was there:

```tsx
interface Plant {
  id: string;
  nickname: string;
  species: string;
  latinName?: string;
  photoUrl: string;
  addedAt: Date;
  zoneLabel: string;
  healthStatus: "HEALTHY" | "ATTENTION" | "CRITICAL" | "RECOVERING";
  lastScanAt?: Date;
  scanCount: number;
}
```

If `PlantTile` exports its own `Plant` type via a typed prop, leave the existing `Props` interface alone — just inline the `Plant` definition above it.

- [ ] **Step 4: Re-run typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Run all tests**

Run: `npm test`
Expected: all tests pass — the existing 31 plus the 3 from Task 4 = 34 green.

- [ ] **Step 6: Commit**

```bash
git add -A src/lib/mock src/components/features/history/HistoryEntry.tsx src/lib/types.ts src/components/features/garden/PlantTile.tsx
git commit -m "cleanup: remove mock garden data and dead HistoryEntry, inline Plant type in PlantTile"
```

Verify with `git status` that the three deletions and two modifications are all staged. `git add -A` on a directory captures deletions inside it.

---

## Task 16: Apply migration to Production + manual smoke test

**Files:** none

- [ ] **Step 1: Apply migration to Production Supabase**

Open Supabase Studio for the **Production** project. Paste the contents of `supabase/migrations/20260429120000_garden_persistence.sql` into the SQL Editor. Run.

Verify the same three checks from Task 1 Step 2 (table exists, plant_id column added, 4 policies on plants).

- [ ] **Step 2: Push code via Vercel**

```bash
git push origin main
```

Wait for Vercel to deploy. Confirm in the dashboard the deploy is green.

- [ ] **Step 3: Smoke test — flow A (new plant)**

On https://gartenscan.de:
1. Open the app, take a clear photo of a plant.
2. Wait for status `ok`.
3. Below the FollowUpActions, the "Diese Pflanze in deinen Garten aufnehmen" CTA should appear.
4. Tap it → SavePlantSheet opens, only "Neu" tab visible (no existing plants yet).
5. Nickname is pre-filled with the species name. Optionally change it. Optionally add a zone.
6. Tap "Pflanze anlegen". Should redirect back to scan/[id]; CTA is gone.
7. Open `/garden`. New tile is visible with the scan image as cover.
8. Tap the tile → `/garden/[plantId]` shows the cover, the stat bar (Zone, Scans=1, Zuletzt), and the scan in the history.

- [ ] **Step 4: Smoke test — flow B (assign to existing)**

1. Take another clear photo of the same plant.
2. After `ok`, tap CTA. SavePlantSheet now has both tabs.
3. Switch to "Bestehend". The previously created plant appears with a "gleiche Art" badge.
4. Tap it. Should redirect, CTA gone.
5. `/garden/[plantId]` for that plant now shows scan count = 2, with both history entries.
6. Cover image is still the FIRST scan, not the new one.

- [ ] **Step 5: Smoke test — cross-user isolation**

1. Open the app in an incognito window (creates anonymous user).
2. `/garden` should be empty (the previous user's plants must NOT appear).
3. Verify by trying to navigate to `/garden/<plantId-from-other-user>` — should return 404.

- [ ] **Step 6: Pipeline-update**

In a PowerShell prompt on the dev machine:

```powershell
pipeline-update -Slug gartenscanner `
  -Progress 96 `
  -Summary "Garten-Persistence Phase 1: plants table, save-flow nach Scan, real garden pages" `
  -Todos @("Phase C: Insekten + Krankheiten", "Phase D: Content 12->50 Arten", "Coach-LLM mit Plant-Kontext")
```

If the smoke tests reveal a bug, fix it before posting the update.

---

## Self-Review Checklist (the writer ran this — engineer can skim)

**Spec coverage:**
- ✓ DB schema → Task 1
- ✓ Repository (Plant types, helpers, DB ops, scanRepository extension) → Tasks 2, 3, 4, 5
- ✓ Three API routes → Tasks 6, 7, 8
- ✓ SavePlantPrompt → Task 9
- ✓ SavePlantSheet → Task 10
- ✓ /scan/[id]/save server page → Task 11
- ✓ Wire SavePlantPrompt into scan/[id] → Task 12
- ✓ /garden refactor → Task 13
- ✓ /garden/[plantId] refactor → Task 14
- ✓ Mocks deleted, types cleaned → Task 15
- ✓ Production migration + smoke test + pipeline-update → Task 16

**Tests:** 3 unit tests for `mergePlantsWithStats` (Task 4). The DB-bound functions and API routes are not unit-tested — this matches the existing repository pattern (`scanRepository.test.ts` only tests pure helpers). End-to-end coverage comes from the manual smoke test in Task 16.

**Type consistency:** `Plant`, `PlantWithStats`, `AssignablePlant`, `CreatePlantInput`, `PlantScanAggregate` all defined in `plantRepository.ts` and used consistently across API routes and UI.

**Out of scope (not implemented in this plan):**
- Plant edit/delete UI
- Cover-image swap
- Nachträglich-Speichern alter Scans
- Plant-zu-DailyTask-Verknüpfung
- Coach-LLM mit Plant-Kontext
