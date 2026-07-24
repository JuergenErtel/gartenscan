import type { ContentEntry } from "@/domain/types";
import { CONTENT_VERSION, SOURCES } from "../_shared";

export const tulpe: ContentEntry = {
  id: "plant_tulpe",
  category: "PLANT",
  name: "Tulpe",
  scientificName: "Tulipa",
  aliases: ["Garten-Tulpe", "Tulip"],
  description:
    "Der Frühlingsbote im Beet, Kübel und in der Vase. Die Zwiebel wird im Herbst gesteckt und blüht von März bis Mai. Botanische Wildtulpen kommen zuverlässig jedes Jahr wieder, viele große Zuchtsorten blühen dagegen nur ein bis zwei Jahre üppig. Alle Zwiebelteile sind giftig.",
  traits: [
    "Zwiebelpflanze mit meist einer becherförmigen Blüte pro Stiel",
    "Breite, glatte, blaugrüne Blätter",
    "Blütenfarben von Weiß über Gelb und Rosa bis fast Schwarz",
    "Blütezeit März bis Mai je nach Sorte",
    "Botanische Wildtulpen kleiner und dauerhafter als große Zuchtsorten",
  ],
  significance: "BENEFIT",
  defaultUrgency: "GONE",
  habitat: "Sonnig, durchlässiger Boden ohne Staunässe",
  seasons: ["SPRING"],
  areas: ["GARDEN", "BED", "BALCONY", "TERRACE", "POTS"],
  confusionRisk: [
    {
      name: "Narzisse (Narcissus)",
      note: "Ebenfalls giftige Frühlingszwiebel; im blütenlosen Zustand an den Zwiebeln leicht zu verwechseln.",
    },
    {
      name: "Speisezwiebel (Allium cepa)",
      note: "Gefährliche Verwechslung: Tulpenzwiebeln sehen Speisezwiebeln ähnlich, sind aber giftig. Getrennt lagern und kennzeichnen.",
    },
  ],
  safety: {
    toxicToChildren: true,
    toxicToPets: ["DOG", "CAT"],
    allergyRisk: true,
    invasive: false,
    notes:
      "Alle Pflanzenteile, vor allem die Zwiebel, enthalten giftige Tulipaline. Verzehr führt zu Übelkeit und Erbrechen. Häufiger Hautkontakt mit Zwiebeln kann eine Kontaktallergie auslösen ('Tulpenfinger') – beim Stecken Handschuhe tragen.",
  },
  methods: [
    {
      id: "m_tulpe_stecken",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED", "EFFECTIVE"],
      title: "Zwiebeln im Herbst stecken",
      description:
        "Tulpen werden im Herbst gepflanzt und brauchen die winterliche Kälte, um im Frühjahr zu blühen. Die richtige Tiefe ist entscheidend.",
      steps: [
        "September bis November stecken, solange der Boden offen ist",
        "Pflanztiefe: etwa doppelt so tief wie die Zwiebel hoch ist (10–15 cm)",
        "Spitze nach oben, mit etwas Abstand in Gruppen setzen",
        "Auf durchlässigen Boden achten; bei schwerem Boden Sand ins Pflanzloch geben",
      ],
      effort: "EASY",
      durationMin: 25,
      timeframe: "SEASONAL",
      ecoScore: 5,
      successRate: "HIGH",
      minExperience: "BEGINNER",
      safeForChildren: false,
      safeForPets: true,
      costEur: "€",
    },
    {
      id: "m_tulpe_nachbluete",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED"],
      title: "Nach der Blüte richtig behandeln",
      description:
        "Damit die Zwiebel Kraft für das nächste Jahr sammelt, darf das Laub nicht zu früh entfernt werden.",
      steps: [
        "Verblühte Blüten abschneiden, damit keine Kraft in die Samenbildung geht",
        "Blätter stehen lassen, bis sie vollständig vergilbt und eingezogen sind",
        "In Kübeln nach dem Einziehen trocken und kühl lagern",
        "Bei nachlassender Blüte alle paar Jahre Zwiebeln teilen oder neu setzen",
      ],
      effort: "EASY",
      durationMin: 15,
      timeframe: "SEASONAL",
      ecoScore: 5,
      successRate: "MEDIUM",
      minExperience: "BEGINNER",
      safeForChildren: false,
      safeForPets: true,
      costEur: "€",
    },
  ],
  prevention: [
    "Zwiebeln getrennt von Speisezwiebeln lagern und klar kennzeichnen (Verwechslungsgefahr).",
    "Beim Stecken Handschuhe tragen, um Kontaktallergie ('Tulpenfinger') zu vermeiden.",
    "Staunässe vermeiden – nasse Zwiebeln faulen im Boden.",
    "Für dauerhafte Blüte botanische Wildtulpen wählen; sie verwildern zuverlässig.",
  ],
  sources: [SOURCES.GPP, SOURCES.NABU],
  contentConfidence: "HIGH",
  version: CONTENT_VERSION,
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/9/9e/%D7%A6%D7%91%D7%A2%D7%95%D7%A0%D7%99%D7%9D.JPG",
};
