import type { Category, ContentEntry } from "@/domain/types";

// Weeds
import { loewenzahn } from "./weeds/loewenzahn";
import { giersch } from "./weeds/giersch";
import { brennnessel } from "./weeds/brennnessel";
import { kraehenfuss } from "./weeds/kraehenfuss";

// Pests
import { blattlaeuse } from "./pests/blattlaeuse";
import { schnecken } from "./pests/schnecken";
import { spinnmilben } from "./pests/spinnmilben";
import { buchsbaumzuensler } from "./pests/buchsbaumzuensler";
import { trauermuecken } from "./pests/trauermuecken";
import { wolllaeuse } from "./pests/wolllaeuse";
import { dickmaulruessler } from "./pests/dickmaulruessler";

// Beneficials
import { marienkaefer } from "./beneficials/marienkaefer";
import { florfliege } from "./beneficials/florfliege";
import { schwebfliege } from "./beneficials/schwebfliege";

// Diseases
import { echterMehltau } from "./diseases/echter_mehltau";
import { krautBraunfaeule } from "./diseases/kraut_braunfaeule";
import { rosenrost } from "./diseases/rosenrost";
import { sternrusstau } from "./diseases/sternrusstau";
import { kraeuselkrankheit } from "./diseases/kraeuselkrankheit";
import { grauschimmel } from "./diseases/grauschimmel";

// Plants
import { hortensie } from "./plants/hortensie";
import { rose } from "./plants/rose";
import { tomate } from "./plants/tomate";
import { efeu } from "./plants/efeu";
import { ahorn } from "./plants/ahorn";
import { hasenglocken } from "./plants/hasenglocken";
import { lavendel } from "./plants/lavendel";
import { buchsbaum } from "./plants/buchsbaum";
import { kirschlorbeer } from "./plants/kirschlorbeer";
import { thuja } from "./plants/thuja";
import { erdbeere } from "./plants/erdbeere";
import { apfel } from "./plants/apfel";
import { zucchini } from "./plants/zucchini";
import { basilikum } from "./plants/basilikum";
import { geranie } from "./plants/geranie";
import { sonnenblume } from "./plants/sonnenblume";
import { tulpe } from "./plants/tulpe";
import { funkie } from "./plants/funkie";

/**
 * Central content registry. In production this would be replaced by a CMS
 * or database-backed content layer.
 */
export const CONTENT_REGISTRY: ContentEntry[] = [
  // Weeds
  loewenzahn,
  giersch,
  brennnessel,
  kraehenfuss,
  // Pests
  blattlaeuse,
  schnecken,
  spinnmilben,
  buchsbaumzuensler,
  trauermuecken,
  wolllaeuse,
  dickmaulruessler,
  // Beneficials
  marienkaefer,
  florfliege,
  schwebfliege,
  // Diseases
  echterMehltau,
  krautBraunfaeule,
  rosenrost,
  sternrusstau,
  kraeuselkrankheit,
  grauschimmel,
  // Plants
  hortensie,
  rose,
  tomate,
  efeu,
  ahorn,
  hasenglocken,
  lavendel,
  buchsbaum,
  kirschlorbeer,
  thuja,
  erdbeere,
  apfel,
  zucchini,
  basilikum,
  geranie,
  sonnenblume,
  tulpe,
  funkie,
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
