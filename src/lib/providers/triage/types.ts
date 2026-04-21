import type { TriageResult } from '@/domain/scan/ScanOutcome';

export interface TriageInput {
  imageUrl: string;
  locale: 'de' | 'en';
}

export interface TriageProvider {
  readonly name: string;
  classify(input: TriageInput): Promise<TriageResult>;
}
