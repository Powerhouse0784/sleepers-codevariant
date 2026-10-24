"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, RotateCw, Archive, SkipForward } from "lucide-react";
import { getMomentum } from "@/features/momentum/momentum";
import type { Cell } from "@/types";
import MomentumBadge from "../MomentumBadge";
import { useStore, useUI } from "@/lib/store";

/** Review cooling and cold items one at a time: revive with a next step, archive, or skip. */
export default function ReviewMode({ queue, now, onClose }: { queue: Cell[]; now: number; onClose: () => void }) {
  const { touch, archive } = useStore(); const { celebrate, toast } = useUI();
  const [i, setI] = useState(0); const [step, setStep] = useState(""); const [stat, setStat] = useState({ r: 0, a: 0, s: 0 });
  const c = queue[i], m = c && getMomentum(c, now), end = i >= queue.length;
  const go = (k: "r" | "a" | "s") => { const n = { ...stat, [k]: stat[k] + 1 }; setStat(n); setStep(""); if (i + 1 >= queue.length) { if (n.r) celebrate(); toast(`Review done: ${n.r} revived, ${n.a} archived, ${n.s} skipped.`); } setI(i + 1); };
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div role="dialog" aria-modal="true" aria-label="Review cooling items" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.key === "Escape" && onClose()} className="card w-full max-w-md overflow-hidden p-6" initial={{ y: 30, scale: 0.96 }} animate={{ y: 0, scale: 1 }}>
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Review cooling items</h2><button autoFocus onClick={onClose} aria-label="Close review" className="rounded-full p-2 text-mute hover:bg-white/5"><X size={18} /></button></div>
        <div className="mt-3 flex gap-1" aria-hidden>{queue.map((_, k) => <span key={k} className={`h-1.5 flex-1 rounded-full ${k < i ? "bg-honey" : k === i ? "bg-honey/50" : "bg-line"}`} />)}</div>
        {end || !c ? (
          <div className="py-10 text-center"><p className="script text-4xl text-honey">All reviewed!</p><p className="mt-2 text-sm text-mute">{stat.r} revived, {stat.a} archived, {stat.s} skipped.</p><button onClick={onClose} className="btn-gold mt-5 px-5 py-2.5 text-sm">Back to the hive</button></div>
        ) : (
          <AnimatePresence mode="wait"><motion.div key={c.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="mt-5">
            <p className="text-xs text-mute">{i + 1} of {queue.length}</p>
            <div className="mt-1 flex items-start justify-between gap-3"><h3 className="text-xl font-semibold leading-tight">{c.title}</h3><MomentumBadge state={m!.state} /></div>
            <p className="mt-2 text-sm text-mute">{m!.reason} {m!.suggestedAction}</p>
            {c.note && <p className="mt-3 rounded-xl border border-line p-3 text-sm text-mute">{c.note}</p>}
            <label htmlFor="rv" className="mt-4 block text-sm font-medium">What is the first step to bring it back?</label>
            <input id="rv" value={step} onChange={(e) => setStep(e.target.value)} onKeyDown={(e) => e.key === "Enter" && step.trim() && (touch(c.id, `Revived: ${step.trim()}`, now), go("r"))} placeholder="e.g. Send a two-line message" className="mt-2 w-full rounded-xl border border-line bg-ink px-3 py-2.5 text-sm" />
            <div className="mt-4 flex flex-wrap gap-2">
              <button disabled={!step.trim()} onClick={() => { touch(c.id, `Revived: ${step.trim()}`, now); go("r"); }} className="btn-gold inline-flex items-center gap-1.5 px-4 py-2.5 text-sm disabled:opacity-40"><RotateCw size={15} aria-hidden /> Revive</button>
              <button onClick={() => { archive(c.id, now); go("a"); }} className="inline-flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm hover:bg-white/5"><Archive size={15} aria-hidden /> Archive</button>
              <button onClick={() => go("s")} className="ml-auto inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm text-mute hover:bg-white/5"><SkipForward size={15} aria-hidden /> Skip</button>
            </div></motion.div></AnimatePresence>)}
      </motion.div>
    </motion.div>
  );
}
