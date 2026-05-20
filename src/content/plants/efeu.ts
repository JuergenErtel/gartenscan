import type { ContentEntry } from "@/domain/types";
import { CONTENT_VERSION, SOURCES } from "../_shared";

export const efeu: ContentEntry = {
  id: "plant_efeu",
  category: "PLANT",
  name: "Gemeiner Efeu",
  scientificName: "Hedera helix",
  aliases: ["Efeu", "Mauerefeu", "Wintergrün"],
  description:
    "Immergrüner Kletterstrauch und einer der wenigen einheimischen Lianen. Wertvoll als Spätblüher (Bienenweide September/Oktober) und als Winterquartier für Vögel. Verbreitet sich stark, kann an Bäumen und Mauern dominieren – ist aber kein Parasit.",
  traits: [
    "Immergrüne, leicht ledrige Blätter, häufig drei- bis fünflappig",
    "An Blütentrieben: ungelappte, rautenförmige Altersblätter",
    "Haftwurzeln am Stängel zum Klettern",
    "Unscheinbare gelbgrüne Doldenblüten im September/Oktober",
    "Schwarze Beeren im Winter – wichtige Vogelnahrung",
  ],
  significance: "BENEFIT",
  defaultUrgency: "GONE",
  habitat: "Halbschatten bis Schatten, frische humose Böden, robust",
  seasons: ["SPRING", "SUMMER", "AUTUMN", "WINTER"],
  areas: ["GARDEN", "BED"],
  confusionRisk: [
    {
      name: "Atlantischer Efeu (Hedera hibernica)",
      note: "Kaum von Hedera helix zu unterscheiden – größere Blätter, oft als Gartenform. Pflege identisch.",
    },
  ],
  safety: {
    toxicToChildren: true,
    toxicToPets: ["DOG", "CAT"],
    allergyRisk: true,
    invasive: false,
    notes:
      "Beeren sind giftig (Übelkeit, Erbrechen). Pflanzensaft kann Hautreizungen auslösen. Bei Schnittarbeiten Handschuhe tragen.",
  },
  methods: [
    {
      id: "m_efeu_rueckschnitt",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED", "EFFECTIVE"],
      title: "Rückschnitt zur Bändigung",
      description:
        "Efeu wuchert schnell. Regelmäßiger Schnitt hält ihn dort, wo er erwünscht ist, ohne ihn zu schwächen.",
      steps: [
        "Schnittzeit: Februar bis Anfang März, vor dem Vogelbrutbeginn",
        "Alte, verholzte Triebe bodennah entfernen",
        "Junge Ranken an Mauern und Bäumen einkürzen, bevor sie Haftwurzeln festsetzen",
        "Handschuhe tragen – Saft reizt die Haut",
        "Bei Bäumen: Stamm-Bereich bis 1,5 m freihalten, damit Rinde belüftet bleibt",
      ],
      effort: "MEDIUM",
      durationMin: 45,
      timeframe: "SEASONAL",
      ecoScore: 5,
      successRate: "HIGH",
      minExperience: "BEGINNER",
      safeForChildren: false,
      safeForPets: true,
      costEur: "€",
    },
    {
      id: "m_efeu_entfernen",
      type: "MECHANICAL",
      style: ["ORGANIC", "EFFECTIVE"],
      title: "Komplett entfernen, wenn nicht erwünscht",
      description:
        "Wenn Efeu eine Mauer oder einen Baum gefährdet, hilft nur konsequentes Entfernen mit Wurzel.",
      steps: [
        "Stämme dicht am Boden mit Astschere durchtrennen",
        "Triebe oberhalb absterben lassen – nicht abreißen, das beschädigt Bäume und Putz",
        "Nach 4–6 Wochen die abgestorbenen Ranken mechanisch ablösen",
        "Wurzelstöcke ausgraben oder wiederholt zurückschneiden, damit sie sich erschöpfen",
      ],
      effort: "HARD",
      durationMin: 120,
      timeframe: "LONG_TERM",
      ecoScore: 3,
      successRate: "MEDIUM",
      minExperience: "INTERMEDIATE",
      safeForChildren: false,
      safeForPets: true,
      costEur: "€",
    },
  ],
  prevention: [
    "Standort bewusst wählen: Efeu lässt sich nur schwer wieder loswerden.",
    "Klettergerüst statt Hauswand benutzen, wenn Putz nicht beschädigt werden soll.",
    "Junge Pflanzen jährlich kontrollieren, bevor sie Haftwurzeln bilden.",
    "Beeren außer Reichweite von Kindern und Haustieren halten.",
  ],
  sources: [SOURCES.NABU, SOURCES.GPP],
  contentConfidence: "MEDIUM",
  version: CONTENT_VERSION,
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/0/05/Hedera_helix_002.jpg",
};
