"use client";
import { Archive, ExternalLink } from "lucide-react";
import ActionZone from "../canvas/ActionZone";
import { useCanvas, type Payload, type ZoneDef } from "@/lib/canvas";
import { useStore, useUI } from "@/lib/store";
import type { Cell } from "@/types";

export interface HiveCellDragged { kind: "hive-cell"; id: string }
export const hiveCellCard = (cell: Cell): Payload => ({
  label: cell.title,
  sub: cell.kind === "idea" ? "Idea" : cell.kind === "person" ? "Person" : cell.kind === "action" ? "Action" : "Note",
  data: { kind: "hive-cell", id: cell.id } satisfies HiveCellDragged,
});
const isHiveCell = (p: Payload): HiveCellDragged | null => {
  const d = p.data as HiveCellDragged;
  return d?.kind === "hive-cell" ? d : null;
};
const getCell = (p: Payload) => {
  const d = isHiveCell(p);
  return d ? useStore.getState().cells.find((c) => c.id === d.id) : undefined;
};
const zones: Record<"open" | "archive", ZoneDef> = {
  open: {
    id: "hive-open", label: "Open", hint: "Drop to inspect this hive item", tone: "#2F8BFF",
    accepts: (p) => getCell(p) ? true : "Drag a Momentum Hive item here.",
    drop: (p) => { const c = getCell(p); if (!c) return; useUI.getState().select(c.id); return `Opened ${c.title}.`; },
  },
  archive: {
    id: "hive-archive", label: "Archive", hint: "Drop to archive this item", tone: "#FF6B81",
    accepts: (p) => { const c = getCell(p); if (!c) return "Drag a Momentum Hive item here."; if (c.archived) return "This item is already archived."; return true; },
    drop: (p) => { const c = getCell(p); if (!c) return; useStore.getState().archive(c.id, Date.now()); return `Archived ${c.title}.`; },
  },
};
export function HiveDock() {
  const holding = useCanvas((s) => !!s.drag);
  if (!holding || !isHiveCell(useCanvas.getState().drag!.payload)) return null;
  return (
    <div role="region" aria-label="Momentum Hive action zones" className="fixed inset-x-3 bottom-[88px] z-[70] lg:inset-x-6 lg:bottom-4">
      <div className="card mx-auto flex w-fit max-w-full items-stretch gap-3 overflow-x-auto rounded-3xl! border-[color-mix(in_srgb,var(--gold)_35%,var(--line))] p-2.5 shadow-2xl backdrop-blur scroll-thin">
        <ActionZone def={zones.open} Icon={ExternalLink} variant="dock" />
        <ActionZone def={zones.archive} Icon={Archive} variant="dock" />
      </div>
    </div>
  );
}
