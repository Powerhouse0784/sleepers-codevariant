"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useStore, useUI } from "@/lib/store";
import { BeeLogo } from "./Art";

const COLORS = ["#FFC629", "#FF477E", "#16B9F4", "#A66BFF", "#4ADE80", "#fff"];

function Burst() {
  const [ps] = useState(() => Array.from({ length: 30 }, (_, i) => { const a = (i / 30) * Math.PI * 2 + Math.random() * 0.4, d = 140 + Math.random() * 220; return { x: Math.cos(a) * d, y: Math.sin(a) * d, c: COLORS[i % COLORS.length], s: 5 + Math.random() * 6, r: Math.random() * 540 }; }));
  const [done, setDone] = useState(false);
  if (done) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[70] grid place-items-center" aria-hidden>
      <motion.span className="absolute h-24 w-24 rounded-full border-4 border-honey" initial={{ scale: 0, opacity: 0.9 }} animate={{ scale: 9, opacity: 0 }} transition={{ duration: 1.1, ease: "easeOut" }} onAnimationComplete={() => setDone(true)} />
      {ps.map((p, i) => <motion.span key={i} className="absolute rounded-sm" style={{ width: p.s, height: p.s * 1.6, background: p.c }} initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }} animate={{ x: p.x, y: p.y + 90, opacity: 0, rotate: p.r }} transition={{ duration: 1.2, ease: "easeOut" }} />)}
    </div>
  );
}
function Swarm() {
  const [bees] = useState(() => Array.from({ length: 11 }, () => ({ top: 8 + Math.random() * 78, dur: 3.2 + Math.random() * 2.4, delay: Math.random() * 0.9, amp: 30 + Math.random() * 60, size: 22 + Math.random() * 18 })));
  return (
    <div className="pointer-events-none fixed inset-0 z-[65] overflow-hidden" aria-hidden>
      {bees.map((b, i) => <motion.div key={i} className="absolute left-0" style={{ top: `${b.top}%` }} initial={{ x: -80 }} animate={{ x: "110vw", y: [0, -b.amp, b.amp / 2, -b.amp / 3, 0] }} transition={{ duration: b.dur, delay: b.delay, ease: "linear" }}><BeeLogo size={b.size} /></motion.div>)}
    </div>
  );
}

/** Global toasts, confetti burst, and the swarm easter egg. */
export default function Effects() {
  const toasts = useUI((s) => s.toasts), burst = useUI((s) => s.burst), swarm = useUI((s) => s.swarm); const calm = useStore((s) => s.calm);
  return (
    <>
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex flex-col items-center gap-2 px-4 lg:bottom-8">
        <AnimatePresence>{toasts.map((t) => <motion.div key={t.id} layout initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} className="card pointer-events-auto px-4 py-2.5 text-sm font-medium">{t.text}</motion.div>)}</AnimatePresence>
      </div>
      {burst > 0 && !calm && <Burst key={burst} />}
      {swarm > 0 && !calm && <Swarm key={swarm} />}
    </>
  );
}
