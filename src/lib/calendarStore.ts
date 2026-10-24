"use client";
import { create } from "zustand";

export type View = "month" | "week" | "day";
type CalUI = {
  view: View; cursor: number; q: string; openId: string | null; upcomingOpen: boolean; pastOpen: boolean;
  setView: (v: View) => void; setCursor: (ms: number) => void; setQ: (q: string) => void;
  open: (id: string | null) => void; setUpcoming: (o: boolean) => void; setPast: (o: boolean) => void;
};
/** Screen state shared by the page, the top bar search and the dialogs. Not persisted: the calendar itself is derived from your events, due dates and joined opportunities. */
export const useCalendarUI = create<CalUI>((set) => ({
  view: "month", cursor: Date.now(), q: "", openId: null, upcomingOpen: false, pastOpen: false,
  setView: (view) => set({ view }), setCursor: (cursor) => set({ cursor }), setQ: (q) => set({ q }),
  open: (openId) => set({ openId }), setUpcoming: (upcomingOpen) => set({ upcomingOpen }), setPast: (pastOpen) => set({ pastOpen }),
}));
