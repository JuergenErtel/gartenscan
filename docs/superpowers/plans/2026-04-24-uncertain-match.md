# Uncertain Match Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `uncertain_match` scan status for Pl@ntNet top-confidence in `[0.10, 0.25)` — the user sees the top candidate with two buttons ("Das ist es" / "Stimmt nicht") and their decision upgrades the scan to `ok` or `no_match` in the DB.

**Architecture:** Extend `ScanStatus` union, add a third branch to `analyzeImageService`, add `updateScanStatus` to `scanRepository`, add one POST endpoint with two actions, add one Client Component, wire it into the server-rendered scan page. No DB schema change. Rollback via changing one constant.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase (Postgres + Storage), Vitest (with `vi.mock`), Tailwind, React 19 Server + Client Components.

**Test strategy:** Pure-function / logic tests via Vitest (following existing `analyzeImageService.test.ts` pattern). No route-handler test framework exists in this repo, and `@testing-library/react` is not installed — manual browser verification is the pragmatic path for the Route and Component layers. Total test delta: +4 unit tests (3 for `analyzeImageService` branches, 1 for `caseSummary`).

**Spec:** `docs/superpowers/specs/2026-04-24-uncertain-match-design.md`

---

## File Structure

**Modified:**
- `src/domain/scan/ScanOutcome.ts` — ScanStatus union gains `'uncertain_match'`
- `src/lib/services/analyzeImageService.ts` — two threshold constants + three-branch decision
- `src/lib/services/scanRepository.ts` — new `updateScanStatus` function
- `src/lib/scan/caseSummary.ts` — new case for `uncertain_match`
- `src/app/scan/[id]/page.tsx` — hoist `signedImageUrl` + new branch

**Created:**
- `src/app/api/scans/[id]/status/route.ts` — POST handler for confirm/reject
- `src/components/features/scan/UncertainMatchState.tsx` — client component with two buttons
- `tests/services/caseSummary.test.ts` — new test file for case summary mapping

**Tests touched:**
- `tests/services/analyzeImageService.test.ts` — 3 new tests

---

## Task 1: Extend ScanStatus union

**Files:**
- Modify: `src/domain/scan/ScanOutcome.ts:6-11`

- [ ] **Step 1: Add `'uncertain_match'` to the union**

Open `src/domain/scan/ScanOutcome.ts`. Replace lines 6-11:

```ts
export type ScanStatus =
  | 'ok'
  | 'low_quality'
  | 'category_unsupported'
  | 'no_match'
  | 'uncertain_match'
  | 'provider_error';
```

- [ ] **Step 2: Verify type check**

Run: `npx tsc --noEmit`
Expected: PASS (no new type errors — unions stay assignable, existing code doesn't exhaustively switch on ScanStatus so no further changes needed yet).

- [ ] **Step 3: Commit**

```bash
git add src/domain/scan/ScanOutcome.ts
git commit -m "feat(scan): add uncertain_match to ScanStatus union"
```

---

## Task 2: Three-branch decision in analyzeImageService

**Files:**
- Modify: `src/lib/services/analyzeImageService.ts`
- Test: `tests/services/analyzeImageService.test.ts`

- [ ] **Step 1: Write failing test for uncertain_match branch**

Open `tests/services/analyzeImageService.test.ts`. After the test `no_match: max confidence below 0.25` (around line 80), insert these three new tests. Note: the existing test `no_match: max confidence below 0.25` uses `confidence: 0.2` — after our change this must become `uncertain_match` (top-score 0.2 is in [0.10, 0.25)). We edit that test rather than add a contradictory one.

First, replace the existing `no_match: max confidence below 0.25` test with:

```ts
  it('no_match: max confidence below 0.10', async () => {
    const triage = makeTriage({ category: 'plant', quality: 'acceptable' });
    const id = makeId({
      candidates: [{ rank: 1, scientificName: 'Rosa', commonNames: [], confidence: 0.05 }],
      providerRaw: {},
    });

    const outcome = await analyzeImage({ imageUrl: 'u', triage, identification: id });

    expect(outcome.status).toBe('no_match');
    expect(outcome.candidates).toHaveLength(0);
  });
```

Then append three new tests inside the `describe` block:

```ts
  it('uncertain_match: top confidence between 0.10 and 0.25 keeps only top candidate', async () => {
    const triage = makeTriage({ category: 'plant', quality: 'acceptable' });
    const id = makeId({
      candidates: [
        { rank: 1, scientificName: 'Pilosella officinarum', commonNames: ['Kleines Habichtskraut'], confidence: 0.15 },
        { rank: 2, scientificName: 'Plantago media', commonNames: [], confidence: 0.08 },
      ],
      providerRaw: {},
    });

    const outcome = await analyzeImage({ imageUrl: 'u', triage, identification: id });

    expect(outcome.status).toBe('uncertain_match');
    expect(outcome.candidates).toHaveLength(1);
    expect(outcome.candidates[0].scientificName).toBe('Pilosella officinarum');
  });

  it('uncertain_match: exactly at lower bound 0.10 is inclusive', async () => {
    const triage = makeTriage({ category: 'plant', quality: 'acceptable' });
    const id = makeId({
      candidates: [{ rank: 1, scientificName: 'X', commonNames: [], confidence: 0.10 }],
      providerRaw: {},
    });

    const outcome = await analyzeImage({ imageUrl: 'u', triage, identification: id });

    expect(outcome.status).toBe('uncertain_match');
  });

  it('ok: exactly at upper bound 0.25 is inclusive', async () => {
    const triage = makeTriage({ category: 'plant', quality: 'acceptable' });
    const id = makeId({
      candidates: [{ rank: 1, scientificName: 'X', commonNames: [], confidence: 0.25 }],
      providerRaw: {},
    });

    const outcome = await analyzeImage({ imageUrl: 'u', triage, identification: id });

    expect(outcome.status).toBe('ok');
  });
```

- [ ] **Step 2: Run tests to see failures**

Run: `npx vitest run tests/services/analyzeImageService.test.ts`
Expected: FAIL. `uncertain_match: top confidence between 0.10 and 0.25` fails because current code returns `no_match` (0.15 < MIN_CONFIDENCE 0.25). `exactly at lower bound 0.10` also fails for same reason. Existing-but-renamed `no_match: max confidence below 0.10` passes (0.05 is below old threshold too). `exactly at upper bound 0.25` passes (≥ 0.25 already returns `ok`).

- [ ] **Step 3: Update analyzeImageService with three-branch logic**

Open `src/lib/services/analyzeImageService.ts`. Replace line 6:

```ts
const MIN_CONFIDENCE = 0.25;
```

With:

```ts
const AUTO_OK_CONFIDENCE = 0.25;
const UNCERTAIN_MIN_CONFIDENCE = 0.10;
```

Replace the block on lines 58-73 (the current `qualified`-filter + two-branch return):

```ts
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
```

With:

```ts
  const sorted = [...ident.candidates].sort((a, b) => b.confidence - a.confidence);
  const top = sorted[0];

  if (top && top.confidence >= AUTO_OK_CONFIDENCE) {
    return {
      status: 'ok',
      triage,
      candidates: sorted.filter((c) => c.confidence >= AUTO_OK_CONFIDENCE).slice(0, 3),
      provider: input.identification.name,
    };
  }

  if (top && top.confidence >= UNCERTAIN_MIN_CONFIDENCE) {
    return {
      status: 'uncertain_match',
      triage,
      candidates: [top],
      provider: input.identification.name,
    };
  }

  return {
    status: 'no_match',
    triage,
    candidates: [],
    provider: input.identification.name,
  };
```

- [ ] **Step 4: Run tests to verify green**

Run: `npx vitest run tests/services/analyzeImageService.test.ts`
Expected: PASS (all 8 tests now: 5 existing + 3 new).

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/analyzeImageService.ts tests/services/analyzeImageService.test.ts
git commit -m "feat(scan): add uncertain_match branch in analyzeImageService"
```

---

## Task 3: caseSummary mapping for uncertain_match

**Files:**
- Modify: `src/lib/scan/caseSummary.ts:55-94`
- Create: `tests/services/caseSummary.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/services/caseSummary.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getScanCaseSummary } from '@/lib/scan/caseSummary';
import type { StoredScan } from '@/domain/scan/ScanOutcome';

function makeScan(overrides: Partial<StoredScan> = {}): StoredScan {
  return {
    id: 's1',
    userId: 'u1',
    createdAt: new Date(),
    imagePath: 'path.jpg',
    outcome: {
      status: 'uncertain_match',
      candidates: [
        { rank: 1, scientificName: 'Pilosella officinarum', commonNames: ['Kleines Habichtskraut'], confidence: 0.15 },
      ],
    },
    ...overrides,
  };
}

describe('getScanCaseSummary', () => {
  it('uncertain_match without matchedEntry shows "Bestätigung offen"', () => {
    const summary = getScanCaseSummary(makeScan());

    expect(summary.title).toBe('Bestätigung offen');
    expect(summary.subtitle).toBe('Wartet auf deine Rückmeldung');
    expect(summary.urgency).toBe('MONITOR');
    expect(summary.actionable).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/services/caseSummary.test.ts`
Expected: FAIL — the switch-statement in `caseSummary.ts` has no `uncertain_match` case, so TypeScript-level it compiles but runtime returns `undefined` → `summary.title` throws.

- [ ] **Step 3: Add uncertain_match case to caseSummary**

Open `src/lib/scan/caseSummary.ts`. In the switch-statement (around lines 55-94), add a new case between `no_match` and `provider_error`:

```ts
    case "uncertain_match":
      return {
        title: "Bestätigung offen",
        subtitle: "Wartet auf deine Rückmeldung",
        nextStep:
          "Scan antippen und den Vorschlag bestätigen oder verwerfen",
        urgency: "MONITOR",
        actionable: true,
      };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/services/caseSummary.test.ts`
Expected: PASS.

Run full suite: `npx vitest run`
Expected: PASS (28 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/scan/caseSummary.ts tests/services/caseSummary.test.ts
git commit -m "feat(scan): map uncertain_match in case summary"
```

---

## Task 4: Add updateScanStatus to scanRepository

**Files:**
- Modify: `src/lib/services/scanRepository.ts` (append at end)

No unit test in this task — the function talks to Supabase directly. Existing `scanRepository` tests only cover pure helpers. Verification happens via the route in Task 5 + manual end-to-end in Task 8.

- [ ] **Step 1: Add updateScanStatus function**

Open `src/lib/services/scanRepository.ts`. Append this function at the end of the file (after `listScansForUser`):

```ts
export async function updateScanStatus(
  scanId: string,
  userId: string,
  newStatus: 'ok' | 'no_match'
): Promise<StoredScan | null> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('scans')
    .update({ status: newStatus })
    .eq('id', scanId)
    .eq('user_id', userId)
    .eq('status', 'uncertain_match')
    .select('id')
    .maybeSingle();

  if (error) throw new Error(`updateScanStatus: ${error.message}`);
  if (!data) return null;

  return getScanById(scanId, userId);
}
```

Rationale: the `.eq('status', 'uncertain_match')` filter is the transition guard — concurrent confirms or a stale client can't double-update. `maybeSingle()` returns `null` when the row doesn't match, which maps to the 409 path in the route.

- [ ] **Step 2: Verify type check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/services/scanRepository.ts
git commit -m "feat(scan): add updateScanStatus with transition guard"
```

---

## Task 5: API route /api/scans/[id]/status

**Files:**
- Create: `src/app/api/scans/[id]/status/route.ts`

Follow the auth pattern from `src/app/api/scans/[id]/route.ts` (line 22-57, PATCH handler).

- [ ] **Step 1: Create the route handler**

Create `src/app/api/scans/[id]/status/route.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateScanStatus } from '@/lib/services/scanRepository';

type ConfirmAction = 'confirm' | 'reject';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const action = body?.action as ConfirmAction | undefined;
  if (action !== 'confirm' && action !== 'reject') {
    return NextResponse.json({ error: 'invalid action' }, { status: 400 });
  }

  const newStatus = action === 'confirm' ? 'ok' : 'no_match';
  const updated = await updateScanStatus(id, user.id, newStatus);

  if (!updated) {
    return NextResponse.json(
      { error: 'invalid_transition' },
      { status: 409 }
    );
  }

  return NextResponse.json({ scan: updated });
}
```

- [ ] **Step 2: Verify type check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/scans/[id]/status/route.ts
git commit -m "feat(api): POST /api/scans/[id]/status for confirm/reject"
```

---

## Task 6: UncertainMatchState component

**Files:**
- Create: `src/components/features/scan/UncertainMatchState.tsx`

This is a **Client Component** (`'use client'` directive) because it owns interactive state: loading, error, fetch calls, `router.refresh()`.

Styling follows the existing `/scan/[id]/page.tsx` ok-path (Hero layout) but muted — no urgency banner, no editorial-quality marker. Use existing UI primitives (`Button`, `BotanicalIcon`) from the codebase.

- [ ] **Step 1: Create the component**

Create `src/components/features/scan/UncertainMatchState.tsx`:

```tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { DetectionCandidate } from '@/domain/scan/ScanOutcome';

interface Props {
  scanId: string;
  candidate: DetectionCandidate;
  imageUrl: string;
}

type PendingAction = 'confirm' | 'reject' | null;

export function UncertainMatchState({ scanId, candidate, imageUrl }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);

  const heroName = candidate.commonNames[0] ?? candidate.scientificName;
  const confidencePct = Math.round(candidate.confidence * 100);

  async function submit(action: 'confirm' | 'reject') {
    setPending(action);
    setError(null);
    try {
      const res = await fetch(`/api/scans/${scanId}/status`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.status === 409) {
        setError('Dieser Scan wurde bereits eingeordnet.');
        router.refresh();
        return;
      }
      if (res.status === 401 || res.status === 403) {
        router.push('/app');
        return;
      }
      if (!res.ok) {
        throw new Error(`status ${res.status}`);
      }

      router.refresh();
    } catch {
      setError('Konnte nicht speichern, bitte nochmal versuchen.');
      setPending(null);
    }
  }

  return (
    <div className="min-h-screen bg-linen pb-28">
      <div className="relative h-[280px] overflow-hidden">
        <Image
          src={imageUrl}
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
          <Link
            href="/app"
            className="tap-press flex h-10 w-10 items-center justify-center rounded-full bg-cream/92 backdrop-blur-md"
          >
            <ArrowLeft className="h-5 w-5 text-bark-900" />
          </Link>
        </div>

        <div className="absolute top-[calc(max(env(safe-area-inset-top),1rem)+52px)] left-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-cream/92 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-bark-900">
            <span className="h-1.5 w-1.5 rounded-full bg-berry-500" />
            Nur {confidencePct} % sicher
          </span>
        </div>
      </div>

      <div className="relative -mt-7 rounded-t-[28px] bg-cream pt-6 pb-6 px-5 shadow-[0_-8px_24px_rgba(58,37,21,0.06)]">
        <p className="eyebrow mb-2">Vermutung, nicht bestätigt</p>
        <h1 className="font-serif text-[28px] leading-tight text-bark-900 mb-1">
          {heroName}
        </h1>
        <p className="latin-name text-[13px] mb-3">{candidate.scientificName}</p>
        <p className="pull-quote mt-3 mb-2">
          Unsere Erkennung ist hier nicht sicher genug für ein Urteil. Deine Bestätigung hilft, den nächsten Scan besser zu führen.
        </p>
      </div>

      <div className="px-5 pt-6">
        <div className="rounded-[18px] border border-clay-800/15 bg-paper p-5">
          <p className="mb-4 text-[13px] leading-relaxed text-bark-900">
            Ist das die Pflanze, die du fotografiert hast?
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => submit('confirm')}
              disabled={pending !== null}
              fullWidth
              iconLeft={<Check className="h-4 w-4" />}
            >
              {pending === 'confirm' ? 'Speichert ...' : 'Das ist es'}
            </Button>
            <Button
              onClick={() => submit('reject')}
              disabled={pending !== null}
              variant="secondary"
              fullWidth
              iconLeft={<X className="h-4 w-4" />}
            >
              {pending === 'reject' ? 'Speichert ...' : 'Stimmt nicht'}
            </Button>
          </div>
          {error && (
            <p className="mt-3 text-[12px] text-berry-700">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify Button component API**

Quickly verify `Button` supports `onClick`, `disabled`, `iconLeft`, `variant="secondary"`, `fullWidth` by opening `src/components/ui/Button.tsx` and scanning the props interface. If `iconLeft` is not supported (only `iconRight`), remove the `iconLeft` prop from both buttons — the component still works without icons.

- [ ] **Step 3: Verify type check**

Run: `npx tsc --noEmit`
Expected: PASS. If Button props mismatch, fix the component accordingly.

- [ ] **Step 4: Commit**

```bash
git add src/components/features/scan/UncertainMatchState.tsx
git commit -m "feat(scan): add UncertainMatchState component with confirm/reject"
```

---

## Task 7: Wire into /scan/[id]/page.tsx

**Files:**
- Modify: `src/app/scan/[id]/page.tsx`

- [ ] **Step 1: Add the uncertain_match branch + hoist signedImageUrl**

Open `src/app/scan/[id]/page.tsx`. Three edits:

**Edit 1** — add import at line 20 (after existing ScanResultStates import):

```tsx
import { UncertainMatchState } from "@/components/features/scan/UncertainMatchState";
```

**Edit 2** — after the `no_match` branch (line 68) and before the `provider_error` branch (line 69), add the new branch. Note: `signedImageUrl` needs to be created just before the branch because the UncertainMatchState needs it. Insert these lines between line 68 (`}`) and line 69 (`if (scan.outcome.status === "provider_error")`):

```tsx
  if (scan.outcome.status === "uncertain_match") {
    const primary = scan.outcome.candidates[0];
    if (!primary) return notFound();
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

**Edit 3** — the existing `const signedImageUrl = ...` on line 79 stays unchanged (still needed for the `ok` branch). Do not remove it.

- [ ] **Step 2: Verify type check + build**

Run: `npx tsc --noEmit`
Expected: PASS.

Run: `npm run build`
Expected: PASS. Next.js compiles without errors; no route changes breaking static analysis.

- [ ] **Step 3: Commit**

```bash
git add src/app/scan/[id]/page.tsx
git commit -m "feat(scan): route uncertain_match to confirm UI"
```

---

## Task 8: Deploy + manual end-to-end verification

**Files:**
- None changed — verification only.

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: PASS. Before this plan: 27 tests. After: 31 tests (+3 new analyzeImageService, +1 new caseSummary; the existing `no_match: max confidence below 0.25` test was edited to use 0.05 and renamed, not removed). If the counter reads 30 or 32, investigate before proceeding.

- [ ] **Step 2: Push to main (triggers Vercel auto-deploy)**

```bash
git push
```

Wait for Vercel-Deploy to complete (~45 s). The Git-integration picks up main automatically and deploys to gartenscan.de.

- [ ] **Step 3: Smoke test #1 — high-confidence plant**

Open https://gartenscan.de in a mobile-sized viewport, upload a clear photo of a common plant (rose, tomato leaf). Expected: status `ok`, matched content if in registry, Confidence ≥ 25 %.

Verify via DB:

```bash
source .env.local && curl -sS \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/scans?select=id,status,provider&order=created_at.desc&limit=1"
```

Expected: `status: ok`.

- [ ] **Step 4: Smoke test #2 — uncertain plant (the main flow)**

Upload the same garden photo that produced 0.10 confidence earlier, or any photo where Pl@ntNet is unsure. Expected UI: `UncertainMatchState` — gedämpfter Hero, "Vermutung, nicht bestätigt"-eyebrow, zwei Buttons.

Verify via DB: `status: uncertain_match`, `candidates` has exactly 1 row in `scan_candidates`.

- [ ] **Step 5: Smoke test #3 — confirm flow**

On the uncertain_match screen, click `Das ist es`. Expected: page refreshes to the `ok` state UI (Hero with candidate details, possibly matched content fallback).

Verify via DB: same scan row, `status: ok`.

- [ ] **Step 6: Smoke test #4 — reject flow**

Create a new uncertain scan (upload another uncertain photo). Click `Stimmt nicht`. Expected: page refreshes to `NoMatchState` UI.

Verify via DB: same scan row, `status: no_match`.

- [ ] **Step 7: Smoke test #5 — double-confirm (409 path)**

Open the same already-confirmed uncertain scan in two browser tabs. Click `Das ist es` in tab 1 (transitions to ok). In tab 2 (still showing UncertainMatchState), click `Das ist es`. Expected: inline error "Dieser Scan wurde bereits eingeordnet." + automatic refresh to the `ok` state UI.

If this flow is hard to reproduce, skip it — the code path is the 409 branch in `UncertainMatchState.tsx`, covered by static reasoning.

- [ ] **Step 8: Update pipeline board**

```powershell
pipeline-update -Slug gartenscanner `
  -Stage live `
  -Progress 95 `
  -Summary "Uncertain-match Zwischenzustand live: Pl@ntNet 0.10-0.25 zeigt Kandidaten zur Nutzer-Bestätigung" `
  -Todos @("Phase C/D/E Backlog", "Email-Upgrade fuer Anon-User", "Garden-Persistence")
```

Note: run this from PowerShell (the function is defined in the user PS profile). If the command is run from bash, skip this step and ask the user to run it manually.

- [ ] **Step 9: Mark this plan complete**

No commit needed — this plan document is historical record. Done when all checkboxes above are checked.

---

## Rollback Procedure

If anything breaks in production after deploy:

1. **Immediate rollback (no code change):** In `src/lib/services/analyzeImageService.ts`, set `UNCERTAIN_MIN_CONFIDENCE = 0.25` (equal to `AUTO_OK_CONFIDENCE`). No new scans land in `uncertain_match`. Redeploy.
2. **Existing uncertain_match scans** (created before rollback) remain in the DB. Either let users confirm/reject them normally, or flip them manually:
   ```sql
   UPDATE scans SET status = 'no_match' WHERE status = 'uncertain_match';
   ```
3. **Full revert:** `git revert` the commits from Tasks 1-7 in reverse order, push, let Vercel redeploy.

---

## Known Constraints + Trade-offs

- **No route-handler unit test** for `/api/scans/[id]/status`: the repo has no route-test framework. Covered by manual smoke tests in Task 8.
- **No component unit test** for `UncertainMatchState`: `@testing-library/react` is not installed. Adding it would be a separate decision (adds deps, setup). Covered by manual browser verification.
- **Top-1 only** on `uncertain_match`: design choice from the spec. Alternative candidates (Top-2, Top-3) from Pl@ntNet are discarded — no fall-back "maybe one of these?" UI.
- **One-way transitions only:** once a scan leaves `uncertain_match`, there's no client-triggered path back. Admin would need a manual SQL `UPDATE` to reset a scan for testing.
