"use client";

import { useEffect, useState } from "react";
import { profileStorage } from "@/lib/storage/profile";
import type { GardenProfile } from "@/domain/types";

export interface UseProfileResult {
  profile: GardenProfile | null;
  loading: boolean;
}

export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<GardenProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setProfile(profileStorage.get());
    setLoading(false);
  }, []);

  return { profile, loading };
}
