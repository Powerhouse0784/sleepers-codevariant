"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Cell, HiveEvent, Kind } from "@/types";
import { makeSeed } from "./seed";

type NewCell = { kind: Kind; title: string; note?: string; eventId: string; dueAt?: string };
export type NewEvent = { title: string; type: string; startsAt: string; endsAt: string; venue?: string; tags?: string[] };
type Store = {
  events: HiveEvent[]; cells: Cell[]; seeded: boolean; seededAt: number; edited: boolean;
  theme: "dark" | "light"; userName: string; calm: boolean; tourDone: boolean;
  setTheme: (t: "dark" | "light") => void; setCalm: (c: boolean) => void; setTourDone: (d: boolean) => void;
  addCell: (c: NewCell, nowMs: number) => string;
  touch: (id: string, text: string, nowMs: number) => void; // the only way an item counts as meaningfully active
  touchMany: (ids: string[], text: string, nowMs: number) => void;
  complete: (id: string, nowMs: number) => void;
  archive: (id: string, nowMs: number) => void; archiveMany: (ids: string[], nowMs: number) => void;
  pin: (id: string) => void;
  addEvent: (e: NewEvent, nowMs: number) => string;
  setEventArchived: (id: string, archived: boolean, nowMs: number) => void;
  visitEvent: (id: string, nowMs: number) => void;
  resetDemo: () => void;
};
const iso = (ms: number) => new Date(ms).toISOString();
const patch = (cells: Cell[], id: string, fn: (c: Cell) => Cell) => cells.map((c) => (c.id === id ? fn(c) : c));
const patchEvent = (events: HiveEvent[], id: string | undefined, fn: (e: HiveEvent) => HiveEvent) => events.map((e) => (e.id === id ? fn(e) : e));
/** Capturing or completing something inside an event is what makes the event "recently updated". Passive visits never do. */
const bump = (events: HiveEvent[], cells: Cell[], ids: string[], nowMs: number) => { const evs = new Set(cells.filter((c) => ids.includes(c.id)).map((c) => c.eventId)); return events.map((e) => (evs.has(e.id) ? { ...e, updatedAt: iso(nowMs) } : e)); };

export const useStore = create<Store>()(
  persist(
    (set) => ({
      events: [], cells: [], seeded: false, seededAt: 0, edited: false, theme: "dark", userName: "Saqib", calm: false, tourDone: false,
      setTheme: (theme) => set({ theme }), setCalm: (calm) => set({ calm }), setTourDone: (tourDone) => set({ tourDone }),
      addCell: (c, nowMs) => {
        const id = `c${nowMs}${Math.floor(Math.random() * 1e3)}`;
        const cell: Cell = { id, ...c, createdAt: iso(nowMs), lastMeaningfulActivityAt: iso(nowMs), log: [{ at: iso(nowMs), text: "Captured" }] };
        set((s) => ({ cells: [cell, ...s.cells], edited: true, events: patchEvent(s.events, c.eventId, (e) => ({ ...e, updatedAt: iso(nowMs) })) }));
        return id;
      },
      touch: (id, text, nowMs) => set((s) => ({ edited: true, events: bump(s.events, s.cells, [id], nowMs), cells: patch(s.cells, id, (c) => ({ ...c, lastMeaningfulActivityAt: iso(nowMs), log: [{ at: iso(nowMs), text }, ...c.log] })) })),
      touchMany: (ids, text, nowMs) => set((s) => ({ edited: true, events: bump(s.events, s.cells, ids, nowMs), cells: s.cells.map((c) => (ids.includes(c.id) ? { ...c, lastMeaningfulActivityAt: iso(nowMs), log: [{ at: iso(nowMs), text }, ...c.log] } : c)) })),
      complete: (id, nowMs) => set((s) => ({ edited: true, events: bump(s.events, s.cells, [id], nowMs), cells: patch(s.cells, id, (c) => ({ ...c, done: true, lastMeaningfulActivityAt: iso(nowMs), log: [{ at: iso(nowMs), text: "Marked done" }, ...c.log] })) })),
      archive: (id, nowMs) => set((s) => ({ edited: true, cells: patch(s.cells, id, (c) => ({ ...c, archived: true, log: [{ at: iso(nowMs), text: "Archived" }, ...c.log] })) })),
      archiveMany: (ids, nowMs) => set((s) => ({ edited: true, cells: s.cells.map((c) => (ids.includes(c.id) ? { ...c, archived: true, log: [{ at: iso(nowMs), text: "Archived" }, ...c.log] } : c)) })),
      pin: (id) => set((s) => ({ cells: patch(s.cells, id, (c) => ({ ...c, pinned: !c.pinned })) })),
      addEvent: (e, nowMs) => {
        const id = `e${nowMs}${Math.floor(Math.random() * 1e3)}`;
        const ev: HiveEvent = { id, title: e.title, type: e.type, venue: e.venue, tags: e.tags, startsAt: e.startsAt, endsAt: e.endsAt, date: e.startsAt, updatedAt: iso(nowMs), visitedAt: iso(nowMs) };
        set((s) => ({ events: [ev, ...s.events], edited: true }));
        return id;
      },
      setEventArchived: (id, archived, nowMs) => set((s) => ({ edited: true, events: patchEvent(s.events, id, (e) => ({ ...e, archived, updatedAt: iso(nowMs) })) })),
      visitEvent: (id, nowMs) => set((s) => ({ events: patchEvent(s.events, id, (e) => ({ ...e, visitedAt: iso(nowMs) })) })),
      resetDemo: () => { const d = makeSeed(Date.now()); set({ ...d, seeded: true, seededAt: Date.now(), edited: false }); },
    }),
    // v3: events gained status/dates/sample fields, so the key moved and old data reseeds cleanly.
    { name: "ebb:v3", version: 3, skipHydration: true },
  ),
);

let tid = 0;
type UI = { ready: boolean; offsetDays: number; selectedId: string | null; captureOpen: boolean; captureKind: Kind; captureEventId: string; dismissed: string[]; tip: number;
  eventId: string | null; createEventOpen: boolean;
  paletteOpen: boolean; toasts: { id: number; text: string }[]; burst: number; swarm: number;
  setReady: () => void; setOffset: (d: number) => void; select: (id: string | null) => void; setCapture: (o: boolean, kind?: Kind, eventId?: string) => void;
  openEvent: (id: string | null) => void; setCreateEvent: (o: boolean) => void;
  dismiss: (id: string) => void; setTip: (n: number) => void; setPalette: (o: boolean) => void;
  toast: (text: string) => void; celebrate: () => void; releaseSwarm: () => void };
export const useUI = create<UI>((set) => ({
  ready: false, offsetDays: 0, selectedId: null, captureOpen: false, captureKind: "idea", captureEventId: "", dismissed: [], tip: 0, eventId: null, createEventOpen: false, paletteOpen: false, toasts: [], burst: 0, swarm: 0,
  setReady: () => set({ ready: true }), setOffset: (offsetDays) => set({ offsetDays }),
  select: (selectedId) => set({ selectedId }), setCapture: (captureOpen, kind, eventId) => set((s) => ({ captureOpen, captureKind: kind ?? s.captureKind, captureEventId: captureOpen ? (eventId ?? "") : s.captureEventId })),
  openEvent: (eventId) => set({ eventId }), setCreateEvent: (createEventOpen) => set({ createEventOpen }),
  dismiss: (id) => set((s) => ({ dismissed: [...s.dismissed, id], tip: 0 })), setTip: (tip) => set({ tip }), setPalette: (paletteOpen) => set({ paletteOpen }),
  toast: (text) => { const id = ++tid; set((s) => ({ toasts: [...s.toasts, { id, text }] })); setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3400); },
  celebrate: () => set((s) => ({ burst: s.burst + 1 })), releaseSwarm: () => set((s) => ({ swarm: s.swarm + 1 })),
}));
