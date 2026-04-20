/**
 * Thin "scan history" mock that wraps the real content registry.
 * In production this is replaced by ScanRepository backed by the DB.
 *
 * Every entry here represents "a scan the demo user made X days ago" —
 * the subject data itself comes from real, curated content (src/content/).
 */
import type { ContentEntry, Urgency } from "@/domain/types";
import { CONTENT_REGISTRY, getContentById } from "@/content";

export interface ScanHistoryItem {
  id: string;
  contentEntry: ContentEntry;
  capturedAt: Date;
  confidence: number;
  urgency: Urgency;
  isExample?: boolean;
}

const daysAgo = (d: number) => {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date;
};

/** Demo history: each item references a real ContentEntry by id. */
const HISTORY: { entryId: string; daysAgo: number; confidence: number; urgency?: Urgency }[] = [
  { entryId: "disease_echter_mehltau", daysAgo: 0, confidence: 0.92 },
  { entryId: "pest_blattlaeuse", daysAgo: 1, confidence: 0.96, urgency: "IMMEDIATE" },
  { entryId: "weed_loewenzahn", daysAgo: 3, confidence: 0.99 },
  { entryId: "plant_tomate", daysAgo: 5, confidence: 0.89 },
  { entryId: "beneficial_marienkaefer", daysAgo: 7, confidence: 0.98 },
  { entryId: "disease_kraut_braunfaeule", daysAgo: 12, confidence: 0.87 },
  { entryId: "pest_schnecken", daysAgo: 18, confidence: 0.94 },
  { entryId: "weed_giersch", daysAgo: 24, confidence: 0.91 },
  { entryId: "disease_rosenrost", daysAgo: 35, confidence: 0.93 },
];

export const MOCK_SCANS: ScanHistoryItem[] = HISTORY.map((h, i) => {
  const entry = getContentById(h.entryId);
  if (!entry)
    throw new Error(`Seed history references unknown entry: ${h.entryId}`);
  return {
    id: `scan_${i}_${entry.id}`,
    contentEntry: entry,
    capturedAt: daysAgo(h.daysAgo),
    confidence: h.confidence,
    urgency: h.urgency ?? entry.defaultUrgency,
  };
});

export function getScanHistoryById(id: string): ScanHistoryItem | undefined {
  return MOCK_SCANS.find((s) => s.id === id);
}

/** Expose all real content entries as potential "scan targets". */
export const ALL_CONTENT = CONTENT_REGISTRY;
