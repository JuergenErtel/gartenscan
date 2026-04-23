import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  Camera,
  Heart,
  Leaf,
  Lightbulb,
  Lock,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { PhoneMockup } from "@/components/features/landing/PhoneMockup";
import { Button } from "@/components/ui/Button";
import { Logo, LogoMark } from "@/components/ui/Logo";

const features = [
  {
    icon: Camera,
    title: "Scannen",
    text: "Foto machen und das Problem klarer sehen",
  },
  {
    icon: Leaf,
    title: "Einordnen",
    text: "Nicht nur Name, sondern Relevanz und Handlungsbedarf",
  },
  {
    icon: Lightbulb,
    title: "Loesen",
    text: "Konkrete erste Massnahme statt trockenem Lexikontext",
  },
  {
    icon: CalendarDays,
    title: "Nachhalten",
    text: "Verlauf, Folgeaufgaben und Beobachtung ueber Zeit",
  },
  {
    icon: TrendingUp,
    title: "Besser werden",
    text: "Aus Einzelfaellen wird mit der Zeit ein besser gepflegter Garten",
  },
] as const;

const categories = [
  {
    title: "Pflanzen",
    text: "Zimmer-, Beet- und Gartenpflanzen schneller zuordnen",
    img: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Hydrangea_macrophylla_01.jpg",
  },
  {
    title: "Unkraut",
    text: "Typische Beikraeuter erkennen und besser unterscheiden",
    img: "https://upload.wikimedia.org/wikipedia/commons/4/4f/DandelionFlower.jpg",
  },
  {
    title: "Insekten",
    text: "Nuezlinge und Gartenbesucher leichter einordnen",
    img: "https://upload.wikimedia.org/wikipedia/commons/6/60/Coccinella.7-punctata.adult.jpg",
  },
  {
    title: "Krankheiten",
    text: "Blaetter, Triebe und Schadbilder gezielter bewerten",
    img: "https://upload.wikimedia.org/wikipedia/commons/9/92/Phytophtora_infestans-effects.jpg",
  },
  {
    title: "Schaedlinge",
    text: "Haeufige Problemfaelle schneller erkennen und handeln",
    img: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Arion_vulgaris_3.jpg",
  },
] as const;

const trust = [
  {
    icon: BrainCircuit,
    title: "Klare Einschaetzung",
    text: "Du bekommst eine verstaendliche Einordnung statt nur eines Namens.",
  },
  {
    icon: ShieldCheck,
    title: "Konkrete Hilfe",
    text: "Naechste Schritte stehen im Vordergrund, nicht endlose Fachtexte.",
  },
  {
    icon: Lock,
    title: "Sorgfaeltiger Umgang",
    text: "Deine Fotos werden fuer die Analyse genutzt, nicht fuer Showeffekte.",
  },
  {
    icon: Heart,
    title: "Fuer den Alltag",
    text: "Praktisch fuer Beete, Balkon, Zimmerpflanzen und spontane Problemfaelle.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sage-100 via-sage-50 to-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -left-20 h-[420px] w-[420px] rounded-full bg-moss-500/20 blur-3xl" />
        <div className="absolute top-32 -right-20 h-[360px] w-[360px] rounded-full bg-sage-300/30 blur-3xl" />
        <div className="absolute bottom-40 left-1/4 h-[300px] w-[300px] rounded-full bg-clay-500/10 blur-3xl" />
      </div>

      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 pt-6 md:px-10 md:pt-10">
        <Logo size={36} className="md:hidden" />
        <Logo size={44} className="hidden md:flex" />
        <nav className="hidden items-center gap-8 text-[14px] font-medium text-forest-800 md:flex">
          <a href="#features" className="transition hover:text-forest-700">
            Produkt
          </a>
          <a href="#scope" className="transition hover:text-forest-700">
            Bereiche
          </a>
          <Link href="/premium" className="transition hover:text-forest-700">
            Premium
          </Link>
        </nav>
        <Button
          href="/onboarding/welcome"
          size="sm"
          className="hidden shrink-0 md:inline-flex"
        >
          App oeffnen
        </Button>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-8 pb-16 md:px-10 md:pt-14">
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="font-serif text-[40px] leading-[1.05] tracking-tight text-forest-900 font-normal md:text-[56px]">
            Erkennen.{" "}
            <span className="text-forest-700">Einordnen.</span>{" "}
            <span className="text-moss-500">Handeln.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-forest-800/80 md:text-[19px]">
            gartenscan hilft dir, Pflanzen, Schaeden und Problemfaelle im
            Garten schneller zu verstehen und direkt den passenden naechsten
            Schritt zu finden.
          </p>

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-paper/80 px-4 py-2 text-[12px] text-forest-800 shadow-[0_6px_24px_rgba(28,42,33,0.06)]">
            <span className="font-semibold">Schneller im Bild:</span>
            <span>Pflanzen</span>
            <span className="opacity-30">•</span>
            <span>Unkraut</span>
            <span className="opacity-30">•</span>
            <span>erste Handlungsempfehlungen</span>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
              href="/onboarding/scan"
              size="lg"
              variant="secondary"
              fullWidth
              className="sm:!w-auto"
              iconLeft={<Sparkles className="h-4 w-4" />}
            >
              So funktioniert&apos;s
            </Button>
          </div>

          <p className="mt-4 text-[12px] text-ink-muted">
            Kostenlos starten • 7 Tage Premium gratis • Ohne Kreditkarte
          </p>
        </div>

        <div className="relative mt-16 grid grid-cols-1 items-start gap-10 md:grid-cols-[1fr_auto_1fr] md:gap-12">
          <div
            id="features"
            className="order-2 flex flex-col gap-5 md:order-1 md:gap-6 md:pt-10 md:pr-2"
          >
            {features.map((feature) => (
              <FeatureItem key={feature.title} {...feature} />
            ))}
          </div>

          <div className="order-1 flex justify-center md:order-2">
            <PhoneMockup />
          </div>

          <div
            id="scope"
            className="order-3 flex flex-col gap-5 md:pt-4 md:pl-2"
          >
            <h2 className="mb-1 text-center font-serif text-[22px] leading-tight tracking-tight text-forest-900 font-normal md:text-left md:text-[24px]">
              <span className="block text-forest-700">Wobei dir gartenscan</span>
              <span className="block">im Garten helfen kann</span>
              <span className="block">und was du fotografieren kannst</span>
            </h2>
            <ol className="relative flex flex-col gap-5">
              <span
                aria-hidden
                className="absolute left-[30px] top-10 bottom-10 w-[1.5px] bg-gradient-to-b from-transparent via-sage-300 to-transparent"
              />
              {categories.map((category) => (
                <CategoryItem key={category.title} {...category} />
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 text-paper">
        <div
          aria-hidden
          className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-moss-500/40 to-transparent"
        />
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-14">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6">
            {trust.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper/10 backdrop-blur">
                  <item.icon className="h-5 w-5 text-sage-200" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-sage-200">
                    {item.title}
                  </p>
                  <p className="max-w-[22ch] text-[13px] leading-snug text-sage-200/80">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-3xl px-6 py-16 text-center md:px-10 md:py-24">
        <LogoMark size={48} className="mx-auto mb-6 text-forest-700" />
        <h2 className="font-serif text-[32px] leading-[1.1] tracking-tight text-forest-900 font-normal md:text-[44px]">
          Starte mit dem naechsten Problemfall in deinem Garten.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] text-forest-800/80 md:text-[17px]">
          Ob Blatt, Bluete, Schaedling oder Schadbild: Ein gutes Foto reicht
          oft, um schneller zu verstehen, was los ist und was du als Naechstes
          tun solltest.
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
          © {new Date().getFullYear()} gartenscan • gartenscan.de • Made in Germany
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
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-paper shadow-[0_4px_14px_rgba(28,42,33,0.06)] ring-1 ring-sage-200/70">
        <Icon className="h-5 w-5 text-forest-700" strokeWidth={1.75} />
      </span>
      <div className="pt-0.5">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-forest-700">
          {title}
        </p>
        <p className="max-w-[26ch] text-[14px] leading-snug text-forest-800/85">
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
      <span className="relative z-10 flex h-16 w-16 shrink-0 overflow-hidden rounded-full ring-[3px] ring-paper shadow-[0_6px_20px_rgba(28,42,33,0.1)]">
        <Image src={img} alt="" fill sizes="64px" className="object-cover" />
      </span>
      <div>
        <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-forest-700">
          {title}
        </p>
        <p className="max-w-[26ch] text-[13px] leading-snug text-forest-800/85">
          {text}
        </p>
      </div>
    </li>
  );
}
