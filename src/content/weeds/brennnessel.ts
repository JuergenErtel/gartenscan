import type { ContentEntry } from "@/domain/types";
import { CONTENT_VERSION, SOURCES } from "../_shared";

export const brennnessel: ContentEntry = {
  id: "weed_brennnessel",
  category: "WEED",
  name: "Große Brennnessel",
  scientificName: "Urtica dioica",
  aliases: ["Nessel", "Haarnessel"],
  description:
    "Im Volksmund lästiges Unkraut, für Naturgärtner jedoch eine der wertvollsten Pflanzen: Raupenfutter für über 30 Schmetterlingsarten, Proteinlieferant, Düngerpflanze (Jauche), Heilpflanze. Die Kontroverse zwischen Nutzen und 'Unkraut' entscheidet sich am Standort.",
  traits: [
    "Herzförmige, gesägte Blätter mit Brennhaaren",
    "Gegenständige Blattstellung am vierkantigen Stängel",
    "Unscheinbare grünliche Blüten in hängenden Rispen",
    "Wächst 50–150 cm hoch",
    "Oberirdische Ausläufer + feine Wurzeln",
  ],
  significance: "NUISANCE",
  defaultUrgency: "MONITOR",
  habitat:
    "Stickstoffreiche Böden, Kompostränder, Zaun- und Wegränder, feuchte Halbschatten",
  seasons: ["SPRING", "SUMMER", "AUTUMN"],
  areas: ["GARDEN", "BED"],
  confusionRisk: [
    {
      name: "Taubnessel (Lamium-Arten)",
      note: "Ähnliche Blattform, aber OHNE Brennhaare. Lippenblüten, rosa bis weiß.",
    },
  ],
  safety: {
    toxicToChildren: false,
    toxicToPets: [],
    allergyRisk: true,
    invasive: false,
    notes:
      "Brennhaare verursachen schmerzhafte, juckende Quaddeln auf der Haut. Beim Entfernen unbedingt Handschuhe und lange Kleidung tragen. Nach kurzem Welken (10 Min) brennen die Haare nicht mehr – dann essbar.",
  },
  methods: [
    {
      id: "m_ausreissen",
      type: "MECHANICAL",
      style: ["ORGANIC", "BALANCED", "EFFECTIVE"],
      title: "Mit Handschuhen ausreißen – vor der Samenbildung",
      description:
        "Einfachste Methode bei kleinem bis mittlerem Bestand. Wichtig: Wurzeln mitentfernen und vor Juli arbeiten (bevor Samen reifen).",
      steps: [
        "Dicke Gartenhandschuhe und lange Ärmel anziehen",
        "Pflanzen bodennah greifen und mit ganzer Wurzel herausziehen",
        "Ausläufer mit Grabegabel lockern, damit nichts zurückbleibt",
        "Entfernte Pflanzen für Brennnesseljauche sammeln oder im Kompost liegen lassen (welken sie ab, sind sie unschädlich)",
      ],
      effort: "EASY",
      durationMin: 20,
      timeframe: "NOW",
      ecoScore: 5,
      successRate: "HIGH",
      minExperience: "BEGINNER",
      safeForChildren: false,
      safeForPets: true,
      costEur: "€",
    },
    {
      id: "m_jauche",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED"],
      title: "Brennnesseljauche als Dünger und Schädlingsabwehr",
      description:
        "Entfernte Brennnesseln werden zu einer der wertvollsten Pflanzenstärkungsmittel. Klassischer Bio-Hack.",
      steps: [
        "1 kg frische Brennnesseln in 10 l Wasser geben (Regenwasser ideal)",
        "In offenem Plastik- oder Holzgefäß (nicht Metall) stehen lassen",
        "Täglich umrühren, 10–14 Tage gären lassen bis Schaumbildung endet",
        "Durchsieben und 1:10 verdünnen für Beetbewässerung",
        "Unverdünnt und stärker verdünnt gegen Blattläuse spritzen",
      ],
      effort: "EASY",
      durationMin: 30,
      timeframe: "SEASONAL",
      ecoScore: 5,
      successRate: "HIGH",
      minExperience: "INTERMEDIATE",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€",
      ingredients: ["Frische Brennnesseln 1 kg", "Wasser (Regen) 10 l"],
    },
    {
      id: "m_schmetterlingsecke",
      type: "CULTURAL",
      style: ["ORGANIC"],
      title: "Schmetterlings-Ecke anlegen",
      description:
        "Brennnesseln sind Raupenfutterpflanzen für Tagpfauenauge, Kleiner Fuchs, Landkärtchen und C-Falter. Eine gezielte Ecke = Beitrag zum Naturschutz.",
      steps: [
        "Sonnige bis halbschattige Ecke (mind. 2 m²) ausweisen",
        "Dort Brennnesseln stehen lassen",
        "Vom Hauptgarten durch Wurzelsperre abgrenzen (30 cm tief)",
        "Im Spätsommer abmähen, nachdem Raupen sich verpuppt haben",
      ],
      effort: "EASY",
      durationMin: 45,
      timeframe: "SEASONAL",
      ecoScore: 5,
      successRate: "HIGH",
      minExperience: "BEGINNER",
      safeForChildren: false,
      safeForPets: true,
      costEur: "€",
    },
  ],
  prevention: [
    "Böden nicht übermäßig mit Stickstoff düngen – Brennnesseln lieben Stickstoff-Überschuss.",
    "Offene Bodenstellen zügig bepflanzen oder mulchen.",
    "Kompostränder sauber halten und Kompost dicht abdecken.",
    "Bei Aussaatflächen: Brennnessel-Samen im Boden keimen bei Licht – daher mit Mulchfolie arbeiten.",
  ],
  sources: [SOURCES.NABU, SOURCES.GPP],
  contentConfidence: "HIGH",
  version: CONTENT_VERSION,
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/d/da/Brennnessel.jpg",
};
