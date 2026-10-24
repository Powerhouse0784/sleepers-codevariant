"use client";
import { ThumbsUp, MessageCircle, Lightbulb, Hammer, CheckCircle2, Megaphone, FilePen, Trash2, Send, type LucideIcon } from "lucide-react";
import ActionZone from "../canvas/ActionZone";
import { useCanvas, type Payload, type ZoneDef } from "@/lib/canvas";
import { useIdeas, useIdeasUI } from "@/lib/ideasStore";
import { useUI } from "@/lib/store";
import { ME, STAGE_LABEL, type Category, type Stage } from "@/features/ideas/ideas";
import { dropRule, type Dragged, type Facts, type ZoneId } from "@/features/ideas/canvas";

/** Cards on this screen: an idea, the new-idea note, or a comment note. */
export const ideaCard = (id: string, label: string, sub?: string): Payload => ({ label, sub, data: { kind: "idea", id } satisfies Dragged });
export const composerCard = (title: string, summary: string, category: Category): Payload => ({ label: title.trim() || "New idea", sub: "New idea note", data: { kind: "composer", title, summary, category } });
export const commentCard = (text: string): Payload => ({ label: text.trim() ? `“${text.trim().slice(0, 40)}”` : "Comment note", sub: "Comment", data: { kind: "comment", text } });

const factsOf = (d: Dragged): Facts | undefined => {
  if (d.kind !== "idea") return undefined; const i = useIdeas.getState().ideas.find((x) => x.id === d.id);
  return i ? { mine: i.authorId === ME, shared: i.shared, stage: i.stage } : undefined;
};
const ideaOf = (d: Dragged) => (d.kind === "idea" ? useIdeas.getState().ideas.find((x) => x.id === d.id) : undefined);
const setStageTo = (to: Stage) => (d: Dragged) => { const i = ideaOf(d); if (!i) return; useIdeas.getState().setStage(i.id, to); return `“${i.title}” is now ${STAGE_LABEL[to].toLowerCase()}.`; };

const def = (id: ZoneId, label: string, hint: string, tone: string, drop: (d: Dragged) => string | void): ZoneDef => ({
  id, label, hint, tone, accepts: (p) => dropRule(id, p.data as Dragged, factsOf(p.data as Dragged)), drop: (p) => drop(p.data as Dragged),
});

/** The nine Action Zones. Every primary action on the Ideas screen is one of these. */
export const IDEA_ZONES: Record<ZoneId, ZoneDef> = {
  support: def("support", "Support", "Drop an idea to like it", "#FFC629", (d) => { const i = ideaOf(d); if (!i) return; useIdeas.getState().toggleLike(i.id); return i.likedByMe ? `Support removed from “${i.title}”.` : `You support “${i.title}”.`; }),
  discuss: def("discuss", "Discuss", "Open it and comment", "#2F8BFF", (d) => { const i = ideaOf(d); if (i) useIdeasUI.getState().open(i.id); }),
  backlog: def("backlog", "Just an idea", "Move yours back", "#9CA8C4", setStageTo("idea")),
  progress: def("progress", "In progress", "Yours: start building", "#FF9F1C", setStageTo("progress")),
  done: def("done", "Done", "Yours: mark it shipped", "#1FD18B", setStageTo("done")),
  publish: def("publish", "Publish", "New note or your draft", "#8B5CF6", (d) => {
    useUI.getState().celebrate();
    if (d.kind === "composer") { const u = useIdeasUI.getState(); useIdeas.getState().add({ title: d.title.trim(), summary: d.summary.trim(), category: u.composer.category, shared: true }, Date.now()); u.clearComposer(); u.clearFilters(); return "Idea shared. The hive is buzzing!"; }
    const i = ideaOf(d); if (!i) return; useIdeas.getState().share(i.id, Date.now()); return `“${i.title}” is now shared with the community.`;
  }),
  draft: def("draft", "Save draft", "New note, kept private", "#6FB1FF", (d) => {
    if (d.kind !== "composer") return; const u = useIdeasUI.getState(); useIdeas.getState().add({ title: d.title.trim(), summary: d.summary.trim(), category: u.composer.category, shared: false }, Date.now()); u.clearComposer(); u.clearFilters();
    return "Saved as a draft. Find it under Total Ideas.";
  }),
  bin: def("bin", "Bin", "Yours: delete it", "#FF6B81", (d) => { const i = ideaOf(d); if (!i) return; const u = useIdeasUI.getState(); useIdeas.getState().remove(i.id); if (u.openId === i.id) u.open(null); return `Deleted “${i.title}”.`; }),
  post: def("post", "Post comment", "Drop your note here", "#2F8BFF", (d) => {
    const u = useIdeasUI.getState(); if (d.kind !== "comment" || !u.openId) return; useIdeas.getState().comment(u.openId, d.text.trim(), Date.now()); u.setCommentText(""); return "Comment posted.";
  }),
};
const ICON: Record<ZoneId, LucideIcon> = { support: ThumbsUp, discuss: MessageCircle, backlog: Lightbulb, progress: Hammer, done: CheckCircle2, publish: Megaphone, draft: FilePen, bin: Trash2, post: Send };
export const Zone = ({ id, variant, className }: { id: ZoneId; variant?: "dock" | "strip"; className?: string }) => <ActionZone def={IDEA_ZONES[id]} Icon={ICON[id]} variant={variant} className={className} />;

const G = ({ t, children }: { t: string; children: React.ReactNode }) => <div className="flex shrink-0 items-stretch gap-2"><p className="hidden w-4 shrink-0 rotate-180 self-center text-[9px] font-bold uppercase tracking-widest text-mute [writing-mode:vertical-rl] xl:block">{t}</p>{children}</div>;
/** The zone dock at the foot of the Ideas screen. On phones it slides up only while a card is being held. */
export function IdeaDock() {
  const holding = useCanvas((s) => !!s.drag); const drawer = useIdeasUI((s) => s.openId !== null);
  if (drawer) return null;
  return (
    <div role="region" aria-label="Action zones" className={`z-20 lg:sticky lg:bottom-4 max-lg:fixed max-lg:inset-x-3 max-lg:bottom-[88px] ${holding ? "" : "max-lg:hidden"}`}>
      <div className="card scroll-thin mx-auto flex w-fit max-w-full items-stretch gap-3 overflow-x-auto rounded-3xl! border-[color-mix(in_srgb,var(--gold)_35%,var(--line))] p-2.5 shadow-2xl backdrop-blur">
        <G t="Community"><Zone id="support" variant="dock" /><Zone id="discuss" variant="dock" /></G>
        <span aria-hidden className="w-px shrink-0 bg-[var(--line)]" />
        <G t="Mine"><Zone id="backlog" variant="dock" /><Zone id="progress" variant="dock" /><Zone id="done" variant="dock" /></G>
        <span aria-hidden className="w-px shrink-0 bg-[var(--line)]" />
        <G t="Share"><Zone id="publish" variant="dock" /><Zone id="draft" variant="dock" /></G>
        <span aria-hidden className="w-px shrink-0 bg-[var(--line)]" />
        <Zone id="bin" variant="dock" />
      </div>
    </div>
  );
}
