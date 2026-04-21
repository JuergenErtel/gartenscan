import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side Guard: wenn das Profil onboarding nicht abgeschlossen hat und der
 * User sich nicht bereits auf einer /onboarding-Route befindet, redirect auf Welcome.
 */
export async function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") ?? "";

  if (!user) {
    return <>{children}</>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("completed_onboarding_at")
    .eq("id", user.id)
    .maybeSingle();

  const isOnOnboardingRoute = pathname.startsWith("/onboarding");
  const completed = !!profile?.completed_onboarding_at;

  if (!completed && !isOnOnboardingRoute) {
    redirect("/onboarding/welcome");
  }

  return <>{children}</>;
}
