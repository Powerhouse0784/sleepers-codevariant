"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useIdeas, useIdeasUI } from "@/lib/ideasStore";
import { useUI } from "@/lib/store";
import { CATEGORIES, type Category } from "@/features/ideas/ideas";
import { CategoryPill } from "./IdeaCover";

/** "Share New Idea". Opens from the hero, the sidebar, the right rail and the command palette. */
export default function ShareIdeaDialog() {
  const open = useIdeasUI((s) => s.shareOpen), setOpen = useIdeasUI((s) => s.setShare), clearFilters = useIdeasUI((s) => s.clearFilters);
  const add = useIdeas((s) => s.add); const toast = useUI((s) => s.toast), celebrate = useUI((s) => s.celebrate);
  const [title, setTitle] = useState(""); const [summary, setSummary] = useState(""); const [cat, setCat] = useState<Category>("tech"); const [err, setErr] = useState("");
  const close = () => { setOpen(false); setTitle(""); setSummary(""); setErr(""); };
  const save = (shared: boolean) => {
    if (!title.trim()) return setErr("Give your idea a title.");
    if (!summary.trim()) return setErr("Add a sentence or two so people get it.");
    add({ title: title.trim(), summary: summary.trim(), category: cat, shared }, Date.now());
    clearFilters(); close();
    if (shared) { celebrate(); toast("Idea shared. The hive is buzzing!"); } else toast("Saved as a draft. Find it under Total Ideas.");
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.form role="dialog" aria-modal="true" aria-label="Share a new idea" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.key === "Escape" && close()} onSubmit={(e) => { e.preventDefault(); save(true); }}
            className="w-full max-w-md rounded-3xl border border-line bg-panel p-6" initial={{ y: 40, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: 0.97 }}>
            <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Share a new idea</h2><button type="button" onClick={close} aria-label="Close" className="rounded-full p-2 text-mute hover:bg-white/5"><X size={18} /></button></div>
            <p className="mt-1 text-xs text-mute">Small thoughts are welcome. Others can like and comment on it.</p>
            <label className="mt-4 block text-xs font-medium text-mute" htmlFor="idea-title">Title</label>
            <input id="idea-title" autoFocus value={title} maxLength={80} onChange={(e) => { setTitle(e.target.value); setErr(""); }} placeholder="e.g. Study group matchmaker" className="field mt-1.5 w-full px-3 py-3 text-base" />
            <div className="mt-4 flex items-end justify-between"><label className="block text-xs font-medium text-mute" htmlFor="idea-summary">What is it?</label><span className="text-[11px] text-mute">{summary.length}/200</span></div>
            <textarea id="idea-summary" value={summary} maxLength={200} rows={3} onChange={(e) => { setSummary(e.target.value); setErr(""); }} placeholder="Who is it for, and what does it change?" className="field mt-1.5 w-full resize-none px-3 py-2.5 text-sm" />
            <p className="mt-4 text-xs font-medium text-mute" id="idea-cat">Category</p>
            <div className="mt-1.5 flex flex-wrap gap-2" role="radiogroup" aria-labelledby="idea-cat">
              {CATEGORIES.map((c) => <button key={c} type="button" role="radio" aria-checked={cat === c} onClick={() => setCat(c)} className={`rounded-md p-0.5 ${cat === c ? "ring-2 ring-honey" : "opacity-70 hover:opacity-100"}`}><CategoryPill category={c} className="px-2.5 py-1 text-[11px]" /></button>)}
            </div>
            <p role="alert" className="mt-3 min-h-5 text-xs text-[#FF6686]">{err}</p>
            <div className="flex gap-2"><button type="button" onClick={() => save(false)} className="btn-blue px-4 py-3 text-sm">Save as draft</button><button type="submit" className="btn-gold flex-1 py-3 text-sm">Share idea</button></div>
          </motion.form>
        </motion.div>)}
    </AnimatePresence>
  );
}
