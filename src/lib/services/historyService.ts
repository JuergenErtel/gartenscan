import 'server-only';
import { getContentById } from '@/content';
import { listFollowUpsByScanIds } from './followUpService';
import { listScansForUser, getScanById } from './scanRepository';
import type { ContentEntry } from '@/domain/types';
import type { ScanFollowUp, StoredScan } from '@/domain/scan/ScanOutcome';

export interface HistoryScanView {
  scan: StoredScan;
  matchedEntry?: ContentEntry;
  followUp?: ScanFollowUp;
}

export async function listHistory(userId: string, limit = 50): Promise<HistoryScanView[]> {
  const scans = await listScansForUser(userId, limit);
  const followUps = await listFollowUpsByScanIds(userId, scans.map((s) => s.id));
  return scans.map((s) => ({
    scan: s,
    matchedEntry: s.matchedContentId ? getContentById(s.matchedContentId) ?? undefined : undefined,
    followUp: followUps.get(s.id),
  }));
}

export async function getHistoryItem(userId: string, scanId: string): Promise<HistoryScanView | null> {
  const scan = await getScanById(scanId, userId);
  if (!scan) return null;
  const followUps = await listFollowUpsByScanIds(userId, [scanId]);
  return {
    scan,
    matchedEntry: scan.matchedContentId ? getContentById(scan.matchedContentId) ?? undefined : undefined,
    followUp: followUps.get(scanId),
  };
}
