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
