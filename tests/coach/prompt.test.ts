import { describe, it, expect } from "vitest";
import { buildContentScope, buildCoachSystemPrompt, type CoachContext } from "@/lib/coach/prompt";

const baseContext: CoachContext = {
  profile: { experience: "beginner", solutionPreference: "organic", hasChildren: false, hasPets: true },
  weather: { tempC: 21, condition: "Bewölkt", location: "Augsburg" },
  plants: [{ nickname: "Balkonrose", species: "Rose" }],
  cases: [{ title: "Blattläuse", subtitle: "87 % sicher", nextStep: "Mit Wasser abspritzen", urgency: "THIS_WEEK" }],
  entries: [],
};

describe("buildContentScope", () => {
  it("nimmt referenzierte IDs auf und dedupliziert", () => {
    const scope = buildContentScope(["pest_blattlaeuse", "pest_blattlaeuse", undefined], "");
    expect(scope.filter((e) => e.id === "pest_blattlaeuse")).toHaveLength(1);
  });
  it("ergaenzt Suchtreffer zur Query", () => {
    // Hinweis: searchContent() matcht nur "alias.includes(query)", nicht umgekehrt
    // (verifiziert gegen src/content/index.ts) - daher hier ein Alias-Substring statt
    // eines vollen Satzes, sonst faende die Suche nichts.
    const scope = buildContentScope([], "Mehltau");
    expect(scope.some((e) => e.id === "disease_echter_mehltau")).toBe(true);
  });
  it("begrenzt den Scope auf 8 Eintraege", () => {
    const allIds = [
      "pest_blattlaeuse",
      "pest_spinnmilben",
      "pest_buchsbaumzuensler",
      "pest_trauermuecken",
      "pest_wolllaeuse",
      "pest_dickmaulruessler",
      "pest_schnecken",
      "disease_rosenrost",
      "disease_sternrusstau",
      "disease_grauschimmel",
    ];
    expect(buildContentScope(allIds, "").length).toBeLessThanOrEqual(8);
  });
});

describe("buildCoachSystemPrompt", () => {
  it("enthaelt Profil-Praeferenzen und Haustier-Hinweis", () => {
    const prompt = buildCoachSystemPrompt(baseContext);
    expect(prompt).toContain("organic");
    expect(prompt).toContain("Haustiere: ja");
  });
  it("listet offene Faelle und Pflanzen", () => {
    const prompt = buildCoachSystemPrompt(baseContext);
    expect(prompt).toContain("Blattläuse");
    expect(prompt).toContain("Balkonrose");
  });
  it("verlangt JSON-Format und nennt erlaubte IDs", () => {
    const scope = buildContentScope(["pest_blattlaeuse"], "");
    const prompt = buildCoachSystemPrompt({ ...baseContext, entries: scope });
    expect(prompt).toContain('"reply"');
    expect(prompt).toContain("[pest_blattlaeuse]");
  });
  it("kommt ohne Wetter/Faelle aus", () => {
    const prompt = buildCoachSystemPrompt({ ...baseContext, weather: null, cases: [], plants: [] });
    expect(prompt).toContain("keine offenen");
  });
});
