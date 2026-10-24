"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Vote = "up" | "down";
type Kb = {
  opens: Record<string, number>; votes: Record<string, Vote>; articleId: string | null; supportOpen: boolean; videoOpen: boolean;
  open: (id: string) => void; close: () => void; vote: (id: string, v: Vote) => void; setSupport: (o: boolean) => void; setVideo: (o: boolean) => void;
};
/** Local-only reading stats: how often you opened each article and whether it helped. Nothing leaves the browser. */
export const useKb = create<Kb>()(persist((set) => ({
  opens: {}, votes: {}, articleId: null, supportOpen: false, videoOpen: false,
  open: (id) => set((s) => ({ articleId: id, opens: { ...s.opens, [id]: (s.opens[id] ?? 0) + 1 } })),
  close: () => set({ articleId: null }),
  vote: (id, v) => set((s) => ({ votes: { ...s.votes, [id]: s.votes[id] === v ? undefined! : v } })),
  setSupport: (supportOpen) => set({ supportOpen }), setVideo: (videoOpen) => set({ videoOpen }),
}), { name: "ebb:kb:v1", version: 1, partialize: (s) => ({ opens: s.opens, votes: s.votes }) }));
