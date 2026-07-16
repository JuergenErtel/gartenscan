import { describe, it, expect } from "vitest";
import { mapPatchToRow } from "@/lib/services/profileRepository";

describe("mapPatchToRow", () => {
  it("mappt postalCode auf postal_code", () => {
    expect(mapPatchToRow({ postalCode: "10115" })).toEqual({ postal_code: "10115" });
  });
  it("setzt postal_code nur bei definiertem patch.postalCode", () => {
    expect(mapPatchToRow({}).postal_code).toBeUndefined();
  });
});
