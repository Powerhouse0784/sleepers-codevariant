"use client";
import { useEffect, useId, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { useCanvas, zoneRegistry, type ZoneDef } from "@/lib/canvas";

/**
 * A place to drop a card. It lights up while a card it accepts is held, grows when that card is over it,
 * and explains itself when it refuses one. `dock` is the big tile, `strip` is the compact one used inside drawers.
 */
export default function ActionZone({ def, Icon, variant = "dock", className = "" }: { def: ZoneDef; Icon: LucideIcon; variant?: "dock" | "strip"; className?: string }) {
  const id = useId(); const ref = useRef(def); ref.current = def;
  useEffect(() => { zoneRegistry.set(id, ref); return () => { zoneRegistry.delete(id); }; }, [id]);
  const held = useCanvas((s) => s.drag?.payload); const over = useCanvas((s) => s.over === id); const flash = useCanvas((s) => (s.flash?.zone === id ? s.flash : null));
  const verdict = held ? def.accepts(held) : null;
  const state = !held ? "idle" : over ? (verdict === true ? "hot" : "reject") : verdict === true ? "armed" : "dim";
  const text = state === "reject" && typeof verdict === "string" ? verdict : state === "hot" ? "Release to drop" : def.hint;
  return (
    <div data-zone={id} role="group" aria-label={`${def.label} action zone. ${def.hint}`} data-state={state} style={{ "--z": def.tone } as React.CSSProperties}
      className={`zone relative isolate shrink-0 select-none overflow-hidden border text-center ${variant === "dock" ? "flex w-[104px] flex-col items-center gap-1 rounded-2xl px-2 py-2.5" : "flex items-center gap-2.5 rounded-xl px-3 py-2 text-left"} ${className}`}>
      <span className="zone-icon grid shrink-0 place-items-center rounded-xl" style={{ width: variant === "dock" ? 34 : 30, height: variant === "dock" ? 34 : 30 }}><Icon size={variant === "dock" ? 18 : 16} aria-hidden /></span>
      <span className="min-w-0 leading-tight"><span className="block text-[12px] font-semibold">{def.label}</span><span className={`block text-[9.5px] ${state === "reject" ? "text-[#ff8a9a]" : "text-mute"} ${variant === "dock" ? "line-clamp-2 min-h-[2.4em]" : ""}`}>{text}</span></span>
      {flash && <span key={flash.n} aria-hidden className={`zone-burst ${flash.ok ? "" : "zone-burst-bad"}`} />}
    </div>
  );
}
