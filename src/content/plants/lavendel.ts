import type { ContentEntry } from "@/domain/types";
import { CONTENT_VERSION, SOURCES } from "../_shared";

export const lavendel: ContentEntry = {
  id: "plant_lavendel",
  category: "PLANT",
  name: "Lavendel",
  scientificName: "Lavandula angustifolia",
  aliases: ["Echter Lavendel", "Schmalblättriger Lavendel", "True lavender"],
  description:
    "Duftender Halbstrauch aus dem Mittelmeerraum, in deutschen Gärten Dauerbrenner für Beet, Kübel und Balkon. Liebt volle Sonne und mageren, durchlässigen Boden. Blüht Juni bis August und ist ein Magnet für Bienen, Hummeln und Schmetterlinge. Größter Feind ist nicht Kälte, sondern Staunässe.",
  traits: [
    "Kompakter Halbstrauch, 30–60 cm hoch, im Alter verholzt",
    "Schmale, graugrüne, silbrig behaarte Blätter",
    "Blau-violette Blütenähren an langen Stielen",
    "Intensiver, harziger Duft von Blättern und Blüten",
    "Blütezeit Juni bis August, bienenfreundlich",
  ],
  significance: "BENEFIT",
  defaultUrgency: "GONE",
  habitat: "Vollsonnig, mager, durchlässig, kalkhaltig – kein Staunässe-Boden",
  seasons: ["SUMMER"],
  areas: ["GARDEN", "BED", "BALCONY", "TERRACE", "POTS"],
  confusionRisk: [
    {
      name: "Lavandin (Lavandula × intermedia)",
      note: "Kräftiger und höher, kampferreicherer Duft. Weniger winterhart als Echter Lavendel.",
    },
    {
      name: "Katzenminze (Nepeta)",
      note: "Ähnlicher Wuchs und blau-violette Blüten, aber weiche Blätter und milderer Minzduft.",
    },
  ],
  safety: {
    toxicToChildren: false,
    toxicToPets: ["DOG", "CAT"],
    allergyRisk: false,
    invasive: false,
    notes:
      "Für Menschen unbedenklich und als Küchen-/Duftkraut nutzbar. Das ätherische Öl (Linalool) kann in größeren Mengen für Hunde und besonders Katzen unverträglich sein – frische Blüten im Beet sind aber unproblematisch.",
  },
  methods: [
    {
      id: "m_lavendel_rueckschnitt",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED", "EFFECTIVE"],
      title: "Zweimal jährlich zurückschneiden",
      description:
        "Der wichtigste Pflegeschritt: Ohne Schnitt verkahlt Lavendel von unten und wird zum sparrigen Gestrüpp. Nie ins alte, blattlose Holz schneiden – daraus treibt er kaum wieder aus.",
      steps: [
        "Erster Schnitt nach der Blüte (August): Verblühtes plus ein Drittel des jungen Triebs kürzen",
        "Zweiter Schnitt im Frühjahr (März/April): kräftig um die Hälfte einkürzen",
        "Immer nur in den grünen, beblätterten Bereich schneiden",
        "Kompakte Halbkugel-Form anstreben",
      ],
      effort: "EASY",
      durationMin: 15,
      timeframe: "SEASONAL",
      ecoScore: 5,
      successRate: "HIGH",
      minExperience: "BEGINNER",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€",
    },
    {
      id: "m_lavendel_standort",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED"],
      title: "Durchlässig pflanzen – Staunässe vermeiden",
      description:
        "Lavendel stirbt fast immer an nassen Füßen, nicht an Frost. Ein magerer, durchlässiger Standort ist die halbe Miete.",
      steps: [
        "Vollsonnigen Platz wählen (mind. 6 Stunden Sonne)",
        "Schwere Böden mit Sand oder feinem Splitt abmagern",
        "Im Kübel Drainageschicht und Loch im Topfboden sicherstellen",
        "Sparsam und nur bei anhaltender Trockenheit gießen, nicht düngen",
      ],
      effort: "MEDIUM",
      durationMin: 30,
      timeframe: "SEASONAL",
      ecoScore: 5,
      successRate: "HIGH",
      minExperience: "BEGINNER",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€",
    },
  ],
  prevention: [
    "Nie ins alte Holz schneiden – Lavendel treibt daraus nur schwer wieder aus.",
    "Staunässe konsequent vermeiden; im Zweifel Boden mit Sand/Splitt magern.",
    "Nicht düngen – zu viele Nährstoffe machen weich und frostempfindlich.",
    "In rauen Lagen mit Reisig gegen Wintersonne und Kahlfrost schützen.",
  ],
  sources: [SOURCES.GPP, SOURCES.NABU, SOURCES.BZL],
  contentConfidence: "HIGH",
  version: CONTENT_VERSION,
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/c/c4/Vanessa_cardui_on_Lavandula_angustifolia-2459.jpg",
};
