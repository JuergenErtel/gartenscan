/**
 * ScanOutcome — neues Domain-Modell für die reale Scan-Pipeline.
 * Ersetzt das legacy DetectionResult (das an ContentEntry.id gekoppelt war).
 */

export type ScanStatus =
  | 'ok'
  | 'low_quality'
  | 'category_unsupported'
  | 'no_match'
  | 'uncertain_match'
  | 'provider_error';

export type TriageCategory =
  | 'beneficial'
  | 'damage'
  | 'disease'
  | 'insect'
  | 'plant'
  | 'unclear';
export type TriageQuality = 'acceptable' | 'blurry' | 'no_subject';

export interface TriageResult {
  category: TriageCategory;
  quality: TriageQuality;
  reason?: string;
}

export interface DetectionTaxonomy {
  family?: string;
  genus?: string;
  species?: string;
}

export interface DetectionCandidate {
  rank: number;                        // 1-based
  scientificName: string;
  commonNames: string[];               // best-effort, kann leer sein
  taxonomy?: DetectionTaxonomy;
  confidence: number;                  // 0..1
  matchedContentId?: string;           // gesetzt wenn scientificName in src/content matcht
}

export interface AiFallbackTip {
  title: string;
  text: string;
}

/**
 * Leichtgewichtiger, KI-generierter Ersatzinhalt für erkannte Arten ohne
 * kuratierten Eintrag in src/content. Klar als nicht-redaktionell markiert.
 */
export interface AiFallbackContent {
  summary: string;          // 1–2 Sätze Einordnung
  tips: AiFallbackTip[];    // 2–4 Maßnahmen
  caution?: string;         // optionaler Vorsichtshinweis
  generatedAt: string;      // ISO-Zeitstempel
  model: string;            // verwendetes Claude-Modell
}

export interface ScanOutcome {
  status: ScanStatus;
  triage?: TriageResult;
  candidates: DetectionCandidate[];
  provider?: string;                   // "plantnet" | "mock" | undefined (bei Fehler)
  reason?: string;                     // nutzerlesbare Begründung für low_quality / category_unsupported / no_match
}

export interface StoredScan {
  id: string;
  userId: string;
  createdAt: Date;
  imagePath: string;
  imageMeta?: { width?: number; height?: number; bytes?: number; mime?: string };
  outcome: ScanOutcome;
  matchedContentId?: string;
  plantId?: string;
  aiFallback?: AiFallbackContent;
}

export type FollowUpStatus =
  | 'OPEN'
  | 'MONITORING'
  | 'DONE'
  | 'ESCALATED';

export interface ScanFollowUp {
  scanId: string;
  userId: string;
  status: FollowUpStatus;
  nextCheckAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
