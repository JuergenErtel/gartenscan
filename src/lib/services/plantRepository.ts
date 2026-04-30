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

// DB-bound functions are added in Task 5.
