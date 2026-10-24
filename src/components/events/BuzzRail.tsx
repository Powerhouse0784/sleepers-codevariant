"use client";
import Link from "next/link";
import { ArrowRight, Calendar, Flame, Snowflake, Sun, Sparkles as SparkIcon } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { ago, stateCount } from "@/features/events/events";
import Hex from "./Hex";
import EventCover from "./EventCover";

const STATES = [
  { s: "hot", label: "Hot", range: "0-2 days", from: "#FF7A45", to: "#D8262F", glow: "rgba(255,110,60,.55)", Icon: Flame },
  { s: "warm", label: "Warm", range: "3-7 days", from: "#FFD84D", to: "#F2A100", glow: "rgba(255,196,41,.5)", Icon: Sun },
  { s: "cooling", label: "Cooling", range: "1-4 weeks", from: "#3F95FF", to: "#1747C9", glow: "rgba(60,140,255,.5)", Icon: Snowflake },
] as const;

/** "Keep the buzz alive": three hexes, each a real filter into the hive. */
export function KeepAlive({ compact, now }: { compact?: boolean; now: number }) {
  const cells = useStore((s) => s.cells);
  const hexes = STATES.map((h) => ({ ...h, n: stateCount(cells, now, h.s) }));
  return (
    <section className="card relative overflow-hidden p-4" aria-labelledby="alive">
      <h2 id="alive" className="flex items-center gap-2 text-[15px] font-semibold"><SparkIcon size={16} className="text-honey" aria-hidden /> <span className="script text-[19px] font-normal">Keep the buzz alive</span></h2>
      <p className="mt-0.5 text-[11px] text-mute">Pick up where you left off.</p>
      {compact ? (
        <ul className="mt-3 flex items-center gap-2">
          {hexes.map((h) => (
            <li key={h.s} className="flex-1"><Link href={`/hive?state=${h.s}`} className="flex items-center gap-2 rounded-xl p-1 hover:bg-white/5" aria-label={`${h.label}, ${h.range}: ${h.n} items`}>
              <Hex size={34} from={h.from} to={h.to} glow={h.glow}><h.Icon size={14} color="#fff" aria-hidden /></Hex>
              <span className="text-[12px] font-semibold leading-tight">{h.label}<span className="block text-[10px] font-normal text-mute">{h.range}</span></span></Link></li>))}
        </ul>
      ) : (
        <div className="relative mx-auto mt-2 h-[196px] w-[200px]">
          {[{ h: hexes[0], x: 0, y: 8 }, { h: hexes[1], x: 100, y: 8 }, { h: hexes[2], x: 50, y: 86 }].map(({ h, x, y }) => (
            <Link key={h.s} href={`/hive?state=${h.s}`} aria-label={`${h.label}, ${h.range}: ${h.n} items`} title={`${h.n} item${h.n === 1 ? "" : "s"}`} className="group absolute transition hover:-translate-y-0.5" style={{ left: x, top: y }}>
              <Hex size={96} from={h.from} to={h.to} glow={h.glow}>
                <span className="flex flex-col items-center leading-tight text-white"><h.Icon size={20} aria-hidden /><span className="mt-0.5 text-[13px] font-bold">{h.label}</span><span className="text-[10px] opacity-90">{h.range}</span></span>
              </Hex></Link>))}
        </div>
      )}
      <Link href="/hive" aria-label="Open the Momentum Hive" className={`${compact ? "absolute right-4 top-4" : "absolute bottom-3 right-3"} grid h-9 w-9 place-items-center rounded-full border border-honey text-honey transition hover:bg-honey hover:text-[var(--on-gold)] [[data-theme=light]_&]:border-transparent [[data-theme=light]_&]:bg-primary [[data-theme=light]_&]:text-white`}><ArrowRight size={16} aria-hidden /></Link>
    </section>
  );
}

export function RecentlyRevisited({ now, onViewAll }: { now: number; onViewAll: () => void }) {
  const events = useStore((s) => s.events); const openEvent = useUI((s) => s.openEvent);
  const recent = events.filter((e) => e.visitedAt).sort((a, b) => Date.parse(b.visitedAt!) - Date.parse(a.visitedAt!)).slice(0, 3);
  return (
    <section className="card p-4" aria-labelledby="revisited">
      <h2 id="revisited" className="flex items-center gap-2 text-[14px] font-semibold"><Calendar size={16} className="text-mute" aria-hidden /> Recently revisited</h2>
      {recent.length === 0 ? <p className="mt-3 text-xs text-mute">Events you open show up here.</p> : (
        <ul className="mt-3 space-y-1">
          {recent.map((e) => (
            <li key={e.id}><button onClick={() => openEvent(e.id)} className="flex w-full items-center gap-3 rounded-xl p-1.5 text-left transition hover:bg-white/5">
              <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg"><EventCover type={e.type} seed={e.id} className="h-full w-full" /></span>
              <span className="min-w-0"><span className="block truncate text-[12.5px] font-semibold">{e.title}</span><span className="block text-[11px] text-mute">{ago(e.visitedAt!, now)}</span></span></button></li>))}
        </ul>)}
      <button onClick={onViewAll} className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline [[data-theme=dark]_&]:text-honey">View all events <ArrowRight size={13} aria-hidden /></button>
    </section>
  );
}
