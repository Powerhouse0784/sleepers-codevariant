"use client";
import { Lightbulb, UserPlus, ListPlus, StickyNote, CalendarPlus, ArrowRight, Flame, type LucideIcon } from "lucide-react";
import ActionZone from "../canvas/ActionZone";
import { useCanvas, type Payload, type ZoneDef } from "@/lib/canvas";
import { useUI } from "@/lib/store";
import type { Kind } from "@/types";

/** Data carried by a Quick-Action card (dragged from the dashboard). */
export interface QuickActionDragged { kind: "quick-action"; actionKind: Kind }
export const quickActionCard = (actionKind: Kind, label: string): Payload => ({
  label,
  sub: "Quick action",
  data: { kind: "quick-action", actionKind } satisfies QuickActionDragged,
});

const isQuick = (p: Payload): QuickActionDragged | null => {
  const d = p.data as QuickActionDragged;
  return d?.kind === "quick-action" ? d : null;
};

const def = (id: string, label: string, hint: string, tone: string,
  accepts: (p: Payload) => true | string, drop: (p: Payload) => string | void): ZoneDef =>
  ({ id, label, hint, tone, accepts, drop });

export const DASHBOARD_ZONES = {
  captureIdea: def("dash-idea", "Capture Idea", "Drop to open the idea capture form", "#FFB020",
    (p) => { if (!isQuick(p)) return "Not a quick-action card."; if (isQuick(p)!.actionKind !== "idea") return "Drop an Idea card here."; return true; },
    (_p) => { useUI.getState().setCapture(true, "idea"); return "Opening idea capture…"; },
  ),
  savePerson: def("dash-person", "Save Contact", "Drop to save a new contact", "#2F8BFF",
    (p) => { if (!isQuick(p)) return "Not a quick-action card."; if (isQuick(p)!.actionKind !== "person") return "Drop a Contact card here."; return true; },
    (_p) => { useUI.getState().setCapture(true, "person"); return "Opening contact capture…"; },
  ),
  addAction: def("dash-action", "Add Action", "Drop to add an action item", "#22B573",
    (p) => { if (!isQuick(p)) return "Not a quick-action card."; if (isQuick(p)!.actionKind !== "action") return "Drop an Action card here."; return true; },
    (_p) => { useUI.getState().setCapture(true, "action"); return "Opening action capture…"; },
  ),
  captureNote: def("dash-note", "Capture Note", "Drop to jot a quick note", "#B07CFF",
    (p) => { if (!isQuick(p)) return "Not a quick-action card."; if (isQuick(p)!.actionKind !== "note") return "Drop a Note card here."; return true; },
    (_p) => { useUI.getState().setCapture(true, "note"); return "Opening note capture…"; },
  ),
  /** A catch-all zone: drop ANY quick-action card here and it runs the matching action. */
  doIt: def("dash-do-it", "Do It!", "Drop any card here to run it", "#FFC629",
    (p) => { if (!isQuick(p)) return "Not a quick-action card."; return true; },
    (p) => {
      const d = isQuick(p)!;
      useUI.getState().setCapture(true, d.actionKind);
      const label = { idea: "idea", person: "contact", action: "action", note: "note" }[d.actionKind];
      return `Opening ${label} capture…`;
    },
  ),
};

const ICONS: Record<keyof typeof DASHBOARD_ZONES, LucideIcon> = {
  captureIdea: Lightbulb, savePerson: UserPlus, addAction: ListPlus, captureNote: StickyNote, doIt: Flame,
};
type ZoneId = keyof typeof DASHBOARD_ZONES;
export const DashZone = ({ id, variant, className }: { id: ZoneId; variant?: "dock" | "strip"; className?: string }) =>
  <ActionZone def={DASHBOARD_ZONES[id]} Icon={ICONS[id]} variant={variant} className={className} />;

/** Dock bar that appears at the bottom while a quick-action card is being held. */
export function DashboardDock() {
  const holding = useCanvas((s) => !!s.drag);
  if (!holding) return null;
  const payload = useCanvas.getState().drag?.payload;
  if (!payload || !isQuick(payload)) return null;
  const d = isQuick(payload)!;
  return (
    <div role="region" aria-label="Quick action zones" className="fixed inset-x-3 bottom-[88px] z-20 lg:inset-x-6 lg:bottom-4">
      <div className="card mx-auto flex w-fit max-w-full items-stretch gap-3 overflow-x-auto rounded-3xl! border-[color-mix(in_srgb,var(--gold)_35%,var(--line))] p-2.5 shadow-2xl backdrop-blur scroll-thin">
        {d.actionKind === "idea" && <DashZone id="captureIdea" variant="dock" />}
        {d.actionKind === "person" && <DashZone id="savePerson" variant="dock" />}
        {d.actionKind === "action" && <DashZone id="addAction" variant="dock" />}
        {d.actionKind === "note" && <DashZone id="captureNote" variant="dock" />}
        <span aria-hidden className="w-px shrink-0 bg-[var(--line)]" />
        <DashZone id="doIt" variant="dock" />
      </div>
    </div>
  );
}
