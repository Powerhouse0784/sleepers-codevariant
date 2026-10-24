"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Check, Archive, RotateCw, Pin, PinOff } from "lucide-react";
import { warmth } from "@/features/hive/stats";
import { useStore, useUI } from "@/lib/store";
import { useNow } from "@/lib/hooks";
import { getMomentum } from "@/features/momentum/momentum";
import MomentumBadge from "./MomentumBadge";

export default function DetailDrawer() {
  const id = useUI((s) => s.selectedId), select = useUI((s) => s.select);
  const cell = useStore((s) => s.cells.find((c) => c.id === id));
  const event = useStore((s) => s.events.find((e) => e.id === cell?.eventId));
  const { touch, complete, archive, pin } = useStore();
  const toast = useUI((s) => s.toast), celebrate = useUI((s) => s.celebrate);
  const now = useNow();
  const [step, setStep] = useState("");
  const m = cell ? getMomentum(cell, now) : null;
  const close = () => { select(null); setStep(""); };
  const needsRevive = m && (m.state === "cooling" || m.state === "cold");

  return (
    <AnimatePresence>
      {cell && m && (
        <>
          <motion.div key="scrim" className="fixed inset-0 z-30 bg-black/50" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside key="drawer" role="dialog" aria-modal="true" aria-label={cell.title}
            onKeyDown={(e) => e.key === "Escape" && close()}
            className="fixed inset-x-0 bottom-0 z-40 max-h-[88dvh] overflow-y-auto rounded-t-3xl border border-line bg-panel p-6 md:inset-y-0 md:left-auto md:right-0 md:w-[420px] md:rounded-none md:rounded-l-3xl"
            initial={{ y: 60, x: 0, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <div className="flex items-start justify-between gap-4">
              <div><MomentumBadge state={m.state} />
                <h2 className="mt-3 text-2xl font-semibold leading-tight">{cell.title}</h2>
                <p className="mt-1 text-sm text-mute capitalize">{cell.kind} from {event?.title ?? "an event"}</p></div>
              <div className="flex shrink-0 items-center"><button onClick={() => pin(cell.id)} aria-pressed={!!cell.pinned} aria-label={cell.pinned ? "Unpin" : "Pin this item"} className={`rounded-full p-2 hover:bg-white/5 ${cell.pinned ? "text-honey" : "text-mute"}`}>{cell.pinned ? <PinOff size={18} /> : <Pin size={18} />}</button><button autoFocus onClick={close} aria-label="Close details" className="rounded-full p-2 text-mute hover:bg-white/5"><X size={20} /></button></div>
            </div>
            <p className="mt-5 text-sm text-mute">{m.reason}</p>
            <p className="mt-1 text-base">{m.suggestedAction}</p>
            {cell.note && <p className="mt-4 rounded-xl border border-line p-3 text-sm text-mute">{cell.note}</p>}

            <label className="mt-6 block text-sm font-medium" htmlFor="step">{needsRevive ? "What is the first step to revive this?" : "Log a next step"}</label>
            <input id="step" value={step} onChange={(e) => setStep(e.target.value)} placeholder="e.g. Message Ananya the diagram"
              className="mt-2 w-full rounded-xl border border-line bg-ink px-3 py-2.5 text-sm placeholder:text-mute/60" />
            <button disabled={!step.trim()} onClick={() => { const w0 = warmth(useStore.getState().cells, now); touch(cell.id, `${needsRevive ? "Revived" : "Step"}: ${step.trim()}`, now); const w1 = warmth(useStore.getState().cells, now); if (needsRevive) celebrate(); toast(needsRevive ? `Revived! Hive warmth ${w0}% to ${w1}%.` : "Step saved. Nicely done."); setStep(""); }}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-honey px-4 py-2.5 text-sm font-semibold text-[#1a1304] disabled:opacity-40">
              <RotateCw size={16} aria-hidden /> {needsRevive ? "Revive with this step" : "Save step"}
            </button>
            <div className="mt-3 flex gap-2">
              {cell.kind === "action" && <button onClick={() => { complete(cell.id, now); celebrate(); toast("Done! One less thing cooling."); close(); }} className="inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm hover:bg-white/5"><Check size={16} aria-hidden /> Mark done</button>}
              <button onClick={() => { archive(cell.id, now); toast("Archived. You can find it in search."); close(); }} className="inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm hover:bg-white/5"><Archive size={16} aria-hidden /> Archive</button>
            </div>
            <h3 className="mt-7 text-sm font-semibold">History</h3>
            <ul className="mt-2 space-y-2 text-sm text-mute">
              {cell.log.map((l, i) => <li key={i}><span className="text-text">{l.text}</span> <span className="text-xs">{new Date(l.at).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span></li>)}
            </ul>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
