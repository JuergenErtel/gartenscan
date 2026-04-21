import type { DetectionCandidate } from '@/domain/scan/ScanOutcome';

export interface IdentificationInput {
  imageUrl: string;
  locale: 'de' | 'en';
  maxCandidates: number;
}

export interface IdentificationResult {
  candidates: DetectionCandidate[];
  providerRaw: unknown;
}

export interface IdentificationProvider {
  readonly name: string;
  identify(input: IdentificationInput): Promise<IdentificationResult>;
}
