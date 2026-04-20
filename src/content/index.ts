import type { Category, ContentEntry } from "@/domain/types";

// Weeds
import { loewenzahn } from "./weeds/loewenzahn";
import { giersch } from "./weeds/giersch";
import { brennnessel } from "./weeds/brennnessel";

// Pests
import { blattlaeuse } from "./pests/blattlaeuse";
import { schnecken } from "./pests/schnecken";

// Beneficials
import { marienkaefer } from "./beneficials/marienkaefer";

// Diseases
import { echterMehltau } from "./diseases/echter_mehltau";
import { krautBraunfaeule } from "./diseases/kraut_braunfaeule";
import { rosenrost } from "./diseases/rosenrost";

// Plants
import { hortensie } from "./plants/hortensie";
import { rose } from "./plants/rose";
import { tomate } from "./plants/tomate";

/**
 * Central content registry. In production this would be replaced by a CMS
 * or database-backed content layer.
 */
export const CONTENT_REGISTRY: ContentEntry[] = [
  // Weeds
  loewenzahn,
  giersch,
  brennnessel,
  // Pests
  blattlaeuse,
  schnecken,
  // Beneficials
  marienkaefer,
  // Diseases
  echterMehltau,
  krautBraunfaeule,
  rosenrost,
  // Plants
  hortensie,
  rose,
  tomate,
];

const CONTENT_BY_ID = new Map(CONTENT_REGISTRY.map((c) => [c.id, c]));

export function getContentById(id: string): ContentEntry | undefined {
  return CONTENT_BY_ID.get(id);
}

export function getContentByCategory(category: Category): ContentEntry[] {
  return CONTENT_REGISTRY.filter((c) => c.category === category);
}

export function searchContent(query: string): ContentEntry[] {
  if (!query.trim()) return CONTENT_REGISTRY;
  const q = query.toLowerCase().trim();
  return CONTENT_REGISTRY.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.scientificName.toLowerCase().includes(q) ||
      c.aliases.some((a) => a.toLowerCase().includes(q))
  );
}

export const CONTENT_STATS = {
  total: CONTENT_REGISTRY.length,
  byCategory: CONTENT_REGISTRY.reduce(
    (acc, c) => {
      acc[c.category] = (acc[c.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<Category, number>
  ),
};
