"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Cell, HiveEvent, Kind } from "@/types";
import { makeSeed } from "./seed";

type NewCell = { kind: Kind; title: string; note?: string; eventId: string; dueAt?: string };
type Store = {
  events: HiveEvent[]; cells: Cell[]; seeded: boolean; theme: "dark" | "light"; userName: string; setTheme: (t: "dark" | "light") => void;
  addCell: (c: NewCell, nowMs: number) => string;
  touch: (id: string, text: string, nowMs: number) => void; // the only way to count as meaningful
  complete: (id: string, nowMs: number) => void;
  archive: (id: string, nowMs: number) => void;
  resetDemo: () => void;
};
const iso = (ms: number) => new Date(ms).toISOString();
const patch = (cells: Cell[], id: string, fn: (c: Cell) => Cell) => cells.map((c) => (c.id === id ? fn(c) : c));

export const useStore = create<Store>()(
  persist(
    (set) => ({
      events: [], cells: [], seeded: false, theme: "dark", userName: "Saqib", setTheme: (theme) => set({ theme }),
      addCell: (c, nowMs) => {
        const id = `c${nowMs}${Math.floor(Math.random() * 1e3)}`;
        const cell: Cell = { id, ...c, createdAt: iso(nowMs), lastMeaningfulActivityAt: iso(nowMs), log: [{ at: iso(nowMs), text: "Captured" }] };
        set((s) => ({ cells: [cell, ...s.cells] }));
        return id;
      },
      touch: (id, text, nowMs) => set((s) => ({ cells: patch(s.cells, id, (c) => ({ ...c, lastMeaningfulActivityAt: iso(nowMs), log: [{ at: iso(nowMs), text }, ...c.log] })) })),
      complete: (id, nowMs) => set((s) => ({ cells: patch(s.cells, id, (c) => ({ ...c, done: true, lastMeaningfulActivityAt: iso(nowMs), log: [{ at: iso(nowMs), text: "Marked done" }, ...c.log] })) })),
      archive: (id, nowMs) => set((s) => ({ cells: patch(s.cells, id, (c) => ({ ...c, archived: true, log: [{ at: iso(nowMs), text: "Archived" }, ...c.log] })) })),
      resetDemo: () => { const d = makeSeed(Date.now()); set({ ...d, seeded: true }); },
    }),
    { name: "ebb:v2", version: 2, skipHydration: true },
  ),
);

type UI = { ready: boolean; offsetDays: number; selectedId: string | null; captureOpen: boolean; captureKind: Kind; dismissed: string[]; tip: number;
  setReady: () => void; setOffset: (d: number) => void; select: (id: string | null) => void; setCapture: (o: boolean, kind?: Kind) => void; dismiss: (id: string) => void; setTip: (n: number) => void };
export const useUI = create<UI>((set) => ({
  ready: false, offsetDays: 0, selectedId: null, captureOpen: false, captureKind: "idea", dismissed: [], tip: 0,
  dismiss: (id) => set((s) => ({ dismissed: [...s.dismissed, id], tip: 0 })), setTip: (tip) => set({ tip }),
  setReady: () => set({ ready: true }), setOffset: (offsetDays) => set({ offsetDays }),
  select: (selectedId) => set({ selectedId }), setCapture: (captureOpen, kind) => set((s) => ({ captureOpen, captureKind: kind ?? s.captureKind })),
}));
