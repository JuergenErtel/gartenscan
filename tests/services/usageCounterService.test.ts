import { describe, it, expect, vi, beforeEach } from 'vitest';
import { currentYearMonth, incrementScanUsage } from '@/lib/services/usageCounterService';

// vi.mock is hoisted — use vi.hoisted() so the mock factory can reference the spy.
const { rpcMock } = vi.hoisted(() => ({ rpcMock: vi.fn() }));

vi.mock('@/lib/supabase/service-role', () => ({
  createServiceRoleClient: () => ({
    rpc: rpcMock,
  }),
}));

describe('usageCounterService', () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it('currentYearMonth returns YYYY-MM', () => {
    expect(currentYearMonth(new Date('2026-04-21T10:00:00Z'))).toBe('2026-04');
    expect(currentYearMonth(new Date('2026-12-31T23:59:00Z'))).toBe('2026-12');
    expect(currentYearMonth(new Date('2027-01-01T00:00:00Z'))).toBe('2027-01');
  });

  it('incrementScanUsage calls rpc with user + month', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: null });
    await incrementScanUsage('user-1', new Date('2026-04-21T10:00:00Z'));
    expect(rpcMock).toHaveBeenCalledWith('increment_scan_usage', {
      p_user_id: 'user-1',
      p_year_month: '2026-04',
    });
  });
});
