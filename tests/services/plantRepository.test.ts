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
