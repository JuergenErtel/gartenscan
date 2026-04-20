import type { Category, DetectionResult } from "@/domain/types";

export interface VisionInput {
  imageUrl?: string;
  imageBase64?: string;
  hintCategory?: Category;
  locale?: string;
}

export interface VisionProvider {
  readonly name: string;
  readonly version: string;
  readonly isProduction: boolean;

  analyze(input: VisionInput): Promise<DetectionResult>;
  healthCheck(): Promise<boolean>;
}
