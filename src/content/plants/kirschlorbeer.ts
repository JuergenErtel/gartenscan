import type { ContentEntry } from "@/domain/types";
import { CONTENT_VERSION, SOURCES } from "../_shared";

export const kirschlorbeer: ContentEntry = {
  id: "plant_kirschlorbeer",
  category: "PLANT",
  name: "Kirschlorbeer",
  scientificName: "Prunus laurocerasus",
  aliases: ["Lorbeerkirsche", "Pontische Lorbeerkirsche", "Cherry laurel"],
  description:
    "Immergrünes Heckengehölz und in Neubaugebieten allgegenwärtig, weil es schnell wächst und blickdicht wird. Ökologisch aber umstritten: bietet heimischen Insekten kaum Nahrung und verwildert über von Vögeln verbreitete Samen. Alle Pflanzenteile sind giftig.",
  traits: [
    "Immergrün, große, glänzende, ledrige, dunkelgrüne Blätter",
    "Schnellwüchsig, wird ohne Schnitt mehrere Meter hoch",
    "Weiße Blütentrauben im Frühjahr, danach kirschartige schwarze Früchte",
    "Zerriebene Blätter riechen nach Bittermandel (Blausäure)",
  ],
  significance: "NEUTRAL",
  defaultUrgency: "GONE",
  habitat: "Sonne bis Schatten, anspruchslos, frischer Gartenboden",
  seasons: ["SPRING", "SUMMER", "AUTUMN", "WINTER"],
  areas: ["GARDEN", "BED"],
  confusionRisk: [
    {
      name: "Echter Lorbeer (Laurus nobilis)",
      note: "Küchengewürz mit aromatischen Blättern – nicht mit dem giftigen Kirschlorbeer verwechseln, dessen Blätter nach Bittermandel riechen.",
    },
    {
      name: "Portugiesischer Kirschlorbeer (Prunus lusitanica)",
      note: "Ähnlich, aber kleinere Blätter mit rötlichen Stielen und etwas ökologischer.",
    },
  ],
  safety: {
    toxicToChildren: true,
    toxicToPets: ["DOG", "CAT"],
    allergyRisk: false,
    invasive: true,
    notes:
      "Blätter und Samen enthalten cyanogene Glykoside (Blausäure) – giftig für Kinder, Haustiere und Weidetiere. Das rohe Fruchtfleisch ist mild, die Kerne aber giftig. Kirschlorbeer verwildert über Vogelverbreitung und gilt in Teilen Europas als problematischer Neophyt.",
  },
  methods: [
    {
      id: "m_kirschlorbeer_schnitt",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED"],
      title: "Mit der Rosenschere statt Heckenschere schneiden",
      description:
        "Die Heckenschere zerschneidet die großen Blätter, die Ränder werden dann braun und unansehnlich. Bei kleineren Hecken lohnt der Schnitt mit der Handschere.",
      steps: [
        "Hauptschnitt Ende Juni (nach der Vogelbrut, Bundesnaturschutzgesetz beachten)",
        "Einzelne Triebe gezielt über einem Blatt einkürzen, Blätter nicht durchschneiden",
        "Zu groß gewordene Hecken vertragen auch einen radikalen Rückschnitt ins alte Holz",
        "Schnittgut wegen Giftigkeit nicht offen liegen lassen",
      ],
      effort: "MEDIUM",
      durationMin: 45,
      timeframe: "SEASONAL",
      ecoScore: 3,
      successRate: "HIGH",
      minExperience: "BEGINNER",
      safeForChildren: false,
      safeForPets: true,
      costEur: "€",
    },
    {
      id: "m_kirschlorbeer_alternative",
      type: "CULTURAL",
      style: ["ORGANIC"],
      title: "Ökologische Heckenalternative erwägen",
      description:
        "Wer neu pflanzt, kann mit heimischen Gehölzen deutlich mehr für Insekten und Vögel tun – bei ähnlichem Sichtschutz.",
      steps: [
        "Für immergrünen Sichtschutz: Eibe oder Liguster statt Kirschlorbeer",
        "Für Blüten und Beeren: Hainbuche, Kornelkirsche oder Feldahorn",
        "Bestehende Hecke muss nicht gerodet werden – Lücken gezielt mit heimischen Arten ergänzen",
      ],
      effort: "HARD",
      durationMin: 120,
      timeframe: "LONG_TERM",
      ecoScore: 5,
      successRate: "HIGH",
      minExperience: "INTERMEDIATE",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€€€",
    },
  ],
  prevention: [
    "Schnittzeitpunkt am Bundesnaturschutzgesetz ausrichten (kein Radikalschnitt von März bis September in Hecken mit Vogelbrut).",
    "Sämlinge im Garten früh jäten, um unkontrollierte Ausbreitung zu vermeiden.",
    "Giftiges Schnittgut und Laub für Kinder und Haustiere unzugänglich entsorgen.",
    "Bei Neupflanzung ökologisch wertvollere, heimische Alternativen bevorzugen.",
  ],
  sources: [SOURCES.NABU, SOURCES.UBA, SOURCES.GPP],
  contentConfidence: "HIGH",
  version: CONTENT_VERSION,
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/8/84/Bloemknoppen_van_een_Laurierkers_%28Prunus_laurocerasus%29._26-04-2026_%28d.j.b.%29.jpg",
};
