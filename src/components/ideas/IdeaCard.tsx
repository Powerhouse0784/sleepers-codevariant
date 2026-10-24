"use client";
import { motion } from "motion/react";
import { ThumbsUp, MessageSquare, ArrowRight, Flame, TrendingUp, Pencil, Hammer } from "lucide-react";
import { useSettings } from "@/lib/settingsStore";
import { authorName, badgeOf, commentCount, likeCount, when, type Idea } from "@/features/ideas/ideas";
import IdeaCover, { Avatar, CategoryPill } from "./IdeaCover";

export function StatusBadge({ idea, all, className = "" }: { idea: Idea; all: Idea[]; className?: string }) {
  const b = !idea.shared ? "draft" : badgeOf(all, idea.id) ?? (idea.stage === "progress" ? "progress" : null);
  if (!b) return null;
  const M = { draft: { I: Pencil, l: "Draft", c: "#B8C4E0" }, hot: { I: Flame, l: "Hot", c: "#FF9F1C" }, trending: { I: TrendingUp, l: "Trending", c: "#FFB02E" }, progress: { I: Hammer, l: "In progress", c: "#6FB1FF" } }[b];
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-[3px] text-[10px] font-semibold backdrop-blur ${className}`} style={{ color: M.c, background: "rgba(20,12,4,.62)", borderColor: `${M.c}66` }}><M.I size={11} aria-hidden />{M.l}</span>;
}

export default function IdeaCard({ idea, all, now, index }: { idea: Idea; all: Idea[]; now: number; index: number }) {
  const userName = useSettings((s) => s.profile.name);
  const name = authorName(idea.authorId, userName); const likes = likeCount(idea);
  return (
    <motion.article layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ delay: Math.min(index, 6) * 0.05 }}
      className="card tile group relative flex h-full flex-col p-2.5 transition hover:-translate-y-0.5 hover:border-primary/60">
      <div className="relative h-[108px] overflow-hidden rounded-xl">
        <IdeaCover category={idea.category} seed={idea.id} className="h-full w-full transition duration-500 group-hover:scale-105" />
        <StatusBadge idea={idea} all={all} className="absolute right-2 top-2" />
        <CategoryPill category={idea.category} className="absolute bottom-2 left-2" />
      </div>
      <div className="flex flex-1 flex-col px-1.5 pb-0.5 pt-3">
        <h3 className="text-[15px] font-semibold leading-snug">{idea.title}</h3>
        <p className="mt-1.5 line-clamp-3 text-[12.5px] leading-relaxed text-mute">{idea.summary}</p>
        <div className="mt-auto flex items-center gap-2 pt-3.5">
          <Avatar id={idea.authorId} name={name} size={30} />
          <p className="min-w-0 flex-1 leading-tight"><span className="block truncate text-[12px] font-medium">{name}</span><span className="block text-[10.5px] text-mute">{when(idea.createdAt, now)}</span></p>
          <span className={`inline-flex items-center gap-1 px-1.5 text-[11.5px] font-medium ${idea.likedByMe ? "text-honey" : "text-mute"}`} aria-label={`${likes} likes${idea.likedByMe ? ", including yours" : ""}`}><ThumbsUp size={13} fill={idea.likedByMe ? "currentColor" : "none"} aria-hidden />{likes}</span>
          <span className="inline-flex items-center gap-1 px-1 text-[11.5px] text-mute" aria-label={`${commentCount(idea)} comments`}><MessageSquare size={13} aria-hidden />{commentCount(idea)}</span>
          <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary" aria-hidden><ArrowRight size={14} /></span>
        </div>
      </div>
    </motion.article>
  );
}
