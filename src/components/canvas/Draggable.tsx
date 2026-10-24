"use client";
import { useRef } from "react";
import { commitDrag, useCanvas, zoneAt, type Payload } from "@/lib/canvas";

/**
 * Makes anything a draggable data card.
 *  mouse/pen: pick up after a few pixels of movement
 *  touch: press and hold, so scrolling the page still works
 *  keyboard: focus the card, Space or Enter to lift it (the DragLayer then takes the arrow keys)
 * Inputs and anything marked data-no-drag never start a drag. A click right after a drag is swallowed.
 */
export default function Draggable({ payload, label, disabled, className = "", children }: { payload: () => Payload | null; label: string; disabled?: boolean; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const lifted = useCanvas((s) => !!s.drag && s.drag.origin === ref.current);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0 || useCanvas.getState().drag) return;
    if ((e.target as HTMLElement).closest("input,textarea,select,[data-no-drag]")) return;
    const p = payload(); if (!p) return;
    const touch = e.pointerType === "touch"; if (!touch) e.preventDefault(); // no accidental text selection while dragging with a mouse
    const sx = e.clientX, sy = e.clientY; let active = false; let timer = 0; let x = sx, y = sy;
    const block = (ev: TouchEvent) => ev.preventDefault();
    const activate = () => { active = true; useCanvas.getState().begin(p, x, y, "pointer", ref.current); document.body.classList.add("canvas-dragging"); if (touch) { window.addEventListener("touchmove", block, { passive: false }); navigator.vibrate?.(12); } };
    const cleanup = () => { window.clearTimeout(timer); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", cancel); window.removeEventListener("touchmove", block); document.body.classList.remove("canvas-dragging"); };
    const swallowClick = () => { const stop = (ev: MouseEvent) => { ev.stopPropagation(); ev.preventDefault(); }; window.addEventListener("click", stop, true); window.setTimeout(() => window.removeEventListener("click", stop, true), 80); };
    function move(ev: PointerEvent) {
      x = ev.clientX; y = ev.clientY;
      if (!active) { const d = Math.hypot(x - sx, y - sy); if (touch) { if (d > 10) cleanup(); return; } if (d < 6) return; activate(); }
      useCanvas.getState().move(x, y, zoneAt(x, y));
    }
    function up() { const was = active; cleanup(); if (was) { swallowClick(); commitDrag(true); } }
    function cancel() { const was = active; cleanup(); if (was) commitDrag(false); }
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up); window.addEventListener("pointercancel", cancel);
    if (touch) timer = window.setTimeout(() => { activate(); useCanvas.getState().move(x, y, zoneAt(x, y)); }, 240);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || e.target !== e.currentTarget || (e.key !== " " && e.key !== "Enter")) return;
    const p = payload(); if (!p) return; e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect(); useCanvas.getState().begin(p, r.left + r.width / 2, r.top + r.height / 2, "keyboard", ref.current);
  };

  return (
    <div ref={ref} tabIndex={disabled ? -1 : 0} role="group" aria-roledescription="draggable card" aria-label={`${label}. Press space to pick up, then choose an action zone.`}
      onPointerDown={onPointerDown} onKeyDown={onKeyDown} onDragStart={(e) => e.preventDefault()}
      className={`${disabled ? "" : "cursor-grab"} rounded-2xl outline-offset-2 transition focus-visible:outline-2 focus-visible:outline-[var(--gold)] [-webkit-touch-callout:none] ${lifted ? "scale-[.97] opacity-40" : ""} ${className}`}>
      {children}
    </div>
  );
}
