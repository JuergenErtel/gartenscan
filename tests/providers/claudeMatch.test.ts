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
});
