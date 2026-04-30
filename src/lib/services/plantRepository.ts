import 'server-only';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

export interface Plant {
  id: string;
  userId: string;
  createdAt: Date;
  nickname: string;
  species: string;
  latinName: string | null;
  matchedContentId: string | null;
  coverImagePath: string;
  zoneLabel: string | null;
  originScanId: string | null;
}

export interface PlantWithStats extends Plant {
  scanCount: number;
  lastScanAt: Date | null;
}

export interface CreatePlantInput {
  userId: string;
  scanId: string;
  nickname: string;
  zoneLabel?: string;
}

export interface PlantScanAggregate {
  count: number;
  lastScanAt: Date;
}

export function mergePlantsWithStats(
  plants: Plant[],
  aggregates: Map<string, PlantScanAggregate>
): PlantWithStats[] {
  return plants.map((p) => {
    const agg = aggregates.get(p.id);
    return {
      ...p,
      scanCount: agg?.count ?? 0,
      lastScanAt: agg?.lastScanAt ?? null,
    };
  });
}

interface PlantRow {
  id: string;
  user_id: string;
  created_at: string;
  nickname: string;
  species: string;
  latin_name: string | null;
  matched_content_id: string | null;
  cover_image_path: string;
  zone_label: string | null;
  origin_scan_id: string | null;
}

function rowToPlant(row: PlantRow): Plant {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: new Date(row.created_at),
    nickname: row.nickname,
    species: row.species,
    latinName: row.latin_name,
    matchedContentId: row.matched_content_id,
    coverImagePath: row.cover_image_path,
    zoneLabel: row.zone_label,
    originScanId: row.origin_scan_id,
  };
}

export async function createPlantFromScan(input: CreatePlantInput): Promise<Plant> {
  const supabase = createServiceRoleClient();

  const { data: scanRow, error: scanErr } = await supabase
    .from('scans')
    .select('id, user_id, status, plant_id, image_path, matched_content_id')
    .eq('id', input.scanId)
    .eq('user_id', input.userId)
    .maybeSingle();

  if (scanErr) throw new Error(`createPlantFromScan scan-fetch: ${scanErr.message}`);
  if (!scanRow) throw new Error('createPlantFromScan: scan not found');
  if (scanRow.status !== 'ok') throw new Error('createPlantFromScan: scan status is not ok');
  if (scanRow.plant_id) throw new Error('createPlantFromScan: scan already has a plant');

  let species = 'Unbekannte Art';
  let latinName: string | null = null;
  const { data: cand } = await supabase
    .from('scan_candidates')
    .select('scientific_name, common_names')
    .eq('scan_id', scanRow.id)
    .eq('rank', 1)
    .maybeSingle();
  if (cand) {
    species = cand.common_names?.[0] ?? cand.scientific_name;
    latinName = cand.scientific_name;
  }

  const { data: insertedRow, error: insErr } = await supabase
    .from('plants')
    .insert({
      user_id: input.userId,
      nickname: input.nickname,
      species,
      latin_name: latinName,
      matched_content_id: scanRow.matched_content_id ?? null,
      cover_image_path: scanRow.image_path,
      zone_label: input.zoneLabel ?? null,
      origin_scan_id: scanRow.id,
    })
    .select('*')
    .single();

  if (insErr || !insertedRow) {
    throw new Error(`createPlantFromScan insert: ${insErr?.message ?? 'unknown'}`);
  }

  const plant = rowToPlant(insertedRow as PlantRow);

  const { error: updErr } = await supabase
    .from('scans')
    .update({ plant_id: plant.id })
    .eq('id', scanRow.id)
    .eq('user_id', input.userId);

  if (updErr) {
    await supabase.from('plants').delete().eq('id', plant.id);
    throw new Error(`createPlantFromScan link-scan: ${updErr.message}`);
  }

  return plant;
}

export async function attachScanToPlant(
  scanId: string,
  plantId: string,
  userId: string
): Promise<void> {
  const supabase = createServiceRoleClient();

  const { data: plant, error: plantErr } = await supabase
    .from('plants')
    .select('id')
    .eq('id', plantId)
    .eq('user_id', userId)
    .maybeSingle();

  if (plantErr) throw new Error(`attachScanToPlant plant-fetch: ${plantErr.message}`);
  if (!plant) throw new Error('attachScanToPlant: plant not found');

  const { data: updated, error: updErr } = await supabase
    .from('scans')
    .update({ plant_id: plantId })
    .eq('id', scanId)
    .eq('user_id', userId)
    .is('plant_id', null)
    .eq('status', 'ok')
    .select('id')
    .maybeSingle();

  if (updErr) throw new Error(`attachScanToPlant update: ${updErr.message}`);
  if (!updated) throw new Error('attachScanToPlant: scan not eligible');
}

export async function listPlantsForUser(userId: string): Promise<PlantWithStats[]> {
  const supabase = createServiceRoleClient();

  const { data: plantRows, error: plantErr } = await supabase
    .from('plants')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (plantErr) throw new Error(`listPlantsForUser plants: ${plantErr.message}`);
  if (!plantRows || plantRows.length === 0) return [];

  const plants = (plantRows as PlantRow[]).map(rowToPlant);

  const { data: scanRows, error: scanErr } = await supabase
    .from('scans')
    .select('plant_id, created_at')
    .eq('user_id', userId)
    .not('plant_id', 'is', null);

  if (scanErr) throw new Error(`listPlantsForUser scans: ${scanErr.message}`);

  const aggregates = new Map<string, PlantScanAggregate>();
  for (const row of scanRows ?? []) {
    if (!row.plant_id) continue;
    const existing = aggregates.get(row.plant_id);
    const ts = new Date(row.created_at);
    if (existing) {
      existing.count += 1;
      if (ts > existing.lastScanAt) existing.lastScanAt = ts;
    } else {
      aggregates.set(row.plant_id, { count: 1, lastScanAt: ts });
    }
  }

  return mergePlantsWithStats(plants, aggregates);
}

export async function getPlantById(
  plantId: string,
  userId: string
): Promise<Plant | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .eq('id', plantId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(`getPlantById: ${error.message}`);
  if (!data) return null;
  return rowToPlant(data as PlantRow);
}

export interface AssignablePlant {
  id: string;
  nickname: string;
  species: string;
  coverImagePath: string;
  sameSpecies: boolean;
}

export async function listPlantsForAssignment(
  userId: string,
  matchedContentId: string | null
): Promise<AssignablePlant[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('plants')
    .select('id, nickname, species, cover_image_path, matched_content_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`listPlantsForAssignment: ${error.message}`);
  if (!data) return [];

  const items = data.map((r) => ({
    id: r.id,
    nickname: r.nickname,
    species: r.species,
    coverImagePath: r.cover_image_path,
    sameSpecies: matchedContentId !== null && r.matched_content_id === matchedContentId,
  }));

  return items.sort((a, b) => {
    if (a.sameSpecies !== b.sameSpecies) return a.sameSpecies ? -1 : 1;
    return 0;
  });
}
