import type { ContentEntry } from "@/domain/types";
import { CONTENT_VERSION, SOURCES } from "../_shared";

export const geranie: ContentEntry = {
  id: "plant_geranie",
  category: "PLANT",
  name: "Geranie",
  scientificName: "Pelargonium",
  aliases: ["Pelargonie", "Balkongeranie", "Geranium (umgangssprachlich)"],
  description:
    "Die Balkonpflanze schlechthin: blühfreudig von Mai bis zum Frost, hitzeverträglich und pflegeleicht. Botanisch korrekt eine Pelargonie – nicht zu verwechseln mit dem winterharten Storchschnabel (Geranium). Nicht winterhart, lässt sich aber frostfrei überwintern.",
  traits: [
    "Buschige oder hängende Pflanze mit fleischigen Stängeln",
    "Rundliche, gekerbte, oft duftende Blätter",
    "Doldenartige Blütenstände in Rot, Rosa, Weiß, Violett",
    "Stehende (zonale) und hängende (Efeu-)Geranien",
    "Blüht durchgehend von Mai bis zum ersten Frost",
  ],
  significance: "BENEFIT",
  defaultUrgency: "GONE",
  habitat: "Sonnig bis halbschattig, durchlässige nährstoffreiche Kübelerde",
  seasons: ["SPRING", "SUMMER", "AUTUMN"],
  areas: ["BALCONY", "TERRACE", "POTS", "BED", "GARDEN"],
  confusionRisk: [
    {
      name: "Storchschnabel (Geranium, echte Gattung)",
      note: "Der winterharte Gartenstaude-'Geranium' ist eine andere Gattung – Pelargonien sind die frostempfindlichen Balkonblumen.",
    },
    {
      name: "Efeu-Geranie vs. Stehende Geranie",
      note: "Hängende Efeu-Geranien haben glänzende, efeuartige Blätter; stehende Sorten wachsen aufrecht und buschig.",
    },
  ],
  safety: {
    toxicToChildren: false,
    toxicToPets: ["DOG", "CAT"],
    allergyRisk: false,
    invasive: false,
    notes:
      "Für Menschen ungefährlich. Pelargonien enthalten Geraniol und Linalool und gelten als leicht giftig für Hunde und besonders Katzen – Verzehr kann Erbrechen und Hautreizungen auslösen.",
  },
  methods: [
    {
      id: "m_geranie_ausputzen",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED", "EFFECTIVE"],
      title: "Verblühtes ausputzen",
      description:
        "Regelmäßiges Entfernen verwelkter Blüten steckt die Energie in neue Knospen statt in Samen – die Pflanze blüht dadurch pausenlos.",
      steps: [
        "Verblühte Blütendolden samt Stiel bis zum Ansatz herausbrechen oder schneiden",
        "Gelbe und faule Blätter ebenfalls entfernen",
        "Ein- bis zweimal pro Woche kontrollieren",
        "Von Mai bis September wöchentlich mit Blühdünger versorgen (Starkzehrer)",
      ],
      effort: "EASY",
      durationMin: 10,
      timeframe: "THIS_WEEK",
      ecoScore: 5,
      successRate: "HIGH",
      minExperience: "BEGINNER",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€",
    },
    {
      id: "m_geranie_ueberwinterung",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED"],
      title: "Frostfrei überwintern",
      description:
        "Geranien sind nicht winterhart, lassen sich aber problemlos über den Winter bringen und treiben im Frühjahr kräftig wieder aus.",
      steps: [
        "Vor dem ersten Frost (Oktober) hereinholen",
        "Triebe um etwa die Hälfte einkürzen",
        "Hell und kühl bei 5–10 °C lagern (Treppenhaus, kühles Fenster)",
        "Sparsam gießen, nicht düngen; ab März wieder wärmer und heller stellen",
      ],
      effort: "MEDIUM",
      durationMin: 30,
      timeframe: "SEASONAL",
      ecoScore: 5,
      successRate: "MEDIUM",
      minExperience: "INTERMEDIATE",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€",
    },
  ],
  prevention: [
    "Nicht über die Blätter gießen – nasses Laub fördert Grauschimmel und Rost.",
    "Erst nach den Eisheiligen (Mitte Mai) dauerhaft nach draußen stellen.",
    "Auf Staunässe achten: Abzugsloch und Drainage im Kübel sicherstellen.",
    "Von Mai bis September regelmäßig düngen – Geranien sind Starkzehrer.",
  ],
  sources: [SOURCES.GPP, SOURCES.BZL],
  contentConfidence: "HIGH",
  version: CONTENT_VERSION,
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/b/b7/A_pink_Pelargonium_peltatum_flower_and_plant.jpg",
};
