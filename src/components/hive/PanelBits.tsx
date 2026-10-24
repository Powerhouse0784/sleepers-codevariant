"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Ghost, Pin } from "lucide-react";
import { getMomentum, STATE_LABEL, type MomentumState } from "@/features/momentum/momentum";
import type { Cell } from "@/types";
import { STATE_COLOR } from "../MomentumBadge";
import { BeeLogo } from "../Art";

const ORDER: MomentumState[] = ["hot", "warm", "cooling", "cold"];

/** Stacked bar showing how the hive splits across states. Each segment filters on click. */
export function DistBar({ counts, selected, onPick }: { counts: Record<MomentumState | "total", number>; selected: MomentumState | null; onPick: (s: MomentumState | null) => void }) {
  if (!counts.total) return null;
  return (
    <div className="mt-3 flex h-3 gap-1 overflow-hidden rounded-full" role="group" aria-label="Distribution of items by state">
      {ORDER.filter((s) => counts[s] > 0).map((s) => (
        <motion.button key={s} onClick={() => onPick(selected === s ? null : s)} aria-label={`${STATE_LABEL[s]}: ${counts[s]}`} title={`${STATE_LABEL[s]}: ${counts[s]}`} className="h-full rounded-full transition-opacity"
          style={{ background: STATE_COLOR[s], opacity: selected && selected !== s ? 0.3 : 1 }} initial={{ flexGrow: 0 }} animate={{ flexGrow: counts[s] }} transition={{ duration: 0.9, ease: "easeOut" }} />))}
    </div>
  );
}

/** Hover or focus a hexagon and see what is inside it. */
export function Peek({ state, cells, now, onOpen }: { state: MomentumState | null; cells: Cell[]; now: number; onOpen: (id: string) => void }) {
  const list = state ? cells.filter((c) => getMomentum(c, now).state === state).sort((a, b) => getMomentum(b, now).heat - getMomentum(a, now).heat).slice(0, 3) : [];
  return (
    <div className="mt-3 min-h-[86px] rounded-2xl border border-line p-3" aria-live="polite">
      <AnimatePresence mode="wait">
        {state ? (
          <motion.div key={state} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <p className="text-xs font-semibold" style={{ color: STATE_COLOR[state] }}>{STATE_LABEL[state]} {list.length === 0 && "· nothing here"}</p>
            <ul className="mt-1.5 grid gap-1 sm:grid-cols-3">{list.map((c) => <li key={c.id}><button onClick={() => onOpen(c.id)} className="w-full truncate rounded-lg px-2 py-1.5 text-left text-[12px] hover:bg-white/5">{c.pinned && <Pin size={11} className="mr-1 inline text-honey" aria-hidden />}{c.title}</button></li>)}</ul>
          </motion.div>
        ) : (
          <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-4 text-center text-[12px] text-mute">Hover a hexagon to peek inside. Click to dive in.</motion.p>)}
      </AnimatePresence>
    </div>
  );
}

export function ColdShelf({ cells, now, onOpen }: { cells: Cell[]; now: number; onOpen: (id: string) => void }) {
  const cold = cells.filter((c) => getMomentum(c, now).state === "cold");
  return (
    <div className="mt-3">
      <h3 className="flex items-center gap-2 text-[12px] font-semibold"><Ghost size={14} style={{ color: STATE_COLOR.cold }} aria-hidden /> Went cold shelf <span className="font-normal text-mute">({cold.length})</span></h3>
      {cold.length === 0 ? <p className="mt-1.5 text-[12px] text-mute">Nothing has gone cold. Lovely.</p> :
        <ul className="mt-2 flex flex-wrap gap-2">{cold.map((c) => <li key={c.id}><button onClick={() => onOpen(c.id)} className="rounded-full border px-3 py-1.5 text-[12px] hover:bg-white/5" style={{ borderColor: `${STATE_COLOR.cold}66` }}>{c.title} <span className="font-semibold" style={{ color: STATE_COLOR.cold }}>Revive</span></button></li>)}</ul>}
    </div>
  );
}

export function Embers({ n = 10 }: { n?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: n }).map((_, i) => <span key={i} className="ember absolute bottom-0 rounded-full bg-honey" style={{ left: `${(i * 97 + 11) % 98}%`, width: 3 + (i % 3), height: 3 + (i % 3), animationDelay: `${(i % 7) * 1.1}s`, animationDuration: `${6 + (i % 4)}s` }} />)}
    </div>
  );
}

const TOUR = [
  "Hi, I'm your bee guide! Each hexagon is a stage of momentum. Hover one to peek, click it to dive in.",
  "Items cool down by themselves. Press 'Watch it cool' to see a month pass in three seconds.",
  "Pressed for time? Ctrl + K opens the command palette, and ? shows every shortcut.",
];
export function BeeTour({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-3 flex items-start gap-3 rounded-2xl border border-honey/40 bg-honey/10 p-3" role="region" aria-label="Quick tour">
      <BeeLogo size={30} />
      <div className="min-w-0 flex-1"><AnimatePresence mode="wait"><motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13px] leading-snug">{TOUR[i]}</motion.p></AnimatePresence>
        <div className="mt-2 flex items-center gap-2"><button onClick={() => (i + 1 < TOUR.length ? setI(i + 1) : onDone())} className="btn-gold px-3 py-1 text-xs">{i + 1 < TOUR.length ? "Next" : "Got it"}</button>
          <button onClick={onDone} className="text-xs text-mute hover:text-text">Skip</button><span className="ml-auto text-[11px] text-mute">{i + 1}/{TOUR.length}</span></div></div>
    </motion.div>
  );
}
