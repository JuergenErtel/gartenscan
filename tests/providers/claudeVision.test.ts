import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClaudeVisionTriageProvider } from '@/lib/providers/triage/claudeVision';

// vi.mock is hoisted — use vi.hoisted() so the mock factory can reference the spy.
const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }));

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = { create: createMock };
    },
  };
});

describe('ClaudeVisionTriageProvider', () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it('parses a valid JSON response for a plant', async () => {
    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: '{"category":"plant","quality":"acceptable"}' }],
    });

    const provider = new ClaudeVisionTriageProvider({ apiKey: 'k' });
    const result = await provider.classify({
      imageUrl: 'https://example.com/plant.jpg',
      locale: 'de',
    });

    expect(result.category).toBe('plant');
    expect(result.quality).toBe('acceptable');
  });

  it('maps blurry-quality result', async () => {
    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: '{"category":"unclear","quality":"blurry","reason":"Bild ist unscharf"}' }],
    });

    const provider = new ClaudeVisionTriageProvider({ apiKey: 'k' });
    const result = await provider.classify({
      imageUrl: 'https://example.com/blurry.jpg',
      locale: 'de',
    });

    expect(result.quality).toBe('blurry');
    expect(result.reason).toBe('Bild ist unscharf');
  });

  it('throws not_configured when apiKey missing', async () => {
    const provider = new ClaudeVisionTriageProvider({ apiKey: '' });
    await expect(
      provider.classify({ imageUrl: 'x', locale: 'de' })
    ).rejects.toMatchObject({ kind: 'not_configured' });
  });

  it('throws upstream_error on non-JSON response', async () => {
    createMock.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'I think this is a rose.' }],
    });

    const provider = new ClaudeVisionTriageProvider({ apiKey: 'k' });
    await expect(
      provider.classify({ imageUrl: 'x', locale: 'de' })
    ).rejects.toMatchObject({ kind: 'upstream_error' });
  });
});
