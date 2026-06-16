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
