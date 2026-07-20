import { describe, it, expect } from "vitest";
import { buildHistory } from "@/lib/coach/history";
import type { CoachMessage } from "@/lib/types";

function msg(id: string, role: "user" | "assistant", content = id): CoachMessage {
  return { id, role, content, createdAt: new Date("2026-07-20T00:00:00Z") };
}

describe("buildHistory", () => {
  it("laesst die Begruessung weg", () => {
    const history = buildHistory([msg("greeting", "assistant"), msg("1", "user")]);
    expect(history).toEqual([{ role: "user", content: "1" }]);
  });

  it("laesst lokale Fehlermeldungen weg", () => {
    const history = buildHistory([
      msg("1", "user"),
      msg("error-123", "assistant", "Netzwerkfehler"),
      msg("2", "user"),
    ]);
    expect(history.map((t) => t.content)).toEqual(["1", "2"]);
  });

  it("beginnt immer mit einer user-Nachricht", () => {
    // 12 echte Turns: nach slice(-10) stuende sonst eine Assistant-Antwort vorne,
    // was Anthropic mit 400 ablehnt.
    const lang: CoachMessage[] = [msg("greeting", "assistant")];
    for (let i = 1; i <= 6; i += 1) {
      lang.push(msg(`u${i}`, "user"));
      lang.push(msg(`a${i}`, "assistant"));
    }
    lang.push(msg("u7", "user"));

    const history = buildHistory(lang);
    expect(history[0].role).toBe("user");
    expect(history[history.length - 1].role).toBe("user");
    expect(history.length).toBeLessThanOrEqual(10);
  });

  it("gibt bei reinem Fehler-Verlauf nichts zurueck", () => {
    const history = buildHistory([
      msg("greeting", "assistant"),
      msg("error-1", "assistant", "Netzwerkfehler"),
    ]);
    expect(history).toEqual([]);
  });
});
