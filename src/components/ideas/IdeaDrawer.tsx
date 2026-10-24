"use client";
import { AnimatePresence, motion } from "motion/react";
import { X, GripVertical, ThumbsUp, Info } from "lucide-react";
import { useIdeas, useIdeasUI } from "@/lib/ideasStore";
import { useSettings } from "@/lib/settingsStore";
import { useNow } from "@/lib/hooks";
import { ME, STAGE_LABEL, authorName, commentCount, likeCount, when } from "@/features/ideas/ideas";
import IdeaCover, { Avatar, CategoryPill } from "./IdeaCover";
import { StatusBadge } from "./IdeaCard";
import Draggable from "../canvas/Draggable";
import { Zone, commentCard, ideaCard } from "./IdeaZones";

/**
 * One idea in a drawer. The idea itself is a card you can drag onto the zones below it (support, move, publish, delete),
 * and a comment is a note you write and drag onto Post. Nothing here is a submit button.
 */
export default function IdeaDrawer() {
  const id = useIdeasUI((s) => s.openId), open = useIdeasUI((s) => s.open), text = useIdeasUI((s) => s.commentText), setText = useIdeasUI((s) => s.setCommentText);
  const ideas = useIdeas((s) => s.ideas); const userName = useSettings((s) => s.profile.name); const now = useNow();
  const idea = ideas.find((i) => i.id === id); const mine = idea?.authorId === ME;
  const close = () => open(null);
  return (
    <AnimatePresence>
      {idea && (
        <>
          <motion.div key="scrim" className="fixed inset-0 z-30 bg-black/50" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside key="drawer" role="dialog" aria-modal="true" aria-label={idea.title} onKeyDown={(e) => e.key === "Escape" && close()}
            className="fixed inset-x-0 bottom-0 z-40 max-h-[90dvh] overflow-y-auto rounded-t-3xl border border-line bg-panel md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[440px] md:rounded-none md:rounded-l-3xl"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <Draggable label={idea.title} payload={() => ideaCard(idea.id, idea.title, "Drop on a zone below")} className="rounded-none! rounded-tl-3xl!">
              <div className="relative h-36 overflow-hidden"><IdeaCover category={idea.category} seed={idea.id} className="h-full w-full" />
                <CategoryPill category={idea.category} className="absolute bottom-3 left-4" />
                <span className="absolute bottom-3 right-4 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10.5px] font-medium text-white backdrop-blur"><GripVertical size={12} aria-hidden /> Drag me onto a zone</span></div>
            </Draggable>
            <button autoFocus onClick={close} aria-label="Close idea" className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur hover:bg-black/60"><X size={18} /></button>
            <div className="p-6 pt-4">
              <div className="flex flex-wrap items-center gap-2"><StatusBadge idea={idea} all={ideas} />{idea.stage !== "idea" && <span className="rounded-md border border-line px-2 py-[2px] text-[10px] text-mute">{STAGE_LABEL[idea.stage]}</span>}</div>
              <h2 className="mt-2 text-2xl font-semibold leading-tight">{idea.title}</h2>
              <p className="mt-3 flex items-center gap-2 text-[13px] text-mute"><Avatar id={idea.authorId} name={authorName(idea.authorId, userName)} size={26} /><span className="font-medium text-[var(--text)]">{authorName(idea.authorId, userName)}</span> · {when(idea.createdAt, now)}</p>
              <p className="mt-4 text-[14px] leading-relaxed">{idea.summary}</p>
              <p className={`mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium ${idea.likedByMe ? "text-honey" : "text-mute"}`}><ThumbsUp size={14} fill={idea.likedByMe ? "currentColor" : "none"} aria-hidden />{likeCount(idea)} {likeCount(idea) === 1 ? "like" : "likes"}{idea.likedByMe && " · including yours"}</p>

              <div className="mt-5 rounded-2xl border border-line p-3">
                <p className="mb-2 text-[12px] font-semibold">Action zones <span className="font-normal text-mute">· drag the card above onto one</span></p>
                <div className="grid grid-cols-2 gap-2">
                  {idea.shared && <Zone id="support" variant="strip" />}
                  {mine && <><Zone id="progress" variant="strip" /><Zone id="done" variant="strip" /><Zone id="backlog" variant="strip" />{!idea.shared && <Zone id="publish" variant="strip" />}<Zone id="bin" variant="strip" /></>}
                </div>
                {!mine && !idea.shared && <p className="text-[12px] text-mute">This is someone else&rsquo;s draft.</p>}
              </div>

              <h3 className="mt-6 text-sm font-semibold">Comments ({commentCount(idea)})</h3>
              {idea.baseComments > 0 && <p className="mt-2 flex gap-2 rounded-xl border border-line p-3 text-[11px] leading-relaxed text-mute"><Info size={14} className="mt-px shrink-0" aria-hidden />Sample idea: {idea.baseComments} earlier comments are demo counts. What you add shows up below.</p>}
              {idea.comments.length === 0 ? <p className="mt-2 rounded-xl border border-dashed border-line p-4 text-center text-[13px] text-mute">No comments yet. Write a note below and drop it on Post.</p> : (
                <ul className="mt-3 space-y-3">{idea.comments.map((c) => <li key={c.id} className="flex gap-2.5"><Avatar id={c.authorId} name={authorName(c.authorId, userName)} size={28} />
                  <div className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2"><p className="text-[12px] font-semibold">{authorName(c.authorId, userName)} <span className="font-normal text-mute">· {when(c.at, now)}</span></p><p className="mt-0.5 break-words text-[13px] leading-relaxed">{c.text}</p></div></li>)}</ul>)}

              <Draggable label="Comment note" payload={() => commentCard(text)} className="mt-4">
                <div className="rounded-2xl border-2 border-dashed p-3" style={{ borderColor: "color-mix(in srgb,#2F8BFF 55%,transparent)", background: "color-mix(in srgb,#2F8BFF 8%,var(--surface))" }}>
                  <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#6FB1FF]"><GripVertical size={13} aria-hidden /> Comment note</p>
                  <label className="sr-only" htmlFor="idea-comment">Write a comment</label>
                  <textarea id="idea-comment" value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={300} placeholder="Write your comment, then drag this note onto Post…" className="field w-full resize-none px-3 py-2 text-[13px]" />
                </div>
              </Draggable>
              <Zone id="post" variant="strip" className="mt-2 w-full" />
            </div>
          </motion.aside>
        </>)}
    </AnimatePresence>
  );
}
