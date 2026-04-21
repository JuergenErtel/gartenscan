import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PlantNetProvider } from '@/lib/providers/identification/plantnet';
import fixture from '../fixtures/plantnet-response.json';

describe('PlantNetProvider', () => {
  const fetchSpy = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchSpy);
    fetchSpy.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps PlantNet response to DetectionCandidates', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify(fixture), { status: 200 })
    );

    const provider = new PlantNetProvider({ apiKey: 'k', project: 'weurope' });
    const result = await provider.identify({
      imageUrl: 'https://example.com/tomato.jpg',
      locale: 'de',
      maxCandidates: 3,
    });

    expect(result.candidates).toHaveLength(2);
    expect(result.candidates[0]).toMatchObject({
      rank: 1,
      scientificName: 'Solanum lycopersicum',
      confidence: 0.8912,
      taxonomy: { family: 'Solanaceae', genus: 'Solanum' },
    });
    expect(result.candidates[0].commonNames).toContain('Tomate');
  });

  it('caps candidates at maxCandidates', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify(fixture), { status: 200 })
    );

    const provider = new PlantNetProvider({ apiKey: 'k', project: 'weurope' });
    const result = await provider.identify({
      imageUrl: 'https://example.com/x.jpg',
      locale: 'de',
      maxCandidates: 1,
    });

    expect(result.candidates).toHaveLength(1);
  });

  it('throws ProviderError on 401', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }));

    const provider = new PlantNetProvider({ apiKey: 'bad', project: 'weurope' });
    await expect(
      provider.identify({ imageUrl: 'https://x/y.jpg', locale: 'de', maxCandidates: 3 })
    ).rejects.toMatchObject({ kind: 'upstream_error', provider: 'plantnet' });
  });

  it('throws ProviderError on 429', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('Too Many Requests', { status: 429 }));

    const provider = new PlantNetProvider({ apiKey: 'k', project: 'weurope' });
    await expect(
      provider.identify({ imageUrl: 'https://x/y.jpg', locale: 'de', maxCandidates: 3 })
    ).rejects.toMatchObject({ kind: 'rate_limit' });
  });

  it('throws ProviderError on timeout', async () => {
    fetchSpy.mockImplementationOnce(() =>
      new Promise((_, reject) =>
        setTimeout(() => reject(Object.assign(new Error('abort'), { name: 'AbortError' })), 10)
      )
    );

    const provider = new PlantNetProvider({ apiKey: 'k', project: 'weurope', timeoutMs: 5 });
    await expect(
      provider.identify({ imageUrl: 'https://x/y.jpg', locale: 'de', maxCandidates: 3 })
    ).rejects.toMatchObject({ kind: 'timeout' });
  });

  it('throws not_configured when apiKey missing', async () => {
    const provider = new PlantNetProvider({ apiKey: '', project: 'weurope' });
    await expect(
      provider.identify({ imageUrl: 'https://x/y.jpg', locale: 'de', maxCandidates: 3 })
    ).rejects.toMatchObject({ kind: 'not_configured' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
