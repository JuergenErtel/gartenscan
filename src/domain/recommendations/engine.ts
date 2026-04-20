import type {
  ContentEntry,
  FilteredRecommendation,
  GardenProfile,
  PetType,
  RecommendationPlan,
  TreatmentMethod,
  Urgency,
} from "@/domain/types";

/**
 * Generates a personalized recommendation plan from a content entry and
 * garden profile. Pure function – easy to test, no I/O.
 */
export function generateRecommendationPlan(
  entry: ContentEntry,
  profile: Pick<
    GardenProfile,
    "hasChildren" | "pets" | "solutionStyle" | "experience"
  >,
  overrideUrgency?: Urgency
): RecommendationPlan {
  const urgency = overrideUrgency ?? entry.defaultUrgency;
  const warnings: string[] = [];

  // Build safety warnings upfront for this user
  if (
    entry.safety.toxicToChildren &&
    profile.hasChildren
  ) {
    warnings.push(
      `Diese Pflanze ist leicht giftig – achte darauf, dass Kinder keine Pflanzenteile in den Mund nehmen.`
    );
  }
  const riskyPets = profile.pets.filter((pet) =>
    entry.safety.toxicToPets.includes(pet)
  );
  if (riskyPets.length > 0) {
    warnings.push(
      `Giftig für ${riskyPets
        .map(petLabel)
        .join(" und ")} – Bereich unzugänglich halten.`
    );
  }

  const filtered = entry.methods.map((method) =>
    scoreMethod(method, profile)
  );

  // Sort: recommended first, then by timeframe, then by priority
  const now = filtered.filter(
    (r) => r.method.timeframe === "NOW" && r.recommended
  );
  const thisWeek = filtered.filter(
    (r) => r.method.timeframe === "THIS_WEEK" && r.recommended
  );
  const longTerm = filtered.filter(
    (r) =>
      (r.method.timeframe === "LONG_TERM" ||
        r.method.timeframe === "SEASONAL") &&
      r.recommended
  );
  const blocked = filtered.filter((r) => !r.recommended);

  return {
    entryId: entry.id,
    urgency,
    summary: buildSummary(entry, profile, warnings),
    nowActions: sortByPriority(now),
    thisWeekActions: sortByPriority(thisWeek),
    longTermActions: sortByPriority(longTerm),
    blockedActions: sortByPriority(blocked),
    warnings,
  };
}

function scoreMethod(
  method: TreatmentMethod,
  profile: Pick<
    GardenProfile,
    "hasChildren" | "pets" | "solutionStyle" | "experience"
  >
): FilteredRecommendation {
  let priority = 10;
  let recommended = true;
  let blockedBy: FilteredRecommendation["blockedBy"];

  // Style filter
  if (!method.style.includes(profile.solutionStyle)) {
    priority -= 5;
    recommended = false;
    blockedBy = {
      reason: "STYLE",
      message: `Passt nicht zu deinem bevorzugten Stil (${styleLabel(
        profile.solutionStyle
      )})`,
    };
  }

  // Child safety
  if (profile.hasChildren && !method.safeForChildren) {
    priority -= 3;
    if (recommended) {
      recommended = false;
      blockedBy = {
        reason: "CHILD_SAFETY",
        message: "Für Haushalte mit Kindern nicht empfohlen",
      };
    }
  }

  // Pet safety
  if (profile.pets.length > 0 && !method.safeForPets) {
    priority -= 3;
    if (recommended) {
      recommended = false;
      blockedBy = {
        reason: "PET_SAFETY",
        message: "Für Haushalte mit Haustieren nicht empfohlen",
      };
    }
  }

  // Experience
  if (
    profile.experience === "BEGINNER" &&
    method.minExperience !== "BEGINNER"
  ) {
    priority -= 2;
  }

  // Eco score bonus
  priority += method.ecoScore;

  // Success rate bonus
  if (method.successRate === "HIGH") priority += 3;
  else if (method.successRate === "MEDIUM") priority += 1;

  return { method, priority, recommended, blockedBy };
}

function sortByPriority(
  recs: FilteredRecommendation[]
): FilteredRecommendation[] {
  return [...recs].sort((a, b) => b.priority - a.priority);
}

function buildSummary(
  entry: ContentEntry,
  profile: Pick<GardenProfile, "solutionStyle">,
  warnings: string[]
): string {
  if (entry.significance === "DANGEROUS") {
    return `Dringendes Handeln erforderlich. ${entry.description.split(".")[0]}.`;
  }
  if (entry.significance === "HARMFUL") {
    return `Solltest du in den nächsten Tagen angehen. ${entry.description.split(".")[0]}.`;
  }
  if (entry.significance === "BENEFIT") {
    return `Gute Nachricht: ${entry.description.split(".")[0]}.`;
  }
  if (entry.significance === "NUISANCE") {
    const style = profile.solutionStyle === "ORGANIC" ? "natürlich" : "gezielt";
    return `Nicht kritisch. Du kannst ${style} gegensteuern, wenn es dich stört.`;
  }
  if (warnings.length > 0) {
    return warnings[0];
  }
  return entry.description.split(".")[0] + ".";
}

function styleLabel(
  style: GardenProfile["solutionStyle"]
): string {
  switch (style) {
    case "ORGANIC":
      return "Bio & natürlich";
    case "BALANCED":
      return "Ausgewogen";
    case "EFFECTIVE":
      return "Effektiv";
  }
}

function petLabel(pet: PetType): string {
  switch (pet) {
    case "DOG":
      return "Hunde";
    case "CAT":
      return "Katzen";
    case "OTHER":
      return "Kleintiere";
  }
}
