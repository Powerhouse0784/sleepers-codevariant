"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { makePeople, ME_ID, type Family, type Group, type Person, type SortKey, type Tab } from "@/features/people/people";

export type MyProfile = { role: string; family: Family; city: string; bio: string; skills: string[]; groups: Group[] };
type PeopleStore = {
  people: Person[]; seeded: boolean; edited: boolean;
  toggleFollow: (id: string) => void;
  saveMe: (name: string, p: MyProfile) => void;
  leave: () => void;
  reset: () => void;
};
/** Its own key, so adding People never touches your events, hive or ideas. Only follows and your own profile are saved. */
export const usePeople = create<PeopleStore>()(
  persist(
    (set) => ({
      people: [], seeded: false, edited: false,
      toggleFollow: (id) => set((s) => ({ edited: true, people: s.people.map((p) => (p.id === id && !p.isMe ? { ...p, followed: !p.followed } : p)) })),
      saveMe: (name, p) => set((s) => {
        const prev = s.people.find((x) => x.isMe);
        const me: Person = { id: ME_ID, name, ...p, status: "online", verified: false, followers: prev?.followers ?? 0, points: prev?.points ?? 0, joinedDaysAgo: prev?.joinedDaysAgo ?? 0, followed: false, isMe: true };
        return { edited: true, people: prev ? s.people.map((x) => (x.isMe ? me : x)) : [...s.people, me] };
      }),
      leave: () => set((s) => ({ edited: true, people: s.people.filter((p) => !p.isMe) })),
      reset: () => set({ people: makePeople(), seeded: true, edited: false }),
    }),
    { name: "ebb:people:v1", version: 1, skipHydration: true },
  ),
);

type PeopleUI = {
  q: string; tab: Tab; role: string; skill: string; sort: SortKey; openId: string | null; topOpen: boolean; profileOpen: boolean;
  setQ: (q: string) => void; setTab: (t: Tab) => void; setRole: (r: string) => void; setSkill: (s: string) => void; setSort: (s: SortKey) => void;
  open: (id: string | null) => void; setTop: (o: boolean) => void; setProfile: (o: boolean) => void; clearFilters: () => void;
};
/** Screen state shared by the page, the top bar search and the dialogs. Not persisted. */
export const usePeopleUI = create<PeopleUI>((set) => ({
  q: "", tab: "all", role: "all", skill: "all", sort: "popular", openId: null, topOpen: false, profileOpen: false,
  setQ: (q) => set({ q }), setTab: (tab) => set({ tab }), setRole: (role) => set({ role }), setSkill: (skill) => set({ skill }), setSort: (sort) => set({ sort }),
  open: (openId) => set({ openId }), setTop: (topOpen) => set({ topOpen }), setProfile: (profileOpen) => set({ profileOpen }),
  clearFilters: () => set({ q: "", tab: "all", role: "all", skill: "all", sort: "popular" }),
}));
