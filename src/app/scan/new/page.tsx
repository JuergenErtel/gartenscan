import { OnboardingGuard } from "@/components/features/onboarding/OnboardingGuard";
import ScanNewClient from "./ScanNewClient";

export default async function ScanNewPage() {
  return (
    <OnboardingGuard>
      <ScanNewClient />
    </OnboardingGuard>
  );
}
