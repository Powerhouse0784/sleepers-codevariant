"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, X, Search, Play, Square, RotateCcw, HelpCircle, ClipboardCheck } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { useNow, useActiveCells, useTypewriter } from "@/lib/hooks";
import { getMomentum, STATE_LABEL, STATE_RANGE, type MomentumState } from "@/features/momentum/momentum";
import { health, healthLabel, warmth, FACTS, SMART, matchSmart, type Smart } from "@/features/hive/stats";
import type { Kind } from "@/types";
import type { InsightAction } from "@/features/insights/insights";
import Hive from "@/components/Hive";
import HeroBee from "@/components/HeroBee";
import { BeeLogo } from "@/components/Art";
import { STATE_COLOR } from "@/components/MomentumBadge";
import HexOverview from "@/components/hive/HexOverview";
import InsightsPanel from "@/components/hive/InsightsPanel";
import StatsStrip from "@/components/hive/StatsStrip";
import { DistBar, Peek, ColdShelf, Embers, BeeTour } from "@/components/hive/PanelBits";
import ListView from "@/components/hive/ListView";
import ReviewMode from "@/components/hive/ReviewMode";
import ShortcutsDialog from "@/components/hive/ShortcutsDialog";
import TopEvents, { type EventRow } from "@/components/hive/TopEvents";

const DAY = 864e5;
const TYPES: { k: Kind | "all"; l: string }[] = [{ k: "all", l: "All" }, { k: "idea", l: "Ideas" }, { k: "person", l: "People" }, { k: "action", l: "Actions" }];
const RANGES = [{ v: 0, l: "All time" }, { v: 7, l: "Last 7 days" }, { v: 30, l: "Last 30 days" }, { v: 90, l: "Last 90 days" }];
const STATES: MomentumState[] = ["hot", "warm", "cooling", "cold"];

export default function HivePage() {
  const cells = useActiveCells(); const now = useNow();
  const { events, userName, calm, tourDone, setTourDone } = useStore();
  const { selectedId, select, offsetDays, setOffset, toast, releaseSwarm } = useUI();
  const [kind, setKind] = useState<Kind | "all">("all"); const [range, setRange] = useState(0); const [q, setQ] = useState(""); const [smart, setSmart] = useState<Smart | null>(null);
  const [state, setState] = useState<MomentumState | null>(null); const [hover, setHover] = useState<MomentumState | null>(null); const [evId, setEvId] = useState<string | null>(null);
  const [view, setView] = useState<"overview" | "cells" | "list">("overview");
  const [review, setReview] = useState(false); const [help, setHelp] = useState(false); const [playing, setPlaying] = useState(false); const [fact, setFact] = useState(0);
  // Deep links like /hive?state=cooling (from the Events screen) preselect that filter.
  useEffect(() => { const s = new URLSearchParams(window.location.search).get("state"); if ((STATES as string[]).includes(s ?? "")) setState(s as MomentumState); }, []);
  const search = useRef<HTMLInputElement>(null); const panel = useRef<HTMLDivElement>(null); const eggs = useRef(0);

  const base = useMemo(() => cells.filter((c) =>
    (kind === "all" || c.kind === kind) && (!range || now - Date.parse(c.createdAt) <= range * DAY) && (!evId || c.eventId === evId) &&
    (!q.trim() || `${c.title} ${c.note ?? ""}`.toLowerCase().includes(q.trim().toLowerCase())) && (!smart || matchSmart(c, smart, now))), [cells, kind, range, evId, q, smart, now]);
  const counts = useMemo(() => { const o = { hot: 0, warm: 0, cooling: 0, cold: 0, total: base.length }; base.forEach((c) => o[getMomentum(c, now).state]++); return o; }, [base, now]);
  const shown = useMemo(() => (state ? base.filter((c) => getMomentum(c, now).state === state) : base), [base, state, now]);
  const queue = useMemo(() => cells.filter((c) => ["cooling", "cold"].includes(getMomentum(c, now).state)).sort((a, b) => getMomentum(a, now).heat - getMomentum(b, now).heat), [cells, now]);

  const eventRows = useMemo<EventRow[]>(() => events.map((e) => {
    const mine = cells.filter((c) => c.eventId === e.id); const upcoming = !!e.startsAt && Date.parse(e.startsAt) > now;
    const last = mine.length ? Math.max(...mine.map((c) => Date.parse(c.lastMeaningfulActivityAt))) : 0; const iso = new Date(last).toISOString();
    const m = last ? getMomentum({ kind: "idea", createdAt: iso, lastMeaningfulActivityAt: iso }, now) : null;
    return { e, upcoming, count: mine.length, state: m?.state ?? null, heat: upcoming ? 1 : m?.heat ?? 0, follow: mine.filter((c) => c.kind === "person" && getMomentum(c, now).state !== "hot").length };
  }).sort((a, b) => (b.upcoming ? 2 : b.heat) - (a.upcoming ? 2 : a.heat)).slice(0, 4), [events, cells, now]);

  // Typed status line + rotating bee fact
  const hr = new Date().getHours(), greet = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
  const hth = health(cells, now), wm = warmth(cells, now);
  const needs = cells.filter((c) => ["cooling", "cold"].includes(getMomentum(c, now).state) || (c.kind === "action" && c.dueAt && Date.parse(c.dueAt) < now)).length;
  const status = `${greet}, ${userName}. Your hive is ${healthLabel(hth).toLowerCase()} at ${wm}% warm${needs ? `, and ${needs} ${needs === 1 ? "item wants" : "items want"} a little love` : ""}.`;
  const typed = useTypewriter(status, !calm);
  useEffect(() => { if (calm) return; const t = setInterval(() => setFact((n) => (n + 1) % FACTS.length), 9000); return () => clearInterval(t); }, [calm]);

  // Time-lapse: watch a month and a half pass
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => { const o = useUI.getState().offsetDays; if (o >= 45) { setPlaying(false); toast("That is what 45 quiet days do. Revive something!"); } else setOffset(o + 1); }, 110);
    return () => clearInterval(t);
  }, [playing, setOffset, toast]);
  const toggleLapse = () => { if (playing) setPlaying(false); else { if (offsetDays >= 45) setOffset(0); setPlaying(true); } };

  const pick = (s: MomentumState | null) => { setState(s); if (s) setView("cells"); };
  const act = (a: NonNullable<InsightAction>) => { if (a.type === "open") select(a.id); else { setKind(a.kind ?? "all"); setEvId(a.eventId ?? null); setState(a.state ?? null); setView("cells"); } };
  const onTotal = () => { eggs.current += 1; if (eggs.current >= 5) { eggs.current = 0; releaseSwarm(); toast("You found the swarm!"); } };

  // Keyboard shortcuts
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement; if (/INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k >= "1" && k <= "4") pick(STATES[+k - 1]); else if (k === "0") setState(null);
      else if (k === "o") setView("overview"); else if (k === "c") setView("cells"); else if (k === "l") setView("list");
      else if (k === "/") { e.preventDefault(); search.current?.focus(); } else if (k === "t") toggleLapse();
      else if (k === "r" && queue.length) setReview(true); else if (k === "?") setHelp(true);
    };
    window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const chip = (on: boolean) => `rounded-full px-4 py-2 text-[13px] font-semibold transition ${on ? "btn-gold" : "border border-line text-mute hover:text-text"}`;
  const evName = events.find((e) => e.id === evId)?.title;
  const anyFilter = kind !== "all" || range || q || smart || evId || state;
  const clear = () => { setKind("all"); setRange(0); setQ(""); setSmart(null); setEvId(null); setState(null); };

  return (
    <div className="mx-auto max-w-[1360px] space-y-4 pb-6">
      {/* Header */}
      <section className="relative flex items-center gap-4 pt-1">
        <span className="relative grid h-[68px] w-[68px] shrink-0 place-items-center" aria-hidden>
          <svg viewBox="-34 -34 68 68" className="absolute inset-0 drop-shadow-[0_0_14px_rgba(255,198,41,.6)]"><polygon points="0,-31 27,-15.5 27,15.5 0,31 -27,15.5 -27,-15.5" fill="color-mix(in srgb, #FFC629 14%, var(--surface))" stroke="#FFC629" strokeWidth="3" /></svg><BeeLogo size={36} /></span>
        <div className="min-w-0">
          <h1 className="text-[28px] font-bold leading-tight md:text-[32px]">Momentum Hive</h1>
          <p className="sr-only">{status}</p>
          <p aria-hidden className="min-h-[22px] text-[14px] md:text-[15px]">{typed}<span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-honey align-middle" /></p>
          <div className="mt-1 hidden h-4 max-w-[560px] md:block"><AnimatePresence mode="wait"><motion.p key={fact} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="truncate text-[12px] text-mute"><span className="font-semibold text-honey">Bee fact:</span> {FACTS[fact]}</motion.p></AnimatePresence></div>
        </div>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <p className="script -rotate-6 text-right text-[26px] leading-[1.05]">Better connections.<br />Bigger dreams.</p>
          <HeroBee className="relative block h-36 w-32 shrink-0" />
        </div>
      </section>

      <StatsStrip cells={cells} now={now} />

      {/* Filters */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {TYPES.map(({ k, l }) => <button key={k} aria-pressed={kind === k} onClick={() => setKind(k)} className={chip(kind === k)}>{l}</button>)}
          <label className="relative ml-auto min-w-[160px] max-w-[260px] flex-1"><span className="sr-only">Search this hive</span><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" aria-hidden />
            <input ref={search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search this hive ( / )" className="card w-full rounded-xl! py-2.5 pl-9 pr-3 text-[13px] placeholder:text-mute" /></label>
          <label className="relative"><span className="sr-only">Date range</span>
            <select value={range} onChange={(e) => setRange(+e.target.value)} className="card cursor-pointer appearance-none rounded-xl! py-2.5 pl-4 pr-9 text-[13px] font-medium">{RANGES.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}</select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-mute" aria-hidden /></label>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs"><span className="text-mute">Smart filters</span>
          {SMART.map(({ k, l }) => <button key={k} aria-pressed={smart === k} onClick={() => setSmart(smart === k ? null : k)} className={`rounded-full border px-3 py-1.5 font-medium ${smart === k ? "border-honey bg-honey/15 text-honey" : "border-line text-mute hover:text-text"}`}>{l}</button>)}
          {anyFilter && <button onClick={clear} className="ml-1 inline-flex items-center gap-1 text-mute underline-offset-2 hover:text-text hover:underline"><RotateCcw size={12} aria-hidden /> Clear all</button>}</div>
      </div>

      {/* Hive + insights */}
      <section className="grid gap-4 lg:grid-cols-[1.75fr_1fr]">
        <div ref={panel} className="card spot relative overflow-hidden p-4" onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`); e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`); }}>
          {!calm && <Embers />}
          <div className="relative">
            <AnimatePresence>{!tourDone && <BeeTour onDone={() => setTourDone(true)} />}</AnimatePresence>
            <div className="flex flex-wrap items-center gap-2">
              {state && <button onClick={() => setState(null)} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium" style={{ borderColor: STATE_COLOR[state], color: STATE_COLOR[state] }}>{STATE_LABEL[state]} <X size={12} aria-hidden /><span className="sr-only">Clear state filter</span></button>}
              {evName && <button onClick={() => setEvId(null)} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-medium text-mute">{evName} <X size={12} aria-hidden /><span className="sr-only">Clear event filter</span></button>}
              <div className="ml-auto flex rounded-full border border-line p-0.5 text-xs" role="tablist" aria-label="Hive view">
                {(["overview", "cells", "list"] as const).map((v) => <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={`rounded-full px-3 py-1.5 font-medium capitalize ${view === v ? "bg-honey text-[#1a1304]" : "text-mute"}`}>{v}</button>)}</div>
            </div>
            <div className="mt-2 min-h-[300px]">
              {view === "overview" && <><HexOverview counts={counts} selected={state} hovered={hover} onPick={pick} onHover={setHover} onTotal={onTotal} />
                <DistBar counts={counts} selected={state} onPick={pick} /><Peek state={hover ?? state} cells={base} now={now} onOpen={select} /><ColdShelf cells={base} now={now} onOpen={select} /></>}
              {view === "cells" && (shown.length ? <><Hive cells={shown} nowMs={now} selectedId={selectedId} onSelect={select} />
                <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-mute" aria-label="Legend">{STATES.map((s) => <li key={s} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: STATE_COLOR[s] }} aria-hidden />{STATE_LABEL[s]}, {STATE_RANGE[s]}</li>)}</ul></>
                : <p className="py-24 text-center text-sm text-mute">Nothing matches these filters.</p>)}
              {view === "list" && (shown.length ? <ListView cells={shown} now={now} /> : <p className="py-24 text-center text-sm text-mute">Nothing matches these filters.</p>)}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
              <button onClick={toggleLapse} className="btn-blue inline-flex items-center gap-1.5 px-3 py-2 text-xs">{playing ? <><Square size={13} aria-hidden /> Stop</> : <><Play size={13} aria-hidden /> Watch it cool</>}</button>
              {offsetDays > 0 && !playing && <button onClick={() => setOffset(0)} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs text-mute hover:text-text"><RotateCcw size={13} aria-hidden /> Back to today (+{offsetDays}d)</button>}
              <button onClick={() => setReview(true)} disabled={!queue.length} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs hover:bg-white/5 disabled:opacity-40"><ClipboardCheck size={13} aria-hidden /> Review cooling ({queue.length})</button>
              <button onClick={() => setHelp(true)} aria-label="Keyboard shortcuts" className="ml-auto rounded-lg p-2 text-mute hover:bg-white/5"><HelpCircle size={16} /></button>
            </div>
          </div>
        </div>
        <InsightsPanel now={now} onAction={act} />
      </section>

      <TopEvents rows={eventRows} evId={evId} onPick={(id) => { setEvId(id); if (id) setView("cells"); }} />

      <AnimatePresence>{review && <ReviewMode queue={queue} now={now} onClose={() => setReview(false)} />}</AnimatePresence>
      <AnimatePresence>{help && <ShortcutsDialog onClose={() => setHelp(false)} onTour={() => setTourDone(false)} />}</AnimatePresence>
    </div>
  );
}
