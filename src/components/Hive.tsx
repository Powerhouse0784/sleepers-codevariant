"use client";
import { useMemo } from "react";
import { motion } from "motion/react";
import { Lightbulb, UserRound, CheckSquare, FileText } from "lucide-react";
import type { Cell, Kind } from "@/types";
import { getMomentum } from "@/features/momentum/momentum";
import { STATE_COLOR } from "./MomentumBadge";
import { commitDrag, useCanvas, zoneAt } from "@/lib/canvas";
import { hiveCellCard } from "./hive/HiveZones";

const KIND_ICON = { idea: Lightbulb, person: UserRound, action: CheckSquare, note: FileText } as const;
const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];

/** Hex spiral: index 0 is the centre, so the hottest item sits in the middle. */
function spiral(n: number): [number, number][] {
  const out: [number, number][] = [[0, 0]];
  for (let ring = 1; out.length < n; ring++) {
    let q = -ring, r = ring;
    for (let side = 0; side < 6; side++)
      for (let step = 0; step < ring; step++) { out.push([q, r]); q += DIRS[side][0]; r += DIRS[side][1]; }
  }
  return out.slice(0, n);
}

export default function Hive({ cells, nowMs, selectedId, size = 38 }: {
  cells: Cell[]; nowMs: number; selectedId: string | null; size?: number;
}) {
  const items = useMemo(() => cells
    .map((c) => ({ c, m: getMomentum(c, nowMs) }))
    .sort((a, b) => b.m.heat - a.m.heat), [cells, nowMs]);
  const pos = useMemo(() => spiral(items.length), [items.length]);
  const rings = Math.max(1, Math.ceil((Math.sqrt(12 * items.length - 3) - 3) / 6) + 1);
  const E = (rings + 1) * size * 1.75;
  const hex = (r: number) => Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 30); return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

  const startPointerDrag = (e: React.PointerEvent<SVGGElement>, cell: Cell) => {
    if (e.button !== 0 || useCanvas.getState().drag) return;
    e.preventDefault();
    const origin = e.currentTarget as unknown as HTMLElement;
    useCanvas.getState().begin(hiveCellCard(cell), e.clientX, e.clientY, "pointer", origin);
    document.body.classList.add("canvas-dragging");
    const move = (ev: PointerEvent) => useCanvas.getState().move(ev.clientX, ev.clientY, zoneAt(ev.clientX, ev.clientY));
    let up: (ev: PointerEvent) => void = () => {};
    let cancel: () => void = () => {};
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      document.body.classList.remove("canvas-dragging");
    };
    up = (ev) => { useCanvas.getState().move(ev.clientX, ev.clientY, zoneAt(ev.clientX, ev.clientY)); cleanup(); commitDrag(true); };
    cancel = () => { cleanup(); commitDrag(false); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
    window.addEventListener("pointercancel", cancel, { once: true });
  };
  const startKeyboardDrag = (e: React.KeyboardEvent<SVGGElement>, cell: Cell) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    if (useCanvas.getState().drag) return;
    const r = e.currentTarget.getBoundingClientRect();
    useCanvas.getState().begin(hiveCellCard(cell), r.left + r.width / 2, r.top + r.height / 2, "keyboard", e.currentTarget as unknown as HTMLElement);
  };

  return (
    <svg viewBox={`${-E} ${-E} ${2 * E} ${2 * E}`} className="mx-auto h-auto w-full max-w-[640px]" role="group" aria-label="Momentum hive. Each cell is an idea, person or action.">
      {items.map(({ c, m }, i) => {
        const [q, r] = pos[i];
        const x = size * Math.sqrt(3) * (q + r / 2), y = size * 1.5 * r;
        const col = STATE_COLOR[m.state], Icon = KIND_ICON[c.kind as Kind];
        const sel = selectedId === c.id;
        return (
          <g key={c.id} transform={`translate(${x} ${y})`}><motion.g className="cell" tabIndex={0} role="button"
            aria-label={`${c.title}. ${m.state}, ${c.kind}. ${m.reason}`}
            onPointerDown={(e) => startPointerDrag(e, c)} onKeyDown={(e) => startKeyboardDrag(e, c)} style={{ touchAction: "none" }}
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.025, type: "spring", stiffness: 260, damping: 20 }}>
            <title>{`${c.title} (${m.state})`}</title>
            {m.state === "hot" && (
              <motion.polygon points={hex(size * 1.02)} fill={col} style={{ filter: "blur(9px)" }}
                animate={{ opacity: [0.25, 0.6, 0.25] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }} />
            )}
            <polygon className="body" points={hex(size * 0.93)} fill={col} fillOpacity={0.28 + 0.72 * m.heat}
              stroke={sel ? "#fff" : col} strokeWidth={sel ? 3 : 1} strokeOpacity={sel ? 1 : 0.55} style={{ transition: "fill-opacity .6s" }} />
            <Icon x={-9} y={-9} width={18} height={18} color={m.heat > 0.45 ? "#1a1304" : "#eef0f7"} aria-hidden />
          </motion.g></g>
        );
      })}
    </svg>
  );
}
