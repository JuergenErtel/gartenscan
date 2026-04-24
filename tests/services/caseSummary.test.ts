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
