import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Share2,
  Gauge,
  Home,
  Clock,
  MessageCircle,
  User,
  Camera,
  Zap,
  Leaf,
  Droplets,
} from "lucide-react";

export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[290px] md:w-[320px] shrink-0">
      {/* Soft ambient glow */}
      <div
        aria-hidden
        className="absolute -inset-10 rounded-full bg-gradient-to-br from-moss-500/20 via-sage-200/30 to-clay-500/10 blur-3xl"
      />

      {/* Phone body */}
      <div className="relative rounded-[46px] bg-forest-900 p-[10px] shadow-[0_30px_80px_-20px_rgba(28,42,33,0.5),0_10px_30px_-10px_rgba(28,42,33,0.4)]">
        {/* Inner bezel */}
        <div className="relative rounded-[38px] bg-sage-50 overflow-hidden aspect-[9/19] ring-[0.5px] ring-forest-700/40">
          {/* Dynamic island / notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 h-[22px] w-[90px] rounded-full bg-forest-900" />

          {/* Status bar */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 pt-2 pb-0.5 text-[11px] font-semibold text-forest-900">
            <span className="tabular-nums">9:41</span>
            <span className="flex items-center gap-1">
              <span className="flex items-end gap-[1.5px]">
                <span className="h-1 w-0.5 rounded-sm bg-forest-900" />
                <span className="h-1.5 w-0.5 rounded-sm bg-forest-900" />
                <span className="h-2 w-0.5 rounded-sm bg-forest-900" />
                <span className="h-2.5 w-0.5 rounded-sm bg-forest-900" />
              </span>
              <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                <path
                  d="M6.5 2C3.86 2 1.4 3.1 0 4.5L6.5 10 13 4.5C11.6 3.1 9.14 2 6.5 2Z"
                  fill="currentColor"
                  opacity="0.9"
                />
              </svg>
              <span className="inline-block w-[22px] h-[10px] rounded-[3px] border border-forest-900/80 relative">
                <span className="absolute inset-[1.5px] right-[6px] bg-forest-900 rounded-[1.5px]" />
                <span className="absolute -right-[2px] top-[2.5px] bottom-[2.5px] w-[1.5px] bg-forest-900/80 rounded-r-sm" />
              </span>
            </span>
          </div>

          {/* Hero photo */}
          <div className="relative h-[48%]">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/4/4f/DandelionFlower.jpg"
              alt="Löwenzahn"
              fill
              sizes="320px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent" />

            {/* Back + share */}
            <div className="absolute top-10 left-4 right-4 flex items-center justify-between z-10">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 backdrop-blur">
                <ArrowLeft className="h-4 w-4 text-forest-700" />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 backdrop-blur">
                <Share2 className="h-3.5 w-3.5 text-forest-700" />
              </span>
            </div>

            {/* Scan focus brackets */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative h-[60%] w-[55%]">
                {(
                  [
                    "top-0 left-0",
                    "top-0 right-0 rotate-90",
                    "bottom-0 right-0 rotate-180",
                    "bottom-0 left-0 -rotate-90",
                  ] as const
                ).map((pos) => (
                  <span
                    key={pos}
                    className={`absolute h-5 w-5 border-l-2 border-t-2 border-paper/90 rounded-tl ${pos}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Result sheet */}
          <div className="absolute left-0 right-0 bottom-[56px] z-20 rounded-t-[28px] bg-sage-50 pt-3 pb-3">
            {/* Drag handle */}
            <div className="mx-auto h-1 w-10 rounded-full bg-sage-200 mb-3" />

            <div className="px-5">
              {/* Erkannt row */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-ink-muted font-semibold mb-0.5">
                    Erkannt
                  </p>
                  <p className="font-serif text-[20px] leading-none text-forest-900 font-normal">
                    Löwenzahn
                  </p>
                  <p className="italic text-[10px] text-ink-muted mt-0.5">
                    Taraxacum officinale
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-ink-muted mt-1" />
              </div>

              {/* Problem level */}
              <div className="flex items-center justify-between rounded-[12px] bg-paper px-3 py-2.5 mb-3 border border-sage-200/70">
                <span className="flex items-center gap-2 text-[11px] font-medium text-forest-900">
                  <Gauge className="h-3.5 w-3.5 text-sun-500" />
                  Problemeinstufung
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block rounded-full bg-sun-100 text-[9px] font-bold uppercase tracking-wider text-[#8a6a14] px-2 py-0.5">
                    Mittel
                  </span>
                  <ArrowRight className="h-3 w-3 text-ink-soft" />
                </span>
              </div>

              {/* Was tun */}
              <p className="text-[11px] font-bold text-forest-900 mb-1">
                Was tun?
              </p>
              <p className="text-[10px] leading-snug text-ink-muted mb-2.5">
                Löwenzahn breitet sich schnell aus und entzieht dem Rasen
                Nährstoffe. Handeln empfehlenswert.
              </p>

              <p className="text-[9px] uppercase tracking-wider text-forest-900 font-bold mb-1.5">
                Empfohlene Lösungen
              </p>
              <div className="space-y-1.5">
                <SolutionRow
                  icon={<Zap className="h-3 w-3" />}
                  title="Schnell & einfach"
                  sub="Ausstechen mit Wurzelstecher"
                  badge="Heute"
                  badgeTone="bg-moss-500 text-paper"
                />
                <SolutionRow
                  icon={<Leaf className="h-3 w-3" />}
                  title="Nachhaltig"
                  sub="Regelmäßig entfernen & Rasen stärken"
                  badge="Wirkungsvoll"
                  badgeTone="bg-forest-700 text-paper"
                />
                <SolutionRow
                  icon={<Droplets className="h-3 w-3" />}
                  title="Natürlich"
                  sub="Essig-Wasser-Salz Mischung"
                  badge="Natürlich"
                  badgeTone="bg-sage-200 text-forest-900"
                />
              </div>

              {/* CTA */}
              <button className="mt-3 w-full flex items-center justify-center gap-1.5 h-9 rounded-full bg-forest-700 text-paper text-[11px] font-semibold">
                Alle 5 Lösungen ansehen
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Bottom nav inside phone */}
          <div className="absolute bottom-0 left-0 right-0 z-30 bg-paper/95 backdrop-blur pt-1 pb-2 border-t border-sage-200/60">
            <div className="flex items-end justify-around px-3">
              <NavItem icon={<Home className="h-4 w-4" />} label="Home" />
              <NavItem icon={<Clock className="h-4 w-4" />} label="Verlauf" />
              <div className="flex flex-col items-center -mt-5">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-moss-500 to-forest-700 flex items-center justify-center shadow-[0_6px_14px_rgba(46,74,56,0.4)] ring-[3px] ring-paper">
                  <Camera className="h-4 w-4 text-paper" strokeWidth={1.75} />
                </div>
                <span className="text-[8px] font-semibold text-forest-700 mt-0.5">
                  Scan
                </span>
              </div>
              <NavItem
                icon={<MessageCircle className="h-4 w-4" />}
                label="Coach"
              />
              <NavItem icon={<User className="h-4 w-4" />} label="Profil" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating click target — whole phone → live app */}
      <Link
        href="/scan/weed_loewenzahn"
        aria-label="Live-Version im Prototypen ansehen"
        className="absolute inset-0 rounded-[46px] focus-visible:outline-2 focus-visible:outline-forest-700"
      />
    </div>
  );
}

function SolutionRow({
  icon,
  title,
  sub,
  badge,
  badgeTone,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  badge: string;
  badgeTone: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-[10px] bg-paper px-2.5 py-1.5 border border-sage-200/60">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-100 text-forest-700">
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[10px] font-bold text-forest-900 leading-none">
          {title}
        </span>
        <span className="block text-[9px] text-ink-muted leading-tight mt-0.5 truncate">
          {sub}
        </span>
      </span>
      <span
        className={`inline-block rounded-full text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${badgeTone}`}
      >
        {badge}
      </span>
    </div>
  );
}

function NavItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-ink-soft">
      {icon}
      <span className="text-[8px] font-medium">{label}</span>
    </div>
  );
}
