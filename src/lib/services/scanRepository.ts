import 'server-only';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { deleteImages } from '@/lib/services/imageStorageService';
import type { AiFallbackContent, ScanOutcome, StoredScan } from '@/domain/scan/ScanOutcome';

export interface SaveScanInput {
  userId: string;
  scanId: string;
  imagePath: string;
  imageMeta: { width?: number; height?: number; bytes?: number; mime?: string };
  outcome: ScanOutcome;
}

export function getStoredOutcomeReason(outcome: ScanOutcome): string | null {
  return outcome.reason ?? outcome.triage?.reason ?? null;
}

export async function saveScan(input: SaveScanInput): Promise<void> {
  const supabase = createServiceRoleClient();

  const { error: scanErr } = await supabase.from('scans').insert({
    id: input.scanId,
    user_id: input.userId,
    image_path: input.imagePath,
    image_meta: input.imageMeta as never,
    triage_category: input.outcome.triage?.category ?? null,
    triage_quality: input.outcome.triage?.quality ?? null,
    triage_reason: getStoredOutcomeReason(input.outcome),
    provider: input.outcome.provider ?? null,
    provider_raw: (input.outcome.candidates.length > 0
      ? { candidates: input.outcome.candidates }
      : null) as never,
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
      taxonomy: (c.taxonomy ?? null) as never,
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
    aiFallback: (scan.ai_fallback ?? undefined) as AiFallbackContent | undefined,
    plantId: scan.plant_id ?? undefined,
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
      plantId: scan.plant_id ?? undefined,
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

export async function listScansForPlant(
  plantId: string,
  userId: string
): Promise<StoredScan[]> {
  const supabase = createServiceRoleClient();

  const { data: scans, error } = await supabase
    .from('scans')
    .select('*')
    .eq('plant_id', plantId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`listScansForPlant: ${error.message}`);
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
      plantId: scan.plant_id ?? undefined,
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

export async function updateScanStatus(
  scanId: string,
  userId: string,
  newStatus: 'ok' | 'no_match',
  selectedRank: number = 1
): Promise<StoredScan | null> {
  const supabase = createServiceRoleClient();

  // Bei confirm mit anderem Kandidaten als rank=1: erst die Kandidaten umsortieren,
  // damit der gewählte rank=1 wird und auch matched_content_id stimmt.
  let chosenContentId: string | null = null;
  if (newStatus === 'ok' && selectedRank !== 1) {
    const { data: cands, error: candErr } = await supabase
      .from('scan_candidates')
      .select('id, rank, content_id')
      .eq('scan_id', scanId)
      .order('rank', { ascending: true });
    if (candErr) throw new Error(`updateScanStatus candidates: ${candErr.message}`);

    const chosen = cands?.find((c) => c.rank === selectedRank);
    if (!chosen) return null;
    chosenContentId = chosen.content_id ?? null;

    const old1 = cands?.find((c) => c.rank === 1);
    if (old1) {
      // 3-stufiges Rerank, damit ein (scan_id, rank)-Unique-Index nicht stört.
      const { error: parkErr } = await supabase
        .from('scan_candidates')
        .update({ rank: 99 })
        .eq('id', old1.id);
      if (parkErr) throw new Error(`updateScanStatus park: ${parkErr.message}`);

      const { error: promoteErr } = await supabase
        .from('scan_candidates')
        .update({ rank: 1 })
        .eq('id', chosen.id);
      if (promoteErr) throw new Error(`updateScanStatus promote: ${promoteErr.message}`);

      const { error: demoteErr } = await supabase
        .from('scan_candidates')
        .update({ rank: selectedRank })
        .eq('id', old1.id);
      if (demoteErr) throw new Error(`updateScanStatus demote: ${demoteErr.message}`);
    }
  } else if (newStatus === 'ok') {
    const { data: top } = await supabase
      .from('scan_candidates')
      .select('content_id')
      .eq('scan_id', scanId)
      .eq('rank', 1)
      .maybeSingle();
    chosenContentId = top?.content_id ?? null;
  }

  const update: { status: string; matched_content_id?: string | null } = {
    status: newStatus,
  };
  if (newStatus === 'ok') update.matched_content_id = chosenContentId;

  const { data, error } = await supabase
    .from('scans')
    .update(update)
    .eq('id', scanId)
    .eq('user_id', userId)
    .eq('status', 'uncertain_match')
    .select('id')
    .maybeSingle();

  if (error) throw new Error(`updateScanStatus: ${error.message}`);
  if (!data) return null;

  return getScanById(scanId, userId);
}

export async function deleteScan(scanId: string, userId: string): Promise<void> {
  const scan = await getScanById(scanId, userId);
  if (!scan) throw new Error('scan not found');

  const supabase = createServiceRoleClient();

  const { data: coverPlants, error: coverErr } = await supabase
    .from('plants')
    .select('nickname')
    .eq('cover_image_path', scan.imagePath)
    .eq('user_id', userId)
    .limit(1);

  if (coverErr) {
    throw new Error(`deleteScan cover-check: ${coverErr.message}`);
  }

  if (coverPlants && coverPlants.length > 0) {
    const nickname = coverPlants[0].nickname;
    throw new Error(`scan is plant cover:${nickname}`);
  }

  const { error: scanDelErr } = await supabase
    .from('scans')
    .delete()
    .eq('id', scanId)
    .eq('user_id', userId);

  if (scanDelErr) {
    throw new Error(`deleteScan scan-delete: ${scanDelErr.message}`);
  }

  if (scan.imagePath) {
    await deleteImages([scan.imagePath]);
  }
}

export async function saveAiFallback(
  scanId: string,
  userId: string,
  content: AiFallbackContent
): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from('scans')
    .update({ ai_fallback: content as never })
    .eq('id', scanId)
    .eq('user_id', userId);
  if (error) throw new Error(`saveAiFallback: ${error.message}`);
}
