import { describe, it, expect } from "vitest";
import { parseCoachResponse } from "@/lib/coach/parse";

const allowed = new Set(["blattlaeuse", "rose"]);

describe("parseCoachResponse", () => {
  it("parst valides JSON und behaelt erlaubte Citations", () => {
    const raw = '{"reply":"Erst abspritzen.","citations":["blattlaeuse"]}';
    expect(parseCoachResponse(raw, allowed)).toEqual({
      reply: "Erst abspritzen.",
      citations: ["blattlaeuse"],
    });
  });
  it("entfernt Code-Fences", () => {
    const raw = '```json\n{"reply":"Ok.","citations":[]}\n```';
    expect(parseCoachResponse(raw, allowed).reply).toBe("Ok.");
  });
  it("verwirft halluzinierte Citation-IDs", () => {
    const raw = '{"reply":"X.","citations":["blattlaeuse","erfunden"]}';
    expect(parseCoachResponse(raw, allowed).citations).toEqual(["blattlaeuse"]);
  });
  it("dedupliziert und begrenzt auf 3 Citations", () => {
    const raw = '{"reply":"X.","citations":["rose","rose","blattlaeuse","rose","blattlaeuse"]}';
    expect(parseCoachResponse(raw, allowed).citations).toEqual(["rose", "blattlaeuse"]);
  });
  it("faellt bei Nicht-JSON auf Rohtext zurueck", () => {
    const raw = "Einfach Text ohne JSON.";
    expect(parseCoachResponse(raw, allowed)).toEqual({
      reply: "Einfach Text ohne JSON.",
      citations: [],
    });
  });
  it("faellt bei leerem reply auf Rohtext zurueck", () => {
    const raw = '{"reply":"","citations":[]}';
    expect(parseCoachResponse(raw, allowed).reply).toBe(raw);
  });
});
