"use client";
import { create } from "zustand";
import { useUI } from "@/lib/store";

/** The Canvas Protocol engine. Cards are dragged; Action Zones accept or refuse them. Nothing here knows about a specific screen. */
export interface Payload { label: string; sub?: string; data: unknown }
export interface ZoneDef {
  id: string; label: string; hint: string; tone: string;
  /** `true` if this zone takes the card, otherwise the reason it does not. */
  accepts: (p: Payload) => true | string;
  /** Do the action. Return the message to toast. */
  drop: (p: Payload) => string | void;
}
interface Drag { payload: Payload; x: number; y: number; mode: "pointer" | "keyboard"; origin: HTMLElement | null }
interface Settle { n: number; x: number; y: number; tx: number | null; ty: number | null; label: string; ok: boolean }
type CanvasState = {
  drag: Drag | null; over: string | null; flash: { zone: string; ok: boolean; n: number } | null; settle: Settle | null; announce: string;
  begin: (payload: Payload, x: number, y: number, mode: Drag["mode"], origin: HTMLElement | null) => void;
  move: (x: number, y: number, over: string | null) => void;
  setOver: (over: string | null) => void;
  say: (t: string) => void;
  clear: () => void;
};
let n = 0;
export const useCanvas = create<CanvasState>((set, get) => ({
  drag: null, over: null, flash: null, settle: null, announce: "",
  begin: (payload, x, y, mode, origin) => set({ drag: { payload, x, y, mode, origin }, over: null, settle: null }),
  move: (x, y, over) => { const d = get().drag; if (!d) return; set({ drag: { ...d, x, y }, over: get().over === over ? get().over : over }); },
  setOver: (over) => set({ over }),
  say: (announce) => set({ announce }),
  clear: () => set({ drag: null, over: null }),
}));

/** Every mounted zone, by instance id. Zones keep their latest definition in a ref, so handlers never go stale. */
export const zoneRegistry = new Map<string, { current: ZoneDef }>();
export const zoneAt = (x: number, y: number): string | null => (document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-zone]")?.dataset.zone ?? null);
/** Visible zones in page order, optionally only those that take the card being held. */
export function visibleZones(payload?: Payload): { id: string; el: HTMLElement; def: ZoneDef }[] {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-zone]")).map((el) => ({ id: el.dataset.zone as string, el, def: zoneRegistry.get(el.dataset.zone as string)?.current }))
    .filter((z): z is { id: string; el: HTMLElement; def: ZoneDef } => !!z.def && z.el.getClientRects().length > 0 && (!payload || z.def.accepts(payload) === true));
}
/** Finish a drag. If it ends on a zone that accepts the card, run the zone's action; otherwise say why not. */
export function commitDrag(ok: boolean) {
  const { drag, over, flash } = useCanvas.getState(); if (!drag) return;
  const z = ok && over ? zoneRegistry.get(over)?.current : undefined; const el = over ? document.querySelector<HTMLElement>(`[data-zone="${CSS.escape(over)}"]`) : null;
  const r = el?.getBoundingClientRect(); const toast = useUI.getState().toast;
  let good = false;
  if (z) {
    const verdict = z.accepts(drag.payload);
    if (verdict === true) { good = true; const msg = z.drop(drag.payload); if (msg) toast(msg); useCanvas.getState().say(msg ? `${msg}` : `Dropped on ${z.label}`); }
    else { toast(verdict); useCanvas.getState().say(`Not accepted: ${verdict}`); }
  } else if (ok) useCanvas.getState().say("Dropped outside a zone. Nothing happened.");
  else useCanvas.getState().say("Cancelled.");
  const o = drag.origin?.getBoundingClientRect();
  useCanvas.setState({ drag: null, over: null, flash: z ? { zone: over as string, ok: good, n: ++n } : flash, settle: { n: ++n, x: drag.x, y: drag.y, tx: good && r ? r.left + r.width / 2 : o ? o.left + o.width / 2 : null, ty: good && r ? r.top + r.height / 2 : o ? o.top + o.height / 2 : null, label: drag.payload.label, ok: good } });
}
