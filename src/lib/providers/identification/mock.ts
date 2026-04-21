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
