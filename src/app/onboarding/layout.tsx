import { OnboardingGuard } from "@/components/features/onboarding/OnboardingGuard";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OnboardingGuard>{children}</OnboardingGuard>;
}
