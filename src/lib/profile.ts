/**
 * Mock user/garden profile. In production this comes from the DB via the
 * GardenProfile entity defined in the architecture.
 */
export const USER_PROFILE = {
  name: "Jürgen",
  postalCode: "80331", // München – change to your actual PLZ
  climateZone: "8a",
  gardenSize: "MEDIUM" as const,
  experience: "INTERMEDIATE" as const,
};
