import type { CoachMessage } from "@/lib/types";

export const COACH_SUGGESTIONS = [
  "Was blüht gerade im April?",
  "Welcher Dünger für meine Rosen?",
  "Schnelle Schatten-Ideen für die Terrasse",
  "Ist mein Boden zu sauer?",
  "Wann Tomaten rausstellen?",
  "Giftige Pflanzen für Kinder",
];

export const COACH_INITIAL: CoachMessage[] = [
  {
    id: "m0",
    role: "assistant",
    content:
      "Guten Morgen, Jürgen. Ich sehe, deine Rose kämpft gerade mit Blattläusen und deine Hortensie zeigt erste Mehltau-Zeichen. Soll ich dir einen Plan für die nächsten 7 Tage zusammenstellen – oder hast du eine andere Frage?",
    createdAt: new Date(),
    citations: ["plant_rose", "plant_hortensie"],
  },
];

// Pre-scripted mock responses keyed by loose keyword matching
export const COACH_RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ["blüht", "april", "jahreszeit"],
    response:
      "Im April blühen bei dir im Münchner Raum typischerweise: Forsythie (bereits am Ende), Magnolien (Hochsaison), Zierkirschen, Narzissen, Tulpen und die ersten Flieder-Sorten. Deine Hortensie braucht noch 6–8 Wochen. Wenn du Farbe willst: Vergissmeinnicht und Stiefmütterchen sind jetzt perfekt zum Pflanzen.",
  },
  {
    keywords: ["dünger", "rose", "düngen"],
    response:
      "Für deine Edelrose 'Nostalgie' empfehle ich einen organischen Rosendünger, dreimal pro Saison: Anfang April (jetzt!), Mitte Juni nach der ersten Blüte, und Ende Juli. Wichtig: Ab Mitte August nicht mehr düngen – die Pflanze muss für den Winter aushärten. Hornspäne sind eine günstige Dauerdüngung für den Unterbau.",
  },
  {
    keywords: ["schatten", "terrasse"],
    response:
      "Schnelle Schatten-Ideen für deine Terrasse: 1) Segeltuchsonnensegel (3×4m, ca. 80€, aufhängen in 30 Min), 2) Kletterpflanzen an Rankhilfen – Clematis oder Waldrebe wachsen schnell und blühen, 3) Kübel mit Fächerahorn als lebender Schattenspender. Willst du permanente oder temporäre Lösung?",
  },
  {
    keywords: ["boden", "sauer", "ph"],
    response:
      "Um das herauszufinden: Kauf einen pH-Teststreifen (ca. 8€, Baumarkt). Misch eine Bodenprobe mit destilliertem Wasser, warte 1 Stunde, teste. Für deine Hortensie wäre pH 5,5 perfekt (sauer = blaue Blüten), für Rosen eher 6,5 (neutral). Ich kann dir auch anbieten, die Analyse mit einem Foto der Bodenprobe zu versuchen – interessiert?",
  },
  {
    keywords: ["tomate", "rausstellen", "pflanzen"],
    response:
      "Klassische Gärtnerregel: Nach den Eisheiligen (11.–15. Mai). Da du in einer Zone 8a wohnst, kannst du es ab 10. Mai riskieren – aber halte eine Vlieshaube bereit. Ich warne dich, falls Nachtfrost kommt. Deine Harzfeuer ist robust, aber unter 5°C nachts leidet sie.",
  },
  {
    keywords: ["giftig", "kinder", "haustier"],
    response:
      "Wichtige Warnung: In deinem Garten solltest du im Blick haben – Hortensie (leicht giftig bei Verzehr größerer Mengen), später Eibe falls vorhanden (sehr giftig, Nadeln und Samen). Relativ sicher sind dagegen Lavendel, Rosen (Stacheln!), Basilikum, Apfelbaum. Ich zeige dir gern eine vollständige Karte für deinen Garten – Premium-Feature.",
  },
];

export function findCoachResponse(query: string): string {
  const lower = query.toLowerCase();
  const match = COACH_RESPONSES.find((r) =>
    r.keywords.some((k) => lower.includes(k))
  );
  if (match) return match.response;
  return "Das ist eine gute Frage. Ich brauche dafür etwas mehr Kontext – kannst du mir ein Foto schicken oder sagen, um welche Pflanze es konkret geht? Dann kann ich dir eine fundierte Antwort geben.";
}
