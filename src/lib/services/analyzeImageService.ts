import { ProviderError } from '@/lib/providers/errors';
import type { IdentificationProvider } from '@/lib/providers/identification/types';
import type { TriageProvider } from '@/lib/providers/triage/types';
import type { ScanOutcome } from '@/domain/scan/ScanOutcome';

const AUTO_OK_CONFIDENCE = 0.25;
const UNCERTAIN_MIN_CONFIDENCE = 0.10;

export interface AnalyzeImageInput {
  imageUrl: string;
  triage: TriageProvider;
  identification: IdentificationProvider;
  locale?: 'de' | 'en';
  maxCandidates?: number;
}

export async function analyzeImage(input: AnalyzeImageInput): Promise<ScanOutcome> {
  const locale = input.locale ?? 'de';
  const maxCandidates = input.maxCandidates ?? 3;

  // Phase 1: Triage
  let triage;
  try {
    triage = await input.triage.classify({ imageUrl: input.imageUrl, locale });
  } catch (err) {
    return providerErrorOutcome(err, input.triage.name);
  }

  if (triage.quality !== 'acceptable') {
    return {
      status: 'low_quality',
      triage,
      candidates: [],
      reason: triage.reason,
    };
  }

  if (triage.category !== 'plant') {
    return {
      status: 'category_unsupported',
      triage,
      candidates: [],
      reason: triage.reason,
    };
  }

  // Phase 2: Identification
  let ident;
  try {
    ident = await input.identification.identify({
      imageUrl: input.imageUrl,
      locale,
      maxCandidates,
    });
  } catch (err) {
    return providerErrorOutcome(err, input.identification.name, triage);
  }

  const sorted = [...ident.candidates].sort((a, b) => b.confidence - a.confidence);
  const top = sorted[0];

  if (top && top.confidence >= AUTO_OK_CONFIDENCE) {
    return {
      status: 'ok',
      triage,
      candidates: sorted.filter((c) => c.confidence >= AUTO_OK_CONFIDENCE).slice(0, 3),
      provider: input.identification.name,
    };
  }

  if (top && top.confidence >= UNCERTAIN_MIN_CONFIDENCE) {
    return {
      status: 'uncertain_match',
      triage,
      candidates: [top],
      provider: input.identification.name,
    };
  }

  return {
    status: 'no_match',
    triage,
    candidates: [],
    provider: input.identification.name,
  };
}

function providerErrorOutcome(
  err: unknown,
  provider: string,
  triage?: ScanOutcome['triage']
): ScanOutcome {
  const kind = err instanceof ProviderError ? err.kind : 'upstream_error';
  const message = err instanceof Error ? err.message : String(err);
  return {
    status: 'provider_error',
    triage,
    candidates: [],
    provider,
    reason: `${kind}: ${message}`,
  };
}
