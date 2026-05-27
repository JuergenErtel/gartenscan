import Anthropic from '@anthropic-ai/sdk';
import { ProviderError } from '@/lib/providers/errors';
import type {
  TriageCategory,
  TriageQuality,
  TriageResult,
} from '@/domain/scan/ScanOutcome';
import type { TriageInput, TriageProvider } from './types';

const SYSTEM_PROMPT = `Du klassifizierst Fotos für eine Garten-App. Antworte NUR mit einem gültigen JSON-Objekt, kein Fließtext davor oder danach.

Schema:
{
  "category": "plant" | "insect" | "beneficial" | "disease" | "damage" | "unclear",
  "quality": "acceptable" | "blurry" | "no_subject",
  "reason": string | null
}

Regeln:
- "plant" = ganze Pflanze, Blatt, Blüte, Frucht, Stängel — auch Unkräuter.
- "insect" = Tier, das nicht eindeutig nützlich ist: Schnecken, Wanzen, Larven, unbekannte Krabbeltiere, Spinnen ohne Netz-Kontext.
- "beneficial" = eindeutig erkennbarer Nützling: Marienkäfer, Biene, Schwebfliege, Florfliege, Schmetterling, Spinne im Netz.
- "disease" = klares Pilz-, Bakterien- oder Virusbild: Belag, definierte Flecken, typisches Symptom.
- "damage" = Schaden an einer Pflanze ohne erkennbares Tier und ohne klares Krankheitsbild: Fraßspuren, vergilbte Blätter, Welke, abgebrochene Triebe.
- "unclear" = nichts von obigem eindeutig erkennbar.
- Wenn Tier UND Schaden sichtbar sind: wähle die Tier-Kategorie.
- Wenn unsicher zwischen insect/beneficial: wähle insect — die nachgelagerte Identifikation korrigiert.
- "quality": "blurry" bei Unschärfe; "no_subject" bei keinem erkennbaren Motiv; sonst "acceptable".
- "reason": kurze deutsche Begründung bei quality != "acceptable" oder category = "unclear", sonst null.`;

const ALLOWED_CATEGORIES: readonly TriageCategory[] = ['plant', 'insect', 'beneficial', 'disease', 'damage', 'unclear'];
const ALLOWED_QUALITY: readonly TriageQuality[] = ['acceptable', 'blurry', 'no_subject'];

interface Opts {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
}

export class ClaudeVisionTriageProvider implements TriageProvider {
  readonly name = 'claude-vision';

  constructor(private readonly opts: Opts) {}

  async classify(input: TriageInput): Promise<TriageResult> {
    if (!this.opts.apiKey) {
      throw new ProviderError('not_configured', this.name, 'ANTHROPIC_API_KEY not set');
    }

    const client = new Anthropic({
      apiKey: this.opts.apiKey,
      timeout: this.opts.timeoutMs ?? 6000,
    });

    let msg;
    try {
      msg = await client.messages.create({
        model: this.opts.model ?? 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'url', url: input.imageUrl },
              },
              {
                type: 'text',
                text: 'Klassifiziere dieses Foto.',
              },
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

    let parsed: { category?: string; quality?: string; reason?: string | null };
    try {
      parsed = JSON.parse(stripCodeFences(textBlock.text));
    } catch {
      throw new ProviderError('upstream_error', this.name, `non-JSON response: ${textBlock.text.slice(0, 80)}`);
    }

    const category = ALLOWED_CATEGORIES.includes(parsed.category as TriageCategory)
      ? (parsed.category as TriageCategory)
      : 'unclear';
    const quality = ALLOWED_QUALITY.includes(parsed.quality as TriageQuality)
      ? (parsed.quality as TriageQuality)
      : 'acceptable';

    return {
      category,
      quality,
      reason: parsed.reason ?? undefined,
    };
  }
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  return match ? match[1].trim() : trimmed;
}
