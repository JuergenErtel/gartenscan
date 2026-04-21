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
