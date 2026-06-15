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
