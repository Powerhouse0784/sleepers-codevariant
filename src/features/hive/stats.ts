import { getMomentum } from "@/features/momentum/momentum";
import type { Cell } from "@/types";

const DAY = 864e5;
export const activeCells = (cells: Cell[]) => cells.filter((c) => !c.archived && !c.done);

/** Share of active items that are hot or warm. */
export function warmth(cells: Cell[], now: number) {
  const a = activeCells(cells); if (!a.length) return 0;
  return Math.round((a.filter((c) => { const s = getMomentum(c, now).state; return s === "hot" || s === "warm"; }).length / a.length) * 100);
}
/** Average heat of active items, 0..100. */
export function health(cells: Cell[], now: number) {
  const a = activeCells(cells); if (!a.length) return 0;
  return Math.round((a.reduce((n, c) => n + getMomentum(c, now).heat, 0) / a.length) * 100);
}
export const healthLabel = (h: number) => (h >= 70 ? "Thriving" : h >= 50 ? "Buzzing" : h >= 30 ? "Cooling" : "Needs love");

/** Consecutive days with at least one logged update. Yesterday counts if today is still empty, so it never punishes a quiet morning. */
export function streak(cells: Cell[], now: number) {
  const days = new Set(cells.flatMap((c) => c.log.map((l) => Date.parse(l.at))).filter((t) => t <= now).map((t) => new Date(t).toDateString()));
  let d = now; if (!days.has(new Date(d).toDateString())) d -= DAY;
  let n = 0; while (days.has(new Date(d).toDateString())) { n++; d -= DAY; }
  return { n, last7: Array.from({ length: 7 }, (_, i) => days.has(new Date(now - (6 - i) * DAY).toDateString())) };
}

const LEVELS: [string, number][] = [["Larva", 0], ["Worker", 3], ["Forager", 8], ["Guardian", 15], ["Queen", 30]];
/** Rank grows with follow-through: steps logged, revivals, completions, follow-ups. Not with app opens. */
export function rank(cells: Cell[]) {
  const pts = cells.reduce((n, c) => n + c.log.filter((l) => /^(Revived|Step|Marked done|Follow-up)/.test(l.text)).length, 0);
  let i = 0; LEVELS.forEach(([, at], k) => { if (pts >= at) i = k; });
  const next = LEVELS[i + 1];
  return { name: LEVELS[i][0], pts, next: next && { name: next[0], at: next[1] }, pct: next ? ((pts - LEVELS[i][1]) / (next[1] - LEVELS[i][1])) * 100 : 100 };
}

/** Warmth for each of the last `days` days, rebuilt from each item's own history. */
export function warmthSeries(cells: Cell[], now: number, days = 14) {
  return Array.from({ length: days }, (_, k) => {
    const t = now - (days - 1 - k) * DAY;
    const alive = activeCells(cells).filter((c) => Date.parse(c.createdAt) <= t);
    if (!alive.length) return 0;
    const warm = alive.filter((c) => {
      const past = c.log.map((l) => Date.parse(l.at)).filter((x) => x <= t);
      const last = past.length ? Math.max(...past) : Date.parse(c.createdAt);
      const s = getMomentum({ kind: c.kind, createdAt: c.createdAt, lastMeaningfulActivityAt: new Date(last).toISOString() }, t).state;
      return s === "hot" || s === "warm";
    }).length;
    return Math.round((warm / alive.length) * 100);
  });
}

export type Smart = "overdue" | "promises" | "followup" | "pinned";
export const SMART: { k: Smart; l: string }[] = [{ k: "overdue", l: "Overdue" }, { k: "promises", l: "Promises" }, { k: "followup", l: "Needs follow-up" }, { k: "pinned", l: "Pinned" }];
export function matchSmart(c: Cell, k: Smart, now: number) {
  if (k === "overdue") return c.kind === "action" && !!c.dueAt && Date.parse(c.dueAt) < now;
  if (k === "promises") return !!c.note?.startsWith("Promised");
  if (k === "followup") return c.kind === "person" && getMomentum(c, now).state !== "hot";
  return !!c.pinned;
}
export const FACTS = [
  "A honeybee can visit up to 2,000 flowers in a single day.",
  "Bees keep the brood nest around 35 °C. You keep your ideas warm.",
  "Bees share directions to flowers with a waggle dance.",
  "A worker bee makes about a twelfth of a teaspoon of honey in her lifetime.",
  "A healthy hive can hold tens of thousands of bees. Small steps add up.",
  "Bees cluster together in winter and take turns staying warm.",
];
