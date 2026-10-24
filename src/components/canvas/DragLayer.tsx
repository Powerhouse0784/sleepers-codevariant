"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GripVertical } from "lucide-react";
import { commitDrag, useCanvas, visibleZones, zoneRegistry } from "@/lib/canvas";

/** Mounted once in the Shell. Draws the card that follows the pointer, runs keyboard dragging, and announces what is happening. */
export default function DragLayer() {
  const drag = useCanvas((s) => s.drag); const over = useCanvas((s) => s.over); const settle = useCanvas((s) => s.settle); const say = useCanvas((s) => s.announce);
  const kb = drag?.mode === "keyboard";

  // keyboard: arrows or Tab choose a zone that accepts the card, Enter or Space drops, Escape puts it back
  useEffect(() => {
    if (!kb) return;
    const st = useCanvas.getState(); const zones = () => visibleZones(st.drag?.payload);
    const pick = (id: string | null) => { st.setOver(id); const z = id ? visibleZones().find((q) => q.id === id) : null; z?.el.scrollIntoView({ block: "nearest", inline: "nearest" }); if (z) st.say(`${z.def.label}: ${z.def.hint}. Press Enter to drop.`); };
    const first = zones()[0]; if (first) { pick(first.id); } else st.say("No action zone accepts this card. Press Escape.");
    const onKey = (e: KeyboardEvent) => {
      const list = zones(); const cur = list.findIndex((z) => z.id === useCanvas.getState().over);
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); commitDrag(false); return; }
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); if (cur < 0) { st.say("Choose a zone first."); return; } const origin = useCanvas.getState().drag?.origin; commitDrag(true); origin?.focus(); return; }
      const next = e.key === "ArrowRight" || e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey), prev = e.key === "ArrowLeft" || e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey);
      if ((next || prev) && list.length) { e.preventDefault(); e.stopPropagation(); pick(list[(cur + (next ? 1 : -1) + list.length) % list.length].id); }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [kb]);

  const overDef = over ? zoneRegistry.get(over)?.current : undefined; const verdict = drag && overDef ? overDef.accepts(drag.payload) : null;
  return (
    <>
      <p role="status" aria-live="polite" className="sr-only">{say}</p>
      {drag && drag.mode === "pointer" && (
        <div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[80]" style={{ transform: `translate3d(${drag.x + 14}px, ${drag.y + 10}px, 0)` }}>
          <div className={`flex max-w-[240px] items-center gap-2 rounded-xl border px-3 py-2 shadow-2xl backdrop-blur ${verdict === true ? "border-[var(--gold)]" : verdict ? "border-[#ff6b81]" : "border-line"}`} style={{ background: "color-mix(in srgb,var(--surface) 92%,transparent)", rotate: "-3deg" }}>
            <GripVertical size={14} className="shrink-0 text-honey" />
            <span className="min-w-0 leading-tight"><span className="block truncate text-[12.5px] font-semibold">{drag.payload.label}</span>
              <span className={`block truncate text-[10.5px] ${verdict === true ? "text-honey" : verdict ? "text-[#ff8a9a]" : "text-mute"}`}>{verdict === true ? `Release to ${overDef?.label}` : typeof verdict === "string" ? verdict : drag.payload.sub ?? "Drag onto an action zone"}</span></span>
          </div>
        </div>)}
      {kb && drag && <div aria-hidden className="fixed bottom-24 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-[var(--gold)] px-4 py-2 text-[12px] shadow-2xl backdrop-blur lg:bottom-28" style={{ background: "color-mix(in srgb,var(--surface) 94%,transparent)" }}>Holding <b>{drag.payload.label}</b> · arrows choose a zone · Enter drops · Esc cancels</div>}
      <AnimatePresence>
        {settle && settle.tx != null && settle.ty != null && (
          <motion.div key={settle.n} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[80]" initial={{ x: settle.x + 14, y: settle.y + 10, scale: 1, opacity: 1 }} animate={{ x: settle.tx - 40, y: settle.ty - 14, scale: settle.ok ? 0.2 : 0.9, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: settle.ok ? 0.28 : 0.35, ease: [0.22, 1, 0.36, 1] }}>
            <div className="max-w-[200px] truncate rounded-xl border border-line px-3 py-2 text-[12.5px] font-semibold" style={{ background: "var(--surface)" }}>{settle.label}</div>
          </motion.div>)}
      </AnimatePresence>
    </>
  );
}
