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

  it('plant catalog expanded', () => {
    expect(CONTENT_STATS.byCategory.PLANT ?? 0).toBeGreaterThanOrEqual(18);
  });
});
