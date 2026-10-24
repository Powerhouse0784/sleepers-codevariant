import { getMomentum } from "@/features/momentum/momentum";
import type { Cell, HiveEvent, Kind } from "@/types";

export type Cta = { label: string; kind: "open" | "capture" | "go"; id?: string; href?: string; capture?: Kind };
export type Suggestion = { id: string; text: string; why: string; cta: Cta };

const DAY = 864e5, HOUR = 36e5;
const first = (t: string) => t.split(" (")[0];
const rel = (ms: number) => {
  const h = Math.abs(ms) / HOUR; if (h < 24) return `${Math.max(1, Math.round(h))}h`; const d = Math.round(h / 24); return `${d} ${d === 1 ? "day" : "days"}`; };

/** Rule-based, explainable suggestions. Order follows the blueprint: promises, due dates, events, cooling ideas. */
export function getSuggestions(cells: Cell[], events: HiveEvent[], now: number): Suggestion[] {
  const out: Suggestion[] = [];
  const active = cells.filter((c) => !c.archived && !c.done);
  const st = (c: Cell) => getMomentum(c, now).state;

  active.filter((c) => c.kind === "action" && c.dueAt && Date.parse(c.dueAt) < now).forEach((c) =>
    out.push({ id: `overdue:${c.id}`, text: `"${c.title}" was due ${rel(now - Date.parse(c.dueAt!))} ago. Want to knock it out?`, why: "You set a due date and it has passed. Promises come first.", cta: { label: "Open it", kind: "open", id: c.id } }));
  active.filter((c) => c.kind === "action" && c.dueAt && Date.parse(c.dueAt) >= now && Date.parse(c.dueAt) - now < DAY).forEach((c) =>
    out.push({ id: `soon:${c.id}`, text: `"${c.title}" is due in ${rel(Date.parse(c.dueAt!) - now)}. A good one to finish today.`, why: "It is due within 24 hours.", cta: { label: "Open it", kind: "open", id: c.id } }));
  events.filter((e) => e.startsAt && Date.parse(e.startsAt) > now && Date.parse(e.startsAt) - now < 3 * DAY).forEach((e) =>
    out.push({ id: `event:${e.id}`, text: `${e.title} is in ${rel(Date.parse(e.startsAt!) - now)}. Jot down one thing you want from it.`, why: "An event starts within 3 days. Intent written down beforehand makes the debrief easier.", cta: { label: "Capture a note", kind: "capture", capture: "note" } }));
  active.filter((c) => c.kind === "person" && c.note?.startsWith("Promised") && st(c) !== "hot").forEach((c) =>
    out.push({ id: `promise:${c.id}`, text: `You promised ${first(c.title)}: ${c.note!.replace("Promised: ", "")}`, why: "You recorded a promise and it has been more than 3 days.", cta: { label: "Open contact", kind: "open", id: c.id } }));
  active.filter((c) => c.kind === "idea" && ["cooling", "cold"].includes(st(c))).forEach((c) =>
    out.push({ id: `idea:${c.id}`, text: `"${c.title}" is ${st(c)}. Pick one tiny next step to bring it back.`, why: getMomentum(c, now).reason, cta: { label: "Revive it", kind: "open", id: c.id } }));
  active.filter((c) => c.kind === "person" && ["cooling", "cold"].includes(st(c))).forEach((c) =>
    out.push({ id: `reconnect:${c.id}`, text: `It has been a while since you talked to ${first(c.title)}. A short check-in goes a long way.`, why: getMomentum(c, now).reason, cta: { label: "Open contact", kind: "open", id: c.id } }));
  out.push({ id: "capture", text: "Anything on your mind from the last event? Capture it while it is fresh.", why: "Quick capture keeps ideas from slipping away.", cta: { label: "Capture an idea", kind: "capture", capture: "idea" } });
  return out.slice(0, 6);
}
