import 'server-only';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import type { ScanOutcome, StoredScan } from '@/domain/scan/ScanOutcome';

export interface SaveScanInput {
  userId: string;
  scanId: string;
  imagePath: string;
  imageMeta: { width?: number; height?: number; bytes?: number; mime?: string };
  outcome: ScanOutcome;
}

export async function saveScan(input: SaveScanInput): Promise<void> {
  const supabase = createServiceRoleClient();

  const { error: scanErr } = await supabase.from('scans').insert({
    id: input.scanId,
    user_id: input.userId,
    image_path: input.imagePath,
    image_meta: input.imageMeta,
    triage_category: input.outcome.triage?.category,
    triage_quality: input.outcome.triage?.quality,
    triage_reason: input.outcome.triage?.reason ?? null,
    provider: input.outcome.provider ?? null,
    provider_raw:
      input.outcome.candidates.length > 0
        ? { candidates: input.outcome.candidates }
        : null,
    status: input.outcome.status,
    matched_content_id: input.outcome.candidates[0]?.matchedContentId ?? null,
  });
  if (scanErr) throw new Error(`saveScan: ${scanErr.message}`);

  if (input.outcome.candidates.length > 0) {
    const rows = input.outcome.candidates.map((c) => ({
      scan_id: input.scanId,
      rank: c.rank,
      scientific_name: c.scientificName,
      common_names: c.commonNames,
      taxonomy: c.taxonomy ?? null,
      confidence: c.confidence,
      content_id: c.matchedContentId ?? null,
    }));
    const { error: candErr } = await supabase.from('scan_candidates').insert(rows);
    if (candErr) throw new Error(`saveScan candidates: ${candErr.message}`);
  }
}

export async function getScanById(scanId: string, userId: string): Promise<StoredScan | null> {
  const supabase = createServiceRoleClient();

  const { data: scan, error: scanErr } = await supabase
    .from('scans')
    .select('*')
    .eq('id', scanId)
    .eq('user_id', userId)
    .maybeSingle();

  if (scanErr) throw new Error(`getScanById: ${scanErr.message}`);
  if (!scan) return null;

  const { data: cands, error: candErr } = await supabase
    .from('scan_candidates')
    .select('*')
    .eq('scan_id', scanId)
    .order('rank', { ascending: true });
  if (candErr) throw new Error(`getScanById candidates: ${candErr.message}`);

  return {
    id: scan.id,
    userId: scan.user_id,
    createdAt: new Date(scan.created_at),
    imagePath: scan.image_path,
    imageMeta: (scan.image_meta ?? undefined) as StoredScan['imageMeta'],
    matchedContentId: scan.matched_content_id ?? undefined,
    outcome: {
      status: scan.status as ScanOutcome['status'],
      provider: scan.provider ?? undefined,
      triage: scan.triage_category
        ? {
            category: scan.triage_category as NonNullable<ScanOutcome['triage']>['category'],
            quality: (scan.triage_quality ?? 'acceptable') as NonNullable<ScanOutcome['triage']>['quality'],
            reason: scan.triage_reason ?? undefined,
          }
        : undefined,
      reason: scan.triage_reason ?? undefined,
      candidates: (cands ?? []).map((c) => ({
        rank: c.rank,
        scientificName: c.scientific_name,
        commonNames: c.common_names,
        taxonomy: (c.taxonomy ?? undefined) as { family?: string; genus?: string; species?: string } | undefined,
        confidence: Number(c.confidence),
        matchedContentId: c.content_id ?? undefined,
      })),
    },
  };
}

export async function listScansForUser(userId: string, limit = 50): Promise<StoredScan[]> {
  const supabase = createServiceRoleClient();

  const { data: scans, error } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`listScansForUser: ${error.message}`);
  if (!scans || scans.length === 0) return [];

  const scanIds = scans.map((s) => s.id);
  const { data: topCands } = await supabase
    .from('scan_candidates')
    .select('*')
    .in('scan_id', scanIds)
    .eq('rank', 1);

  const topByScan = new Map((topCands ?? []).map((c) => [c.scan_id, c]));

  return scans.map((scan) => {
    const topCand = topByScan.get(scan.id);
    return {
      id: scan.id,
      userId: scan.user_id,
      createdAt: new Date(scan.created_at),
      imagePath: scan.image_path,
      imageMeta: (scan.image_meta ?? undefined) as StoredScan['imageMeta'],
      matchedContentId: scan.matched_content_id ?? undefined,
      outcome: {
        status: scan.status as ScanOutcome['status'],
        provider: scan.provider ?? undefined,
        candidates: topCand
          ? [{
              rank: 1,
              scientificName: topCand.scientific_name,
              commonNames: topCand.common_names,
              taxonomy: (topCand.taxonomy ?? undefined) as { family?: string; genus?: string; species?: string } | undefined,
              confidence: Number(topCand.confidence),
              matchedContentId: topCand.content_id ?? undefined,
            }]
          : [],
      },
    };
  });
}
