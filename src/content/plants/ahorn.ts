import type { ContentEntry } from "@/domain/types";
import { CONTENT_VERSION, SOURCES } from "../_shared";

export const ahorn: ContentEntry = {
  id: "plant_ahorn",
  category: "PLANT",
  name: "Ahorn",
  scientificName: "Acer pseudoplatanus",
  aliases: ["Bergahorn", "Spitzahorn", "Feldahorn", "Acer"],
  description:
    "Sammelbegriff für die Gattung Acer. In deutschen Gärten kommen vor allem Berg-, Spitz- und Feldahorn vor – plus zahlreiche Zierformen (Fächerahorn, Rotahorn). Robuste Baumart, wertvoll als Bienenweide im Frühjahr und durch farbintensives Herbstlaub.",
  traits: [
    "Gegenständige, meist 5-lappige Blätter (artabhängig)",
    "Geflügelte Doppelfrüchte ('Nasenzwicker') im Herbst",
    "Sommergrün, oft leuchtende Herbstfärbung",
    "Glatte bis grobe, abblätternde Rinde je nach Art",
    "Höhe stark sortenabhängig: 3 m (Fächerahorn) bis 30 m (Bergahorn)",
  ],
  significance: "BENEFIT",
  defaultUrgency: "GONE",
  habitat: "Sonnig bis halbschattig, frischer humoser Boden, frostfest",
  seasons: ["SPRING", "SUMMER", "AUTUMN"],
  areas: ["GARDEN"],
  confusionRisk: [
    {
      name: "Platane (Platanus)",
      note: "Ähnliche Blattform, aber wechselständig statt gegenständig und mit Borkenmuster.",
    },
    {
      name: "Eschenahorn (Acer negundo)",
      note: "Fiederblättrig statt gelappt – sieht eher wie eine Esche aus, ist aber ein Ahorn.",
    },
  ],
  safety: {
    toxicToChildren: false,
    toxicToPets: ["OTHER"],
    allergyRisk: false,
    invasive: false,
    notes:
      "Bergahorn-Samen können bei Pferden die schwere 'Atypische Weidemyopathie' auslösen. In Weidenähe Samen einsammeln. Für Menschen und Hunde/Katzen unbedenklich.",
  },
  methods: [
    {
      id: "m_ahorn_schnitt",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED"],
      title: "Form- und Erhaltungsschnitt",
      description:
        "Ahorn 'blutet' stark, wenn man im Frühjahr schneidet. Schnittzeit zwingt das Vorgehen, nicht die Optik.",
      steps: [
        "Schnitt im Sommer (Juli/August) nach dem Saftstrom",
        "Niemals im Februar bis April – Schnittwunden bluten wochenlang",
        "Nur tote, kreuzende oder zu dichte Triebe entfernen",
        "Bei Zierahornen (Fächerahorn) möglichst gar nicht schneiden",
        "Werkzeug scharf und desinfiziert verwenden",
      ],
      effort: "MEDIUM",
      durationMin: 45,
      timeframe: "SEASONAL",
      ecoScore: 5,
      successRate: "HIGH",
      minExperience: "INTERMEDIATE",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€",
    },
    {
      id: "m_ahorn_giessen",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED"],
      title: "Junge Bäume in Trockenphasen wässern",
      description:
        "Ahorn ist tiefwurzelnd und trockenheitsverträglich – aber in den ersten 3 Jahren nach Pflanzung empfindlich.",
      steps: [
        "Junge Bäume in heißen Sommermonaten alle 7–10 Tage durchdringend wässern",
        "20–30 Liter pro Gabe, direkt in den Wurzelbereich",
        "Mulchen mit Rindenhumus reduziert Verdunstung",
        "Nicht über Blätter gießen – Sonnenbrand-Risiko",
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
  ],
  prevention: [
    "Standort mit Bedacht wählen: ausgewachsene Bergahorne werden 25–30 m hoch.",
    "Mindestabstand zur Hauswand 5 m, sonst Schäden durch Wurzeln möglich.",
    "Bei Pferdeweide Samen im Herbst und Frühjahr regelmäßig einsammeln.",
    "Zierformen (Fächerahorn) windgeschützt setzen, frische Triebe sind empfindlich.",
  ],
  sources: [SOURCES.NABU, SOURCES.LFL],
  contentConfidence: "MEDIUM",
  version: CONTENT_VERSION,
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/d/d6/Acer_pseudoplatanus_001.jpg",
};
