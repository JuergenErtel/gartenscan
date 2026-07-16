"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/services/profileRepository";
import { isValidPLZ } from "@/lib/weather/plz";
import { geocodePLZ } from "@/lib/weather/openmeteo";

export async function updateLocation(
  plz: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = plz.trim();
  if (!isValidPLZ(trimmed)) {
    return { ok: false, error: "Bitte eine 5-stellige PLZ eingeben." };
  }
  const geo = await geocodePLZ(trimmed);
  if (!geo) {
    return { ok: false, error: "PLZ nicht gefunden." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Nicht angemeldet." };
  }
  await updateProfile(user.id, { postalCode: trimmed });
  revalidatePath("/app");
  return { ok: true };
}
