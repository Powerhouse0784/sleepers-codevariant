"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { useNow } from "@/lib/hooks";
import { EVENT_TYPES } from "@/types";
import { TypePill } from "./EventCover";
import { ActionIntentCard } from "../canvas/ActionIntent";

const dayStr = (ms: number) => { const d = new Date(ms); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const at = (day: string, h: number) => { const [y, m, d] = day.split("-").map(Number); return new Date(y, m - 1, d, h).toISOString(); };

export default function CreateEventDialog() {
  const open = useUI((s) => s.createEventOpen), setOpen = useUI((s) => s.setCreateEvent), openEvent = useUI((s) => s.openEvent);
  const addEvent = useStore((s) => s.addEvent); const now = useNow();
  const [title, setTitle] = useState(""); const [type, setType] = useState<string>("Conference"); const [venue, setVenue] = useState(""); const [tags, setTags] = useState("");
  const [start, setStart] = useState(""); const [end, setEnd] = useState(""); const [err, setErr] = useState("");
  useEffect(() => { if (open) { setStart(dayStr(now)); setEnd(dayStr(now)); setErr(""); } }, [open, now]);
  const close = () => { setOpen(false); setTitle(""); setVenue(""); setTags(""); setErr(""); };
  const save = () => {
    if (!title.trim()) return setErr("Give your event a name.");
    if (!start || !end || end < start) return setErr("The end date can't be before the start date.");
    const id = addEvent({ title: title.trim(), type, venue: venue.trim() || undefined, tags: tags.split(",").map((t) => t.trim()).filter(Boolean), startsAt: at(start, 9), endsAt: at(end, 18) }, now);
    close(); openEvent(id);
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.form role="dialog" aria-modal="true" aria-label="Create event" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.key === "Escape" && close()} onSubmit={(e) => { e.preventDefault(); setErr("Drag the Create event card onto Execute to save."); }}
            className="w-full max-w-md rounded-3xl border border-line bg-panel p-6" initial={{ y: 40, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: 0.97 }}>
            <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Create event</h2><button type="button" onClick={close} aria-label="Close" className="rounded-full p-2 text-mute hover:bg-white/5"><X size={18} /></button></div>
            <p className="mt-1 text-xs text-mute">Start with the basics. You can capture ideas, people and actions into it right after.</p>
            <label className="mt-4 block text-xs font-medium text-mute" htmlFor="ev-title">Event name</label>
            <input id="ev-title" autoFocus value={title} onChange={(e) => { setTitle(e.target.value); setErr(""); }} placeholder="e.g. HackSphere 2026" className="field mt-1.5 w-full px-3 py-3 text-base" />
            <p className="mt-4 text-xs font-medium text-mute" id="ev-type">Type</p>
            <div className="mt-1.5 flex flex-wrap gap-2" role="radiogroup" aria-labelledby="ev-type">
              {EVENT_TYPES.map((t) => <button key={t} type="button" role="radio" aria-checked={type === t} onClick={() => setType(t)} className={`rounded-full p-0.5 ${type === t ? "ring-2 ring-honey" : "opacity-70 hover:opacity-100"}`}><TypePill type={t} className="px-3 py-1 text-[11px]" /></button>)}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-mute" htmlFor="ev-start">Starts</label><input id="ev-start" type="date" value={start} onChange={(e) => { setStart(e.target.value); if (end < e.target.value) setEnd(e.target.value); setErr(""); }} className="field mt-1.5 w-full px-3 py-2.5 text-sm" /></div>
              <div><label className="block text-xs font-medium text-mute" htmlFor="ev-end">Ends</label><input id="ev-end" type="date" min={start} value={end} onChange={(e) => { setEnd(e.target.value); setErr(""); }} className="field mt-1.5 w-full px-3 py-2.5 text-sm" /></div>
            </div>
            <label className="mt-4 block text-xs font-medium text-mute" htmlFor="ev-venue">Venue or link</label>
            <input id="ev-venue" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="City, venue, or Online" className="field mt-1.5 w-full px-3 py-2.5 text-sm" />
            <label className="mt-4 block text-xs font-medium text-mute" htmlFor="ev-tags">Tags (optional, comma separated)</label>
            <input id="ev-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="AI, founders" className="field mt-1.5 w-full px-3 py-2.5 text-sm" />
            <p role="alert" className="mt-3 min-h-5 text-xs text-[#FF6686]">{err}</p>
            <ActionIntentCard label="Create event" hint="Create this event from the details above" onExecute={save} className="mt-2"><div className="btn-gold w-full rounded-xl py-3 text-center text-sm">Create event</div></ActionIntentCard>
          </motion.form>
        </motion.div>)}
    </AnimatePresence>
  );
}
