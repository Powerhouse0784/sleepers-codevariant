"use client";
import { GripVertical, Sparkles } from "lucide-react";
import Draggable from "../canvas/Draggable";
import { composerCard } from "./IdeaZones";
import { CATEGORIES, CATEGORY_COLOR, CATEGORY_LABEL } from "@/features/ideas/ideas";
import { useIdeasUI } from "@/lib/ideasStore";

/** The new-idea note. Write on it, then drag it onto Publish (share) or Save draft. There is no submit button. */
export default function Composer() {
  const c = useIdeasUI((s) => s.composer); const set = useIdeasUI((s) => s.setComposer);
  return (
    <Draggable label={c.title.trim() || "New idea note"} payload={() => composerCard(c.title, c.summary, c.category)} className="h-full">
      <section aria-label="New idea note" className="card relative flex h-full flex-col gap-2 border-2 border-dashed p-3.5" style={{ borderColor: "color-mix(in srgb,var(--gold) 55%,transparent)", background: "linear-gradient(160deg, color-mix(in srgb,var(--gold) 14%,var(--surface)), var(--surface) 75%)" }}>
        <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-honey"><Sparkles size={14} aria-hidden /> New idea note<GripVertical size={16} className="ml-auto text-mute" aria-hidden /></p>
        <label className="sr-only" htmlFor="idea-composer-title">Idea title</label>
        <input id="idea-composer-title" value={c.title} maxLength={80} onChange={(e) => set({ title: e.target.value })} placeholder="Title your idea…" className="field w-full px-3 py-2 text-[14px] font-semibold" />
        <label className="sr-only" htmlFor="idea-composer-summary">What is it?</label>
        <textarea id="idea-composer-summary" value={c.summary} maxLength={200} rows={3} onChange={(e) => set({ summary: e.target.value })} placeholder="Who is it for, and what does it change?" className="field w-full resize-none px-3 py-2 text-[12.5px]" />
        <div className="flex flex-wrap gap-1" role="group" aria-label="Category">
          {CATEGORIES.map((k) => <button key={k} type="button" aria-pressed={c.category === k} onClick={() => set({ category: k })} className="rounded-md px-1.5 py-[3px] text-[9.5px] font-semibold text-white transition" style={{ background: CATEGORY_COLOR[k], opacity: c.category === k ? 1 : 0.4, outline: c.category === k ? "2px solid var(--gold)" : "none", outlineOffset: 1 }}>{CATEGORY_LABEL[k]}</button>)}
        </div>
        <p className="mt-auto pt-1 text-[11px] leading-snug text-mute">Drag this note onto <b className="text-[#a78bfa]">Publish</b> to share it, or <b className="text-[#6FB1FF]">Save draft</b> to keep it.</p>
      </section>
    </Draggable>
  );
}
