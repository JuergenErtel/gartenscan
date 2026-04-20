import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sage-50">
      <main className="mx-auto max-w-lg pb-32">{children}</main>
      <BottomNav />
    </div>
  );
}
