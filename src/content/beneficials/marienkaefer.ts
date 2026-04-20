import type { ContentEntry } from "@/domain/types";
import { CONTENT_VERSION, SOURCES } from "../_shared";

export const marienkaefer: ContentEntry = {
  id: "beneficial_marienkaefer",
  category: "BENEFICIAL",
  name: "Siebenpunkt-Marienkäfer",
  scientificName: "Coccinella septempunctata",
  aliases: ["Marienkäfer", "Glückskäfer", "Herrgottskäfer"],
  description:
    "Der wohl bekannteste Nützling in deutschen Gärten. Sowohl Larve als auch Käfer fressen große Mengen an Blattläusen – eine einzige Larve bis zu 400 Blattläuse während ihrer Entwicklung. Geschützte Art, nicht bekämpfen.",
  traits: [
    "Halbkugelförmiger Käfer, 5–8 mm, rot mit 7 schwarzen Punkten",
    "Larven: schwarz-orange, 8–12 mm lang, 'krokodilförmig'",
    "Eier: orange-gelbe Gelege an Blattunterseiten, meist nahe Blattlauskolonien",
    "Puppe: orange, hängt an Blatt oder Stängel",
  ],
  significance: "BENEFIT",
  defaultUrgency: "GONE",
  habitat: "Überall dort, wo Blattläuse sind: Rosen, Obstbäume, Gemüsebeete, Büsche",
  seasons: ["SPRING", "SUMMER", "AUTUMN"],
  areas: ["GARDEN", "BED", "BALCONY", "TERRACE", "POTS"],
  confusionRisk: [
    {
      name: "Asiatischer Marienkäfer (Harmonia axyridis)",
      note: "Eingewanderte Art, ähnlich aber variabler in Farbe (gelb bis dunkelrot, 0–19 Punkte). Nützlich, aber verdrängt teilweise heimische Arten.",
    },
    {
      name: "Kartoffelkäfer-Larven",
      note: "Orange-gelb, rundlich. KEIN Nützling, schädigen Kartoffelpflanzen.",
    },
  ],
  safety: {
    toxicToChildren: false,
    toxicToPets: [],
    allergyRisk: false,
    invasive: false,
    notes:
      "Völlig ungefährlich. Käfer können bei Bedrohung gelbe Körperflüssigkeit absondern (Reflexbluten), die gelbe Flecken hinterlässt – harmlos.",
  },
  methods: [
    {
      id: "m_nichts_tun",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED", "EFFECTIVE"],
      title: "Einfach da lassen – sie tun den Job für dich",
      description:
        "Marienkäfer brauchen keine Maßnahme. Sie sind der natürliche Feind deiner Blattläuse. Wenn du sie siehst: Freu dich und lass sie arbeiten.",
      steps: [
        "Nicht anfassen oder umsiedeln",
        "Keine Insektizide in deren Umgebung einsetzen",
        "Larven und Eier NICHT wegwischen – das ist die nächste Generation",
      ],
      effort: "EASY",
      durationMin: 0,
      timeframe: "NOW",
      ecoScore: 5,
      successRate: "HIGH",
      minExperience: "BEGINNER",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€",
    },
    {
      id: "m_lebensraum",
      type: "CULTURAL",
      style: ["ORGANIC", "BALANCED"],
      title: "Überwinterungsplätze schaffen",
      description:
        "Damit Marienkäfer in deinem Garten bleiben und sich vermehren: biete Winterquartiere. Das verdoppelt die Population über Jahre.",
      steps: [
        "Herbstlaub unter Sträuchern liegen lassen",
        "Totholzecke einrichten (Äste, Rindenstücke gestapelt)",
        "Insektenhotel mit Kiefernzapfen und Rindenmulch",
        "Stauden nicht komplett im Herbst zurückschneiden",
      ],
      effort: "EASY",
      durationMin: 45,
      timeframe: "SEASONAL",
      ecoScore: 5,
      successRate: "HIGH",
      minExperience: "BEGINNER",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€",
    },
    {
      id: "m_pflanzen",
      type: "CULTURAL",
      style: ["ORGANIC"],
      title: "Pollen- und Nektarpflanzen setzen",
      description:
        "Erwachsene Marienkäfer brauchen auch Pollen. Diese Pflanzen ziehen sie magisch an.",
      steps: [
        "Doldenblütler pflanzen: Dill, Fenchel, Koriander, Wilde Möhre",
        "Kapuzinerkresse als Lockpflanze für Blattläuse (→ Marienkäfer folgen)",
        "Ringelblumen und Schafgarbe ergänzen",
        "Mindestens 3 verschiedene Arten, verteilt über die Saison blühend",
      ],
      effort: "MEDIUM",
      durationMin: 90,
      timeframe: "SEASONAL",
      ecoScore: 5,
      successRate: "HIGH",
      minExperience: "BEGINNER",
      safeForChildren: true,
      safeForPets: true,
      costEur: "€€",
    },
  ],
  prevention: [
    "Keine Insektizide einsetzen – auch 'sanfte' Mittel schaden Marienkäfern oft stärker als Zielschädlingen.",
    "Im Frühjahr nicht zu früh aufräumen – Marienkäfer überwintern im Laub.",
    "Auf Kinder achten: Marienkäfer fühlen sich 'süß' an, aber bitte nicht einsammeln oder umsiedeln.",
  ],
  sources: [SOURCES.NABU, SOURCES.JKI],
  contentConfidence: "HIGH",
  version: CONTENT_VERSION,
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/6/60/Coccinella.7-punctata.adult.jpg",
};
