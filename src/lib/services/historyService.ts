import 'server-only';
import { getContentById } from '@/content';
import { listScansForUser, getScanById } from './scanRepository';
import type { ContentEntry } from '@/domain/types';
import type { StoredScan } from '@/domain/scan/ScanOutcome';

export interface HistoryScanView {
  scan: StoredScan;
  matchedEntry?: ContentEntry;
}

export async function listHistory(userId: string, limit = 50): Promise<HistoryScanView[]> {
  const scans = await listScansForUser(userId, limit);
  return scans.map((s) => ({
    scan: s,
    matchedEntry: s.matchedContentId ? getContentById(s.matchedContentId) ?? undefined : undefined,
  }));
}

export async function getHistoryItem(userId: string, scanId: string): Promise<HistoryScanView | null> {
  const scan = await getScanById(scanId, userId);
  if (!scan) return null;
  return {
    scan,
    matchedEntry: scan.matchedContentId ? getContentById(scan.matchedContentId) ?? undefined : undefined,
  };
}
