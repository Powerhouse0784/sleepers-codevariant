"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, X, SkipForward, HelpCircle } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { useNow } from "@/lib/hooks";
import { getSuggestions, type Cta } from "@/features/buddy/suggest";
import { BeeLogo } from "./Art";

export function useBuddy() {
  const cells = useStore((s) => s.cells), events = useStore((s) => s.events); const now = useNow();
  const { dismissed, dismiss, tip, setTip, select, setCapture } = useUI(); const router = useRouter();
  const tips = useMemo(() => getSuggestions(cells, events, now).filter((t) => !dismissed.includes(t.id)), [cells, events, now, dismissed]);
  const idx = tips.length ? tip % tips.length : 0;
  const run = (c: Cta) => { if (c.kind === "open" && c.id) select(c.id); else if (c.kind === "capture") setCapture(true, c.capture); else if (c.href) router.push(c.href); };
  return { tips, cur: tips[idx], idx, next: () => setTip(tip + 1), dismiss, run };
}

/** The bee speaks. Suggestions are rule-based and always explain why. */
export function BuddyBubble({ className = "", tail = false }: { className?: string; tail?: boolean }) {
  const b = useBuddy(); const [why, setWhy] = useState(false);
  if (!b.cur) return null;
  return (
    <div className={`card ${className}`} role="status" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.div key={b.cur.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-honey"><BeeLogo size={16} /> Bee tip {b.idx + 1}/{b.tips.length}</p>
          <p className="mt-1.5 text-[13px] font-medium leading-snug">{b.cur.text}</p>
          {why && <p className="mt-1.5 text-[11px] leading-snug text-mute">{b.cur.why}</p>}
          <div className="mt-2.5 flex items-center gap-1.5">
            <button onClick={() => b.run(b.cur.cta)} className="btn-gold inline-flex items-center gap-1 px-3 py-1.5 text-xs">{b.cur.cta.label} <ChevronRight size={13} aria-hidden /></button>
            <button onClick={() => setWhy(!why)} aria-pressed={why} aria-label="Why this tip?" className="rounded-lg p-1.5 text-mute hover:bg-white/5"><HelpCircle size={16} /></button>
            <button onClick={() => { setWhy(false); b.next(); }} aria-label="Next tip" className="rounded-lg p-1.5 text-mute hover:bg-white/5"><SkipForward size={16} /></button>
            <button onClick={() => b.dismiss(b.cur.id)} aria-label="Dismiss this tip" className="ml-auto rounded-lg p-1.5 text-mute hover:bg-white/5"><X size={16} /></button>
          </div>
        </motion.div>
      </AnimatePresence>
      {tail && <span className="absolute -bottom-[7px] right-24 h-3.5 w-3.5 rotate-45 border-b border-r border-line bg-surface" aria-hidden />}
    </div>
  );
}

/** Floating helper on every screen except the dashboard (where the hero bee talks). */
export function BuddyFab() {
  const b = useBuddy(); const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-24 right-4 z-20 lg:bottom-6 lg:right-6">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }} className="card absolute bottom-16 right-0 w-[300px] p-3">
            <p className="px-1 pb-2 text-sm font-semibold">Your bee suggests</p>
            {b.tips.length === 0 && <p className="px-1 pb-2 text-sm text-mute">You are all caught up. Nice work.</p>}
            <ul className="space-y-1">{b.tips.slice(0, 3).map((t) => (
              <li key={t.id}><button onClick={() => { b.run(t.cta); setOpen(false); }} className="w-full rounded-xl p-2.5 text-left text-[13px] leading-snug hover:bg-white/5"><span className="block">{t.text}</span><span className="mt-1 block text-xs font-semibold text-honey">{t.cta.label}</span></button></li>))}</ul>
          </motion.div>)}
      </AnimatePresence>
      <motion.button onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Bee helper" whileTap={{ scale: 0.92 }} animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity }}
        className="relative grid h-14 w-14 place-items-center rounded-full border border-line bg-surface shadow-lg"><BeeLogo size={34} />
        {b.tips.length > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-honey text-[11px] font-bold text-[#1a1304]">{Math.min(9, b.tips.length)}</span>}</motion.button>
    </div>
  );
}
