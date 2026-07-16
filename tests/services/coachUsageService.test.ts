import { describe, it, expect } from "vitest";
import { currentDay } from "@/lib/services/coachUsageService";

describe("currentDay", () => {
  it("formatiert UTC als YYYY-MM-DD", () => {
    expect(currentDay(new Date("2026-07-16T10:00:00Z"))).toBe("2026-07-16");
  });
  it("padded Monat und Tag", () => {
    expect(currentDay(new Date("2026-01-05T00:00:00Z"))).toBe("2026-01-05");
  });
  it("nutzt UTC, nicht lokale Zeit", () => {
    expect(currentDay(new Date("2026-07-16T23:30:00-02:00"))).toBe("2026-07-17");
  });
});
