"use client";
import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, CalendarDays, MapPin, Lightbulb, UserRound, CheckSquare, FileText, Archive, ArchiveRestore, Info } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { useNow } from "@/lib/hooks";
import { getMomentum } from "@/features/momentum/momentum";
import { dateRange, eventStats, eventStatus, startsIn } from "@/features/events/events";
import MomentumBadge from "../MomentumBadge";
import EventCover, { TypePill } from "./EventCover";
import { Progress, StatusPill } from "./EventCard";
import type { Kind } from "@/types";
import { ActionIntentCard } from "../canvas/ActionIntent";
import Draggable from "../canvas/Draggable";
import { hiveCellCard } from "../hive/HiveZones";

const KINDS: { k: Kind; label: string; I: typeof Lightbulb }[] = [
  { k: "idea", label: "Idea", I: Lightbulb }, { k: "person", label: "Person", I: UserRound }, { k: "action", label: "Action", I: CheckSquare }, { k: "note", label: "Note", I: FileText },
];

/** Event workspace in a drawer: what you captured here, a capture shortcut for each type, and archive. */
export default function EventDrawer() {
  const id = useUI((s) => s.eventId), openEvent = useUI((s) => s.openEvent), setCapture = useUI((s) => s.setCapture);
  const { events, cells, visitEvent, setEventArchived } = useStore(); const now = useNow();
  const e = events.find((x) => x.id === id);
  useEffect(() => { if (id) visitEvent(id, Date.now()); }, [id, visitEvent]);
  const mine = useMemo(() => cells.filter((c) => c.eventId === id && !c.archived).sort((a, b) => Date.parse(b.lastMeaningfulActivityAt) - Date.parse(a.lastMeaningfulActivityAt)), [cells, id]);
  const status = e ? eventStatus(e, now) : "past"; const stats = e ? eventStats(e, cells) : null;
  const close = () => openEvent(null);
  return (
    <AnimatePresence>
      {e && stats && (
        <>
          <motion.div key="scrim" className="fixed inset-0 z-30 bg-black/50" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside key="drawer" role="dialog" aria-modal="true" aria-label={e.title} onKeyDown={(ev) => ev.key === "Escape" && close()}
            className="fixed inset-x-0 bottom-0 z-40 max-h-[90dvh] overflow-y-auto rounded-t-3xl border border-line bg-panel md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[440px] md:rounded-none md:rounded-l-3xl"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <div className="relative h-36 overflow-hidden"><EventCover type={e.type} seed={e.id} className="h-full w-full" />
              <TypePill type={e.type} className="absolute bottom-3 left-4" />
              <button autoFocus onClick={close} aria-label="Close event" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur hover:bg-black/60"><X size={18} /></button></div>
            <div className="p-6 pt-4">
              <div className="flex items-center gap-2"><StatusPill status={status} />{e.tags?.map((t) => <span key={t} className="rounded-md border border-line px-2 py-[2px] text-[10px] text-mute">{t}</span>)}</div>
              <h2 className="mt-2 text-2xl font-semibold leading-tight">{e.title}</h2>
              <p className="mt-2 flex items-center gap-2 text-[13px] text-mute"><CalendarDays size={14} aria-hidden />{dateRange(e)}</p>
              <p className="mt-1 flex items-center gap-2 text-[13px] text-mute"><MapPin size={14} aria-hidden />{e.venue ?? "Venue to be added"}</p>
              <div className="mt-4">{status === "upcoming" ? <p className="text-[13px] font-medium text-[#3F8CFF]">{startsIn(e, now)}</p> : <Progress value={stats.progress} label="Event progress" />}</div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[["Ideas", stats.ideas], ["People", stats.people], ["Actions", stats.actions]].map(([l, n]) => <div key={l} className="rounded-xl border border-line py-2.5"><p className="text-xl font-bold">{n}</p><p className="text-[11px] text-mute">{l}</p></div>)}
              </div>
              {e.sample && <p className="mt-3 flex gap-2 rounded-xl border border-line p-3 text-[11px] leading-relaxed text-mute"><Info size={14} className="mt-px shrink-0" aria-hidden /> Sample event: its starting counts are demo data. Anything you capture here is added on top and updates progress.</p>}

              {status !== "archived" && <>
                <h3 className="mt-6 text-sm font-semibold">Capture into this event</h3>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {KINDS.map(({ k, label, I }) => <ActionIntentCard key={k} label={`Capture ${label.toLowerCase()}`} hint={`Capture a ${label.toLowerCase()} into this event`} onExecute={() => setCapture(true, k, e.id)} className="rounded-xl"><div className="flex flex-col items-center gap-1.5 rounded-xl border border-line py-3 text-[11px] font-medium text-mute"><I size={18} aria-hidden />{label}</div></ActionIntentCard>)}
                </div></>}

              <h3 className="mt-6 text-sm font-semibold">Captured here</h3>
              {mine.length === 0 ? <p className="mt-2 rounded-xl border border-dashed border-line p-4 text-center text-[13px] text-mute">Nothing captured yet. Add someone you met or an idea you had.</p> : (
                <ul className="mt-2 divide-y divide-line">
                  {mine.map((c) => { const I = KINDS.find((x) => x.k === c.kind)!.I; return (
                    <li key={c.id}><Draggable label={c.title} payload={() => hiveCellCard(c)} className="w-full"><div className="flex w-full items-center gap-3 py-2.5 text-left hover:bg-white/5"><I size={16} className="shrink-0 text-mute" aria-hidden /><span className="min-w-0 flex-1 truncate text-[13px]">{c.title}</span>{!c.done && <MomentumBadge state={getMomentum(c, now).state} />}{c.done && <span className="text-[11px] text-[#1FBF8F]">Done</span>}<span className="text-[10px] text-mute/70">Drag</span></div></Draggable></li>); })}
                </ul>)}

              <ActionIntentCard label={status === "archived" ? "Restore event" : "Archive event"} hint={status === "archived" ? "Restore this event" : "Archive this event"} onExecute={() => { setEventArchived(e.id, status !== "archived", Date.now()); if (status !== "archived") close(); }} className="mt-6"><div className="inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm">{status === "archived" ? <ArchiveRestore size={16} aria-hidden /> : <Archive size={16} aria-hidden />} {status === "archived" ? "Restore event" : "Archive event"}</div></ActionIntentCard>
            </div>
          </motion.aside>
        </>)}
    </AnimatePresence>
  );
}
