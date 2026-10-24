"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { makeIdeas, ME, type Category, type Idea, type Scope, type Stage } from "@/features/ideas/ideas";

type NewIdea = { title: string; summary: string; category: Category; shared: boolean };
type IdeasStore = {
  ideas: Idea[]; seeded: boolean; seededAt: number; edited: boolean;
  add: (i: NewIdea, nowMs: number) => string;
  toggleLike: (id: string) => void;
  comment: (id: string, text: string, nowMs: number) => void;
  setStage: (id: string, stage: Stage) => void;
  share: (id: string, nowMs: number) => void;
  remove: (id: string) => void;
  reset: () => void;
};
const patch = (list: Idea[], id: string, fn: (i: Idea) => Idea) => list.map((i) => (i.id === id ? fn(i) : i));

/** Separate from the main store on purpose: its own key, so adding Ideas never reseeds or wipes your events and hive. */
export const useIdeas = create<IdeasStore>()(
  persist(
    (set) => ({
      ideas: [], seeded: false, seededAt: 0, edited: false,
      add: (n, nowMs) => {
        const id = `i${nowMs}${Math.floor(Math.random() * 1e3)}`;
        const idea: Idea = { id, title: n.title, summary: n.summary, category: n.category, authorId: ME, createdAt: new Date(nowMs).toISOString(), likes: 0, likedByMe: false, baseComments: 0, comments: [], stage: "idea", shared: n.shared };
        set((s) => ({ ideas: [idea, ...s.ideas], edited: true })); return id;
      },
      toggleLike: (id) => set((s) => ({ edited: true, ideas: patch(s.ideas, id, (i) => ({ ...i, likedByMe: !i.likedByMe })) })),
      comment: (id, text, nowMs) => set((s) => ({ edited: true, ideas: patch(s.ideas, id, (i) => ({ ...i, comments: [...i.comments, { id: `k${nowMs}${Math.floor(Math.random() * 1e3)}`, authorId: ME, text, at: new Date(nowMs).toISOString() }] })) })),
      setStage: (id, stage) => set((s) => ({ edited: true, ideas: patch(s.ideas, id, (i) => ({ ...i, stage })) })),
      share: (id, nowMs) => set((s) => ({ edited: true, ideas: patch(s.ideas, id, (i) => ({ ...i, shared: true, createdAt: new Date(nowMs).toISOString() })) })),
      remove: (id) => set((s) => ({ edited: true, ideas: s.ideas.filter((i) => i.id !== id) })),
      reset: () => set({ ideas: makeIdeas(Date.now()), seeded: true, seededAt: Date.now(), edited: false }),
    }),
    { name: "ebb:ideas:v1", version: 1, skipHydration: true },
  ),
);

type Composer = { title: string; summary: string; category: Category };
const EMPTY: Composer = { title: "", summary: "", category: "tech" };
type IdeasUI = {
  shareOpen: boolean; openId: string | null; topOpen: boolean; q: string; category: Category | "all"; scope: Scope; composer: Composer; commentText: string;
  /** "shareOpen" now means "take me to the new-idea note": the page scrolls to it and focuses the title, then clears this. */
  setShare: (o: boolean) => void; open: (id: string | null) => void; setTop: (o: boolean) => void;
  setQ: (q: string) => void; setCategory: (c: Category | "all") => void; setScope: (s: Scope) => void; clearFilters: () => void;
  setComposer: (c: Partial<Composer>) => void; clearComposer: () => void; setCommentText: (t: string) => void;
};
/** Screen state shared by the page, the top bar search and the Action Zones. Not persisted. */
export const useIdeasUI = create<IdeasUI>((set) => ({
  shareOpen: false, openId: null, topOpen: false, q: "", category: "all", scope: "all", composer: EMPTY, commentText: "",
  setShare: (shareOpen) => set({ shareOpen }), open: (openId) => set({ openId, commentText: "" }), setTop: (topOpen) => set({ topOpen }),
  setQ: (q) => set({ q }), setCategory: (category) => set({ category }), setScope: (scope) => set({ scope }), clearFilters: () => set({ q: "", category: "all", scope: "all" }),
  setComposer: (c) => set((s) => ({ composer: { ...s.composer, ...c } })), clearComposer: () => set({ composer: EMPTY }), setCommentText: (commentText) => set({ commentText }),
}));
