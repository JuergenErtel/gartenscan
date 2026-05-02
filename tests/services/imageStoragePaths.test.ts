import { describe, expect, it } from 'vitest';
import { collectUniqueImagePaths } from '@/lib/services/imageStoragePaths';

describe('collectUniqueImagePaths', () => {
  it('returns unique paths from scans plus cover', () => {
    const result = collectUniqueImagePaths(
      ['u1/a.jpg', 'u1/b.jpg', 'u1/c.jpg'],
      'u1/d.jpg'
    );
    expect(result.sort()).toEqual(['u1/a.jpg', 'u1/b.jpg', 'u1/c.jpg', 'u1/d.jpg']);
  });

  it('dedupes when cover is also a scan path', () => {
    const result = collectUniqueImagePaths(
      ['u1/a.jpg', 'u1/b.jpg'],
      'u1/a.jpg'
    );
    expect(result.sort()).toEqual(['u1/a.jpg', 'u1/b.jpg']);
  });

  it('handles empty scan list', () => {
    const result = collectUniqueImagePaths([], 'u1/cover.jpg');
    expect(result).toEqual(['u1/cover.jpg']);
  });

  it('drops empty / falsy paths', () => {
    const result = collectUniqueImagePaths(['u1/a.jpg', ''], '');
    expect(result).toEqual(['u1/a.jpg']);
  });
});
