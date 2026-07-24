import type { ContentEntry } from "@/domain/types";
import { CONTENT_VERSION, SOURCES } from "../_shared";

export const buchsbaum: ContentEntry = {
  id: "plant_buchsbaum",
  category: "PLANT",
  name: "Buchsbaum",
  scientificName: "Buxus sempervirens",
  aliases: ["Gewöhnlicher Buchsbaum", "Buchs", "Buxus", "Boxwood"],
  description:
    "Immergrünes, langsam wachsendes Formgehölz – jahrhundertelang das Rückgrat von Beeteinfassungen, Kugeln und Hecken. Robust und schnittverträglich, heute aber stark bedroht durch den Buchsbaumzünsler und das Triebsterben. Alle Pflanzenteile sind giftig.",
  traits: [
    "Immergrün, dichte, kleine, ledrige, dunkelgrüne Blätter",
    "Sehr langsamer Wuchs, extrem schnittverträglich",
    "Junge Triebe grün und kantig, später graubraune Borke",
    "Unscheinbare gelbgrüne Blüten im Frühjahr",
    "Als Kugel, Kegel, Einfassung oder Hecke formbar",
  ],
  significance: "BENEFIT",
  defaultUrgency: "GONE",
  habitat: "Halbschatten bis Sonne, frischer, humoser, kalkhaltiger Boden",
  seasons: ["SPRING", "SUMMER", "AUTUMN", "WINTER"],
  areas: ["GARDEN", "BED", "TERRACE", "POTS"],
  confusionRisk: [
    {
      name: "Japanische Stechpalme (Ilex crenata)",
      note: "Beliebter Buchs-Ersatz mit fast gleichem Aussehen, aber resistent gegen Zünsler und Triebsterben.",
    },
    {
      name: "Liguster (Ligustrum)",
      note: "Ähnlich als Hecke, Blätter aber größer und meist laubabwerfend bis halbimmergrün.",
    },
  ],
  safety: {
    toxicToChildren: true,
    toxicToPets: ["DOG", "CAT"],
    allergyRisk: false,
    invasive: false,
    notes:
      "Alle Pflanzenteile enthalten giftige Alkaloide (u. a. Buxin). Verzehr von Blättern führt zu Erbrechen, Krämpfen und Kreislaufproblemen bei Mensch und Tier. Schnittgut nicht in Reichweite von Kindern oder Weidetieren liegen lassen.",
  },
  methods: [
    {
      id: "m_buchs_formschnitt",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED"],
      title: "Formschnitt an bedecktem Tag",
      description:
        "Buchs lässt sich fast beliebig in Form schneiden. Wichtig ist der richtige Zeitpunkt, sonst gibt es braune Blattränder durch Sonnenbrand.",
      steps: [
        "Hauptschnitt Ende Mai/Juni nach dem ersten Austrieb, zweiter Schnitt im August möglich",
        "An bewölktem Tag oder abends schneiden, nie in praller Mittagssonne",
        "Scharfe, saubere Schere verwenden; nach dem Schnitt wässern",
        "Nicht bei Frost oder großer Hitze schneiden",
      ],
      effort: "MEDIUM",
      durationMin: 40,
      timeframe: "SEASONAL",
      ecoScore: 5,
      successRate: "HIGH",
      minExperience: "BEGINNER",
      safeForChildren: false,
      safeForPets: true,
      costEur: "€",
    },
    {
      id: "m_buchs_zuensler",
      type: "MECHANICAL",
      style: ["ORGANIC", "EFFECTIVE"],
      title: "Auf Buchsbaumzünsler kontrollieren",
      description:
        "Der Zünsler ist heute die größte Gefahr für den Buchs. Frühe Kontrolle entscheidet, ob die Pflanze zu retten ist.",
      steps: [
        "Ab April regelmäßig ins Innere der Pflanze schauen: grüne Raupen, Gespinste und Kotkrümel sind Alarmzeichen",
        "Pheromonfalle aufhängen, um den Falterflug zu erkennen",
        "Erste Raupen absammeln oder mit scharfem Wasserstrahl herausspülen",
        "Bei stärkerem Befall gezielt mit einem Präparat auf Basis von Bacillus thuringiensis behandeln",
      ],
      effort: "MEDIUM",
      durationMin: 30,
      timeframe: "THIS_WEEK",
      ecoScore: 4,
      successRate: "MEDIUM",
      minExperience: "BEGINNER",
      safeForChildren: false,
      safeForPets: true,
      costEur: "€€",
    },
  ],
  prevention: [
    "Regelmäßig ins Innere schauen – Zünslerbefall wird sonst zu spät bemerkt.",
    "Luftig pflanzen und morgens bodennah gießen; nasses Laub fördert das Triebsterben (Cylindrocladium).",
    "Bei wiederkehrendem Befall auf resistente Alternativen wie Ilex crenata umstellen.",
    "Schnittgut befallener Pflanzen im Restmüll entsorgen, nicht kompostieren.",
  ],
  sources: [SOURCES.JKI, SOURCES.GPP, SOURCES.NABU],
  contentConfidence: "HIGH",
  version: CONTENT_VERSION,
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/e/e7/Buxus_sempervirens_10860.JPG",
};
