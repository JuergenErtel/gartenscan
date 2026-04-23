import { describe, expect, it } from 'vitest';
import { getStoredOutcomeReason } from '@/lib/services/scanRepository';
import type { ScanOutcome } from '@/domain/scan/ScanOutcome';

describe('scanRepository', () => {
  it('stores provider_error reason when no triage reason exists', () => {
    const outcome: ScanOutcome = {
      status: 'provider_error',
      provider: 'claude-vision',
      candidates: [],
      reason: 'upstream_error: Claude API returned 500',
    };

    expect(getStoredOutcomeReason(outcome)).toBe(
      'upstream_error: Claude API returned 500'
    );
  });

  it('prefers top-level reason when both outcome and triage reasons exist', () => {
    const outcome: ScanOutcome = {
      status: 'provider_error',
      provider: 'plantnet',
      candidates: [],
      reason: 'timeout: upstream took too long',
      triage: {
        category: 'plant',
        quality: 'acceptable',
        reason: 'triage fallback',
      },
    };

    expect(getStoredOutcomeReason(outcome)).toBe(
      'timeout: upstream took too long'
    );
  });

  it('falls back to triage reason for non-provider outcomes', () => {
    const outcome: ScanOutcome = {
      status: 'low_quality',
      candidates: [],
      triage: {
        category: 'plant',
        quality: 'blurry',
        reason: 'zu unscharf',
      },
      reason: 'zu unscharf',
    };

    expect(getStoredOutcomeReason(outcome)).toBe('zu unscharf');
  });
});
