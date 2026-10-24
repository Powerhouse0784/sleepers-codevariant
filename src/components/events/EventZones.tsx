"use client";
import { ExternalLink, Camera, Archive, ArchiveRestore, Plus } from "lucide-react";
import ActionZone from "../canvas/ActionZone";
import { useCanvas, type Payload, type ZoneDef } from "@/lib/canvas";
import { useStore, useUI } from "@/lib/store";
import { eventStatus } from "@/features/events/events";
import { useNow } from "@/lib/hooks";

/** Shape of data carried by an event card. */
export interface EventDragged { kind: "event"; id: string }
export const eventCard = (id: string, title: string, type: string): Payload => ({
  label: title, sub: type, data: { kind: "event", id } satisfies EventDragged,
});

const isEvent = (p: Payload): EventDragged | null => {
  const d = p.data as EventDragged;
  return d?.kind === "event" ? d : null;
};
const getEvent = (p: Payload) => {
  const d = isEvent(p); if (!d) return undefined;
  return useStore.getState().events.find((e) => e.id === d.id);
};

const def = (id: string, label: string, hint: string, tone: string,
  accepts: (p: Payload) => true | string, drop: (p: Payload) => string | void): ZoneDef =>
  ({ id, label, hint, tone, accepts, drop });

export function makeEventZones(now: number) {
  return {
    open: def("ev-open", "Open", "Drop to open event", "#2F8BFF",
      (p) => { const e = getEvent(p); if (!e) return "Not an event card."; return true; },
      (p) => { const d = isEvent(p)!; useUI.getState().openEvent(d.id); },
    ),
    capture: def("ev-capture", "Capture", "Drop to add idea / person / action", "#FF9F1C",
      (p) => {
        const e = getEvent(p); if (!e) return "Not an event card.";
        const status = eventStatus(e, now);
        if (status === "archived") return "Archived events can't be captured into.";
        return true;
      },
      (p) => { const d = isEvent(p)!; useUI.getState().setCapture(true, "idea", d.id); return "Choose what to capture →"; },
    ),
    archive: def("ev-archive", "Archive", "Drop to archive event", "#FF6B81",
      (p) => {
        const e = getEvent(p); if (!e) return "Not an event card.";
        if (eventStatus(e, now) === "archived") return "Already archived — use Restore.";
        return true;
      },
      (p) => { const d = isEvent(p)!; const e = getEvent(p)!; useStore.getState().setEventArchived(e.id, true, Date.now()); return `"${e.title}" archived.`; },
    ),
    restore: def("ev-restore", "Restore", "Drop to bring it back", "#1FD18B",
      (p) => {
        const e = getEvent(p); if (!e) return "Not an event card.";
        if (eventStatus(e, now) !== "archived") return "Only archived events can be restored.";
        return true;
      },
      (p) => { const d = isEvent(p)!; const e = getEvent(p)!; useStore.getState().setEventArchived(e.id, false, Date.now()); return `"${e.title}" restored.`; },
    ),
  };
}

const ICONS = { open: ExternalLink, capture: Camera, archive: Archive, restore: ArchiveRestore };
type ZoneId = keyof ReturnType<typeof makeEventZones>;
export const EventZone = ({ id, variant, className, zones }: { id: ZoneId; variant?: "dock" | "strip"; className?: string; zones: ReturnType<typeof makeEventZones> }) =>
  <ActionZone def={zones[id]} Icon={ICONS[id]} variant={variant} className={className} />;

/** The dock bar that appears at the bottom while an event card is being held. */
export function EventDock() {
  const now = useNow();
  const zones = makeEventZones(now);
  const holding = useCanvas((s) => !!s.drag);
  if (!holding) return null;
  // Only show if the card being held is an event card
  const payload = useCanvas.getState().drag?.payload;
  if (!payload || !isEvent(payload)) return null;
  return <EventDockInner zones={zones} />;
}

function EventDockInner({ zones }: { zones: ReturnType<typeof makeEventZones> }) {
  return (
    <div role="region" aria-label="Event action zones" className="fixed inset-x-3 bottom-[88px] z-20 lg:inset-x-6 lg:bottom-4">
      <div className="card mx-auto flex w-fit max-w-full items-stretch gap-3 overflow-x-auto rounded-3xl! border-[color-mix(in_srgb,var(--gold)_35%,var(--line))] p-2.5 shadow-2xl backdrop-blur scroll-thin">
        <EventZone id="open" variant="dock" zones={zones} />
        <span aria-hidden className="w-px shrink-0 bg-[var(--line)]" />
        <EventZone id="capture" variant="dock" zones={zones} />
        <span aria-hidden className="w-px shrink-0 bg-[var(--line)]" />
        <EventZone id="archive" variant="dock" zones={zones} />
        <EventZone id="restore" variant="dock" zones={zones} />
      </div>
    </div>
  );
}
