import { BottomNav } from "./BottomNav";
import { BetaBadge } from "../ui/BetaBadge";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sage-50">
      <div className="pointer-events-none fixed top-[max(env(safe-area-inset-top),0.75rem)] right-3 z-40">
        <BetaBadge />
      </div>
      <main className="mx-auto max-w-lg pb-32">{children}</main>
      <BottomNav />
    </div>
  );
}
