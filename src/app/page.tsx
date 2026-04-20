import Link from "next/link";
import Image from "next/image";
import {
  Camera,
  Leaf,
  Lightbulb,
  CalendarDays,
  TrendingUp,
  BrainCircuit,
  ShieldCheck,
  Lock,
  Heart,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/ui/Logo";
import { PhoneMockup } from "@/components/features/landing/PhoneMockup";
import { Button } from "@/components/ui/Button";

const features = [
  {
    icon: Camera,
    title: "Scannen",
    text: "Foto machen und schnell erkennen",
  },
  {
    icon: Leaf,
    title: "Verstehen",
    text: "Detaillierte Infos zum Problem und zur Ursache",
  },
  {
    icon: Lightbulb,
    title: "Lösen",
    text: "Konkrete Maßnahmen und Schritt-für-Schritt Anleitungen",
  },
  {
    icon: CalendarDays,
    title: "Planen",
    text: "Saisonale Tipps und persönliche Gartenpläne",
  },
  {
    icon: TrendingUp,
    title: "Verbessern",
    text: "Beobachten, lernen und deinen Garten kontinuierlich verbessern",
  },
] as const;

const categories = [
  {
    title: "Pflanzen",
    text: "Bäume, Sträucher, Blumen & mehr",
    img: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Hydrangea_macrophylla_01.jpg",
  },
  {
    title: "Unkraut",
    text: "Unkraut sicher erkennen & effektiv entfernen",
    img: "https://upload.wikimedia.org/wikipedia/commons/4/4f/DandelionFlower.jpg",
  },
  {
    title: "Insekten",
    text: "Insekten, Spinnen & Nützlinge bestimmen",
    img: "https://upload.wikimedia.org/wikipedia/commons/6/60/Coccinella.7-punctata.adult.jpg",
  },
  {
    title: "Krankheiten",
    text: "Pflanzenschäden erkennen & richtig behandeln",
    img: "https://upload.wikimedia.org/wikipedia/commons/9/92/Phytophtora_infestans-effects.jpg",
  },
  {
    title: "Schädlinge",
    text: "Schädlinge erkennen & gezielt bekämpfen",
    img: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Arion_vulgaris_3.jpg",
  },
] as const;

const trust = [
  {
    icon: BrainCircuit,
    title: "KI-Power",
    text: "Modernste KI für präzise Ergebnisse",
  },
  {
    icon: ShieldCheck,
    title: "Vertrauenswürdig",
    text: "Von Gartenexperten entwickelt",
  },
  {
    icon: Lock,
    title: "Sicher",
    text: "Deine Daten bleiben bei dir",
  },
  {
    icon: Heart,
    title: "Für Dich",
    text: "Tipps, die wirklich zu deinem Garten passen",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sage-100 via-sage-50 to-paper">
      {/* Ambient background blurs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -left-20 h-[420px] w-[420px] rounded-full bg-moss-500/20 blur-3xl" />
        <div className="absolute top-32 -right-20 h-[360px] w-[360px] rounded-full bg-sage-300/30 blur-3xl" />
        <div className="absolute bottom-40 left-1/4 h-[300px] w-[300px] rounded-full bg-clay-500/10 blur-3xl" />
      </div>

      {/* Nav */}
      <header className="relative z-20 mx-auto max-w-7xl px-6 md:px-10 pt-6 md:pt-10 flex items-center justify-between">
        <Logo size={36} className="md:hidden" />
        <Logo size={44} className="hidden md:flex" />
        <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-forest-800">
          <a href="#features" className="hover:text-forest-700 transition">
            Features
          </a>
          <a href="#kategorien" className="hover:text-forest-700 transition">
            Erkennt
          </a>
          <Link href="/premium" className="hover:text-forest-700 transition">
            Premium
          </Link>
        </nav>
        <Button
          href="/onboarding/welcome"
          size="sm"
          className="hidden md:inline-flex shrink-0"
        >
          App öffnen
        </Button>
      </header>

      {/* Hero: tagline + phone + columns */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 md:px-10 pt-8 md:pt-14 pb-16">
        {/* Tagline centered on all screens */}
        <div className="relative text-center max-w-3xl mx-auto">
          <h1 className="font-serif text-[40px] md:text-[56px] leading-[1.05] tracking-tight text-forest-900 font-normal">
            Erkennen.{" "}
            <span className="text-forest-700">Verstehen.</span>{" "}
            <span className="text-moss-500">Lösen.</span>
          </h1>
          <p className="mt-5 text-[17px] md:text-[19px] text-forest-800/80 leading-relaxed max-w-xl mx-auto">
            Dein Gartenexperte in der Hosentasche. Foto machen, Problem
            verstehen, sofort handeln.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              href="/onboarding/welcome"
              size="lg"
              fullWidth
              className="sm:!w-auto"
              iconRight={<ArrowRight className="h-4 w-4" />}
            >
              Jetzt kostenlos starten
            </Button>
            <Button
              href="/scan/weed_loewenzahn"
              size="lg"
              variant="secondary"
              fullWidth
              className="sm:!w-auto"
              iconLeft={<Sparkles className="h-4 w-4" />}
            >
              Demo-Scan ansehen
            </Button>
          </div>

          <p className="mt-4 text-[12px] text-ink-muted">
            Kostenlos starten · 7 Tage Premium gratis · Ohne Kreditkarte
          </p>
        </div>

        {/* 3-col layout on desktop, phone-only + columns stacked on mobile */}
        <div className="relative mt-16 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-10 md:gap-12 items-start">
          {/* Left column: features */}
          <div
            id="features"
            className="order-2 md:order-1 flex flex-col gap-5 md:gap-6 md:pt-10 md:pr-2"
          >
            {features.map((f, i) => (
              <FeatureItem key={f.title} {...f} align="right" delay={i} />
            ))}
          </div>

          {/* Center: phone */}
          <div className="order-1 md:order-2 flex justify-center">
            <PhoneMockup />
          </div>

          {/* Right column: categories */}
          <div
            id="kategorien"
            className="order-3 flex flex-col md:pt-4 md:pl-2 gap-5"
          >
            <h2 className="font-serif text-[22px] md:text-[24px] leading-tight tracking-tight text-forest-900 font-normal mb-1 text-center md:text-left">
              <span className="block text-forest-700">Eine App.</span>
              <span className="block">Alle Antworten.</span>
              <span className="block">Ein schöner Garten.</span>
            </h2>
            <ol className="relative flex flex-col gap-5">
              <span
                aria-hidden
                className="absolute left-[30px] top-10 bottom-10 w-[1.5px] bg-gradient-to-b from-transparent via-sage-300 to-transparent"
              />
              {categories.map((c) => (
                <CategoryItem key={c.title} {...c} />
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Trust band */}
      <section className="relative z-10 bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 text-paper">
        <div
          aria-hidden
          className="absolute -top-px inset-x-0 h-px bg-gradient-to-r from-transparent via-moss-500/40 to-transparent"
        />
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-12 md:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
            {trust.map((t) => (
              <div key={t.title} className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper/10 backdrop-blur">
                  <t.icon
                    className="h-5 w-5 text-sage-200"
                    strokeWidth={1.75}
                  />
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] font-bold text-sage-200 mb-1">
                    {t.title}
                  </p>
                  <p className="text-[13px] leading-snug text-sage-200/80 max-w-[22ch]">
                    {t.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom final CTA */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 md:px-10 py-16 md:py-24 text-center">
        <LogoMark size={48} className="mx-auto text-forest-700 mb-6" />
        <h2 className="font-serif text-[32px] md:text-[44px] leading-[1.1] tracking-tight text-forest-900 font-normal">
          Starte heute. Dein Garten wartet nicht.
        </h2>
        <p className="mt-4 text-[15px] md:text-[17px] text-forest-800/80 max-w-xl mx-auto">
          In 30 Sekunden vom ersten Foto zur ersten Handlungsempfehlung.
        </p>
        <div className="mt-8 flex justify-center">
          <Button
            href="/onboarding/welcome"
            size="lg"
            iconRight={<ArrowRight className="h-4 w-4" />}
          >
            Zur App
          </Button>
        </div>
        <p className="mt-10 text-[12px] text-ink-soft">
          © {new Date().getFullYear()} gartenscan · gartenscan.de · Made with care in Germany
        </p>
      </section>
    </div>
  );
}

function FeatureItem({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
  align: "left" | "right";
  delay: number;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-paper shadow-[0_4px_14px_rgba(28,42,33,0.06)] ring-1 ring-sage-200/70">
        <Icon className="h-5 w-5 text-forest-700" strokeWidth={1.75} />
      </span>
      <div className="pt-0.5">
        <p className="text-[11px] uppercase tracking-[0.14em] font-bold text-forest-700 mb-1">
          {title}
        </p>
        <p className="text-[14px] leading-snug text-forest-800/85 max-w-[26ch]">
          {text}
        </p>
      </div>
    </div>
  );
}

function CategoryItem({
  title,
  text,
  img,
}: {
  title: string;
  text: string;
  img: string;
}) {
  return (
    <li className="relative flex items-center gap-4">
      <span className="relative flex h-16 w-16 shrink-0 overflow-hidden rounded-full ring-[3px] ring-paper shadow-[0_6px_20px_rgba(28,42,33,0.1)] z-10">
        <Image
          src={img}
          alt=""
          fill
          sizes="64px"
          className="object-cover"
        />
      </span>
      <div>
        <p className="text-[11px] uppercase tracking-[0.14em] font-bold text-forest-700 mb-0.5">
          {title}
        </p>
        <p className="text-[13px] leading-snug text-forest-800/85 max-w-[26ch]">
          {text}
        </p>
      </div>
    </li>
  );
}
