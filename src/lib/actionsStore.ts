"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { OPPORTUNITIES, type JoinMap, type OppKind } from "@/features/actions/actions";

type ActionsStore = {
  joined: JoinMap;
  join: (id: string, nowMs: number) => void;
  leave: (id: string) => void;
  complete: (id: string, nowMs: number) => void;
  reset: () => void;
};
/** Its own key, so the Action Center never touches your events, hive, ideas or people. Only what you joined is saved; XP and counts are derived. */
export const useActions = create<ActionsStore>()(
  persist(
    (set) => ({
      joined: {},
      join: (id, nowMs) => set((s) => (s.joined[id] ? s : { joined: { ...s.joined, [id]: { at: nowMs } } })),
      leave: (id) => set((s) => { const { [id]: _drop, ...rest } = s.joined; void _drop; return { joined: rest }; }),
      complete: (id, nowMs) => set((s) => (s.joined[id] && !s.joined[id].done ? { joined: { ...s.joined, [id]: { ...s.joined[id], done: nowMs } } } : s)),
      reset: () => set({ joined: {} }),
    }),
    {
      name: "ebb:actions:v1", version: 1, skipHydration: true,
      // drop ids that no longer exist in the sample list so old saves can't inflate XP
      merge: (saved, cur) => { const j = ((saved as Partial<ActionsStore> | undefined)?.joined ?? {}) as JoinMap; const ok = new Set(OPPORTUNITIES.map((o) => o.id)); return { ...cur, joined: Object.fromEntries(Object.entries(j).filter(([k]) => ok.has(k))) }; },
    },
  ),
);

type ActionsUI = {
  q: string; filter: OppKind | "all"; expanded: boolean; progressOpen: boolean; feedOpen: boolean;
  setQ: (q: string) => void; setFilter: (f: OppKind | "all") => void; setExpanded: (e: boolean) => void;
  setProgress: (o: boolean) => void; setFeed: (o: boolean) => void; clear: () => void;
};
/** Screen state shared by the page, the top bar search and the dialogs. Not persisted. */
export const useActionsUI = create<ActionsUI>((set) => ({
  q: "", filter: "all", expanded: false, progressOpen: false, feedOpen: false,
  setQ: (q) => set({ q }), setFilter: (filter) => set({ filter }), setExpanded: (expanded) => set({ expanded }),
  setProgress: (progressOpen) => set({ progressOpen }), setFeed: (feedOpen) => set({ feedOpen }),
  clear: () => set({ q: "", filter: "all", expanded: false }),
}));
