import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClaudeMatchProvider } from '@/lib/providers/identification/claudeMatch';

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }));

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = { create: createMock };
    },
  };
});

describe('ClaudeMatchProvider', () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it('returns a single high-confidence candidate', async () => {
    createMock.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: '{"candidates":[{"contentId":"pest_blattlaeuse","confidence":0.82,"reason":"Dichte gruene Kolonien an Triebspitze"}]}',
        },
      ],
    });

    const provider = new ClaudeMatchProvider({
      apiKey: 'k',
      scope: ['PEST', 'BENEFICIAL'],
    });
    const result = await provider.identify({
      imageUrl: 'https://example.com/aphid.jpg',
      locale: 'de',
      maxCandidates: 3,
    });

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].matchedContentId).toBe('pest_blattlaeuse');
    expect(result.candidates[0].confidence).toBeCloseTo(0.82);
    expect(result.candidates[0].scientificName).toBe('Aphidoidea');
    expect(result.candidates[0].commonNames[0]).toBe('Blattläuse');
  });

  it('returns up to maxCandidates entries in input order, ranked starting at 1', async () => {
    createMock.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: '{"candidates":[' +
            '{"contentId":"disease_echter_mehltau","confidence":0.7},' +
            '{"contentId":"disease_kraut_braunfaeule","confidence":0.4},' +
            '{"contentId":"disease_rosenrost","confidence":0.2}' +
          ']}',
        },
      ],
    });

    const provider = new ClaudeMatchProvider({ apiKey: 'k', scope: ['DISEASE'] });
    const result = await provider.identify({
      imageUrl: 'x',
      locale: 'de',
      maxCandidates: 3,
    });

    expect(result.candidates).toHaveLength(3);
    expect(result.candidates[0].rank).toBe(1);
    expect(result.candidates[1].rank).toBe(2);
    expect(result.candidates[2].rank).toBe(3);
  });

  it('drops halluzinierte contentIds outside the scope', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    createMock.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: '{"candidates":[' +
            '{"contentId":"pest_blattlaeuse","confidence":0.6},' +
            '{"contentId":"plant_does_not_exist","confidence":0.5}' +
          ']}',
        },
      ],
    });

    const provider = new ClaudeMatchProvider({ apiKey: 'k', scope: ['PEST', 'BENEFICIAL'] });
    const result = await provider.identify({
      imageUrl: 'x',
      locale: 'de',
      maxCandidates: 3,
    });

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].matchedContentId).toBe('pest_blattlaeuse');
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('drops contentIds whose category is not in the scope', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    createMock.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: '{"candidates":[{"contentId":"disease_echter_mehltau","confidence":0.6}]}',
        },
      ],
    });

    const provider = new ClaudeMatchProvider({ apiKey: 'k', scope: ['PEST'] });
    const result = await provider.identify({
      imageUrl: 'x',
      locale: 'de',
      maxCandidates: 3,
    });

    expect(result.candidates).toHaveLength(0);
    warnSpy.mockRestore();
  });

  it('returns empty candidates when claude says none', async () => {
    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: '{"candidates":[]}' }],
    });

    const provider = new ClaudeMatchProvider({ apiKey: 'k', scope: ['DISEASE'] });
    const result = await provider.identify({
      imageUrl: 'x',
      locale: 'de',
      maxCandidates: 3,
    });

    expect(result.candidates).toEqual([]);
  });

  it('throws not_configured when apiKey missing', async () => {
    const provider = new ClaudeMatchProvider({ apiKey: '', scope: ['DISEASE'] });
    await expect(
      provider.identify({ imageUrl: 'x', locale: 'de', maxCandidates: 3 })
    ).rejects.toMatchObject({ kind: 'not_configured' });
  });

  it('throws upstream_error on non-JSON response', async () => {
    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'I think it is aphids.' }],
    });

    const provider = new ClaudeMatchProvider({ apiKey: 'k', scope: ['PEST'] });
    await expect(
      provider.identify({ imageUrl: 'x', locale: 'de', maxCandidates: 3 })
    ).rejects.toMatchObject({ kind: 'upstream_error' });
  });

  it('throws rate_limit on HTTP 429', async () => {
    createMock.mockRejectedValueOnce(Object.assign(new Error('rate'), { status: 429 }));

    const provider = new ClaudeMatchProvider({ apiKey: 'k', scope: ['PEST'] });
    await expect(
      provider.identify({ imageUrl: 'x', locale: 'de', maxCandidates: 3 })
    ).rejects.toMatchObject({ kind: 'rate_limit' });
  });

  it('parses JSON wrapped in code fences', async () => {
    createMock.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: '```json\n{"candidates":[{"contentId":"pest_schnecken","confidence":0.55}]}\n```',
        },
      ],
    });

    const provider = new ClaudeMatchProvider({ apiKey: 'k', scope: ['PEST'] });
    const result = await provider.identify({
      imageUrl: 'x',
      locale: 'de',
      maxCandidates: 3,
    });

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].matchedContentId).toBe('pest_schnecken');
  });
});
