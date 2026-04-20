import type { VisionProvider } from "@/domain/identification/VisionProvider";
import { MockVisionProvider } from "./MockVisionProvider";

/**
 * Vision provider factory.
 * Swap provider by setting env var VISION_PROVIDER.
 *
 * Production integration path:
 *  - "plantnet": Pl@ntNet API (my.plantnet.org) – cheapest, good for plants
 *  - "claude":   Anthropic Vision – best for reasoning/uncertainty handling
 *  - "openai":   OpenAI Vision – fast, general
 *  - "custom":   Own fine-tuned model on Replicate/Modal
 *
 * Current default: "mock" – deterministic, no API key required.
 */
export function getVisionProvider(): VisionProvider {
  const name = process.env.VISION_PROVIDER ?? "mock";
  switch (name) {
    // case "plantnet":
    //   return new PlantNetVisionProvider(process.env.PLANTNET_API_KEY!);
    // case "claude":
    //   return new ClaudeVisionProvider(process.env.ANTHROPIC_API_KEY!);
    // case "openai":
    //   return new OpenAIVisionProvider(process.env.OPENAI_API_KEY!);
    case "mock":
    default:
      return new MockVisionProvider();
  }
}
