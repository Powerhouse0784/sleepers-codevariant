"use client";
import { CalendarPlus, ExternalLink, CalendarCheck, CalendarClock, type LucideIcon } from "lucide-react";
import ActionZone from "../canvas/ActionZone";
import { useCanvas, type Payload, type ZoneDef } from "@/lib/canvas";
import { useCalendarUI } from "@/lib/calendarStore";
import { useStore, useUI } from "@/lib/store";
import { CAT_TYPE, type CalItem } from "@/features/calendar/calendar";

/** Shape of data carried by a calendar item card. */
export interface CalItemDragged { kind: "cal-item"; id: string; src: CalItem["src"]; refId?: string; title: string; cat: CalItem["cat"]; start: number; end: number; allDay: boolean; where?: string }

export const calItemCard = (i: CalItem): Payload => ({
  label: i.title,
  sub: i.src === "sample" ? "Sample item" : i.src === "event" ? "Your event" : i.src === "task" ? "Task" : "Joined challenge",
  data: { kind: "cal-item", id: i.id, src: i.src, refId: i.refId, title: i.title, cat: i.cat, start: i.start, end: i.end, allDay: i.allDay, where: i.where } satisfies CalItemDragged,
});

const isCalItem = (p: Payload): CalItemDragged | null => {
  const d = p.data as CalItemDragged;
  return d?.kind === "cal-item" ? d : null;
};

const def = (id: string, label: string, hint: string, tone: string,
  accepts: (p: Payload) => true | string, drop: (p: Payload) => string | void): ZoneDef =>
  ({ id, label, hint, tone, accepts, drop });

export const CALENDAR_ZONES = {
  open: def("cal-open", "Open", "Drop to view this item's details", "#2F8BFF",
    (p) => { if (!isCalItem(p)) return "Not a calendar item."; return true; },
    (p) => { const d = isCalItem(p)!; useCalendarUI.getState().open(d.id); },
  ),
  addEvent: def("cal-add", "Add to Events", "Drop a sample entry to save it", "#1FD18B",
    (p) => {
      const d = isCalItem(p); if (!d) return "Not a calendar item.";
      if (d.src !== "sample") return "Only sample items can be added to your events.";
      return true;
    },
    (p) => {
      const d = isCalItem(p)!;
      const end = d.allDay ? d.end - 1 : d.end;
      useStore.getState().addEvent({ title: d.title, type: CAT_TYPE[d.cat], startsAt: new Date(d.start).toISOString(), endsAt: new Date(end).toISOString(), venue: d.where }, Date.now());
      return `"${d.title}" added to your events!`;
    },
  ),
  openEvent: def("cal-open-event", "Open Event", "Drop your event to open its detail", "#FF9F1C",
    (p) => {
      const d = isCalItem(p); if (!d) return "Not a calendar item.";
      if (d.src !== "event" || !d.refId) return "Only your own events can be opened here.";
      return true;
    },
    (p) => { const d = isCalItem(p)!; useUI.getState().openEvent(d.refId!); },
  ),
  viewUpcoming: def("cal-upcoming", "Upcoming", "Drop any item to see all upcoming", "#8B5CF6",
    (p) => { if (!isCalItem(p)) return "Not a calendar item."; return true; },
    (_p) => { useCalendarUI.getState().setUpcoming(true); return "Showing upcoming events."; },
  ),
  viewPast: def("cal-past", "Past Events", "Drop any item to see past events", "#9CA8C4",
    (p) => { if (!isCalItem(p)) return "Not a calendar item."; return true; },
    (_p) => { useCalendarUI.getState().setPast(true); return "Showing past events."; },
  ),
};

const ICONS: Record<keyof typeof CALENDAR_ZONES, LucideIcon> = {
  open: ExternalLink, addEvent: CalendarPlus, openEvent: CalendarCheck, viewUpcoming: CalendarCheck, viewPast: CalendarClock,
};
type ZoneId = keyof typeof CALENDAR_ZONES;
const Zone = ({ id, variant, className }: { id: ZoneId; variant?: "dock" | "strip"; className?: string }) =>
  <ActionZone def={CALENDAR_ZONES[id]} Icon={ICONS[id]} variant={variant} className={className} />;

/** Dock that slides up while a calendar item card is being held. */
export function CalendarDock() {
  const holding = useCanvas((s) => !!s.drag);
  if (!holding) return null;
  const payload = useCanvas.getState().drag?.payload;
  if (!payload || !isCalItem(payload)) return null;
  return <CalendarDockInner payload={payload} />;
}

function CalendarDockInner({ payload }: { payload: Payload }) {
  const d = isCalItem(payload)!;
  return (
    <div role="region" aria-label="Calendar action zones" className="fixed inset-x-3 bottom-[88px] z-20 lg:inset-x-6 lg:bottom-4">
      <div className="card mx-auto flex w-fit max-w-full items-stretch gap-3 overflow-x-auto rounded-3xl! border-[color-mix(in_srgb,var(--gold)_35%,var(--line))] p-2.5 shadow-2xl backdrop-blur scroll-thin">
        <Zone id="open" variant="dock" />
        <span aria-hidden className="w-px shrink-0 bg-[var(--line)]" />
        {d.src === "sample" && <Zone id="addEvent" variant="dock" />}
        {d.src === "event" && d.refId && <Zone id="openEvent" variant="dock" />}
        <span aria-hidden className="w-px shrink-0 bg-[var(--line)]" />
        <Zone id="viewUpcoming" variant="dock" />
        <Zone id="viewPast" variant="dock" />
      </div>
    </div>
  );
}
