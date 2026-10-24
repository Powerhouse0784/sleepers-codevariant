"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { CalendarDays, MapPin, MoreVertical, Lightbulb, Users, Zap, ExternalLink, Clock } from "lucide-react";
import type { HiveEvent } from "@/types";
import { dateRange, startsIn, type EventStats, type EventStatus } from "@/features/events/events";
import EventCover, { TypePill } from "./EventCover";

const STATUS: Record<EventStatus, { label: string; color: string }> = {
  active: { label: "Active", color: "#1FBF8F" }, upcoming: { label: "Upcoming", color: "#3F8CFF" },
  past: { label: "Past", color: "var(--mute)" }, archived: { label: "Archived", color: "var(--mute)" },
};
export function StatusPill({ status }: { status: EventStatus }) {
  const s = STATUS[status];
  return <span className="inline-flex items-center rounded-md px-2.5 py-[3px] text-[11px] font-semibold" style={{ color: s.color, background: `color-mix(in srgb, ${s.color} 16%, transparent)`, border: status === "archived" ? "1px dashed var(--line)" : undefined }}>{s.label}</span>;
}
export function Progress({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-2" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <span className="h-[6px] flex-1 overflow-hidden rounded-full bg-line">
        <motion.span className="block h-full rounded-full" style={{ background: value >= 90 ? "var(--bar-hi)" : "var(--bar-lo)" }} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.9, ease: "easeOut" }} /></span>
      <span className="w-9 text-right text-[11px] font-semibold text-mute">{value}%</span>
    </div>
  );
}

/** Compact menu — primary actions (Archive/Capture) moved to the drag dock */
function Menu({ e, onOpen }: { e: HiveEvent; onOpen: () => void }) {
  const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (ev: MouseEvent) => { if (!ref.current?.contains(ev.target as Node)) setOpen(false); };
    const esc = (ev: KeyboardEvent) => ev.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", off); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", off); document.removeEventListener("keydown", esc); };
  }, [open]);
  const item = "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] hover:bg-white/5";
  return (
    <div ref={ref} className="relative z-10 shrink-0" data-no-drag>
      <button onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open} aria-label={`Actions for ${e.title}`} className="grid h-7 w-7 place-items-center rounded-full text-mute hover:bg-white/10 hover:text-[var(--text)]"><MoreVertical size={16} aria-hidden /></button>
      {open && (
        <div role="menu" className="card absolute right-0 top-8 z-30 w-52 rounded-xl! p-1.5">
          <button role="menuitem" className={item} onClick={() => { setOpen(false); onOpen(); }}><ExternalLink size={14} aria-hidden /> Open event</button>
          <p className="px-2.5 pb-1 pt-2 text-[10.5px] leading-tight text-mute">⠿ Drag the card to Archive or Capture into this event</p>
        </div>)}
    </div>
  );
}

const Stat = ({ I, n, label }: { I: typeof Lightbulb; n: number; label: string }) => (
  <span className="flex items-center gap-1.5"><I size={15} className="shrink-0 opacity-80" aria-hidden /><span className="leading-none"><span className="block text-[13px] font-semibold">{n}</span><span className="mt-0.5 block text-[10px] text-mute">{label}</span></span></span>
);

type Props = { e: HiveEvent; status: EventStatus; stats: EventStats; now: number; layout: "grid" | "row"; index: number;
  onOpen: () => void; onCapture: () => void; onArchive: () => void };

export default function EventCard({ e, status, stats, now, layout, index, onOpen }: Props) {
  const tint = status === "active" ? "#1FBF8F55" : "var(--line)";
  const common = { style: { "--tint": tint } as React.CSSProperties };
  const menu = <Menu e={e} onOpen={onOpen} />;
  const title = <button onClick={onOpen} className="truncate text-left text-[14px] font-bold leading-tight after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-2xl">{e.title}</button>;
  const meta = (
    <>
      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-mute"><CalendarDays size={12} className="shrink-0" aria-hidden /><span className="truncate">{dateRange(e)}</span></p>
      <p className="mt-1 flex items-center gap-1.5 text-[11px] text-mute"><MapPin size={12} className="shrink-0" aria-hidden /><span className="truncate">{e.venue ?? "Venue to be added"}</span></p>
    </>
  );
  const progress = status === "upcoming"
    ? <p className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "#3F8CFF" }}><Clock size={13} aria-hidden /> {startsIn(e, now)}</p>
    : <Progress value={stats.progress} label={`${e.title} progress`} />;

  if (layout === "row") {
    return (
      <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 8) * 0.04 }} {...common}
        className="card tile group relative flex gap-3 p-2.5 transition hover:-translate-y-0.5">
        <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-xl sm:h-[104px] sm:w-[120px]"><EventCover type={e.type} seed={e.id} className="h-full w-full" />
          <TypePill type={e.type} className="absolute bottom-1.5 left-1.5" /></div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-1">{title}{menu}</div>
          {meta}
          <div className="mt-auto flex items-center gap-3 pt-2"><StatusPill status={status} /><div className="min-w-0 flex-1">{progress}</div></div>
          <div className="mt-2 hidden gap-5 border-t border-line pt-2 sm:flex"><Stat I={Lightbulb} n={stats.ideas} label="Ideas" /><Stat I={Users} n={stats.people} label="People" /><Stat I={Zap} n={stats.actions} label="Actions" /></div>
        </div>
      </motion.article>
    );
  }
  return (
    <motion.article layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 8) * 0.05 }} {...common}
      className="card tile group relative flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-16px_rgba(35,120,255,.55)]">
      <div className="relative h-[96px] overflow-hidden"><EventCover type={e.type} seed={e.id} className="h-full w-full transition duration-500 group-hover:scale-105" />
        <TypePill type={e.type} className="absolute bottom-2 left-2.5" /></div>
      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-start justify-between gap-1">{title}{menu}</div>
        {meta}
        <div className="mt-2.5"><StatusPill status={status} /></div>
        <div className="mt-2.5">{progress}</div>
        <div className="mt-3 grid grid-cols-3 gap-1 border-t border-line pt-3"><Stat I={Lightbulb} n={stats.ideas} label="Ideas" /><Stat I={Users} n={stats.people} label="People" /><Stat I={Zap} n={stats.actions} label="Actions" /></div>
        <p className="mt-2 text-[10px] text-mute/60 select-none" aria-hidden>⠿ drag to archive · capture · open</p>
      </div>
    </motion.article>
  );
}
