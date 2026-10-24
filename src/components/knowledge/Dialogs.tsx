"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Copy, Mail, PlayCircle } from "lucide-react";
import { useKb } from "@/features/knowledge/store";
import { useUI } from "@/lib/store";

const SUPPORT_EMAIL = "support@eventbeebuzz.example";
const Shell = ({ label, onClose, children }: { label: string; onClose: () => void; children: React.ReactNode }) => (
  <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
    <motion.div role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.key === "Escape" && onClose()} className="w-full max-w-md rounded-3xl border border-line bg-panel p-6" initial={{ y: 40, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: 0.97 }}>
      {children}</motion.div>
  </motion.div>
);

export function SupportDialog() {
  const open = useKb((s) => s.supportOpen), setOpen = useKb((s) => s.setSupport), toast = useUI((s) => s.toast);
  const [subject, setSubject] = useState(""); const [msg, setMsg] = useState(""); const [err, setErr] = useState("");
  const body = `${subject.trim() ? `Subject: ${subject.trim()}\n\n` : ""}${msg.trim()}`;
  const close = () => { setOpen(false); setErr(""); };
  const valid = () => (msg.trim() ? true : (setErr("Tell us a little about what is going wrong."), false));
  return (
    <AnimatePresence>
      {open && (
        <Shell label="Contact support" onClose={close}>
          <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Contact support</h2><button onClick={close} aria-label="Close" className="rounded-full p-2 text-mute hover:bg-white/5"><X size={18} /></button></div>
          <p className="mt-1 text-[12px] leading-relaxed text-mute">This prototype has no support inbox, so nothing is sent from here. Write your message, then copy it or open it in your email app.</p>
          <label htmlFor="sp-sub" className="mt-4 block text-xs font-medium text-mute">Subject (optional)</label>
          <input id="sp-sub" autoFocus value={subject} onChange={(e) => setSubject(e.target.value)} className="field mt-1.5 w-full px-3 py-2.5 text-sm" placeholder="e.g. My event shows the wrong status" />
          <label htmlFor="sp-msg" className="mt-3 block text-xs font-medium text-mute">What happened?</label>
          <textarea id="sp-msg" value={msg} onChange={(e) => { setMsg(e.target.value); setErr(""); }} rows={4} className="field mt-1.5 w-full resize-none px-3 py-2.5 text-sm" placeholder="What you did, what you expected and what you saw." />
          <p role="alert" className="mt-2 min-h-5 text-xs text-[#FF6686]">{err}</p>
          <div className="mt-1 flex gap-2">
            <button onClick={async () => { if (!valid()) return; try { await navigator.clipboard.writeText(body); toast("Message copied."); } catch { toast("Copy is blocked here. Select the text instead."); } }} className="btn-blue inline-flex flex-1 items-center justify-center gap-2 px-3 py-2.5 text-[13px]"><Copy size={14} aria-hidden /> Copy message</button>
            <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject.trim() || "Event Bee Buzz help")}&body=${encodeURIComponent(msg.trim())}`} onClick={(e) => { if (!valid()) e.preventDefault(); }} className="btn-gold inline-flex flex-1 items-center justify-center gap-2 px-3 py-2.5 text-[13px]"><Mail size={14} aria-hidden /> Open in email</a>
          </div>
        </Shell>)}
    </AnimatePresence>
  );
}

const VIDEOS = [
  { t: "Capture your first idea", id: "capture-your-first-idea-in-seconds", m: "1 min" },
  { t: "Create and run an event", id: "how-to-create-and-manage-events", m: "3 min" },
  { t: "Read the Momentum Hive", id: "understanding-the-momentum-hive", m: "4 min" },
];
export function VideoDialog() {
  const open = useKb((s) => s.videoOpen), setOpen = useKb((s) => s.setVideo), read = useKb((s) => s.open);
  const close = () => setOpen(false);
  return (
    <AnimatePresence>
      {open && (
        <Shell label="Video tutorials" onClose={close}>
          <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Video tutorials</h2><button autoFocus onClick={close} aria-label="Close" className="rounded-full p-2 text-mute hover:bg-white/5"><X size={18} /></button></div>
          <p className="mt-1 text-[12px] leading-relaxed text-mute">Videos are planned but not recorded yet. These are the first three, and each has a written step-by-step guide you can read today.</p>
          <ul className="mt-4 space-y-2">
            {VIDEOS.map((v) => (
              <li key={v.id}><button onClick={() => { close(); read(v.id); }} className="flex w-full items-center gap-3 rounded-2xl border border-line p-3 text-left transition hover:border-honey/60 hover:bg-white/5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#8B35FF]/25 text-[#b98cff]"><PlayCircle size={20} aria-hidden /></span>
                <span className="flex-1"><span className="block text-[13px] font-semibold">{v.t}</span><span className="block text-[11px] text-mute">Coming soon · {v.m} · read the guide instead</span></span></button></li>))}
          </ul>
        </Shell>)}
    </AnimatePresence>
  );
}
