"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, ThumbsUp, Send, Trash2, Info, Share2 } from "lucide-react";
import { useIdeas, useIdeasUI } from "@/lib/ideasStore";
import { useStore, useUI } from "@/lib/store";
import { useNow } from "@/lib/hooks";
import { ME, STAGE_LABEL, authorName, commentCount, likeCount, when, type Stage } from "@/features/ideas/ideas";
import IdeaCover, { Avatar, CategoryPill } from "./IdeaCover";
import { StatusBadge } from "./IdeaCard";

const STAGES: Stage[] = ["idea", "progress", "done"];

/** One idea in a drawer: read it, like it, comment, and (if it's yours) move it along. Mounted in the Shell so it opens from anywhere. */
export default function IdeaDrawer() {
  const id = useIdeasUI((s) => s.openId), open = useIdeasUI((s) => s.open);
  const { ideas, toggleLike, comment, setStage, share, remove } = useIdeas(); const userName = useStore((s) => s.userName); const toast = useUI((s) => s.toast); const celebrate = useUI((s) => s.celebrate); const now = useNow();
  const [text, setText] = useState(""); const [sure, setSure] = useState(false);
  const idea = ideas.find((i) => i.id === id); const mine = idea?.authorId === ME;
  const close = () => { open(null); setText(""); setSure(false); };
  const send = () => { const t = text.trim(); if (!idea || !t) return; comment(idea.id, t, Date.now()); setText(""); };
  return (
    <AnimatePresence>
      {idea && (
        <>
          <motion.div key="scrim" className="fixed inset-0 z-30 bg-black/50" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside key="drawer" role="dialog" aria-modal="true" aria-label={idea.title} onKeyDown={(e) => e.key === "Escape" && close()}
            className="fixed inset-x-0 bottom-0 z-40 max-h-[90dvh] overflow-y-auto rounded-t-3xl border border-line bg-panel md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[440px] md:rounded-none md:rounded-l-3xl"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <div className="relative h-36 overflow-hidden"><IdeaCover category={idea.category} seed={idea.id} className="h-full w-full" />
              <CategoryPill category={idea.category} className="absolute bottom-3 left-4" />
              <button autoFocus onClick={close} aria-label="Close idea" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur hover:bg-black/60"><X size={18} /></button></div>
            <div className="p-6 pt-4">
              <div className="flex flex-wrap items-center gap-2"><StatusBadge idea={idea} all={ideas} />{idea.stage !== "idea" && <span className="rounded-md border border-line px-2 py-[2px] text-[10px] text-mute">{STAGE_LABEL[idea.stage]}</span>}</div>
              <h2 className="mt-2 text-2xl font-semibold leading-tight">{idea.title}</h2>
              <p className="mt-3 flex items-center gap-2 text-[13px] text-mute"><Avatar id={idea.authorId} name={authorName(idea.authorId, userName)} size={26} /><span className="font-medium text-[var(--text)]">{authorName(idea.authorId, userName)}</span> · {when(idea.createdAt, now)}</p>
              <p className="mt-4 text-[14px] leading-relaxed">{idea.summary}</p>
              <div className="mt-4 flex items-center gap-3">
                <button onClick={() => toggleLike(idea.id)} aria-pressed={idea.likedByMe} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-semibold transition ${idea.likedByMe ? "border-honey bg-honey/15 text-honey" : "border-line text-mute hover:text-[var(--text)]"}`}><ThumbsUp size={15} fill={idea.likedByMe ? "currentColor" : "none"} aria-hidden />{idea.likedByMe ? "Liked" : "Like"} · {likeCount(idea)}</button>
              </div>

              {mine && (
                <div className="mt-6 rounded-2xl border border-line p-4">
                  <p className="text-sm font-semibold">Your idea</p>
                  <div className="mt-2 flex gap-1.5" role="group" aria-label="Progress">
                    {STAGES.map((s) => <button key={s} onClick={() => setStage(idea.id, s)} className="pill flex-1 px-2 py-2 text-[12px]" aria-pressed={idea.stage === s}>{STAGE_LABEL[s]}</button>)}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!idea.shared && <button onClick={() => { share(idea.id, Date.now()); celebrate(); toast("Idea shared with the community."); }} className="btn-gold inline-flex items-center gap-2 px-4 py-2 text-[13px]"><Share2 size={14} aria-hidden /> Share with community</button>}
                    <button onClick={() => { if (!sure) setSure(true); else { remove(idea.id); close(); toast("Idea deleted."); } }} onBlur={() => setSure(false)} className="inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-[13px] text-mute hover:text-[#FF6686]"><Trash2 size={14} aria-hidden />{sure ? "Click again to delete" : "Delete"}</button></div>
                </div>)}

              <h3 className="mt-6 text-sm font-semibold">Comments ({commentCount(idea)})</h3>
              {idea.baseComments > 0 && <p className="mt-2 flex gap-2 rounded-xl border border-line p-3 text-[11px] leading-relaxed text-mute"><Info size={14} className="mt-px shrink-0" aria-hidden />Sample idea: {idea.baseComments} earlier comments are demo counts. What you add shows up below.</p>}
              {idea.comments.length === 0 ? <p className="mt-2 rounded-xl border border-dashed border-line p-4 text-center text-[13px] text-mute">No comments yet. Be the first to add one.</p> : (
                <ul className="mt-3 space-y-3">{idea.comments.map((c) => <li key={c.id} className="flex gap-2.5"><Avatar id={c.authorId} name={authorName(c.authorId, userName)} size={28} />
                  <div className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2"><p className="text-[12px] font-semibold">{authorName(c.authorId, userName)} <span className="font-normal text-mute">· {when(c.at, now)}</span></p><p className="mt-0.5 break-words text-[13px] leading-relaxed">{c.text}</p></div></li>)}</ul>)}
              <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mt-4 flex gap-2">
                <label className="sr-only" htmlFor="idea-comment">Add a comment</label>
                <input id="idea-comment" value={text} onChange={(e) => setText(e.target.value)} maxLength={300} placeholder="Add a comment..." className="field min-w-0 flex-1 px-3 py-2.5 text-[13px]" />
                <button type="submit" disabled={!text.trim()} aria-label="Post comment" className="btn-gold grid h-10 w-10 shrink-0 place-items-center disabled:opacity-40"><Send size={16} aria-hidden /></button>
              </form>
            </div>
          </motion.aside>
        </>)}
    </AnimatePresence>
  );
}
