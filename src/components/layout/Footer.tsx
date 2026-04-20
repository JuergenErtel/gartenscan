import Link from "next/link";

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-lg border-t border-sage-200/60 px-5 py-8 text-[12px] text-ink-muted">
      <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Link
          href="/impressum"
          className="hover:text-forest-700 transition"
        >
          Impressum
        </Link>
        <span className="text-sage-300">·</span>
        <Link
          href="/datenschutz"
          className="hover:text-forest-700 transition"
        >
          Datenschutz
        </Link>
      </nav>
      <p className="mt-3 text-center text-ink-muted/80">
        © {new Date().getFullYear()} gartenscan
      </p>
    </footer>
  );
}
