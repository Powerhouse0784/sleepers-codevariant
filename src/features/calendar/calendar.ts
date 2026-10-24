/** Calendar logic. Everything on the grid is derived from your events, due dates and joined opportunities, plus a labelled sample schedule. Nothing here is stored. */
import type { Cell, HiveEvent } from "../../types/index";
import type { JoinMap, Opportunity } from "../actions/actions";

export type Cat = "workshop" | "challenge" | "meeting" | "idea" | "webinar";
export const CATS: Cat[] = ["workshop", "challenge", "meeting", "idea", "webinar"];
export const CAT_LABEL: Record<Cat, string> = { workshop: "Workshop", challenge: "Challenge", meeting: "Meeting", idea: "Idea", webinar: "Webinar" };
export const CAT_COLOR: Record<Cat, string> = { workshop: "#8B5CF6", challenge: "#14B8A6", meeting: "#2F8BFF", idea: "#EC4899", webinar: "#F59E0B" };
/** Event type used when you turn a sample entry into one of your own events. */
export const CAT_TYPE: Record<Cat, string> = { workshop: "Workshop", challenge: "Hackathon", meeting: "Meetup", idea: "Forum", webinar: "Conference" };
const TYPE_CAT: Record<string, Cat> = { Hackathon: "challenge", Workshop: "workshop", Meetup: "meeting", Networking: "meeting", Forum: "idea", Conference: "webinar" };

export type Src = "event" | "task" | "joined" | "sample";
export interface CalItem { id: string; title: string; short?: string; cat: Cat; start: number; end: number; allDay: boolean; where?: string; blurb?: string; src: Src; refId?: string }

export const DAY = 864e5;
export const startOfDay = (ms: number) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };
export const addDays = (ms: number, n: number) => { const d = new Date(ms); d.setDate(d.getDate() + n); return d.getTime(); };
export const addMonths = (ms: number, n: number) => { const d = new Date(ms); d.setDate(1); d.setMonth(d.getMonth() + n); return d.getTime(); };
export const sameDay = (a: number, b: number) => startOfDay(a) === startOfDay(b);
export const startOfWeek = (ms: number) => addDays(startOfDay(ms), -new Date(ms).getDay());
export const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const monthTitle = (ms: number) => new Date(ms).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
export const dayTitle = (ms: number) => new Date(ms).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
export const longDay = (ms: number) => new Date(ms).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
export const timeLabel = (ms: number) => new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
export const itemTime = (i: CalItem) => (i.allDay ? "All Day" : timeLabel(i.start));

/** 6-row-max month grid. Days outside the month are null so they render blank, as in the design. */
export function monthGrid(cursor: number): (number | null)[][] {
  const d = new Date(cursor); const y = d.getFullYear(), m = d.getMonth();
  const lead = new Date(y, m, 1).getDay(); const n = daysInMonth(y, m);
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: n }, (_, k) => new Date(y, m, k + 1).getTime())];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, r) => cells.slice(r * 7, r * 7 + 7));
}

/** Sample schedule: day-of-month, hour, minute, title, short chip label, category, place. Applied to last, this and next month so the demo always looks lived-in. */
type Tpl = [number, number, number, string, string, Cat, string?];
const SAMPLE: Tpl[] = [
  [2, 10, 0, "Design Workshop", "Design Workshop", "workshop", "Studio 2"], [3, 14, 0, "Hackathon Prep", "Hackathon Prep", "challenge", "Online"],
  [4, 11, 0, "Team Sync Meeting", "Team Sync", "meeting", "Online"], [6, 16, 0, "Idea Pitch Session", "Idea Pitch", "idea", "Online"],
  [9, 18, 0, "Webinar: Build Your Future", "Webinar", "webinar", "Online"], [11, -1, 0, "Challenge", "Challenge", "challenge", "Online"],
  [13, 15, 0, "Workshop", "Workshop", "meeting", "Innovation Lab"], [15, 11, 0, "Community Event", "Community Event", "workshop", "Community Hub"],
  [17, 17, 0, "Mentorship Program", "Mentorship", "idea", "Online"], [19, 19, 0, "Showcase", "Showcase", "webinar", "Main Hall"],
  [21, -1, 0, "Hackathon", "Hackathon", "challenge", "Campus"], [23, 16, 0, "Learning Session", "Learning Session", "meeting", "Online"],
  [25, 14, 0, "Design Review", "Design Review", "workshop", "Studio 2"], [27, 17, 0, "Idea Workshop", "Idea Workshop", "idea", "Online"],
  [30, 23, 59, "Final Submission", "Final Submission", "challenge", "Online"],
];
export function sampleItems(now: number): CalItem[] {
  const out: CalItem[] = [];
  for (const off of [-1, 0, 1]) {
    const base = new Date(addMonths(now, off)); const y = base.getFullYear(), m = base.getMonth(), n = daysInMonth(y, m);
    SAMPLE.forEach(([day, h, min, title, short, cat, where], k) => {
      if (day > n) return;
      const allDay = h < 0; const start = allDay ? new Date(y, m, day).getTime() : new Date(y, m, day, h, min).getTime();
      out.push({ id: `s-${y}-${m}-${k}`, title, short, cat, start, end: allDay ? start + DAY - 1 : start + 36e5, allDay, where, src: "sample", blurb: "Part of the sample schedule. Add it to your events to make it yours." });
    });
  }
  return out;
}

export interface Inputs { events: HiveEvent[]; cells: Cell[]; joined: JoinMap; opps: Opportunity[]; now: number }
export function buildItems({ events, cells, joined, opps, now }: Inputs): CalItem[] {
  const real: CalItem[] = [];
  for (const e of events) {
    if (e.archived) continue; const s = Date.parse(e.startsAt ?? e.date); if (Number.isNaN(s)) continue;
    const en = e.endsAt ? Date.parse(e.endsAt) : s + 36e5; const multi = !sameDay(s, en);
    real.push({ id: `e-${e.id}`, title: e.title, cat: TYPE_CAT[e.type] ?? "meeting", start: s, end: en, allDay: multi, where: e.venue, src: "event", refId: e.id, blurb: `${e.type}${e.tags?.length ? ` · ${e.tags.join(", ")}` : ""}` });
  }
  for (const c of cells) {
    if (c.archived || c.done || !c.dueAt || c.kind !== "action") continue; const s = Date.parse(c.dueAt); if (Number.isNaN(s)) continue;
    real.push({ id: `t-${c.id}`, title: c.title, cat: "meeting", start: s, end: s + 36e5, allDay: false, src: "task", refId: c.id, blurb: "Due date for an action you captured." });
  }
  for (const o of opps) {
    const r = joined[o.id]; if (!r || o.inDays === undefined) continue;
    const [hh, mm, ap] = (o.time ?? "9:00 AM").match(/(\d+):(\d+)\s*(AM|PM)/i)?.slice(1) ?? ["9", "0", "AM"];
    const d = new Date(startOfDay(now)); d.setDate(d.getDate() + o.inDays); d.setHours((Number(hh) % 12) + (ap.toUpperCase() === "PM" ? 12 : 0), Number(mm));
    real.push({ id: `j-${o.id}`, title: o.title, cat: o.kind === "challenge" ? "challenge" : "workshop", start: d.getTime(), end: d.getTime() + 36e5, allDay: false, where: "Action Center", src: "joined", refId: o.id, blurb: "You joined this from the Action Center." });
  }
  const taken = new Set(real.map((r) => `${r.title.toLowerCase()}|${startOfDay(r.start)}`));
  return [...real, ...sampleItems(now).filter((s) => !taken.has(`${s.title.toLowerCase()}|${startOfDay(s.start)}`))];
}
export const byTime = (a: CalItem, b: CalItem) => Number(b.allDay) - Number(a.allDay) || a.start - b.start || a.title.localeCompare(b.title);
export function itemsOn(all: CalItem[], day: number) {
  const s = startOfDay(day), e = s + DAY - 1;
  return all.filter((i) => i.start <= e && i.end >= s).sort(byTime);
}
export const matches = (i: CalItem, q: string) => { const t = q.trim().toLowerCase(); return !t || `${i.title} ${i.where ?? ""} ${CAT_LABEL[i.cat]}`.toLowerCase().includes(t); };
export const upcoming = (all: CalItem[], now: number, n = 5) => all.filter((i) => i.end >= now).sort((a, b) => a.start - b.start || a.title.localeCompare(b.title)).slice(0, n);
export const past = (all: CalItem[], now: number) => all.filter((i) => i.end < now).sort((a, b) => b.start - a.start);
export const isPast = (i: CalItem, now: number) => i.end < now;
export function tileParts(ms: number) { const d = new Date(ms); return { d: String(d.getDate()).padStart(2, "0"), m: d.toLocaleDateString("en-GB", { month: "short" }) }; }
