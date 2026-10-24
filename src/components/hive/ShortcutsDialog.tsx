"use client";
import { motion } from "motion/react";
import { X } from "lucide-react";

const KEYS: [string, string][] = [["1 2 3 4", "Filter Hot, Warm, Cooling, Cold"], ["0", "Clear the state filter"], ["O  C  L", "Overview, Cells, List view"], ["/", "Search this hive"], ["T", "Watch the hive cool"], ["R", "Review cooling items"], ["Ctrl K", "Command palette"], ["?", "This help"]];
export default function ShortcutsDialog({ onClose, onTour }: { onClose: () => void; onTour: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.key === "Escape" && onClose()} className="card w-full max-w-sm p-6" initial={{ y: 24, scale: 0.97 }} animate={{ y: 0, scale: 1 }}>
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Keyboard shortcuts</h2><button autoFocus onClick={onClose} aria-label="Close" className="rounded-full p-2 text-mute hover:bg-white/5"><X size={18} /></button></div>
        <ul className="mt-3 divide-y divide-line">{KEYS.map(([k, d]) => <li key={k} className="flex items-center justify-between gap-3 py-2 text-sm"><span className="text-mute">{d}</span><kbd className="rounded-md border border-line px-2 py-0.5 text-xs">{k}</kbd></li>)}</ul>
        <button onClick={() => { onTour(); onClose(); }} className="btn-blue mt-4 px-4 py-2 text-xs">Replay the quick tour</button>
      </motion.div>
    </motion.div>
  );
}
