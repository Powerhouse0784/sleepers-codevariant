"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Lightbulb, UserRound, CheckSquare, FileText, X } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { useNow } from "@/lib/hooks";
import type { Kind } from "@/types";

const KINDS: { k: Kind; label: string; Icon: typeof Lightbulb; ph: string }[] = [
  { k: "idea", label: "Idea", Icon: Lightbulb, ph: "What is the idea?" },
  { k: "person", label: "Person", Icon: UserRound, ph: "Who did you meet?" },
  { k: "action", label: "Action", Icon: CheckSquare, ph: "What do you need to do?" },
  { k: "note", label: "Note", Icon: FileText, ph: "What do you want to remember?" },
];

export default function QuickCapture() {
  const open = useUI((s) => s.captureOpen), setOpen = useUI((s) => s.setCapture), select = useUI((s) => s.select);
  const events = useStore((s) => s.events), addCell = useStore((s) => s.addCell);
  const now = useNow();
  const [kind, setKind] = useState<Kind>("idea");
  const [title, setTitle] = useState(""); const [note, setNote] = useState(""); const [eventId, setEventId] = useState("");
  const ck = useUI((s) => s.captureKind), ceid = useUI((s) => s.captureEventId);
  useEffect(() => { if (open) { setKind(ck); setEventId(ceid); } }, [open, ck, ceid]);
  const cur = KINDS.find((x) => x.k === kind)!;
  const close = () => { setOpen(false); setTitle(""); setNote(""); };
  const save = () => {
    if (!title.trim()) return;
    const id = addCell({ kind, title: title.trim(), note: note.trim() || undefined, eventId: eventId || events[0]?.id || "" }, now);
    close(); select(id);
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.div role="dialog" aria-modal="true" aria-label="Quick capture" onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === "Escape" && close()}
            className="w-full max-w-md rounded-3xl border border-line bg-panel p-6" initial={{ y: 40, scale: .97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: .97 }}>
            <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Capture</h2>
              <button onClick={close} aria-label="Close" className="rounded-full p-2 text-mute hover:bg-white/5"><X size={18} /></button></div>
            <div className="mt-4 grid grid-cols-4 gap-2" role="tablist">
              {KINDS.map(({ k, label, Icon }) => (
                <button key={k} role="tab" aria-selected={kind === k} onClick={() => setKind(k)}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${kind === k ? "border-honey bg-honey/10 text-honey" : "border-line text-mute"}`}>
                  <Icon size={16} aria-hidden /> {label}</button>))}
            </div>
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && save()} placeholder={cur.ph} aria-label="Title"
              className="mt-4 w-full rounded-xl border border-line bg-ink px-3 py-3 text-base placeholder:text-mute/60" />
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={kind === "person" ? "What did you promise them?" : "Optional note"} aria-label="Note" rows={2}
              className="mt-3 w-full resize-none rounded-xl border border-line bg-ink px-3 py-2.5 text-sm placeholder:text-mute/60" />
            <select value={eventId} onChange={(e) => setEventId(e.target.value)} aria-label="Event" className="mt-3 w-full rounded-xl border border-line bg-ink px-3 py-2.5 text-sm">
              {events.filter((e) => !e.archived).map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
            <button onClick={save} disabled={!title.trim()} className="mt-5 w-full rounded-xl bg-honey py-3 text-sm font-semibold text-[#1a1304] disabled:opacity-40">Add to hive</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
