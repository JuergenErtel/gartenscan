import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-5 safe-top">
      <EmptyState
        mark="compass"
        title="Diese Seite gibt es nicht"
        body="Die Seite, die du suchst, wurde verschoben oder existiert nicht mehr. Zurück auf den Pfad?"
        ctaLabel="Zur Startseite"
        ctaHref="/"
      />
    </main>
  );
}
