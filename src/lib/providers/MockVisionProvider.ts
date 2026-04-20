import { CONTENT_REGISTRY } from "@/content";
import type { DetectionResult } from "@/domain/types";
import type {
  VisionInput,
  VisionProvider,
} from "@/domain/identification/VisionProvider";

/**
 * Mock vision provider. Uses hash of image URL to deterministically pick
 * a content entry — NOT real identification, clearly marked as non-production.
 *
 * Swap this for ClaudeVisionProvider / OpenAIVisionProvider / Pl@ntNetProvider
 * via the VisionProvider factory once API keys are configured.
 */
export class MockVisionProvider implements VisionProvider {
  readonly name = "mock";
  readonly version = "1.0.0";
  readonly isProduction = false;

  async analyze(input: VisionInput): Promise<DetectionResult> {
    // Simulate latency for realistic UX
    await new Promise((r) => setTimeout(r, 400));

    const pool =
      input.hintCategory != null
        ? CONTENT_REGISTRY.filter((c) => c.category === input.hintCategory)
        : CONTENT_REGISTRY;

    if (pool.length === 0) {
      return {
        primary: { entryId: CONTENT_REGISTRY[0].id, confidence: 0.2 },
        alternatives: [],
        overallConfidence: 0.2,
        needsBetterPhoto: true,
        followUpQuestions: [
          "Kannst du ein zweites Foto aus anderer Perspektive machen?",
        ],
      };
    }

    // Deterministic pick based on URL hash
    const hash = simpleHash(input.imageUrl ?? input.imageBase64 ?? "");
    const primary = pool[hash % pool.length];
    const confidence = 0.82 + ((hash >> 8) % 17) / 100; // 0.82..0.99

    // Build 2-3 alternatives from remaining pool
    const others = pool.filter((c) => c.id !== primary.id);
    const alternatives = others
      .sort(() => ((hash >> 16) % 2 ? 1 : -1))
      .slice(0, Math.min(2, others.length))
      .map((c, i) => ({
        entryId: c.id,
        confidence: Math.max(0.03, confidence - 0.4 - i * 0.15),
      }));

    const needsBetterPhoto = confidence < 0.7;

    return {
      primary: { entryId: primary.id, confidence },
      alternatives,
      overallConfidence: confidence,
      needsBetterPhoto,
      followUpQuestions: needsBetterPhoto
        ? ["Gibt es Fraßspuren, Beläge oder Verfärbungen? Ein Nahfoto hilft."]
        : undefined,
    };
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
