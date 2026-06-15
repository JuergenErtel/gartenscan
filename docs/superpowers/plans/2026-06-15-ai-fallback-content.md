# KI-Fallback für erkannte Arten ohne kuratierten Eintrag — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wenn Pl@ntNet eine Art sicher erkennt, aber kein kuratierter Eintrag existiert, zeigt die Scan-Ergebnisseite eine leichtgewichtige, klar als KI-generiert gekennzeichnete Einordnung mit 2–4 Maßnahmen — statt eines leeren Platzhalters.

**Architecture:** Eine reine, testbare Logikschicht (`src/lib/scan/aiFallback.ts`: Guard, Prompt-Bau, Response-Parsing) trennt sich vom IO-Service (`src/lib/services/aiFallbackService.ts`: Anthropic-Aufruf + Read-Through-Cache). Der Cache liegt als `jsonb`-Spalte `ai_fallback` auf der bestehenden `scans`-Tabelle. Die Ergebnisseite rendert im `!matchedEntry`-Zweig eine `<Suspense>`-Sektion, die den Service lazy aufruft und das Panel oder (bei `null`) den bestehenden Platzhalter zeigt.

**Tech Stack:** Next.js 16 (App Router, async Server Components, Suspense), React 19, TypeScript, `@anthropic-ai/sdk` (Claude Haiku), Supabase (Service-Role-Client), Vitest. Spec: `docs/superpowers/specs/2026-06-15-ai-fallback-content-design.md`.

---

## Vorab: betroffene Dateien

- **Neu:** `src/lib/scan/aiFallback.ts` — reine Logik (Guard, Prompts, Parsing). Keine Server-/IO-Imports → direkt unit-testbar.
- **Neu:** `src/lib/services/aiFallbackService.ts` — orchestriert Cache + Anthropic + Persistenz.
- **Neu:** `src/components/features/scan/AiFallbackPanel.tsx` — Präsentation des KI-Inhalts.
- **Neu:** `src/components/features/scan/AiFallbackSection.tsx` — async Server-Component (Service-Aufruf) + Skeleton + Platzhalter.
- **Neu:** `supabase/migrations/20260615120000_scans_ai_fallback.sql` — Cache-Spalte.
- **Neu:** `tests/scan/aiFallback.test.ts` — Tests der reinen Logik.
- **Neu:** `tests/services/aiFallbackService.test.ts` — Service-Tests (Anthropic + Repo gemockt).
- **Ändern:** `src/domain/scan/ScanOutcome.ts` — neue Typen + `StoredScan.aiFallback`.
- **Ändern:** `src/lib/services/scanRepository.ts` — `getScanById` liest Spalte, neue `saveAiFallback`.
- **Ändern:** `src/app/scan/[id]/page.tsx` — Suspense-Sektion statt Platzhalter-Block (Zeilen 298-306).

**Hinweis:** `saveAiFallback` nutzt den bestehenden `createServiceRoleClient()` (umgeht RLS) — keine neue DB-Policy nötig. Die bestehende `select`-Policy deckt das Lesen der neuen Spalte ab.

---

### Task 1: Domain-Typen erweitern

**Files:**
- Modify: `src/domain/scan/ScanOutcome.ts`

- [ ] **Step 1: Typen ergänzen**

Füge in `src/domain/scan/ScanOutcome.ts` direkt nach dem `DetectionCandidate`-Interface (vor `export interface ScanOutcome`) ein:

```ts
export interface AiFallbackTip {
  title: string;
  text: string;
}

/**
 * Leichtgewichtiger, KI-generierter Ersatzinhalt für erkannte Arten ohne
 * kuratierten Eintrag in src/content. Klar als nicht-redaktionell markiert.
 */
export interface AiFallbackContent {
  summary: string;          // 1–2 Sätze Einordnung
  tips: AiFallbackTip[];    // 2–4 Maßnahmen
  caution?: string;         // optionaler Vorsichtshinweis
  generatedAt: string;      // ISO-Zeitstempel
  model: string;            // verwendetes Claude-Modell
}
```

- [ ] **Step 2: `StoredScan` um `aiFallback` erweitern**

Ergänze im `StoredScan`-Interface (nach `plantId?: string;`):

```ts
  aiFallback?: AiFallbackContent;
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS (reine Typergänzung, keine Verwender brechen).

- [ ] **Step 4: Commit**

```bash
git add src/domain/scan/ScanOutcome.ts
git commit -m "feat(scan): add AiFallbackContent types to domain model"
```

---

### Task 2: Reine Fallback-Logik (Guard, Prompts, Parsing) mit Tests

Diese Schicht hat keine Server-/SDK-Imports und ist daher ohne Mocks testbar — analog zu `src/lib/scan/caseSummary.ts`.

**Files:**
- Create: `src/lib/scan/aiFallback.ts`
- Test: `tests/scan/aiFallback.test.ts`

- [ ] **Step 1: Failing test schreiben**

Erstelle `tests/scan/aiFallback.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  shouldGenerateFallback,
  parseFallbackResponse,
} from '@/lib/scan/aiFallback';
import type { StoredScan } from '@/domain/scan/ScanOutcome';

function makeScan(overrides: Partial<StoredScan> = {}): StoredScan {
  return {
    id: 's1',
    userId: 'u1',
    createdAt: new Date('2026-06-15T00:00:00Z'),
    imagePath: 'p.jpg',
    outcome: {
      status: 'ok',
      provider: 'plantnet',
      candidates: [
        {
          rank: 1,
          scientificName: 'Lepidium coronopus',
          commonNames: ['Niederliegender Krähenfuß'],
          confidence: 0.88,
          matchedContentId: undefined,
        },
      ],
    },
    ...overrides,
  };
}

describe('shouldGenerateFallback', () => {
  it('true: ok + scientificName + kein Match', () => {
    expect(shouldGenerateFallback(makeScan())).toBe(true);
  });

  it('false: status nicht ok', () => {
    const scan = makeScan();
    scan.outcome.status = 'no_match';
    expect(shouldGenerateFallback(scan)).toBe(false);
  });

  it('false: kuratierter Eintrag vorhanden', () => {
    const scan = makeScan();
    scan.outcome.candidates[0].matchedContentId = 'weed_giersch';
    expect(shouldGenerateFallback(scan)).toBe(false);
  });

  it('false: kein Kandidat', () => {
    const scan = makeScan();
    scan.outcome.candidates = [];
    expect(shouldGenerateFallback(scan)).toBe(false);
  });

  it('false: leerer scientificName', () => {
    const scan = makeScan();
    scan.outcome.candidates[0].scientificName = '   ';
    expect(shouldGenerateFallback(scan)).toBe(false);
  });
});

describe('parseFallbackResponse', () => {
  const valid =
    '{"summary":"Ein niederliegendes Rasen-Unkraut.","tips":[' +
    '{"title":"Ausstechen","text":"Einzelpflanzen mit Unkrautstecher samt Wurzel entfernen."},' +
    '{"title":"Rasen stärken","text":"Nachsäen und düngen, damit Lücken zuwachsen."}' +
    '],"caution":"Nicht mit essbaren Kräutern verwechseln."}';

  it('parst gültiges JSON', () => {
    const r = parseFallbackResponse(valid);
    expect(r).not.toBeNull();
    expect(r!.summary).toContain('Rasen-Unkraut');
    expect(r!.tips).toHaveLength(2);
    expect(r!.caution).toContain('verwechseln');
  });

  it('parst JSON in Code-Fences', () => {
    const r = parseFallbackResponse('```json\n' + valid + '\n```');
    expect(r).not.toBeNull();
    expect(r!.tips).toHaveLength(2);
  });

  it('begrenzt auf 4 Tipps', () => {
    const tips = Array.from({ length: 6 }, (_, i) =>
      `{"title":"T${i}","text":"Text ${i}"}`
    ).join(',');
    const r = parseFallbackResponse(`{"summary":"x","tips":[${tips}]}`);
    expect(r!.tips).toHaveLength(4);
  });

  it('verwirft leere Tipps und gibt null bei < 2 gültigen', () => {
    const r = parseFallbackResponse(
      '{"summary":"x","tips":[{"title":"","text":""},{"title":"Nur eins","text":"ok"}]}'
    );
    expect(r).toBeNull();
  });

  it('gibt null bei leerer summary', () => {
    const r = parseFallbackResponse(
      '{"summary":"  ","tips":[{"title":"a","text":"b"},{"title":"c","text":"d"}]}'
    );
    expect(r).toBeNull();
  });

  it('gibt null bei nicht-JSON', () => {
    expect(parseFallbackResponse('Das ist Krähenfuß.')).toBeNull();
  });

  it('lässt caution weg, wenn leer', () => {
    const r = parseFallbackResponse(
      '{"summary":"x","tips":[{"title":"a","text":"b"},{"title":"c","text":"d"}],"caution":"  "}'
    );
    expect(r!.caution).toBeUndefined();
  });
});
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `npx vitest run tests/scan/aiFallback.test.ts`
Expected: FAIL mit „Cannot find module '@/lib/scan/aiFallback'".

- [ ] **Step 3: Implementierung schreiben**

Erstelle `src/lib/scan/aiFallback.ts`:

```ts
import type { StoredScan, AiFallbackContent } from '@/domain/scan/ScanOutcome';

export interface FallbackPromptInput {
  scientificName: string;
  commonNames: string[];
  triageCategory?: string;
}

export type ParsedFallback = Pick<AiFallbackContent, 'summary' | 'tips' | 'caution'>;

/** Fallback nur bei sicherer Erkennung ohne kuratierten Eintrag. */
export function shouldGenerateFallback(scan: StoredScan): boolean {
  if (scan.outcome.status !== 'ok') return false;
  const top = scan.outcome.candidates[0];
  if (!top) return false;
  if (!top.scientificName || !top.scientificName.trim()) return false;
  if (top.matchedContentId) return false;
  return true;
}

export function buildFallbackSystemPrompt(): string {
  return `Du bist ein deutschsprachiger Garten-Assistent. Der Nutzer hat eine
Pflanze/ein Unkraut fotografiert, das sicher bestimmt wurde, für das es aber
noch keinen redaktionell geprüften Eintrag gibt.

Liefere eine knappe, praktische Ersteinschätzung:
- "summary": 1–2 Sätze, was die Art ist und ob sie im Garten Probleme macht.
- "tips": 2 bis 4 konkrete, umsetzbare Maßnahmen. Bevorzuge mechanische,
  kulturelle und organische Methoden. Chemische Mittel nur generisch erwähnen
  (KEINE Produktnamen) und stets mit dem Hinweis, Etikett zu beachten oder
  Fachberatung einzuholen. Jeder Tipp: { "title": kurz, "text": 1–2 Sätze }.
- "caution": optional GENAU EIN Vorsichtshinweis (Giftigkeit, Hautreizung,
  Verwechslung). Weglassen, wenn nichts Relevantes.

Antworte NUR mit gültigem JSON, kein Fließtext davor/danach:
{ "summary": "...", "tips": [{ "title": "...", "text": "..." }], "caution": "..." }`;
}

export function buildFallbackUserPrompt(input: FallbackPromptInput): string {
  const common = input.commonNames.length
    ? input.commonNames.join(', ')
    : '(keine deutschen Namen bekannt)';
  const cat = input.triageCategory ? `\nKategorie: ${input.triageCategory}` : '';
  return `Art (wissenschaftlich): ${input.scientificName}
Deutsche Namen: ${common}${cat}

Gib die Ersteinschätzung als JSON zurück.`;
}

export function parseFallbackResponse(text: string): ParsedFallback | null {
  let raw: unknown;
  try {
    raw = JSON.parse(stripCodeFences(text));
  } catch {
    return null;
  }
  if (typeof raw !== 'object' || raw === null) return null;
  const obj = raw as Record<string, unknown>;

  const summary = typeof obj.summary === 'string' ? obj.summary.trim() : '';
  if (!summary) return null;

  const rawTips = Array.isArray(obj.tips) ? obj.tips : [];
  const tips = rawTips
    .map((t) => {
      if (typeof t !== 'object' || t === null) return null;
      const o = t as Record<string, unknown>;
      const title = typeof o.title === 'string' ? o.title.trim() : '';
      const tipText = typeof o.text === 'string' ? o.text.trim() : '';
      if (!title || !tipText) return null;
      return { title, text: tipText };
    })
    .filter((t): t is { title: string; text: string } => t !== null)
    .slice(0, 4);

  if (tips.length < 2) return null;

  const caution =
    typeof obj.caution === 'string' && obj.caution.trim()
      ? obj.caution.trim()
      : undefined;

  return { summary, tips, caution };
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  return match ? match[1].trim() : trimmed;
}
```

- [ ] **Step 4: Test laufen lassen — muss bestehen**

Run: `npx vitest run tests/scan/aiFallback.test.ts`
Expected: PASS (alle Cases grün).

- [ ] **Step 5: Commit**

```bash
git add src/lib/scan/aiFallback.ts tests/scan/aiFallback.test.ts
git commit -m "feat(scan): pure AI-fallback logic (guard, prompts, parsing)"
```

---

### Task 3: DB-Migration + Repository (lesen/schreiben des Caches)

**Files:**
- Create: `supabase/migrations/20260615120000_scans_ai_fallback.sql`
- Modify: `src/lib/services/scanRepository.ts`

- [ ] **Step 1: Migration schreiben**

Erstelle `supabase/migrations/20260615120000_scans_ai_fallback.sql`:

```sql
-- Cache für KI-generierte Ersatzinhalte (erkannte Art ohne kuratierten Eintrag)
alter table public.scans
  add column if not exists ai_fallback jsonb;
```

- [ ] **Step 2: Import in `scanRepository.ts` ergänzen**

Erweitere die Typ-Importzeile oben in `src/lib/services/scanRepository.ts`:

```ts
import type { AiFallbackContent, ScanOutcome, StoredScan } from '@/domain/scan/ScanOutcome';
```

- [ ] **Step 3: `getScanById` liest die Spalte**

Füge in `getScanById` im zurückgegebenen Objekt (auf gleicher Ebene wie `matchedContentId: scan.matched_content_id ?? undefined,`) hinzu:

```ts
    aiFallback: (scan.ai_fallback ?? undefined) as AiFallbackContent | undefined,
```

- [ ] **Step 4: `saveAiFallback` ergänzen**

Füge am Ende von `src/lib/services/scanRepository.ts` an:

```ts
export async function saveAiFallback(
  scanId: string,
  userId: string,
  content: AiFallbackContent
): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from('scans')
    .update({ ai_fallback: content as never })
    .eq('id', scanId)
    .eq('user_id', userId);
  if (error) throw new Error(`saveAiFallback: ${error.message}`);
}
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS. (Die Supabase-Felder sind hier lose/`never`-typisiert wie bei `image_meta`/`provider_raw` — daher kein generierter-Typ-Konflikt durch die neue Spalte.)

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260615120000_scans_ai_fallback.sql src/lib/services/scanRepository.ts
git commit -m "feat(scan): persist ai_fallback cache column on scans"
```

---

### Task 4: AI-Fallback-Service (Cache + Anthropic-Orchestrierung) mit Tests

**Files:**
- Create: `src/lib/services/aiFallbackService.ts`
- Test: `tests/services/aiFallbackService.test.ts`

- [ ] **Step 1: Failing test schreiben**

Erstelle `tests/services/aiFallbackService.test.ts` (Muster wie `tests/providers/claudeMatch.test.ts`: SDK via `vi.hoisted` mocken; zusätzlich `scanRepository` mocken, damit `server-only` nicht geladen wird):

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOrCreateAiFallback } from '@/lib/services/aiFallbackService';
import { saveAiFallback } from '@/lib/services/scanRepository';
import type { StoredScan } from '@/domain/scan/ScanOutcome';

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }));

vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { create: createMock };
  },
}));

vi.mock('@/lib/services/scanRepository', () => ({
  saveAiFallback: vi.fn(),
}));

function makeScan(overrides: Partial<StoredScan> = {}): StoredScan {
  return {
    id: 's1',
    userId: 'u1',
    createdAt: new Date('2026-06-15T00:00:00Z'),
    imagePath: 'p.jpg',
    outcome: {
      status: 'ok',
      provider: 'plantnet',
      candidates: [
        {
          rank: 1,
          scientificName: 'Lepidium coronopus',
          commonNames: ['Niederliegender Krähenfuß'],
          confidence: 0.88,
        },
      ],
    },
    ...overrides,
  };
}

const VALID_JSON =
  '{"summary":"Rasen-Unkraut.","tips":[' +
  '{"title":"Ausstechen","text":"Mit Wurzel entfernen."},' +
  '{"title":"Rasen stärken","text":"Nachsäen und düngen."}]}';

describe('getOrCreateAiFallback', () => {
  beforeEach(() => {
    createMock.mockReset();
    vi.mocked(saveAiFallback).mockReset();
    process.env.ANTHROPIC_API_KEY = 'test-key';
  });

  it('gibt null ohne Generierung, wenn Guard nicht greift', async () => {
    const scan = makeScan();
    scan.outcome.candidates[0].matchedContentId = 'weed_giersch';
    const r = await getOrCreateAiFallback(scan, 'u1');
    expect(r).toBeNull();
    expect(createMock).not.toHaveBeenCalled();
  });

  it('Cache-Hit: gibt gespeicherten Inhalt zurück, ohne Anthropic', async () => {
    const scan = makeScan({
      aiFallback: {
        summary: 's',
        tips: [{ title: 'a', text: 'b' }, { title: 'c', text: 'd' }],
        generatedAt: '2026-06-15T00:00:00Z',
        model: 'claude-haiku-4-5-20251001',
      },
    });
    const r = await getOrCreateAiFallback(scan, 'u1');
    expect(r).not.toBeNull();
    expect(r!.summary).toBe('s');
    expect(createMock).not.toHaveBeenCalled();
  });

  it('Cache-Miss: generiert, persistiert genau einmal, gibt Inhalt zurück', async () => {
    createMock.mockResolvedValueOnce({ content: [{ type: 'text', text: VALID_JSON }] });
    const r = await getOrCreateAiFallback(makeScan(), 'u1');
    expect(r).not.toBeNull();
    expect(r!.tips).toHaveLength(2);
    expect(r!.model).toBe('claude-haiku-4-5-20251001');
    expect(typeof r!.generatedAt).toBe('string');
    expect(vi.mocked(saveAiFallback)).toHaveBeenCalledTimes(1);
  });

  it('gibt null ohne API-Key', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const r = await getOrCreateAiFallback(makeScan(), 'u1');
    expect(r).toBeNull();
    expect(createMock).not.toHaveBeenCalled();
  });

  it('gibt null bei Anthropic-Fehler, persistiert nichts', async () => {
    createMock.mockRejectedValueOnce(new Error('boom'));
    const r = await getOrCreateAiFallback(makeScan(), 'u1');
    expect(r).toBeNull();
    expect(vi.mocked(saveAiFallback)).not.toHaveBeenCalled();
  });

  it('gibt null bei ungültiger Antwort, persistiert nichts', async () => {
    createMock.mockResolvedValueOnce({ content: [{ type: 'text', text: 'kein json' }] });
    const r = await getOrCreateAiFallback(makeScan(), 'u1');
    expect(r).toBeNull();
    expect(vi.mocked(saveAiFallback)).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `npx vitest run tests/services/aiFallbackService.test.ts`
Expected: FAIL mit „Cannot find module '@/lib/services/aiFallbackService'".

- [ ] **Step 3: Implementierung schreiben**

Erstelle `src/lib/services/aiFallbackService.ts`:

```ts
import Anthropic from '@anthropic-ai/sdk';
import type { StoredScan, AiFallbackContent } from '@/domain/scan/ScanOutcome';
import { saveAiFallback } from '@/lib/services/scanRepository';
import {
  shouldGenerateFallback,
  buildFallbackSystemPrompt,
  buildFallbackUserPrompt,
  parseFallbackResponse,
} from '@/lib/scan/aiFallback';

const MODEL = 'claude-haiku-4-5-20251001';
const TIMEOUT_MS = 15000;

/**
 * Liefert KI-Ersatzinhalt für eine erkannte Art ohne kuratierten Eintrag.
 * Read-Through-Cache: bereits generierte Inhalte kommen aus scan.aiFallback.
 * Jeder Fehler endet in `null` — die Seite zeigt dann ihren Platzhalter.
 */
export async function getOrCreateAiFallback(
  scan: StoredScan,
  userId: string
): Promise<AiFallbackContent | null> {
  if (!shouldGenerateFallback(scan)) return null;
  if (scan.aiFallback) return scan.aiFallback;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const top = scan.outcome.candidates[0];
  const client = new Anthropic({ apiKey, timeout: TIMEOUT_MS });

  let text: string;
  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      system: buildFallbackSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: buildFallbackUserPrompt({
            scientificName: top.scientificName,
            commonNames: top.commonNames,
            triageCategory: scan.outcome.triage?.category,
          }),
        },
      ],
    });
    const block = msg.content.find((c: { type: string }) => c.type === 'text') as
      | { type: 'text'; text: string }
      | undefined;
    if (!block) return null;
    text = block.text;
  } catch {
    return null;
  }

  const parsed = parseFallbackResponse(text);
  if (!parsed) return null;

  const content: AiFallbackContent = {
    ...parsed,
    generatedAt: new Date().toISOString(),
    model: MODEL,
  };

  try {
    await saveAiFallback(scan.id, userId, content);
  } catch {
    // Persistenz-Fehler ignorieren — Inhalt trotzdem anzeigen.
  }

  return content;
}
```

- [ ] **Step 4: Test laufen lassen — muss bestehen**

Run: `npx vitest run tests/services/aiFallbackService.test.ts`
Expected: PASS (alle 6 Cases grün).

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/aiFallbackService.ts tests/services/aiFallbackService.test.ts
git commit -m "feat(scan): AI-fallback service with read-through cache"
```

---

### Task 5: UI — Panel, async Sektion und Seiten-Integration

Kein React-Komponenten-Testframework im Projekt → Verifikation über Typecheck/Build (Task 6) und manuellen Mobile-Check (Task 7).

**Files:**
- Create: `src/components/features/scan/AiFallbackPanel.tsx`
- Create: `src/components/features/scan/AiFallbackSection.tsx`
- Modify: `src/app/scan/[id]/page.tsx`

- [ ] **Step 1: Präsentations-Panel erstellen**

Erstelle `src/components/features/scan/AiFallbackPanel.tsx`:

```tsx
import { AlertTriangle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { AiFallbackContent } from "@/domain/scan/ScanOutcome";

export function AiFallbackPanel({ content }: { content: AiFallbackContent }) {
  return (
    <div className="px-5 pt-6">
      <div className="rounded-[20px] border border-sun-400/40 bg-paper p-5">
        <div className="mb-3">
          <Badge tone="warning" icon={<Sparkles className="h-3 w-3" />}>
            KI-generiert · nicht redaktionell geprüft
          </Badge>
        </div>

        <p className="text-[14px] leading-relaxed text-bark-900">
          {content.summary}
        </p>

        <p className="mt-5 mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          Erste Maßnahmen
        </p>
        <div className="space-y-2.5">
          {content.tips.map((tip, index) => (
            <div
              key={`${tip.title}-${index}`}
              className="rounded-[16px] border border-clay-800/10 bg-sage-50 p-4"
            >
              <p className="text-[14px] font-semibold text-bark-900">
                {tip.title}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                {tip.text}
              </p>
            </div>
          ))}
        </div>

        {content.caution && (
          <div className="mt-4 flex gap-2 rounded-[14px] bg-sun-100 p-3.5">
            <AlertTriangle
              className="h-4 w-4 shrink-0 text-[#8a6a14]"
              strokeWidth={2}
            />
            <p className="text-[13px] leading-relaxed text-[#8a6a14]">
              {content.caution}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Async Sektion + Skeleton + Platzhalter erstellen**

Erstelle `src/components/features/scan/AiFallbackSection.tsx`:

```tsx
import type { StoredScan } from "@/domain/scan/ScanOutcome";
import { getOrCreateAiFallback } from "@/lib/services/aiFallbackService";
import { AiFallbackPanel } from "./AiFallbackPanel";

/** Statischer Platzhalter, wenn kein KI-Inhalt erzeugt werden konnte. */
export function AiFallbackPlaceholder() {
  return (
    <div className="px-5 pt-6">
      <div className="rounded-[16px] bg-cream p-5 text-[13px] text-bark-900/75">
        Wir haben diese Art erkannt, aber noch keine belastbare
        Handlungsempfehlung hinterlegt. In diesem Zustand wirkt die App wie ein
        Scanner. Genau das bauen wir gerade aus.
      </div>
    </div>
  );
}

export function AiFallbackSkeleton() {
  return (
    <div className="px-5 pt-6">
      <div className="rounded-[20px] border border-sun-400/30 bg-paper p-5">
        <div className="h-5 w-56 animate-pulse rounded-full bg-sage-100" />
        <div className="mt-4 h-4 w-full animate-pulse rounded bg-sage-100" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-sage-100" />
        <div className="mt-5 space-y-2.5">
          <div className="h-16 animate-pulse rounded-[16px] bg-sage-50" />
          <div className="h-16 animate-pulse rounded-[16px] bg-sage-50" />
        </div>
      </div>
    </div>
  );
}

export async function AiFallbackSection({
  scan,
  userId,
}: {
  scan: StoredScan;
  userId: string;
}) {
  const content = await getOrCreateAiFallback(scan, userId);
  if (!content) return <AiFallbackPlaceholder />;
  return <AiFallbackPanel content={content} />;
}
```

- [ ] **Step 3: Seite integrieren — Import ergänzen**

Füge in `src/app/scan/[id]/page.tsx` bei den Imports hinzu (oben zu den bestehenden Imports):

```tsx
import { Suspense } from "react";
import {
  AiFallbackSection,
  AiFallbackSkeleton,
} from "@/components/features/scan/AiFallbackSection";
```

- [ ] **Step 4: Platzhalter-Block durch Suspense-Sektion ersetzen**

Ersetze in `src/app/scan/[id]/page.tsx` den `else`-Zweig des `matchedEntry`-Ausdrucks — den gesamten Block (aktuell Zeilen 298-306):

```tsx
        ) : (
          <div className="px-5 pt-6">
            <div className="rounded-[16px] bg-cream p-5 text-[13px] text-bark-900/75">
              Wir haben diese Art erkannt, aber noch keine belastbare
              Handlungsempfehlung hinterlegt. In diesem Zustand wirkt die App
              wie ein Scanner. Genau das bauen wir gerade aus.
            </div>
          </div>
        )}
```

durch:

```tsx
        ) : (
          <Suspense fallback={<AiFallbackSkeleton />}>
            <AiFallbackSection scan={scan} userId={user.id} />
          </Suspense>
        )}
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/features/scan/AiFallbackPanel.tsx src/components/features/scan/AiFallbackSection.tsx "src/app/scan/[id]/page.tsx"
git commit -m "feat(scan): render AI-fallback panel for unmatched species"
```

---

### Task 6: Volle Verifikation (Tests + Build)

**Files:** keine

- [ ] **Step 1: Komplette Testsuite**

Run: `npm test`
Expected: PASS — alle bisherigen Tests plus die neuen aus Task 2 und Task 4 grün.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: PASS — keine Typ-/Kompilierfehler, `/scan/[id]` baut durch.

---

### Task 7: Manuelle Mobile-Verifikation

Kein automatisierter UI-Test im Projekt. Voraussetzung: Migration `20260615120000_scans_ai_fallback.sql` ist auf der genutzten Supabase-Instanz angewandt (sonst schlägt `saveAiFallback` fehl → der Platzhalter erscheint statt des Panels).

**Files:** keine

- [ ] **Step 1: Migration anwenden**

Die neue Migration auf der Entwicklungs-/Supabase-Instanz einspielen (z. B. via Supabase CLI `supabase db push` oder manuell im SQL-Editor den Inhalt von `supabase/migrations/20260615120000_scans_ai_fallback.sql` ausführen).
Expected: Spalte `scans.ai_fallback` existiert.

- [ ] **Step 2: Dev-Server starten**

Run: `npm run dev`
Expected: Server auf `http://localhost:3000`. `ANTHROPIC_API_KEY` muss in `.env.local` gesetzt sein.

- [ ] **Step 3: Im Telefon-Viewport prüfen (390×844)**

Eine Pflanze/ein Unkraut scannen, die/das sicher erkannt wird, aber keinen kuratierten Eintrag hat (z. B. das ursprüngliche *Lepidium coronopus*).
Prüfen:
- Hero/Bild/Name laden sofort; das KI-Panel streamt kurz danach nach (Skeleton sichtbar).
- Panel zeigt Badge „KI-generiert · nicht redaktionell geprüft", eine Einordnung und 2–4 Maßnahmen; ggf. Vorsicht-Callout.
- Bei erneutem Öffnen erscheint das Panel sofort (Cache greift, kein Skeleton-Delay).
- Kein horizontales Scrollen; Layout konsistent mit dem übrigen Ergebnis.

- [ ] **Step 4: Graceful-Degradation gegenprüfen**

`ANTHROPIC_API_KEY` temporär entfernen, einen neuen passenden Scan öffnen.
Expected: Statt Panel erscheint der bestehende Platzhaltertext — kein Fehler, keine kaputte Seite.

---

## Self-Review-Notiz

- **Spec-Abdeckung:** Auslöser-Bedingung (Task 2 `shouldGenerateFallback`), Datenmodell + Cache-Spalte (Task 1 + Task 3), Service mit Cache/Anthropic/Fehler→null (Task 4), Prompt + Sicherheits-Leitplanken (Task 2 `buildFallbackSystemPrompt`), UI-Panel mit klarem Label + Suspense-Streaming + Graceful Degradation (Task 5), Tests (Task 2/4), manuelle Mobile-Verifikation inkl. Migration (Task 7). Alle Spec-Abschnitte sind abgedeckt.
- **Typkonsistenz:** `AiFallbackContent`/`AiFallbackTip` (Task 1) werden in `aiFallback.ts` (`ParsedFallback = Pick<...>`), `aiFallbackService.ts`, `scanRepository.ts` und den UI-Komponenten identisch verwendet. Funktionsnamen `shouldGenerateFallback`, `buildFallbackSystemPrompt`, `buildFallbackUserPrompt`, `parseFallbackResponse`, `getOrCreateAiFallback`, `saveAiFallback` sind über Tasks hinweg konsistent.
- **Abweichungen vom Spec:** Platzhalter und Skeleton liegen zusammen mit der async Sektion in `AiFallbackSection.tsx` (statt im Panel) — hält `page.tsx` schlank und trennt Verantwortlichkeiten. Inhaltlich keine Abweichung.
- **Persistenz/RLS:** `saveAiFallback` nutzt den Service-Role-Client wie der restliche `scanRepository` — RLS wird umgangen, keine neue Policy nötig.
