import type { ContentEntry } from "@/domain/types";
import { CONTENT_VERSION, SOURCES } from "../_shared";

export const thuja: ContentEntry = {
  id: "plant_thuja",
  category: "PLANT",
  name: "Thuja",
  scientificName: "Thuja occidentalis",
  aliases: ["Abendländischer Lebensbaum", "Lebensbaum", "White cedar"],
  description:
    "Die klassische immergrüne Heckenpflanze der Vorgärten: schnell blickdicht, pflegeleicht, günstig. Ökologisch wenig wertvoll und anfällig für Trockenschäden, die als braune Stellen sichtbar werden. Enthält das giftige Thujon.",
  traits: [
    "Immergrün, schuppenförmige, flach anliegende Nadeln",
    "Aromatischer Geruch beim Zerreiben der Zweige",
    "Kegelförmiger, dichter Wuchs, als Hecke gut schneidbar",
    "Kleine, längliche, hellbraune Zapfen",
    "Braune Innenbereiche im Herbst sind teils natürlicher Nadelwechsel",
  ],
  significance: "NEUTRAL",
  defaultUrgency: "GONE",
  habitat: "Sonne bis Halbschatten, frischer, nicht zu trockener Boden",
  seasons: ["SPRING", "SUMMER", "AUTUMN", "WINTER"],
  areas: ["GARDEN", "BED"],
  confusionRisk: [
    {
      name: "Scheinzypresse (Chamaecyparis)",
      note: "Sehr ähnliche Schuppennadeln; Zweige der Thuja riechen beim Zerreiben aromatischer.",
    },
    {
      name: "Wacholder (Juniperus)",
      note: "Andere Heckenkonifere, oft mit pieksenden Nadeln und blauen Beerenzapfen.",
    },
  ],
  safety: {
    toxicToChildren: true,
    toxicToPets: ["DOG", "CAT"],
    allergyRisk: true,
    invasive: false,
    notes:
      "Alle Pflanzenteile enthalten das ätherische Öl Thujon und sind bei Verzehr giftig für Mensch und Tier. Der Pflanzensaft kann bei empfindlichen Personen Hautreizungen auslösen – beim Schnitt Handschuhe tragen.",
  },
  methods: [
    {
      id: "m_thuja_schnitt",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED"],
      title: "Schneiden – nie ins alte Holz",
      description:
        "Thuja treibt aus altem, braunem Holz nicht wieder aus. Ein zu radikaler Schnitt hinterlässt dauerhaft kahle Stellen.",
      steps: [
        "Zweimal jährlich leicht schneiden: Ende Juni und Ende August",
        "Nur im grünen, benadelten Bereich schneiden",
        "An bedecktem Tag arbeiten, um Verbräunung durch Sonne zu vermeiden",
        "Handschuhe tragen (hautreizender Saft)",
      ],
      effort: "MEDIUM",
      durationMin: 40,
      timeframe: "SEASONAL",
      ecoScore: 3,
      successRate: "HIGH",
      minExperience: "BEGINNER",
      safeForChildren: false,
      safeForPets: true,
      costEur: "€",
    },
    {
      id: "m_thuja_wasser",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED"],
      title: "Braune Stellen durch Trockenheit vorbeugen",
      description:
        "Die meisten braunen Partien entstehen durch Wassermangel, besonders bei jungen Hecken und im Winter bei Frosttrocknis.",
      steps: [
        "In Trockenphasen durchdringend und bodennah wässern",
        "Wurzelbereich mit Rindenmulch feucht halten",
        "Auch im Winter an frostfreien Tagen gießen (immergrün = ständige Verdunstung)",
        "Braune Einzelstellen ausschneiden; großflächige Verbräunung ist oft nicht mehr reparabel",
      ],
      effort: "EASY",
      durationMin: 20,
      timeframe: "SEASONAL",
      ecoScore: 4,
      successRate: "MEDIUM",
      minExperience: "BEGINNER",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€",
    },
  ],
  prevention: [
    "Gleichmäßig feucht halten – Trockenstress ist die häufigste Ursache brauner Stellen.",
    "Nie ins alte Holz schneiden; Thuja treibt daraus nicht wieder aus.",
    "Bei Neupflanzung ökologisch wertvollere Hecken (Hainbuche, Liguster, Eibe) erwägen.",
    "Schnittgut und Nadeln von Kindern und Haustieren fernhalten.",
  ],
  sources: [SOURCES.GPP, SOURCES.NABU, SOURCES.DWD],
  contentConfidence: "HIGH",
  version: CONTENT_VERSION,
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/2/2e/Young_thuja_occidentalis_in_Yefremov.jpg",
};
