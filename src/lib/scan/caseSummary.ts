import type { ScanFollowUp, StoredScan } from "@/domain/scan/ScanOutcome";
import type { ContentEntry, Urgency } from "@/domain/types";

export interface ScanCaseSummary {
  title: string;
  subtitle: string;
  nextStep: string;
  urgency: Urgency;
  actionable: boolean;
}

export function getScanCaseSummary(
  scan: StoredScan,
  matchedEntry?: ContentEntry,
  followUp?: ScanFollowUp
): ScanCaseSummary {
  if (followUp?.status === "DONE") {
    return {
      title: matchedEntry?.name ?? scan.outcome.candidates[0]?.commonNames[0] ?? "Fall abgeschlossen",
      subtitle: "Als erledigt markiert",
      nextStep: "Nur erneut pruefen, falls das Problem wieder auftaucht",
      urgency: "GONE",
      actionable: false,
    };
  }

  if (followUp?.status === "ESCALATED") {
    return {
      title: matchedEntry?.name ?? scan.outcome.candidates[0]?.commonNames[0] ?? "Fall eskaliert",
      subtitle: "Braucht jetzt genauere Pruefung",
      nextStep: "Akut erneut bewerten und gezielt nachlegen",
      urgency: "IMMEDIATE",
      actionable: true,
    };
  }

  const top = scan.outcome.candidates[0];

  if (matchedEntry) {
    return {
      title: matchedEntry.name,
      subtitle:
        scan.outcome.status === "ok" && top
          ? `${Math.round(top.confidence * 100)} % sicher`
          : "Redaktionell eingeordnet",
      nextStep:
        monitoringStep(followUp) ??
        matchedEntry.methods[0]?.title ??
        "Ergebnis pruefen und naechste Massnahme waehlen",
      urgency: followUp?.status === "MONITORING" ? "MONITOR" : matchedEntry.defaultUrgency,
      actionable: matchedEntry.defaultUrgency !== "GONE",
    };
  }

  switch (scan.outcome.status) {
    case "category_unsupported":
      return unsupportedSummary(scan);
    case "low_quality":
      return {
        title: "Foto zu unklar",
        subtitle: "Kein belastbares Ergebnis",
        nextStep:
          "Naehere Teilansicht von Blatt, Schadstelle oder Tier machen",
        urgency: "MONITOR",
        actionable: true,
      };
    case "no_match":
      return {
        title:
          top?.commonNames[0] ?? top?.scientificName ?? "Nicht sauber erkannt",
        subtitle: "Zu unsicher fuer eine klare Zuordnung",
        nextStep:
          "Markante Stelle neu fotografieren oder Coach zur Einordnung nutzen",
        urgency: "MONITOR",
        actionable: true,
      };
    case "provider_error":
      return {
        title: "Scan pausiert",
        subtitle: "Erkennung gerade nicht verfuegbar",
        nextStep: "Spaeter erneut versuchen, statt blind zu handeln",
        urgency: "MONITOR",
        actionable: true,
      };
    case "ok":
      return {
        title:
          top?.commonNames[0] ?? top?.scientificName ?? "Erkannt",
        subtitle: top ? `${Math.round(top.confidence * 100)} % sicher` : "Erkannt",
        nextStep: "Ergebnis pruefen und passend handeln",
        urgency: "MONITOR",
        actionable: true,
      };
  }
}

function monitoringStep(followUp?: ScanFollowUp): string | undefined {
  if (followUp?.status !== "MONITORING") return undefined;
  if (!followUp.nextCheckAt) return "Weiter beobachten und veraenderte Stellen erneut pruefen";

  const label = followUp.nextCheckAt.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
  });
  return `Bis ${label} beobachten und dann erneut kontrollieren`;
}

function unsupportedSummary(scan: StoredScan): ScanCaseSummary {
  const category = scan.outcome.triage?.category;

  if (category === "disease") {
    return {
      title: "Schadbild erkannt",
      subtitle: "Noch keine exakte Live-Diagnose",
      nextStep:
        "Befall lokal begrenzen, zweite Nahaufnahme machen und Ursache eingrenzen",
      urgency: "THIS_WEEK",
      actionable: true,
    };
  }

  if (category === "insect") {
    return {
      title: "Tier oder Schaedling erkannt",
      subtitle: "Noch keine sichere Live-Einordnung",
      nextStep:
        "Pflanzenschaden mitpruefen und bis zur Klaerung keine pauschalen Mittel einsetzen",
      urgency: "MONITOR",
      actionable: true,
    };
  }

  return {
    title: "Problemfall unklar",
    subtitle: "Noch nicht sauber klassifizierbar",
    nextStep:
      "Konkreteres Foto machen und den Fall ueber den Coach weiter eingrenzen",
    urgency: "MONITOR",
    actionable: true,
  };
}
