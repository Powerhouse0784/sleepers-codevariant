import type { Cell, HiveEvent } from "@/types";
import { getMomentum, type MomentumState } from "@/features/momentum/momentum";

export type EventStatus = "upcoming" | "active" | "past" | "archived";
export const DAY = 864e5;

/** Status is always derived from dates (and the archive flag), never stored. */
export function eventStatus(e: HiveEvent, now: number): EventStatus {
  if (e.archived) return "archived";
  const start = Date.parse(e.startsAt ?? e.date);
  const end = e.endsAt ? Date.parse(e.endsAt) : start + DAY;
  return start > now ? "upcoming" : end >= now ? "active" : "past";
}

export type EventStats = { ideas: number; people: number; actions: number; total: number; progress: number };
/** Counts = demo baseline + live cells. A live cell counts as "acted on" once it is done or has any log entry beyond Captured. */
export function eventStats(e: HiveEvent, cells: Cell[]): EventStats {
  const live = cells.filter((c) => c.eventId === e.id && !c.archived && c.kind !== "note");
  const n = (k: string) => live.filter((c) => c.kind === k).length;
  const s = e.sample;
  const ideas = (s?.ideas ?? 0) + n("idea"), people = (s?.people ?? 0) + n("person"), actions = (s?.actions ?? 0) + n("action");
  const baseTotal = (s?.ideas ?? 0) + (s?.people ?? 0) + (s?.actions ?? 0);
  const acted = ((s?.progress ?? 0) / 100) * baseTotal + live.filter((c) => c.done || c.log.length > 1).length;
  const total = ideas + people + actions;
  return { ideas, people, actions, total, progress: total ? Math.min(100, Math.round((acted / total) * 100)) : 0 };
}

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
export function dateRange(e: HiveEvent) {
  const a = e.startsAt ?? e.date; if (!e.endsAt) return fmt(a);
  const same = new Date(a).toDateString() === new Date(e.endsAt).toDateString();
  return same ? fmt(a) : `${fmt(a)} – ${fmt(e.endsAt)}`;
}
export function startsIn(e: HiveEvent, now: number) {
  const d = Math.max(1, Math.ceil((Date.parse(e.startsAt ?? e.date) - now) / DAY));
  return d === 1 ? "Starts tomorrow" : `Starts in ${d} days`;
}
export function ago(iso: string, now: number) {
  const m = Math.max(0, (now - Date.parse(iso)) / 6e4);
  if (m < 60) return m < 1 ? "just now" : `${Math.floor(m)} min ago`;
  const h = m / 60; if (h < 24) return `${Math.floor(h)} ${Math.floor(h) === 1 ? "hour" : "hours"} ago`;
  const d = Math.floor(h / 24); return `${d} ${d === 1 ? "day" : "days"} ago`;
}

/** Follow-ups open: people who need a nudge (warm or colder) plus due-dated actions that are not done. */
export function followUpsOpen(cells: Cell[], now: number) {
  return cells.filter((c) => !c.archived && !c.done && (
    (c.kind === "person" && getMomentum(c, now).state !== "hot") || (c.kind === "action" && !!c.dueAt))).length;
}
/** How many active items sit in a momentum state (for the "Keep the buzz alive" hexes). */
export function stateCount(cells: Cell[], now: number, s: MomentumState) {
  return cells.filter((c) => !c.archived && !c.done && getMomentum(c, now).state === s).length;
}

export type SortKey = "updated" | "newest" | "oldest" | "name" | "progress";
export const SORTS: { k: SortKey; label: string }[] = [
  { k: "updated", label: "Recently updated" }, { k: "newest", label: "Date: newest" }, { k: "oldest", label: "Date: oldest" },
  { k: "name", label: "Name: A to Z" }, { k: "progress", label: "Most progress" },
];
export const FILTERS = ["all", "upcoming", "active", "past", "archived"] as const;
export type Filter = (typeof FILTERS)[number];
export const FILTER_LABEL: Record<Filter, string> = { all: "All events", upcoming: "Upcoming", active: "Active", past: "Past", archived: "Archived" };
