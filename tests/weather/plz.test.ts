import { describe, it, expect } from "vitest";
import { isValidPLZ } from "@/lib/weather/plz";

describe("isValidPLZ", () => {
  it("akzeptiert genau 5 Ziffern", () => {
    expect(isValidPLZ("80331")).toBe(true);
  });
  it("akzeptiert fuehrende Nullen", () => {
    expect(isValidPLZ("01067")).toBe(true);
  });
  it("lehnt zu kurze/lange PLZ ab", () => {
    expect(isValidPLZ("8033")).toBe(false);
    expect(isValidPLZ("803312")).toBe(false);
  });
  it("lehnt nicht-numerische Eingaben ab", () => {
    expect(isValidPLZ("8033a")).toBe(false);
    expect(isValidPLZ("")).toBe(false);
  });
  it("ignoriert umgebende Leerzeichen nicht (Aufrufer trimmt)", () => {
    expect(isValidPLZ(" 80331")).toBe(false);
  });
});
