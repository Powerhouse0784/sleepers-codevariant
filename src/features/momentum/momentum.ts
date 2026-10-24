import type { Kind } from "@/types";

export type MomentumState = "hot" | "warm" | "cooling" | "cold";
export type MomentumResult = {
  state: MomentumState;
  ageInDays: number;
  heat: number; // 0..1, smooth visual fade only; state comes from thresholds
  reason: string;
  suggestedAction: string;
};

// Non-overlapping policy, configurable in ONE place (hours since last meaningful activity).
export const THRESHOLDS_HOURS = { hot: 72, warm: 168, cooling: 720 } as const;

const GUIDANCE: Record<Kind, Record<MomentumState, string>> = {
  idea: {
    hot: "Capture the thought and pick a first step.",
    warm: "Make the next step concrete.",
    cooling: "Continue, reschedule, or deliberately pause.",
    cold: "Review it: revive, remix, or archive.",
  },
  person: {
    hot: "Send a quick thank-you while they remember you.",
    warm: "Follow up with what you promised.",
    cooling: "Check in with some context from the event.",
    cold: "Reconnect, or decide they are no longer relevant.",
  },
  note: {
    hot: "Turn this note into an idea or an action.",
    warm: "Link it to a person or a next step.",
    cooling: "Revisit it and decide what it becomes.",
    cold: "Review it: keep, convert, or archive.",
  },
  action: {
    hot: "Start it while the context is fresh.",
    warm: "Do the smallest next piece today.",
    cooling: "Finish it, reschedule it, or let it go.",
    cold: "Revive with a new first step, or archive.",
  },
};

export function getMomentum(
  item: { kind: Kind; createdAt: string; lastMeaningfulActivityAt: string },
  nowMs: number = Date.now(),
): MomentumResult {
  const last = Date.parse(item.lastMeaningfulActivityAt) || Date.parse(item.createdAt);
  const hours = Math.max(0, (nowMs - last) / 36e5);
  const state: MomentumState =
    hours < THRESHOLDS_HOURS.hot ? "hot"
    : hours < THRESHOLDS_HOURS.warm ? "warm"
    : hours < THRESHOLDS_HOURS.cooling ? "cooling"
    : "cold";
  const ageInDays = Math.floor(hours / 24);
  const heat = Math.min(1, Math.max(0.08, 1 - hours / THRESHOLDS_HOURS.cooling));
  const reason =
    hours < 1 ? "Updated in the last hour."
    : hours < 48 ? `No meaningful update in ${Math.floor(hours)} hours.`
    : `No meaningful update in ${ageInDays} days.`;
  return { state, ageInDays, heat, reason, suggestedAction: GUIDANCE[item.kind][state] };
}

export const STATE_LABEL: Record<MomentumState, string> = { hot: "Hot", warm: "Warm", cooling: "Cooling", cold: "Cold" };
export const STATE_RANGE: Record<MomentumState, string> = { hot: "under 3 days", warm: "3 to 7 days", cooling: "1 to 4 weeks", cold: "30+ days" };
