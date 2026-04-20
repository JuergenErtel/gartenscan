import type { AnalyticsPayload, EventName } from "./events";

export interface AnalyticsTracker {
  readonly name: string;
  track(event: EventName, payload?: AnalyticsPayload): void;
  identify(userId: string, traits?: AnalyticsPayload): void;
}

class ConsoleTracker implements AnalyticsTracker {
  readonly name = "console";
  track(event: EventName, payload?: AnalyticsPayload): void {
    if (process.env.NODE_ENV === "production") return;
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${event}`, payload ?? {});
  }
  identify(userId: string, traits?: AnalyticsPayload): void {
    if (process.env.NODE_ENV === "production") return;
    // eslint-disable-next-line no-console
    console.log(`[analytics] identify ${userId}`, traits ?? {});
  }
}

let tracker: AnalyticsTracker | null = null;

export function getTracker(): AnalyticsTracker {
  if (!tracker) tracker = new ConsoleTracker();
  return tracker;
}

// Convenience helper with client/server safe defaults
export function track(event: EventName, payload?: AnalyticsPayload): void {
  getTracker().track(event, payload);
}
