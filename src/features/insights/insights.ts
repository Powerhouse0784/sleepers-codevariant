import { getMomentum, type MomentumState } from "@/features/momentum/momentum";
import type { Cell, HiveEvent, Kind } from "@/types";

export type InsightAction = { type: "open"; id: string } | { type: "filter"; kind?: Kind; eventId?: string; state?: MomentumState } | null;
export type Insight = { key: "focus" | "trend" | "attention" | "positive"; label: string; text: string; action: InsightAction };
const DAY = 864e5;

/** Plain rules over your own data. No model involved. */
export function getInsights(cells: Cell[], events: HiveEvent[], now: number): Insight[] {
  const active = cells.filter((c) => !c.archived && !c.done);
  const st = (c: Cell) => getMomentum(c, now).state;

  const needy = active.filter((c) => c.kind === "person" && st(c) !== "hot");
  const byEvent = new Map<string, number>(); needy.forEach((c) => byEvent.set(c.eventId, (byEvent.get(c.eventId) ?? 0) + 1));
  const top = [...byEvent.entries()].sort((a, b) => b[1] - a[1])[0];
  const topEvent = top && events.find((e) => e.id === top[0]);
  const focus: Insight = top && topEvent
    ? { key: "focus", label: "Top Focus", text: `Follow up with ${top[1]} ${top[1] === 1 ? "person" : "people"} from ${topEvent.title}`, action: { type: "filter", kind: "person", eventId: topEvent.id } }
    : { key: "focus", label: "Top Focus", text: "No follow-ups waiting. Capture someone you met.", action: null };

  const idea = active.filter((c) => c.kind === "idea").sort((a, b) => getMomentum(b, now).heat - getMomentum(a, now).heat)[0];
  const trend: Insight = idea ? { key: "trend", label: "Trending Idea", text: idea.title, action: { type: "open", id: idea.id } } : { key: "trend", label: "Trending Idea", text: "No ideas yet. Capture the first one.", action: null };

  const overdue = active.filter((c) => c.kind === "action" && c.dueAt && Date.parse(c.dueAt) < now);
  const attention: Insight = overdue.length
    ? { key: "attention", label: "Needs Attention", text: `${overdue.length} ${overdue.length === 1 ? "action is" : "actions are"} overdue`, action: { type: "open", id: overdue[0].id } }
    : { key: "attention", label: "Needs Attention", text: "Nothing is overdue. Nice.", action: null };

  const logs = cells.flatMap((c) => c.log.map((l) => Date.parse(l.at)));
  const cur = logs.filter((t) => now - t < 7 * DAY && t <= now).length, prev = logs.filter((t) => now - t >= 7 * DAY && now - t < 14 * DAY).length;
  const pct = prev >= 3 ? Math.round(((cur - prev) / prev) * 100) : null;
  const text = pct === null ? `You logged ${cur} ${cur === 1 ? "update" : "updates"} this week` : pct >= 0 ? `Your activity is up ${Math.min(pct, 999)}% vs last week!` : `Activity is down ${-pct}% vs last week. One small step helps.`;
  return [focus, trend, attention, { key: "positive", label: "Positive Momentum", text, action: null }];
}
