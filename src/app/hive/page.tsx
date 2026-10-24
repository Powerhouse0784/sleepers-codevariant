"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, ChevronDown, X } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { useNow, useActiveCells } from "@/lib/hooks";
import { getMomentum, STATE_LABEL, STATE_RANGE, type MomentumState } from "@/features/momentum/momentum";
import type { Kind } from "@/types";
import Hive from "@/components/Hive";
import HeroBee from "@/components/HeroBee";
import HexOverview from "@/components/hive/HexOverview";
import InsightsPanel from "@/components/hive/InsightsPanel";
import EventArt from "@/components/hive/EventArt";
import MomentumBadge, { STATE_COLOR } from "@/components/MomentumBadge";
import { BeeLogo } from "@/components/Art";
import type { InsightAction } from "@/features/insights/insights";

const DAY = 864e5;
const TYPES: { k: Kind | "all"; l: string }[] = [{ k: "all", l: "All" }, { k: "idea", l: "Ideas" }, { k: "person", l: "People" }, { k: "action", l: "Actions" }];
const RANGES = [{ v: 0, l: "All time" }, { v: 7, l: "Last 7 days" }, { v: 30, l: "Last 30 days" }, { v: 90, l: "Last 90 days" }];
const STATES: MomentumState[] = ["hot", "warm", "cooling", "cold"];
const city = (v?: string) => v?.split(",")[0] ?? "";
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function HivePage() {
  const cells = useActiveCells(); const now = useNow();
  const events = useStore((s) => s.events); const { selectedId, select } = useUI();
  const [kind, setKind] = useState<Kind | "all">("all"); const [range, setRange] = useState(0);
  const [state, setState] = useState<MomentumState | null>(null); const [evId, setEvId] = useState<string | null>(null);
  const [view, setView] = useState<"overview" | "cells" | "list">("overview");

  const base = useMemo(() => cells.filter((c) => (kind === "all" || c.kind === kind) && (!range || now - Date.parse(c.createdAt) <= range * DAY) && (!evId || c.eventId === evId)), [cells, kind, range, evId, now]);
  const counts = useMemo(() => { const o = { hot: 0, warm: 0, cooling: 0, cold: 0, total: base.length }; base.forEach((c) => o[getMomentum(c, now).state]++); return o; }, [base, now]);
  const shown = useMemo(() => (state ? base.filter((c) => getMomentum(c, now).state === state) : base), [base, state, now]);

  const topEvents = useMemo(() => events.map((e) => {
    const mine = cells.filter((c) => c.eventId === e.id);
    const upcoming = !!e.startsAt && Date.parse(e.startsAt) > now;
    const last = mine.length ? Math.max(...mine.map((c) => Date.parse(c.lastMeaningfulActivityAt))) : 0;
    const m = last ? getMomentum({ kind: "idea", createdAt: new Date(last).toISOString(), lastMeaningfulActivityAt: new Date(last).toISOString() }, now) : null;
    return { e, upcoming, count: mine.length, state: m?.state ?? null, heat: upcoming ? 2 : m?.heat ?? 0 };
  }).sort((a, b) => b.heat - a.heat).slice(0, 4), [events, cells, now]);

  const pick = (s: MomentumState | null) => { setState(s); if (s) setView("cells"); };
  const act = (a: NonNullable<InsightAction>) => { if (a.type === "open") select(a.id); else { setKind(a.kind ?? "all"); setEvId(a.eventId ?? null); setState(a.state ?? null); setView("cells"); } };
  const chip = (on: boolean) => `rounded-full px-5 py-2 text-[13px] font-semibold transition ${on ? "btn-gold" : "border border-line text-mute hover:text-text"}`;
  const evName = events.find((e) => e.id === evId)?.title;

  return (
    <div className="mx-auto max-w-[1360px] space-y-4 pb-6">
      {/* Header */}
      <section className="relative flex items-center gap-4 pt-1">
        <span className="relative grid h-[68px] w-[68px] shrink-0 place-items-center" aria-hidden>
          <svg viewBox="-34 -34 68 68" className="absolute inset-0 drop-shadow-[0_0_14px_rgba(255,198,41,.6)]"><polygon points="0,-31 27,-15.5 27,15.5 0,31 -27,15.5 -27,-15.5" fill="color-mix(in srgb, #FFC629 14%, var(--surface))" stroke="#FFC629" strokeWidth="3" /></svg><BeeLogo size={36} /></span>
        <div className="min-w-0">
          <h1 className="text-[28px] font-bold leading-tight md:text-[32px]">Momentum Hive</h1>
          <p className="text-[14px] md:text-[15px]">Your ideas, people and actions, all in one view.</p>
          <p className="mt-1 hidden max-w-[520px] text-[12px] text-mute md:block">See what&rsquo;s hot, warm or cooling, find your next best step, and keep the buzz going!</p>
        </div>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <p className="script -rotate-6 text-right text-[26px] leading-[1.05]">Better connections.<br />Bigger dreams.</p>
          <HeroBee className="relative block h-36 w-32 shrink-0" />
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {TYPES.map(({ k, l }) => <button key={k} aria-pressed={kind === k} onClick={() => setKind(k)} className={chip(kind === k)}>{l}</button>)}
        <label className="relative ml-auto"><span className="sr-only">Date range</span>
          <select value={range} onChange={(e) => setRange(+e.target.value)} className="card cursor-pointer appearance-none rounded-xl! py-2.5 pl-4 pr-9 text-[13px] font-medium">{RANGES.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}</select>
          <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-mute" aria-hidden /></label>
      </div>

      {/* Hive + insights */}
      <section className="grid gap-4 lg:grid-cols-[1.75fr_1fr]">
        <div className="card relative overflow-hidden p-4">
          <div className="flex flex-wrap items-center gap-2">
            {state && <button onClick={() => setState(null)} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium" style={{ borderColor: STATE_COLOR[state], color: STATE_COLOR[state] }}>{STATE_LABEL[state]} <X size={12} aria-hidden /><span className="sr-only">Clear state filter</span></button>}
            {evName && <button onClick={() => setEvId(null)} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-medium text-mute">{evName} <X size={12} aria-hidden /><span className="sr-only">Clear event filter</span></button>}
            <div className="ml-auto flex rounded-full border border-line p-0.5 text-xs" role="tablist" aria-label="Hive view">
              {(["overview", "cells", "list"] as const).map((v) => <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={`rounded-full px-3 py-1.5 font-medium capitalize ${view === v ? "bg-honey text-[#1a1304]" : "text-mute"}`}>{v}</button>)}</div>
          </div>
          <div className="mt-2 min-h-[300px]">
            {view === "overview" && <HexOverview counts={counts} selected={state} onPick={pick} />}
            {view === "cells" && (shown.length ? <><Hive cells={shown} nowMs={now} selectedId={selectedId} onSelect={select} />
              <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-mute" aria-label="Legend">{STATES.map((s) => <li key={s} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: STATE_COLOR[s] }} aria-hidden />{STATE_LABEL[s]}, {STATE_RANGE[s]}</li>)}</ul></>
              : <p className="py-24 text-center text-sm text-mute">Nothing matches these filters.</p>)}
            {view === "list" && (shown.length ? <ul className="divide-y divide-line">{shown.map((c) => { const m = getMomentum(c, now); return (
              <li key={c.id}><button onClick={() => select(c.id)} className="flex w-full items-center gap-3 px-2 py-3 text-left hover:bg-white/5"><MomentumBadge state={m.state} /><span className="flex-1 truncate text-sm">{c.title}</span><span className="hidden text-xs capitalize text-mute sm:block">{c.kind}</span><span className="hidden text-xs text-mute md:block">{m.reason}</span></button></li>); })}</ul>
              : <p className="py-24 text-center text-sm text-mute">Nothing matches these filters.</p>)}
          </div>
        </div>
        <InsightsPanel now={now} onAction={act} />
      </section>

      {/* Top events */}
      <section className="card p-5" aria-labelledby="te">
        <div className="flex items-center justify-between"><h2 id="te" className="text-[16px] font-semibold">Top Events by Momentum</h2>
          <Link href="/events" className="btn-blue inline-flex items-center gap-1.5 px-3 py-1.5 text-xs">View All <ArrowRight size={13} aria-hidden /></Link></div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {topEvents.map(({ e, upcoming, count, state: s }, i) => { const on = evId === e.id; const col = upcoming ? "#2F8BFF" : s ? STATE_COLOR[s] : "#98a2c0"; return (
            <motion.li key={e.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07 }}>
              <button onClick={() => { setEvId(on ? null : e.id); setView("cells"); }} aria-pressed={on} className="group flex w-full gap-3 overflow-hidden rounded-2xl border p-0 text-left transition hover:-translate-y-0.5 sm:block"
                style={{ borderColor: on ? "var(--gold)" : "var(--line)" }}>
                <span className="relative block h-20 w-28 shrink-0 overflow-hidden sm:h-[88px] sm:w-full"><EventArt seed={e.id} className="h-full w-full" />
                  <span className="absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: col }}>{upcoming ? "Upcoming" : s ? STATE_LABEL[s] : "No items"}</span></span>
                <span className="block min-w-0 flex-1 p-3 sm:p-3.5"><span className="block truncate text-[13px] font-semibold">{e.title}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-mute">{fmt(e.startsAt ?? e.date)}{e.venue ? ` · ${city(e.venue)}` : ""}</span>
                  <span className="mt-1 block text-[11px] text-mute">{count} {count === 1 ? "item" : "items"}</span></span>
              </button></motion.li>); })}
        </ul>
      </section>
    </div>
  );
}
