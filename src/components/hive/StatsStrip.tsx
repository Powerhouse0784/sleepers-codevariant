"use client";
import { useMemo } from "react";
import { motion } from "motion/react";
import { Flame, Crown } from "lucide-react";
import type { Cell } from "@/types";
import { health, healthLabel, streak, rank, warmthSeries, warmth } from "@/features/hive/stats";
import { CountUp } from "../dashboard/bits";

function Ring({ v }: { v: number }) {
  const C = 2 * Math.PI * 26, col = v >= 70 ? "#4ADE80" : v >= 50 ? "#FFC629" : v >= 30 ? "#16B9F4" : "#A66BFF";
  return (
    <div className="relative h-[64px] w-[64px] shrink-0" role="img" aria-label={`Hive health ${v} out of 100`}>
      <svg viewBox="0 0 64 64" className="-rotate-90"><circle cx="32" cy="32" r="26" fill="none" stroke="var(--line)" strokeWidth="7" />
        <motion.circle cx="32" cy="32" r="26" fill="none" stroke={col} strokeWidth="7" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - v / 100) }} transition={{ duration: 1.2, ease: "easeOut" }} style={{ filter: `drop-shadow(0 0 5px ${col}88)` }} /></svg>
      <span className="absolute inset-0 grid place-items-center text-[17px] font-bold"><CountUp to={v} /></span>
    </div>
  );
}
function Spark({ data }: { data: number[] }) {
  const w = 120, h = 40, max = Math.max(100, ...data), step = w / (data.length - 1);
  const p = data.map((v, i) => `${i * step},${h - (v / max) * (h - 4) - 2}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-full" role="img" aria-label={`Warmth over 14 days: from ${data[0]}% to ${data[data.length - 1]}%`}>
      <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFC629" stopOpacity=".4" /><stop offset="1" stopColor="#FFC629" stopOpacity="0" /></linearGradient></defs>
      <polygon points={`0,${h} ${p} ${w},${h}`} fill="url(#sg)" />
      <motion.polyline points={p} fill="none" stroke="#FFC629" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
      <circle cx={w} cy={h - (data[data.length - 1] / max) * (h - 4) - 2} r="3" fill="#FFC629" />
    </svg>
  );
}

/** Four at-a-glance cards: health, streak, rank, 14-day warmth trend. */
export default function StatsStrip({ cells, now }: { cells: Cell[]; now: number }) {
  const h = useMemo(() => health(cells, now), [cells, now]);
  const st = useMemo(() => streak(cells, now), [cells, now]);
  const rk = useMemo(() => rank(cells), [cells]);
  const series = useMemo(() => warmthSeries(cells, now), [cells, now]);
  const card = "card flex items-center gap-3 p-3.5";
  const anim = (i: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 + i * 0.07 } });
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Hive stats">
      <motion.div {...anim(0)} className={card}><Ring v={h} /><div><p className="text-[11px] text-mute">Hive health</p><p className="text-[16px] font-bold leading-tight">{healthLabel(h)}</p><p className="text-[11px] text-mute">average freshness</p></div></motion.div>
      <motion.div {...anim(1)} className={card}>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl" style={{ background: "linear-gradient(145deg,#FF8A3C,#FF477E)", boxShadow: "0 8px 20px -6px #FF477E" }}><motion.span animate={st.n ? { scale: [1, 1.15, 1] } : undefined} transition={{ duration: 1.6, repeat: Infinity }}><Flame size={22} color="#fff" aria-hidden /></motion.span></span>
        <div className="min-w-0"><p className="text-[11px] text-mute">Progress streak</p><p className="text-[16px] font-bold leading-tight">{st.n ? `${st.n} ${st.n === 1 ? "day" : "days"}` : "Start today"}</p>
          <div className="mt-1 flex gap-1" aria-label="Last 7 days">{st.last7.map((on, i) => <span key={i} className={`h-1.5 w-3.5 rounded-full ${on ? "bg-honey" : "bg-line"}`} />)}</div></div>
      </motion.div>
      <motion.div {...anim(2)} className={card}>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl" style={{ background: "linear-gradient(145deg,#FFD23F,#E8A800)", boxShadow: "0 8px 20px -6px #FFC629" }}><Crown size={22} color="#1a1304" aria-hidden /></span>
        <div className="min-w-0 flex-1"><p className="text-[11px] text-mute">Bee rank</p><p className="text-[16px] font-bold leading-tight">{rk.name}</p>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line"><motion.div className="h-full rounded-full bg-honey" initial={{ width: 0 }} animate={{ width: `${rk.pct}%` }} transition={{ duration: 1 }} /></div>
          <p className="mt-1 text-[10px] text-mute">{rk.next ? `${rk.next.at - rk.pts} more step${rk.next.at - rk.pts === 1 ? "" : "s"} to ${rk.next.name}` : "Top rank. Well done."}</p></div>
      </motion.div>
      <motion.div {...anim(3)} className="card p-3.5"><div className="flex items-baseline justify-between"><p className="text-[11px] text-mute">Warmth, 14 days</p><p className="text-[13px] font-bold"><CountUp to={warmth(cells, now)} suffix="%" /></p></div><Spark data={series} /></motion.div>
    </section>
  );
}
