# Phase C — Insekten + Krankheiten Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die Scan-Pipeline um die Triage-Kategorien `insect`, `beneficial`, `disease`, `damage` erweitern, einen neuen `ClaudeMatchProvider` einfuehren, der gegen die `CONTENT_REGISTRY` matched, und das Content-Set um 10 Hot-Topic-Eintraege erweitern.

**Architecture:** Triage liefert kuenftig 6 Kategorien. `analyzeImageService` routet pro Kategorie an Pl@ntNet (plant) oder den neuen `ClaudeMatchProvider` (insect/beneficial/disease/damage) mit kategorie-spezifischem Content-Scope. UI erhaelt drei punktuelle Anpassungen.

**Tech Stack:** TypeScript / Next.js 15 App Router, Anthropic SDK (`@anthropic-ai/sdk`), Vitest, Supabase. Spec: `docs/superpowers/specs/2026-05-27-phase-c-insekten-krankheiten-design.md`.

---

## File Structure

**Modify:**
- `src/domain/scan/ScanOutcome.ts` — `TriageCategory` um `beneficial` + `damage` erweitern
- `src/lib/providers/triage/claudeVision.ts` — Prompt + `ALLOWED_CATEGORIES`
- `src/lib/providers/identification/factory.ts` — neue Funktion `getIdentificationProviderFor`
- `src/lib/services/analyzeImageService.ts` — `identification` → `identificationFor`-Refactor
- `src/app/api/scans/route.ts` — Aufrufer auf Factory umstellen
- `src/app/scan/[id]/page.tsx` — `SavePlantPrompt` conditional
- `src/components/features/scan/ScanResultStates.tsx` — `CategoryUnsupportedState` + `NoMatchState`
- `src/content/index.ts` — neue Imports + Registry-Eintraege

**Create:**
- `src/lib/providers/identification/claudeMatch.ts` — neuer `ClaudeMatchProvider`
- `tests/providers/claudeMatch.test.ts` — Provider-Tests
- `tests/content/registry.test.ts` — Smoke-Test fuer Content-Registry
- `src/content/pests/spinnmilben.ts`
- `src/content/pests/buchsbaumzuensler.ts`
- `src/content/pests/trauermuecken.ts`
- `src/content/pests/wolllaeuse.ts`
- `src/content/pests/dickmaulruessler.ts`
- `src/content/beneficials/florfliege.ts`
- `src/content/beneficials/schwebfliege.ts`
- `src/content/diseases/sternrusstau.ts`
- `src/content/diseases/kraeuselkrankheit.ts`
- `src/content/diseases/grauschimmel.ts`

**Update (existing tests):**
- `tests/providers/claudeVision.test.ts` — Fixtures fuer `beneficial`, `damage`
- `tests/services/analyzeImageService.test.ts` — Mock-Helper auf `identificationFor` umbauen, Routing-Tests pro Kategorie

---

## Task 1: TriageCategory um beneficial + damage erweitern

**Files:**
- Modify: `src/domain/scan/ScanOutcome.ts:14`

- [ ] **Step 1: Erweitere TriageCategory**

In `src/domain/scan/ScanOutcome.ts:14` aendere:

```ts
export type TriageCategory = 'plant' | 'insect' | 'disease' | 'unclear';
```

zu:

```ts
export type TriageCategory =
  | 'plant'
  | 'insect'
  | 'beneficial'
  | 'disease'
  | 'damage'
  | 'unclear';
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: keine Fehler — alle bestehenden `category === 'plant'`-Checks etc. bleiben gueltig (Discriminated Union erweitert sich rueckwaertskompatibel).

- [ ] **Step 3: Commit**

```bash
git add src/domain/scan/ScanOutcome.ts
git commit -m "domain(triage): kategorien beneficial + damage ergaenzen"
```

---

## Task 2: ClaudeVision-Prompt erweitern + Tests

**Files:**
- Modify: `src/lib/providers/triage/claudeVision.ts:10-27`
- Modify: `tests/providers/claudeVision.test.ts`

- [ ] **Step 1: Failing Test fuer beneficial-Klassifikation schreiben**

Am Ende von `tests/providers/claudeVision.test.ts` (vor schliessendem `})` der describe-Klammer) einfuegen:

```ts
  it('parses beneficial category', async () => {
    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: '{"category":"beneficial","quality":"acceptable"}' }],
    });

    const provider = new ClaudeVisionTriageProvider({ apiKey: 'k' });
    const result = await provider.classify({
      imageUrl: 'https://example.com/ladybug.jpg',
      locale: 'de',
    });

    expect(result.category).toBe('beneficial');
  });

  it('parses damage category', async () => {
    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: '{"category":"damage","quality":"acceptable"}' }],
    });

    const provider = new ClaudeVisionTriageProvider({ apiKey: 'k' });
    const result = await provider.classify({
      imageUrl: 'https://example.com/damage.jpg',
      locale: 'de',
    });

    expect(result.category).toBe('damage');
  });
```

- [ ] **Step 2: Tests ausfuehren — sollen fehlschlagen**

Run: `npx vitest run tests/providers/claudeVision.test.ts`
Expected: Die zwei neuen Tests FAIL. Begruendung: `ALLOWED_CATEGORIES` enthaelt `beneficial`/`damage` noch nicht, also fallback zu `unclear`.

- [ ] **Step 3: ALLOWED_CATEGORIES erweitern**

In `src/lib/providers/triage/claudeVision.ts:27` aendere:

```ts
const ALLOWED_CATEGORIES: readonly TriageCategory[] = ['plant', 'insect', 'disease', 'unclear'];
```

zu:

```ts
const ALLOWED_CATEGORIES: readonly TriageCategory[] = ['plant', 'insect', 'beneficial', 'disease', 'damage', 'unclear'];
```

- [ ] **Step 4: System-Prompt erweitern**

In `src/lib/providers/triage/claudeVision.ts:10-25` ersetze den `SYSTEM_PROMPT`-String durch:

```ts
const SYSTEM_PROMPT = `Du klassifizierst Fotos fuer eine Garten-App. Antworte NUR mit einem gueltigen JSON-Objekt, kein Fliesstext davor oder danach.

Schema:
{
  "category": "plant" | "insect" | "beneficial" | "disease" | "damage" | "unclear",
  "quality": "acceptable" | "blurry" | "no_subject",
  "reason": string | null
}

Regeln:
- "plant" = ganze Pflanze, Blatt, Bluete, Frucht, Stengel — auch Unkraeuter.
- "insect" = Tier, das nicht eindeutig nuetzlich ist: Schnecken, Wanzen, Larven, unbekannte Krabbeltiere, Spinnen ohne Netz-Kontext.
- "beneficial" = eindeutig erkennbarer Nuetzling: Marienkaefer, Biene, Schwebfliege, Florfliege, Schmetterling, Spinne im Netz.
- "disease" = klares Pilz-, Bakterien- oder Virusbild: Belag, definierte Flecken, typisches Symptom.
- "damage" = Schaden an einer Pflanze ohne erkennbares Tier und ohne klares Krankheitsbild: Frassspuren, vergilbte Blaetter, Welke, abgebrochene Triebe.
- "unclear" = nichts von obigem eindeutig erkennbar.
- Wenn Tier UND Schaden sichtbar sind: waehle die Tier-Kategorie.
- Wenn unsicher zwischen insect/beneficial: waehle insect — die nachgelagerte Identifikation korrigiert.
- "quality": "blurry" bei Unschaerfe; "no_subject" bei keinem erkennbaren Motiv; sonst "acceptable".
- "reason": kurze deutsche Begruendung bei quality != "acceptable" oder category = "unclear", sonst null.`;
```

- [ ] **Step 5: Tests ausfuehren — sollen jetzt gruen sein**

Run: `npx vitest run tests/providers/claudeVision.test.ts`
Expected: alle Tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/providers/triage/claudeVision.ts tests/providers/claudeVision.test.ts
git commit -m "triage(prompt): beneficial + damage als triage-kategorien"
```

---

## Task 3: ClaudeMatchProvider — Grundgeruest + Happy-Path-Test

**Files:**
- Create: `src/lib/providers/identification/claudeMatch.ts`
- Create: `tests/providers/claudeMatch.test.ts`

- [ ] **Step 1: Failing Happy-Path-Test schreiben**

Erstelle `tests/providers/claudeMatch.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClaudeMatchProvider } from '@/lib/providers/identification/claudeMatch';

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }));

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = { create: createMock };
    },
  };
});

describe('ClaudeMatchProvider', () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it('returns a single high-confidence candidate', async () => {
    createMock.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: '{"candidates":[{"contentId":"pest_blattlaeuse","confidence":0.82,"reason":"Dichte gruene Kolonien an Triebspitze"}]}',
        },
      ],
    });

    const provider = new ClaudeMatchProvider({
      apiKey: 'k',
      scope: ['PEST', 'BENEFICIAL'],
    });
    const result = await provider.identify({
      imageUrl: 'https://example.com/aphid.jpg',
      locale: 'de',
      maxCandidates: 3,
    });

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].matchedContentId).toBe('pest_blattlaeuse');
    expect(result.candidates[0].confidence).toBeCloseTo(0.82);
    expect(result.candidates[0].scientificName).toBe('Aphidoidea');
    expect(result.candidates[0].commonNames[0]).toBe('Blattlaeuse');
  });
});
```

- [ ] **Step 2: Test ausfuehren — soll fehlschlagen**

Run: `npx vitest run tests/providers/claudeMatch.test.ts`
Expected: FAIL mit "Cannot find module '@/lib/providers/identification/claudeMatch'" o.ae.

- [ ] **Step 3: ClaudeMatchProvider implementieren**

Erstelle `src/lib/providers/identification/claudeMatch.ts`:

```ts
import Anthropic from '@anthropic-ai/sdk';
import { CONTENT_REGISTRY } from '@/content';
import { ProviderError } from '@/lib/providers/errors';
import type { Category, ContentEntry } from '@/domain/types';
import type { DetectionCandidate } from '@/domain/scan/ScanOutcome';
import type {
  IdentificationInput,
  IdentificationProvider,
  IdentificationResult,
} from './types';

interface Opts {
  apiKey: string;
  scope: Category[];
  model?: string;
  timeoutMs?: number;
}

interface ClaudeMatchResponse {
  candidates: Array<{
    contentId: string;
    confidence: number;
    reason?: string;
  }>;
}

export class ClaudeMatchProvider implements IdentificationProvider {
  readonly name = 'claudematch';

  constructor(private readonly opts: Opts) {}

  async identify(input: IdentificationInput): Promise<IdentificationResult> {
    if (!this.opts.apiKey) {
      throw new ProviderError('not_configured', this.name, 'ANTHROPIC_API_KEY not set');
    }

    const scoped = CONTENT_REGISTRY.filter((c) => this.opts.scope.includes(c.category));
    const scopedById = new Map(scoped.map((c) => [c.id, c]));

    const client = new Anthropic({
      apiKey: this.opts.apiKey,
      timeout: this.opts.timeoutMs ?? 15000,
    });

    const systemPrompt = buildSystemPrompt(scoped);

    let msg;
    try {
      msg = await client.messages.create({
        model: this.opts.model ?? 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'url', url: input.imageUrl } },
              { type: 'text', text: 'Identifiziere das Subjekt im Bild.' },
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

    let parsed: ClaudeMatchResponse;
    try {
      parsed = JSON.parse(stripCodeFences(textBlock.text));
    } catch {
      throw new ProviderError('upstream_error', this.name, `non-JSON response: ${textBlock.text.slice(0, 80)}`);
    }

    const validCandidates: DetectionCandidate[] = [];
    for (const c of parsed.candidates ?? []) {
      const content = scopedById.get(c.contentId);
      if (!content) {
        console.warn(`[claudeMatch] verworfene halluzinierte contentId: ${c.contentId} (scope: ${this.opts.scope.join(',')})`);
        continue;
      }
      validCandidates.push({
        rank: validCandidates.length + 1,
        scientificName: content.scientificName,
        commonNames: [content.name, ...content.aliases],
        taxonomy: undefined,
        confidence: Math.max(0, Math.min(1, c.confidence)),
        matchedContentId: content.id,
      });
      if (validCandidates.length >= input.maxCandidates) break;
    }

    return { candidates: validCandidates, providerRaw: parsed };
  }
}

function buildSystemPrompt(scoped: ContentEntry[]): string {
  const lines = scoped
    .map((c) => {
      const traits = c.traits.slice(0, 3).join('; ');
      const confusion = c.confusionRisk.map((r) => r.name).join(', ');
      const confusionLine = confusion ? `\n  Verwechslungsrisiko: ${confusion}` : '';
      return `[${c.id}] ${c.name} (${c.scientificName})\n  Merkmale: ${traits}${confusionLine}`;
    })
    .join('\n\n');

  return `Du identifizierst Garten-Subjekte (Insekten, Nuetzlinge, Krankheiten, Schaeden).
Hier ist die Liste bekannter Eintraege:

${lines}

Schaue dir das Bild an und waehle bis zu 3 passende Eintraege.
Antworte NUR mit gueltigem JSON, kein Fliesstext davor oder danach:
{ "candidates": [{ "contentId": "...", "confidence": 0.0-1.0, "reason": "..." }] }

Wenn nichts klar passt, gib eine leere Liste: { "candidates": [] }
Verwende ausschliesslich contentIds aus der Liste oben.`;
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  return match ? match[1].trim() : trimmed;
}
```

- [ ] **Step 4: Test ausfuehren — soll jetzt gruen sein**

Run: `npx vitest run tests/providers/claudeMatch.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/providers/identification/claudeMatch.ts tests/providers/claudeMatch.test.ts
git commit -m "provider(claudematch): identifikation gegen content-registry"
```

---

## Task 4: ClaudeMatchProvider — Edge-Cases (Halluzination, leere Antwort, Errors)

**Files:**
- Modify: `tests/providers/claudeMatch.test.ts`

- [ ] **Step 1: Edge-Case-Tests hinzufuegen**

In `tests/providers/claudeMatch.test.ts` am Ende der `describe`-Klammer ergaenzen:

```ts
  it('returns up to maxCandidates entries in input order, ranked starting at 1', async () => {
    createMock.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: '{"candidates":[' +
            '{"contentId":"disease_echter_mehltau","confidence":0.7},' +
            '{"contentId":"disease_kraut_braunfaeule","confidence":0.4},' +
            '{"contentId":"disease_rosenrost","confidence":0.2}' +
          ']}',
        },
      ],
    });

    const provider = new ClaudeMatchProvider({ apiKey: 'k', scope: ['DISEASE'] });
    const result = await provider.identify({
      imageUrl: 'x',
      locale: 'de',
      maxCandidates: 3,
    });

    expect(result.candidates).toHaveLength(3);
    expect(result.candidates[0].rank).toBe(1);
    expect(result.candidates[1].rank).toBe(2);
    expect(result.candidates[2].rank).toBe(3);
  });

  it('drops halluzinierte contentIds outside the scope', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    createMock.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: '{"candidates":[' +
            '{"contentId":"pest_blattlaeuse","confidence":0.6},' +
            '{"contentId":"plant_does_not_exist","confidence":0.5}' +
          ']}',
        },
      ],
    });

    const provider = new ClaudeMatchProvider({ apiKey: 'k', scope: ['PEST', 'BENEFICIAL'] });
    const result = await provider.identify({
      imageUrl: 'x',
      locale: 'de',
      maxCandidates: 3,
    });

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].matchedContentId).toBe('pest_blattlaeuse');
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('drops contentIds whose category is not in the scope', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    createMock.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: '{"candidates":[{"contentId":"disease_echter_mehltau","confidence":0.6}]}',
        },
      ],
    });

    const provider = new ClaudeMatchProvider({ apiKey: 'k', scope: ['PEST'] });
    const result = await provider.identify({
      imageUrl: 'x',
      locale: 'de',
      maxCandidates: 3,
    });

    expect(result.candidates).toHaveLength(0);
    warnSpy.mockRestore();
  });

  it('returns empty candidates when claude says none', async () => {
    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: '{"candidates":[]}' }],
    });

    const provider = new ClaudeMatchProvider({ apiKey: 'k', scope: ['DISEASE'] });
    const result = await provider.identify({
      imageUrl: 'x',
      locale: 'de',
      maxCandidates: 3,
    });

    expect(result.candidates).toEqual([]);
  });

  it('throws not_configured when apiKey missing', async () => {
    const provider = new ClaudeMatchProvider({ apiKey: '', scope: ['DISEASE'] });
    await expect(
      provider.identify({ imageUrl: 'x', locale: 'de', maxCandidates: 3 })
    ).rejects.toMatchObject({ kind: 'not_configured' });
  });

  it('throws upstream_error on non-JSON response', async () => {
    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'I think it is aphids.' }],
    });

    const provider = new ClaudeMatchProvider({ apiKey: 'k', scope: ['PEST'] });
    await expect(
      provider.identify({ imageUrl: 'x', locale: 'de', maxCandidates: 3 })
    ).rejects.toMatchObject({ kind: 'upstream_error' });
  });

  it('throws rate_limit on HTTP 429', async () => {
    createMock.mockRejectedValueOnce(Object.assign(new Error('rate'), { status: 429 }));

    const provider = new ClaudeMatchProvider({ apiKey: 'k', scope: ['PEST'] });
    await expect(
      provider.identify({ imageUrl: 'x', locale: 'de', maxCandidates: 3 })
    ).rejects.toMatchObject({ kind: 'rate_limit' });
  });

  it('parses JSON wrapped in code fences', async () => {
    createMock.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: '```json\n{"candidates":[{"contentId":"pest_schnecken","confidence":0.55}]}\n```',
        },
      ],
    });

    const provider = new ClaudeMatchProvider({ apiKey: 'k', scope: ['PEST'] });
    const result = await provider.identify({
      imageUrl: 'x',
      locale: 'de',
      maxCandidates: 3,
    });

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].matchedContentId).toBe('pest_schnecken');
  });
```

- [ ] **Step 2: Tests ausfuehren — alle sollen gruen sein**

Run: `npx vitest run tests/providers/claudeMatch.test.ts`
Expected: alle Tests PASS. Die Implementierung aus Task 3 deckt die Cases bereits ab.

- [ ] **Step 3: Commit**

```bash
git add tests/providers/claudeMatch.test.ts
git commit -m "test(claudematch): halluzinations-guard, errors, leere antwort"
```

---

## Task 5: Factory-Funktion getIdentificationProviderFor

**Files:**
- Modify: `src/lib/providers/identification/factory.ts`

- [ ] **Step 1: Bestehende Factory beibehalten, neue Funktion ergaenzen**

Ersetze den Inhalt von `src/lib/providers/identification/factory.ts` durch:

```ts
import { PlantNetProvider } from './plantnet';
import { MockIdentificationProvider } from './mock';
import { ClaudeMatchProvider } from './claudeMatch';
import type { IdentificationProvider } from './types';
import type { TriageCategory } from '@/domain/scan/ScanOutcome';

export function getIdentificationProvider(): IdentificationProvider {
  if (process.env.IDENTIFICATION_PROVIDER === 'mock') {
    return new MockIdentificationProvider();
  }

  return new PlantNetProvider({
    apiKey: process.env.PLANTNET_API_KEY ?? '',
    project: process.env.PLANTNET_PROJECT ?? 'weurope',
  });
}

export function getIdentificationProviderFor(
  category: TriageCategory
): IdentificationProvider | null {
  if (process.env.IDENTIFICATION_PROVIDER === 'mock') {
    return new MockIdentificationProvider();
  }

  switch (category) {
    case 'plant':
      return new PlantNetProvider({
        apiKey: process.env.PLANTNET_API_KEY ?? '',
        project: process.env.PLANTNET_PROJECT ?? 'weurope',
      });
    case 'insect':
    case 'beneficial':
      return new ClaudeMatchProvider({
        apiKey: process.env.ANTHROPIC_API_KEY ?? '',
        scope: ['PEST', 'BENEFICIAL'],
      });
    case 'disease':
      return new ClaudeMatchProvider({
        apiKey: process.env.ANTHROPIC_API_KEY ?? '',
        scope: ['DISEASE'],
      });
    case 'damage':
      return new ClaudeMatchProvider({
        apiKey: process.env.ANTHROPIC_API_KEY ?? '',
        scope: ['DISEASE', 'PEST'],
      });
    case 'unclear':
      return null;
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: keine Fehler. Switch ist exhaustive — TS prueft das.

- [ ] **Step 3: Commit**

```bash
git add src/lib/providers/identification/factory.ts
git commit -m "factory(identification): kategorie-routing fuer claudematch"
```

---

## Task 6: analyzeImageService auf identificationFor umstellen

**Files:**
- Modify: `src/lib/services/analyzeImageService.ts`
- Modify: `tests/services/analyzeImageService.test.ts`

- [ ] **Step 1: Bestehende Tests auf neue Signatur anpassen**

In `tests/services/analyzeImageService.test.ts`:

Ersetze den `makeId`-Helper und den Aufruf `analyzeImage({ ..., identification })` durch einen Factory-Helper. Konkret:

Nach `makeTriage` ergaenzen:

```ts
function makeIdFactory(id: IdentificationProvider | null) {
  return (_category: TriageResult['category']) => id;
}
```

Dann in JEDEM `await analyzeImage({ ... })`-Aufruf:
- `identification: id` ersetzen durch `identificationFor: makeIdFactory(id)`
- Beim `category_unsupported`-Test (Zeile 49-58): den Test umbauen — siehe naechster Step. Bis dahin uebersprungen.

Pseudocode-Diff fuer den ersten Test (Zeile 23-36):

```ts
const outcome = await analyzeImage({ imageUrl: 'u', triage, identificationFor: makeIdFactory(id) });
```

- [ ] **Step 2: category_unsupported-Test umbauen**

Bisher (Zeile 49-58) testete der `category_unsupported`-Case eine `insect`-Triage. Nach Phase C ist das KEIN unsupported mehr. Ersetze den Test durch:

```ts
  it('category_unsupported: triage says unclear, factory returns null', async () => {
    const triage = makeTriage({ category: 'unclear', quality: 'acceptable', reason: 'nichts klar' });
    const identificationFor = (_cat: TriageResult['category']) => null;

    const outcome = await analyzeImage({ imageUrl: 'u', triage, identificationFor });

    expect(outcome.status).toBe('category_unsupported');
    expect(outcome.triage?.category).toBe('unclear');
  });
```

- [ ] **Step 3: Tests ausfuehren — sollen fehlschlagen**

Run: `npx vitest run tests/services/analyzeImageService.test.ts`
Expected: FAIL — `analyzeImage` kennt `identificationFor` noch nicht, akzeptiert noch das alte `identification`.

- [ ] **Step 4: analyzeImageService refaktorieren**

In `src/lib/services/analyzeImageService.ts` ersetze den gesamten Inhalt durch:

```ts
import { ProviderError } from '@/lib/providers/errors';
import type { IdentificationProvider } from '@/lib/providers/identification/types';
import type { TriageProvider } from '@/lib/providers/triage/types';
import type { ScanOutcome, TriageCategory } from '@/domain/scan/ScanOutcome';

const AUTO_OK_CONFIDENCE = 0.25;
const UNCERTAIN_MIN_CONFIDENCE = 0.05;

export interface AnalyzeImageInput {
  imageUrl: string;
  triage: TriageProvider;
  identificationFor: (category: TriageCategory) => IdentificationProvider | null;
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

  const identification = input.identificationFor(triage.category);
  if (!identification) {
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
    ident = await identification.identify({
      imageUrl: input.imageUrl,
      locale,
      maxCandidates,
    });
  } catch (err) {
    return providerErrorOutcome(err, identification.name, triage);
  }

  const sorted = [...ident.candidates].sort((a, b) => b.confidence - a.confidence);
  const top = sorted[0];

  if (top && top.confidence >= AUTO_OK_CONFIDENCE) {
    return {
      status: 'ok',
      triage,
      candidates: sorted.filter((c) => c.confidence >= AUTO_OK_CONFIDENCE).slice(0, 3),
      provider: identification.name,
    };
  }

  if (top && top.confidence >= UNCERTAIN_MIN_CONFIDENCE) {
    return {
      status: 'uncertain_match',
      triage,
      candidates: sorted
        .filter((c) => c.confidence >= UNCERTAIN_MIN_CONFIDENCE)
        .slice(0, 3),
      provider: identification.name,
    };
  }

  return {
    status: 'no_match',
    triage,
    candidates: [],
    provider: identification.name,
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

- [ ] **Step 5: Tests ausfuehren — sollen gruen sein**

Run: `npx vitest run tests/services/analyzeImageService.test.ts`
Expected: alle Tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/services/analyzeImageService.ts tests/services/analyzeImageService.test.ts
git commit -m "service(analyzeImage): identificationFor-routing statt fester provider"
```

---

## Task 7: Routing-Tests pro Triage-Kategorie

**Files:**
- Modify: `tests/services/analyzeImageService.test.ts`

- [ ] **Step 1: Routing-Tests ergaenzen**

In `tests/services/analyzeImageService.test.ts` am Ende der `describe`-Klammer hinzufuegen:

```ts
  it('routing: insect calls identificationFor with insect category', async () => {
    const triage = makeTriage({ category: 'insect', quality: 'acceptable' });
    const id = makeId({
      candidates: [{ rank: 1, scientificName: 'Aphidoidea', commonNames: ['Blattlaeuse'], confidence: 0.7, matchedContentId: 'pest_blattlaeuse' }],
      providerRaw: {},
    });
    const factory = vi.fn((_cat) => id);

    const outcome = await analyzeImage({ imageUrl: 'u', triage, identificationFor: factory });

    expect(factory).toHaveBeenCalledWith('insect');
    expect(outcome.status).toBe('ok');
    expect(outcome.candidates[0].matchedContentId).toBe('pest_blattlaeuse');
  });

  it('routing: beneficial calls identificationFor with beneficial category', async () => {
    const triage = makeTriage({ category: 'beneficial', quality: 'acceptable' });
    const id = makeId({
      candidates: [{ rank: 1, scientificName: 'Coccinellidae', commonNames: ['Marienkaefer'], confidence: 0.9, matchedContentId: 'beneficial_marienkaefer' }],
      providerRaw: {},
    });
    const factory = vi.fn((_cat) => id);

    const outcome = await analyzeImage({ imageUrl: 'u', triage, identificationFor: factory });

    expect(factory).toHaveBeenCalledWith('beneficial');
    expect(outcome.status).toBe('ok');
  });

  it('routing: disease calls identificationFor with disease category', async () => {
    const triage = makeTriage({ category: 'disease', quality: 'acceptable' });
    const id = makeId({
      candidates: [{ rank: 1, scientificName: 'Erysiphales', commonNames: ['Mehltau'], confidence: 0.6, matchedContentId: 'disease_echter_mehltau' }],
      providerRaw: {},
    });
    const factory = vi.fn((_cat) => id);

    const outcome = await analyzeImage({ imageUrl: 'u', triage, identificationFor: factory });

    expect(factory).toHaveBeenCalledWith('disease');
    expect(outcome.status).toBe('ok');
  });

  it('routing: damage calls identificationFor with damage category', async () => {
    const triage = makeTriage({ category: 'damage', quality: 'acceptable' });
    const id = makeId({
      candidates: [],
      providerRaw: {},
    });
    const factory = vi.fn((_cat) => id);

    const outcome = await analyzeImage({ imageUrl: 'u', triage, identificationFor: factory });

    expect(factory).toHaveBeenCalledWith('damage');
    expect(outcome.status).toBe('no_match');
  });
```

- [ ] **Step 2: Tests ausfuehren**

Run: `npx vitest run tests/services/analyzeImageService.test.ts`
Expected: alle Tests PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/services/analyzeImageService.test.ts
git commit -m "test(analyzeImage): routing pro triage-kategorie"
```

---

## Task 8: API-Route auf identificationFor umstellen

**Files:**
- Modify: `src/app/api/scans/route.ts:10, 80-86`

- [ ] **Step 1: Import austauschen**

In `src/app/api/scans/route.ts:10` aendere:

```ts
import { getIdentificationProvider } from '@/lib/providers/identification/factory';
```

zu:

```ts
import { getIdentificationProviderFor } from '@/lib/providers/identification/factory';
```

- [ ] **Step 2: Aufruf umstellen**

In `src/app/api/scans/route.ts:80-86` ersetze:

```ts
    const triage = new ClaudeVisionTriageProvider({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' });
    const identification = getIdentificationProvider();

    const outcome = await analyzeImage({
      imageUrl: signedUrl,
      triage,
      identification,
    });
```

durch:

```ts
    const triage = new ClaudeVisionTriageProvider({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' });

    const outcome = await analyzeImage({
      imageUrl: signedUrl,
      triage,
      identificationFor: getIdentificationProviderFor,
    });
```

- [ ] **Step 3: Typecheck + vitest**

Run: `npx tsc --noEmit && npx vitest run`
Expected: keine TS-Fehler, alle Tests gruen.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/scans/route.ts
git commit -m "api(scans): route ueber identificationFor-factory"
```

---

## Task 9: UI — SavePlantPrompt conditional auf PLANT/WEED

**Files:**
- Modify: `src/app/scan/[id]/page.tsx:205`

- [ ] **Step 1: Conditional Rendering anpassen**

In `src/app/scan/[id]/page.tsx:205` aendere:

```tsx
            {!scan.plantId && <SavePlantPrompt scanId={scan.id} />}
```

zu:

```tsx
            {!scan.plantId &&
              (matchedEntry.category === "PLANT" || matchedEntry.category === "WEED") && (
                <SavePlantPrompt scanId={scan.id} />
              )}
```

(Hinweis: innerhalb `{matchedEntry ? (...)`-Block ist `matchedEntry` bereits non-null garantiert — der Optional-Operator entfaellt.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: keine Fehler.

- [ ] **Step 3: Commit**

```bash
git add src/app/scan/[id]/page.tsx
git commit -m "ui(scan): SavePlantPrompt nur fuer pflanze/unkraut"
```

---

## Task 10: UI — CategoryUnsupportedState auf unclear-only vereinfachen

**Files:**
- Modify: `src/components/features/scan/ScanResultStates.tsx:32-82`

- [ ] **Step 1: CategoryUnsupportedState ersetzen**

In `src/components/features/scan/ScanResultStates.tsx` ersetze den gesamten Block `export function CategoryUnsupportedState({ category }: { category?: string }) { ... }` (Zeilen 32-82) durch:

```tsx
export function CategoryUnsupportedState({ category: _category }: { category?: string }) {
  const coachPrompt =
    "Ich habe einen unklaren Gartenfall fotografiert. Hilf mir bei Einordnung und naechstem sinnvollen Schritt.";

  return (
    <GenericErrorFrame
      eyebrow="Motiv unklar"
      title="Wir konnten weder Pflanze noch Tier noch Schaden klar genug erkennen."
      body="So bleibt der Scan ohne Substanz. Mit einem zweiten Foto, das ein Subjekt deutlich zeigt, kommt die App fast immer ans Ziel."
      mark="compass"
      tips={[
        "Naeher ran an genau ein Motiv: Pflanze, Tier oder Schadstelle.",
        "Wenn du nicht weisst, was du vor dir hast, nutze den Coach mit einer kurzen Beschreibung.",
      ]}
      quickPlan={{
        title: "Naechster Versuch, der eher klappt",
        steps: [
          "Ein klares Hauptmotiv mittig ins Bild ruecken.",
          "Hintergrund ruhig halten, naeher rangehen.",
          "Tageslicht statt Blitz.",
        ],
      }}
      secondaryCta={{
        href: `/coach?q=${encodeURIComponent(coachPrompt)}`,
        label: "Coach mit Kontext oeffnen",
      }}
    />
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: keine Fehler. Die Prop `category` bleibt im Signatur-Vertrag (Caller in `scan/[id]/page.tsx:62` reicht sie noch durch), wird aber intern ignoriert.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/scan/ScanResultStates.tsx
git commit -m "ui(scan): CategoryUnsupportedState auf unclear-only vereinfachen"
```

---

## Task 11: UI — NoMatchState triage-aware

**Files:**
- Modify: `src/components/features/scan/ScanResultStates.tsx:84-111`
- Modify: `src/app/scan/[id]/page.tsx:70`

- [ ] **Step 1: NoMatchState Signatur + Branching**

In `src/components/features/scan/ScanResultStates.tsx` ersetze den `NoMatchState`-Block (Zeile 84-111) durch:

```tsx
export function NoMatchState({
  triageCategory,
}: {
  triageCategory?: import("@/domain/scan/ScanOutcome").TriageCategory;
}) {
  const isCreature = triageCategory === "insect" || triageCategory === "beneficial";
  const isSymptom = triageCategory === "disease" || triageCategory === "damage";

  const title = isCreature
    ? "Dieses Tier kennen wir noch nicht."
    : isSymptom
      ? "Dieses Schadbild konnten wir nicht zuordnen."
      : "Wir konnten diese Pflanze nicht sauber genug zuordnen.";

  const coachPrompt = isCreature
    ? "Ich habe ein Tier im Garten fotografiert, das nicht zugeordnet werden konnte. Hilf mir bei Einordnung und naechstem Schritt."
    : isSymptom
      ? "Ich habe ein Schadbild fotografiert, das nicht zugeordnet werden konnte. Hilf mir bei moeglichen Ursachen und naechstem Schritt."
      : "Ich konnte meine Pflanze nicht sauber scannen. Hilf mir mit den wahrscheinlichsten Optionen und worauf ich als Naechstes achten soll.";

  return (
    <GenericErrorFrame
      eyebrow="Zu unsicher"
      title={title}
      body="Unsichere Erkennung ist nur dann akzeptabel, wenn der naechste Versuch besser gefuehrt wird. Sonst bleibt es ein Demo-Gefuehl."
      mark="leaf"
      tips={[
        "Nochmal naeher ran an das eine Motiv, das du klaeren willst.",
        "Hintergrund ruhig halten, lieber eine klare Teilansicht als ein Komplettbild.",
      ]}
      quickPlan={{
        title: "So kommst du eher zum Aha-Moment",
        steps: [
          "Eine markante Stelle gezielt neu fotografieren.",
          "Bei Pflanzen: Bluete, Frucht oder Blattunterseite mitnehmen. Bei Tieren: Naheinstellung. Bei Schaeden: betroffene Stelle isolieren.",
          "Wenn du Zeitdruck hast: Coach fragen, statt auf perfekten Match zu warten.",
        ],
      }}
      secondaryCta={{
        href: `/coach?q=${encodeURIComponent(coachPrompt)}`,
        label: "Mit Coach weiter",
      }}
    />
  );
}
```

- [ ] **Step 2: Caller in scan/[id]/page.tsx anpassen**

In `src/app/scan/[id]/page.tsx:70` aendere:

```tsx
        <NoMatchState />
```

zu:

```tsx
        <NoMatchState triageCategory={scan.outcome.triage?.category} />
```

- [ ] **Step 3: Typecheck + vitest**

Run: `npx tsc --noEmit && npx vitest run`
Expected: gruen.

- [ ] **Step 4: Commit**

```bash
git add src/components/features/scan/ScanResultStates.tsx src/app/scan/[id]/page.tsx
git commit -m "ui(scan): NoMatchState triage-aware (tier/schadbild/pflanze)"
```

---

## Task 12: Content — 5 Pests

**Files:**
- Create: `src/content/pests/spinnmilben.ts`
- Create: `src/content/pests/buchsbaumzuensler.ts`
- Create: `src/content/pests/trauermuecken.ts`
- Create: `src/content/pests/wolllaeuse.ts`
- Create: `src/content/pests/dickmaulruessler.ts`
- Modify: `src/content/index.ts`

**Template fuer Pest-Eintraege** (vom bestehenden `blattlaeuse.ts` abgeleitet):

```ts
import type { ContentEntry } from "@/domain/types";
import { CONTENT_VERSION, SOURCES } from "../_shared";

export const <varName>: ContentEntry = {
  id: "pest_<slug>",
  category: "PEST",
  name: "<Deutscher Name>",
  scientificName: "<Wissenschaftlicher Name>",
  aliases: ["<Synonym 1>", "<Synonym 2>"],
  description: "<2-3 Saetze ueber das Tier, Schadbild, Vermehrung.>",
  traits: [
    "<Merkmal 1: Groesse, Farbe>",
    "<Merkmal 2: Schadbild>",
    "<Merkmal 3: Verhalten / Spinnenweben / Wabbel>",
    "<Merkmal 4: Auftreten>",
    "<Merkmal 5: Verwechslung>",
  ],
  significance: "HARMFUL",
  defaultUrgency: "THIS_WEEK", // oder IMMEDIATE bei akut
  habitat: "<Welche Pflanzen, welche Standorte>",
  seasons: ["SPRING", "SUMMER"], // anpassen
  areas: ["GARDEN", "BED", "BALCONY", "POTS"], // anpassen
  confusionRisk: [
    { name: "<Verwechslung 1>", note: "<Worin unterscheidet sich>" },
    { name: "<Verwechslung 2>", note: "<Worin unterscheidet sich>" },
  ],
  safety: {
    toxicToChildren: false,
    toxicToPets: [],
    allergyRisk: false,
    invasive: false,
  },
  methods: [
    // Mind. 3 methods: 1x MECHANICAL/CULTURAL, 1x HOME_REMEDY, 1x BIOLOGICAL oder ORGANIC_PRODUCT
    // Struktur siehe blattlaeuse.ts:42 fuer Referenz.
  ],
  prevention: [
    "<Vorbeugende Massnahme 1>",
    "<Vorbeugende Massnahme 2>",
    "<Vorbeugende Massnahme 3>",
  ],
  sources: [SOURCES.JKI, SOURCES.LFL], // 2-3 passende Quellen aus _shared.ts
  contentConfidence: "HIGH",
  version: CONTENT_VERSION,
  imageUrl: "<Wikipedia-Commons-URL oder leerer String>",
};
```

- [ ] **Step 1: spinnmilben.ts schreiben**

Erstelle `src/content/pests/spinnmilben.ts`. Kennzahlen:
- id: `pest_spinnmilben`, varName: `spinnmilben`
- name: "Spinnmilben", scientificName: "Tetranychus urticae", aliases: ["Rote Spinne", "Gemeine Spinnmilbe"]
- significance: HARMFUL, defaultUrgency: THIS_WEEK
- seasons: ["SUMMER"], areas: ["GARDEN", "BED", "BALCONY", "POTS"]
- methods: Abspritzen (MECHANICAL), Luftfeuchte erhoehen (CULTURAL), Raubmilben Phytoseiulus persimilis (BIOLOGICAL), Neem (ORGANIC_PRODUCT)
- Quellen: JKI, LFL
- Trockene Hitze + niedrige Luftfeuchte sind Treiber — als Merkmal und in prevention.

- [ ] **Step 2: buchsbaumzuensler.ts schreiben**

- id: `pest_buchsbaumzuensler`, name: "Buchsbaumzuensler-Raupen", scientificName: "Cydalima perspectalis"
- significance: HARMFUL, defaultUrgency: IMMEDIATE
- seasons: ["SPRING", "SUMMER", "AUTUMN"], areas: ["GARDEN", "BED"]
- methods: Abklauben (MECHANICAL), Bacillus thuringiensis (BIOLOGICAL), Hochdruck-Wasser (MECHANICAL), spaeter Schnitt + Schlupfwespen-Foerderung
- aliases: ["Buchsbaummotte"]
- Verwechslungsrisiko mit Buchsbaum-Blattfloh, Frostschaden.

- [ ] **Step 3: trauermuecken.ts schreiben**

- id: `pest_trauermuecken`, name: "Trauermuecken", scientificName: "Sciaridae"
- significance: NUISANCE (Larven schaedlich, Adulte nur laestig)
- defaultUrgency: THIS_WEEK
- seasons: ["SPRING", "SUMMER", "AUTUMN", "WINTER"], areas: ["POTS", "BALCONY"]
- methods: Substrat austrocknen (CULTURAL), Gelbtafeln (MECHANICAL), Nematoden Steinernema feltiae (BIOLOGICAL), Sand-Mulch (CULTURAL)
- Wichtig: Hinweis auf Indoor-Setting, frische Erde mitbringt oft Eier.

- [ ] **Step 4: wolllaeuse.ts schreiben**

- id: `pest_wolllaeuse`, name: "Wolllaeuse", scientificName: "Pseudococcidae"
- aliases: ["Schmierlaeuse"]
- significance: HARMFUL, defaultUrgency: THIS_WEEK
- seasons: alle, areas: ["POTS", "BALCONY", "GARDEN"]
- methods: Watte mit Alkohol/Schmierseife abtupfen (MECHANICAL), Australischer Marienkaefer Cryptolaemus (BIOLOGICAL), Neem (ORGANIC_PRODUCT)
- Verwechslungsrisiko: Schildlaeuse, Mehltau-Belag.

- [ ] **Step 5: dickmaulruessler.ts schreiben**

- id: `pest_dickmaulruessler`, name: "Dickmaulruessler", scientificName: "Otiorhynchus sulcatus"
- significance: HARMFUL, defaultUrgency: THIS_WEEK
- seasons: ["SPRING", "SUMMER", "AUTUMN"], areas: ["GARDEN", "BED", "POTS"]
- Schadbild: Buchtenfrass an Blattraendern (Adulte), Wurzelfrass durch Larven (gefaehrlicher)
- methods: Abends absammeln mit Brett-Fallen (MECHANICAL), Nematoden Heterorhabditis bacteriophora (BIOLOGICAL, im Sommer), Bodenpflege/Mulchkontrolle
- Quelle: JKI, GPP

- [ ] **Step 6: Pests in content/index.ts registrieren**

In `src/content/index.ts` nach `import { schnecken } from "./pests/schnecken";` ergaenzen:

```ts
import { spinnmilben } from "./pests/spinnmilben";
import { buchsbaumzuensler } from "./pests/buchsbaumzuensler";
import { trauermuecken } from "./pests/trauermuecken";
import { wolllaeuse } from "./pests/wolllaeuse";
import { dickmaulruessler } from "./pests/dickmaulruessler";
```

Und im `CONTENT_REGISTRY`-Array nach `schnecken,` einfuegen:

```ts
  spinnmilben,
  buchsbaumzuensler,
  trauermuecken,
  wolllaeuse,
  dickmaulruessler,
```

- [ ] **Step 7: Typecheck + Vitest Smoke**

Run: `npx tsc --noEmit && npx vitest run`
Expected: gruen.

- [ ] **Step 8: Commit**

```bash
git add src/content/pests src/content/index.ts
git commit -m "content(pests): spinnmilben, buchsbaumzuensler, trauermuecken, wolllaeuse, dickmaulruessler"
```

---

## Task 13: Content — 2 Beneficials

**Files:**
- Create: `src/content/beneficials/florfliege.ts`
- Create: `src/content/beneficials/schwebfliege.ts`
- Modify: `src/content/index.ts`

**Template fuer Beneficial-Eintraege** (vom bestehenden `marienkaefer.ts` abgeleitet — schaue dort fuer Struktur):
- `category: "BENEFICIAL"`, `significance: "BENEFIT"`
- `defaultUrgency: "MONITOR"` (Nuetzlinge brauchen keine Bekaempfung)
- `methods` fokussiert auf Foerdern, nicht bekaempfen: insektenfreundliche Bepflanzung, Insektenhotel, keine Pestizide.
- `safety.toxicToChildren: false`, `safety.invasive: false`.

- [ ] **Step 1: florfliege.ts schreiben**

- id: `beneficial_florfliege`, name: "Florfliege", scientificName: "Chrysoperla carnea"
- aliases: ["Goldauge", "Stinkfliege"]
- significance: BENEFIT, defaultUrgency: MONITOR
- description: Larven sind voracious Blattlausjaeger (sog. "Blattlausloewen"), Imago goldgruen, transparente Fluegel.
- seasons: ["SPRING", "SUMMER", "AUTUMN"], areas: ["GARDEN", "BED", "BALCONY", "POTS"]
- methods: Insektenhotel mit Florfliegenkasten (CULTURAL, BIOLOGICAL), Bluetenreiches Saumbiotop (CULTURAL), Verzicht auf Breitband-Insektizide (CULTURAL), Eier/Larven gezielt aussetzen bei Befall (BIOLOGICAL)
- prevention: Habitat dauerhaft anbieten (Totholz, Stauden, ueberwinterungs-Quartiere).
- Quellen: NABU, JKI.

- [ ] **Step 2: schwebfliege.ts schreiben**

- id: `beneficial_schwebfliege`, name: "Schwebfliege", scientificName: "Syrphidae"
- aliases: ["Schwirrfliege"]
- significance: BENEFIT, defaultUrgency: MONITOR
- description: Bestaeuber UND Blattlausjaeger (Larven). Wespen-Mimikry — wichtige Verwechslung.
- seasons: ["SPRING", "SUMMER", "AUTUMN"], areas: ["GARDEN", "BED", "BALCONY", "POTS"]
- confusionRisk: Wespen (Schwebfliegen haben nur 2 Fluegel statt 4, schweben am Fleck, kein Stachel).
- methods: Doldenbluetler (Dill, Fenchel) als Nektarquelle, Wildblumeninseln, Verzicht Pestizide, Steinhaufen als Versteck.
- Quellen: NABU, JKI.

- [ ] **Step 3: Beneficials in content/index.ts registrieren**

In `src/content/index.ts` nach `import { marienkaefer } from "./beneficials/marienkaefer";` ergaenzen:

```ts
import { florfliege } from "./beneficials/florfliege";
import { schwebfliege } from "./beneficials/schwebfliege";
```

Im `CONTENT_REGISTRY`-Array nach `marienkaefer,` einfuegen:

```ts
  florfliege,
  schwebfliege,
```

- [ ] **Step 4: Typecheck + Vitest Smoke**

Run: `npx tsc --noEmit && npx vitest run`
Expected: gruen.

- [ ] **Step 5: Commit**

```bash
git add src/content/beneficials src/content/index.ts
git commit -m "content(beneficials): florfliege, schwebfliege"
```

---

## Task 14: Content — 3 Diseases

**Files:**
- Create: `src/content/diseases/sternrusstau.ts`
- Create: `src/content/diseases/kraeuselkrankheit.ts`
- Create: `src/content/diseases/grauschimmel.ts`
- Modify: `src/content/index.ts`

**Template fuer Disease-Eintraege** (vom bestehenden `echter_mehltau.ts` abgeleitet):
- `category: "DISEASE"`, `significance: "HARMFUL"`
- `defaultUrgency: "THIS_WEEK"` (Pilze breiten sich aus)
- methods: mind. 1x MECHANICAL (befallene Blaetter entfernen), 1x HOME_REMEDY, 1x ORGANIC_PRODUCT (Fungizid), 1x CULTURAL (Standort/Pflege)
- prevention zentral: Belueftung, Wahl resistenter Sorten, Hygiene.

- [ ] **Step 1: sternrusstau.ts schreiben**

- id: `disease_sternrusstau`, name: "Sternrusstau", scientificName: "Diplocarpon rosae"
- aliases: ["Schwarzfleckenkrankheit"]
- significance: HARMFUL, defaultUrgency: THIS_WEEK
- description: Haeufigste Rosenkrankheit. Strahlige schwarze Flecken auf Blattoberseite, Gelbfaerbung um Flecken, vorzeitiger Blattfall.
- habitat: Rosen, besonders bei feuchter Witterung.
- seasons: ["SPRING", "SUMMER", "AUTUMN"], areas: ["GARDEN", "BED"]
- methods: Befallenes Laub entfernen + im Restmuell entsorgen (MECHANICAL), Ackerschachtelhalmbruehe (HOME_REMEDY), Netzschwefel/Kupferpraeparat (ORGANIC_PRODUCT), ADR-Sorten + luftige Pflanzung (CULTURAL)
- confusionRisk: Echter Mehltau (weisser Belag oben, keine Flecken), Falscher Mehltau (Blattunterseite).
- Quellen: JKI, GPP, LFL.

- [ ] **Step 2: kraeuselkrankheit.ts schreiben**

- id: `disease_kraeuselkrankheit`, name: "Kraeuselkrankheit", scientificName: "Taphrina deformans"
- significance: HARMFUL, defaultUrgency: THIS_WEEK
- description: Pilz an Pfirsich, Nektarine, Mandel. Jungtriebe deformieren sich, Blaetter werden blasig, gekraeuselt, rot bis weisslich. Befall startet im Fruehjahr bei Knospenaustrieb.
- habitat: Pfirsich, Nektarine, Mandel.
- seasons: ["SPRING"], areas: ["GARDEN"]
- methods: Befallene Triebe ausschneiden (MECHANICAL), Knospenaustrieb-Spritzung mit Kupfer (ORGANIC_PRODUCT, Achtung: Wartezeit + nur bis Knospenschwellen), Schachtelhalmbruehe (HOME_REMEDY), resistente Sorten + Regendach (CULTURAL).
- prevention: Spritzung im zeitigen Vorfruehling (Februar/Maerz) bevor Knospen aufgehen.
- Quellen: JKI, GPP, LFL.

- [ ] **Step 3: grauschimmel.ts schreiben**

- id: `disease_grauschimmel`, name: "Grauschimmel", scientificName: "Botrytis cinerea"
- aliases: ["Botrytis"]
- significance: HARMFUL, defaultUrgency: IMMEDIATE
- description: Universeller Schimmelpilz. Grauer, filzig-watteartiger Belag auf Bluetenbasis, weichen Pflanzenteilen, faulenden Fruechten. Greift weiches Gewebe an, breitet sich rasend schnell aus.
- habitat: Erdbeeren, Tomaten, Salat, Pelargonien, Cyclamen, Stauden.
- seasons: ["SPRING", "SUMMER", "AUTUMN"], areas: ["GARDEN", "BED", "BALCONY", "POTS"]
- methods: Befallene Teile sofort entfernen (MECHANICAL), Pflanzbestand auslichten (CULTURAL), Bacillus subtilis (BIOLOGICAL), bei Erdbeeren Strohmulch (CULTURAL).
- confusionRisk: Echter Mehltau (mehlig statt watteartig), Sclerotinia (haerterer Belag).
- prevention: Belueftung, Morgens giessen, Pflanzen-Hygiene, kein Stickstoff-Ueberschuss.
- Quellen: JKI, LFL, GPP.

- [ ] **Step 4: Diseases in content/index.ts registrieren**

In `src/content/index.ts` nach `import { rosenrost } from "./diseases/rosenrost";` ergaenzen:

```ts
import { sternrusstau } from "./diseases/sternrusstau";
import { kraeuselkrankheit } from "./diseases/kraeuselkrankheit";
import { grauschimmel } from "./diseases/grauschimmel";
```

Im `CONTENT_REGISTRY`-Array nach `rosenrost,` einfuegen:

```ts
  sternrusstau,
  kraeuselkrankheit,
  grauschimmel,
```

- [ ] **Step 5: Typecheck + Vitest Smoke**

Run: `npx tsc --noEmit && npx vitest run`
Expected: gruen.

- [ ] **Step 6: Commit**

```bash
git add src/content/diseases src/content/index.ts
git commit -m "content(diseases): sternrusstau, kraeuselkrankheit, grauschimmel"
```

---

## Task 15: Content-Registry Smoke-Tests

**Files:**
- Create: `tests/content/registry.test.ts`

- [ ] **Step 1: Smoke-Test schreiben**

Erstelle `tests/content/registry.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { CONTENT_REGISTRY, CONTENT_STATS } from '@/content';
import type { Category } from '@/domain/types';

const VALID_CATEGORIES: Category[] = ['PLANT', 'WEED', 'PEST', 'BENEFICIAL', 'DISEASE', 'DAMAGE'];

describe('CONTENT_REGISTRY', () => {
  it('has no duplicate ids', () => {
    const ids = CONTENT_REGISTRY.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all entries have a valid category', () => {
    for (const c of CONTENT_REGISTRY) {
      expect(VALID_CATEGORIES).toContain(c.category);
    }
  });

  it('all entries have at least one method', () => {
    for (const c of CONTENT_REGISTRY) {
      expect(c.methods.length, `${c.id} hat keine methods`).toBeGreaterThan(0);
    }
  });

  it('all entries have non-empty name and scientificName', () => {
    for (const c of CONTENT_REGISTRY) {
      expect(c.name.trim(), `${c.id} ohne name`).not.toBe('');
      expect(c.scientificName.trim(), `${c.id} ohne scientificName`).not.toBe('');
    }
  });

  it('all entries have a version string', () => {
    for (const c of CONTENT_REGISTRY) {
      expect(c.version, `${c.id} ohne version`).toBeTruthy();
    }
  });

  it('all entries have at least one source', () => {
    for (const c of CONTENT_REGISTRY) {
      expect(c.sources.length, `${c.id} ohne sources`).toBeGreaterThan(0);
    }
  });

  it('Phase-C target counts reached', () => {
    expect(CONTENT_STATS.byCategory.PEST ?? 0).toBeGreaterThanOrEqual(7);
    expect(CONTENT_STATS.byCategory.BENEFICIAL ?? 0).toBeGreaterThanOrEqual(3);
    expect(CONTENT_STATS.byCategory.DISEASE ?? 0).toBeGreaterThanOrEqual(6);
  });
});
```

- [ ] **Step 2: Tests ausfuehren**

Run: `npx vitest run tests/content/registry.test.ts`
Expected: alle PASS. Falls die Phase-C-Count-Tests fehlschlagen, fehlen Eintraege aus Task 12/13/14.

- [ ] **Step 3: Commit**

```bash
git add tests/content/registry.test.ts
git commit -m "test(content): registry-smoke (ids, kategorien, methods, phase-c-counts)"
```

---

## Task 16: Manuelle End-to-End-Verifikation

**Files:** keine — manueller Check gegen Dev-Server.

- [ ] **Step 1: Vollstaendigen Testlauf**

Run: `npx vitest run`
Expected: alle Tests gruen (bestehende 38 + neue aus Tasks 2, 3, 4, 6, 7, 15).

- [ ] **Step 2: Dev-Server starten**

Run: `npm run dev`

- [ ] **Step 3: Je ein echtes Foto pro Triage-Kategorie hochladen**

In `/scan/new` jeweils:
1. Pflanze (z.B. Hortensie oder Rose) — Triage `plant`, Pl@ntNet greift, `matchedContentId` gesetzt falls in Registry.
2. Marienkaefer-Foto — Triage `beneficial`, ClaudeMatch findet `beneficial_marienkaefer`.
3. Blattlaus-Foto — Triage `insect`, ClaudeMatch findet `pest_blattlaeuse`.
4. Mehltau-Foto — Triage `disease`, ClaudeMatch findet `disease_echter_mehltau` o.ae.
5. Vergilbtes Blatt ohne klare Krankheit — Triage `damage`, ClaudeMatch schlaegt Ursache vor (DISEASE oder PEST), evtl. `uncertain_match`.

- [ ] **Step 4: DB-Verifikation**

DB-Outcome pro Scan inspizieren (Supabase Dashboard oder das bestehende Diagnose-Script aus dem Memory-Snapshot). Pro Eintrag pruefen:
- `outcome.triage.category` ist der erwartete Wert
- `outcome.provider` = `plantnet` (plant) bzw. `claudematch` (rest)
- `outcome.status` plausibel
- `matched_content_id` gesetzt wo erwartet

- [ ] **Step 5: UI-Spot-Checks**

Auf der Scan-Detail-Seite:
- Pflanze: `SavePlantPrompt` SICHTBAR
- Marienkaefer / Blattlaus / Mehltau: `SavePlantPrompt` NICHT SICHTBAR
- `CategoryLabel` zeigt korrekte Kategorie
- `ActionDecisionPanel` zeigt methods aus dem Content-Eintrag
- Bei `uncertain_match`: Top-3-Buttons funktionieren

- [ ] **Step 6: Pipeline-Update senden**

```powershell
pipeline-update -Slug gartenscanner `
  -Progress 98 `
  -Summary "Phase C live: insekten, nuetzlinge, krankheiten und schaeden ueber claudematch + 10 neue content-eintraege" `
  -Todos @("Coach LLM-Anbindung", "Phase D weiter ausbauen", "Stripe / Paywall (Phase E)", "Pricing finalisieren")
```

- [ ] **Step 7: Final-Commit (optional, falls Bugfixes noetig)**

Bei manuellen Fixes:

```bash
git add <files>
git commit -m "fix(phase-c): <konkreter fix>"
```
