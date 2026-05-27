import Anthropic from '@anthropic-ai/sdk';
import { CONTENT_REGISTRY } from '@/content';
import { ProviderError } from '@/lib/providers/errors';
import type { Category, ContentEntry } from '@/domain/types';
import type { DetectionCandidate } from '@/domain/scan/ScanOutcome';
import type {
  IdentificationInput,
  IdentificationProvider,
  IdentificationResult,
} from './types';

interface Opts {
  apiKey: string;
  scope: Category[];
  model?: string;
  timeoutMs?: number;
}

interface ClaudeMatchResponse {
  candidates: Array<{
    contentId: string;
    confidence: number;
    reason?: string;
  }>;
}

export class ClaudeMatchProvider implements IdentificationProvider {
  readonly name = 'claudematch';

  constructor(private readonly opts: Opts) {}

  async identify(input: IdentificationInput): Promise<IdentificationResult> {
    if (!this.opts.apiKey) {
      throw new ProviderError('not_configured', this.name, 'ANTHROPIC_API_KEY not set');
    }

    const scoped = CONTENT_REGISTRY.filter((c) => this.opts.scope.includes(c.category));
    const scopedById = new Map(scoped.map((c) => [c.id, c]));

    const client = new Anthropic({
      apiKey: this.opts.apiKey,
      timeout: this.opts.timeoutMs ?? 15000,
    });

    const systemPrompt = buildSystemPrompt(scoped);

    let msg;
    try {
      msg = await client.messages.create({
        model: this.opts.model ?? 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'url', url: input.imageUrl } },
              { type: 'text', text: 'Identifiziere das Subjekt im Bild.' },
            ],
          },
        ],
      });
    } catch (err) {
      // @ts-expect-error SDK error shape
      const status = err?.status;
      if (status === 429) {
        throw new ProviderError('rate_limit', this.name, 'anthropic rate limit', err);
      }
      throw new ProviderError('upstream_error', this.name, 'anthropic call failed', err);
    }

    const textBlock = msg.content.find((c: { type: string }) => c.type === 'text') as
      | { type: 'text'; text: string }
      | undefined;
    if (!textBlock) {
      throw new ProviderError('upstream_error', this.name, 'no text block in response');
    }

    let parsed: ClaudeMatchResponse;
    try {
      parsed = JSON.parse(stripCodeFences(textBlock.text));
    } catch {
      throw new ProviderError('upstream_error', this.name, `non-JSON response: ${textBlock.text.slice(0, 80)}`);
    }

    const validCandidates: DetectionCandidate[] = [];
    for (const c of parsed.candidates ?? []) {
      const content = scopedById.get(c.contentId);
      if (!content) {
        console.warn(`[claudeMatch] verworfene halluzinierte contentId: ${c.contentId} (scope: ${this.opts.scope.join(',')})`);
        continue;
      }
      validCandidates.push({
        rank: validCandidates.length + 1,
        scientificName: content.scientificName,
        commonNames: [content.name, ...content.aliases],
        taxonomy: undefined,
        confidence: Math.max(0, Math.min(1, c.confidence)),
        matchedContentId: content.id,
      });
      if (validCandidates.length >= input.maxCandidates) break;
    }

    return { candidates: validCandidates, providerRaw: parsed };
  }
}

function buildSystemPrompt(scoped: ContentEntry[]): string {
  const lines = scoped
    .map((c) => {
      const traits = c.traits.slice(0, 3).join('; ');
      const confusion = c.confusionRisk.map((r) => r.name).join(', ');
      const confusionLine = confusion ? `\n  Verwechslungsrisiko: ${confusion}` : '';
      return `[${c.id}] ${c.name} (${c.scientificName})\n  Merkmale: ${traits}${confusionLine}`;
    })
    .join('\n\n');

  return `Du identifizierst Garten-Subjekte (Insekten, Nuetzlinge, Krankheiten, Schaeden).
Hier ist die Liste bekannter Eintraege:

${lines}

Schaue dir das Bild an und waehle bis zu 3 passende Eintraege.
Antworte NUR mit gueltigem JSON, kein Fliesstext davor oder danach:
{ "candidates": [{ "contentId": "...", "confidence": 0.0-1.0, "reason": "..." }] }

Wenn nichts klar passt, gib eine leere Liste: { "candidates": [] }
Verwende ausschliesslich contentIds aus der Liste oben.`;
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  return match ? match[1].trim() : trimmed;
}
