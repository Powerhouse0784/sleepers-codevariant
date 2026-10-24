"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ArrowRight, Clock } from "lucide-react";
import { getMomentum, STATE_LABEL, type MomentumState } from "@/features/momentum/momentum";
import type { Cell, HiveEvent } from "@/types";
import { STATE_COLOR } from "../MomentumBadge";
import { useUI } from "@/lib/store";
import EventArt from "./EventArt";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const city = (v?: string) => v?.split(",")[0] ?? "";

function Countdown({ to }: { to: string }) {
  const off = useUI((s) => s.offsetDays); const [, setT] = useState(0);
  useEffect(() => { const t = setInterval(() => setT((n) => n + 1), 30_000); return () => clearInterval(t); }, []);
  const ms = Math.max(0, Date.parse(to) - (Date.now() + off * 864e5)); const d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5), m = Math.floor((ms % 36e5) / 6e4);
  return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary"><Clock size={11} aria-hidden /> Starts in {d ? `${d}d ` : ""}{h}h {m}m</span>;
}

/** Card that tilts toward the cursor. */
function Tilt({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0), y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), { stiffness: 200, damping: 20 }), ry = useSpring(useTransform(x, [-0.5, 0.5], [-9, 9]), { stiffness: 200, damping: 20 });
  return (
    <motion.div style={{ rotateX: rx, rotateY: ry, transformPerspective: 700 }} whileHover={{ y: -4 }}
      onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left) / r.width - 0.5); y.set((e.clientY - r.top) / r.height - 0.5); }}
      onPointerLeave={() => { x.set(0); y.set(0); }}>{children}</motion.div>
  );
}

export type EventRow = { e: HiveEvent; upcoming: boolean; count: number; state: MomentumState | null; heat: number; follow: number };
export default function TopEvents({ rows, evId, onPick }: { rows: EventRow[]; evId: string | null; onPick: (id: string | null) => void }) {
  return (
    <section className="card p-5" aria-labelledby="te">
      <div className="flex items-center justify-between"><h2 id="te" className="text-[16px] font-semibold">Top Events by Momentum</h2>
        <Link href="/events" className="btn-blue inline-flex items-center gap-1.5 px-3 py-1.5 text-xs">View All <ArrowRight size={13} aria-hidden /></Link></div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map(({ e, upcoming, count, state: s, heat, follow }, i) => { const on = evId === e.id; const col = upcoming ? "#2F8BFF" : s ? STATE_COLOR[s] : "#98a2c0"; return (
          <motion.li key={e.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07 }}>
            <Tilt><button onClick={() => onPick(on ? null : e.id)} aria-pressed={on} className="flex w-full gap-3 overflow-hidden rounded-2xl border p-0 text-left sm:block" style={{ borderColor: on ? "var(--gold)" : "var(--line)", background: "var(--surface)" }}>
              <span className="relative block h-20 w-28 shrink-0 overflow-hidden sm:h-[92px] sm:w-full"><EventArt seed={e.id} className="h-full w-full" />
                <span className="absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: col }}>{upcoming ? "Upcoming" : s ? STATE_LABEL[s] : "No items"}</span></span>
              <span className="block min-w-0 flex-1 p-3 sm:p-3.5"><span className="block truncate text-[13px] font-semibold">{e.title}</span>
                <span className="mt-0.5 block truncate text-[11px] text-mute">{fmt(e.startsAt ?? e.date)}{e.venue ? ` · ${city(e.venue)}` : ""}</span>
                <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-line"><motion.span className="block h-full rounded-full" style={{ background: col }} initial={{ width: 0 }} animate={{ width: `${upcoming ? 100 : Math.round(heat * 100)}%` }} transition={{ duration: 0.9, delay: 0.3 }} /></span>
                <span className="mt-1.5 block text-[11px] text-mute">{upcoming && e.startsAt ? <Countdown to={e.startsAt} /> : <>{count} {count === 1 ? "item" : "items"}{follow ? ` · ${follow} to follow up` : ""}</>}</span></span>
            </button></Tilt></motion.li>); })}
      </ul>
    </section>
  );
}
