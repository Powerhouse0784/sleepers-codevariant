"use client";
import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, CalendarCheck, Plus, ArrowRight, Sparkles, Flag, Video, Heart, Mic, SearchX, type LucideIcon } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { useActions } from "@/lib/actionsStore";
import { useCalendarUI, type View } from "@/lib/calendarStore";
import { useMedia, useNow } from "@/lib/hooks";
import { OPPORTUNITIES } from "@/features/actions/actions";
import { CAT_COLOR, WEEKDAYS, addDays, addMonths, buildItems, dayTitle, isPast, itemTime, itemsOn, matches, monthGrid, monthTitle, sameDay, startOfDay, startOfWeek, type CalItem } from "@/features/calendar/calendar";
import { ItemDialog, ListDialog, PromoCard, QuickActions, TodayPanel, UpcomingPanel } from "./CalendarRail";
import Draggable from "../canvas/Draggable";
import { CalendarDock, calItemCard } from "./CalendarZones";
import { ActionIntentCard } from "../canvas/ActionIntent";

const CAT_ICON: Record<CalItem["cat"], LucideIcon> = { workshop: Sparkles, challenge: Flag, meeting: Video, idea: Heart, webinar: Mic };
const mask = (stop: number) => ({ maskImage: `linear-gradient(90deg,transparent,#000 ${stop}%)`, WebkitMaskImage: `linear-gradient(90deg,transparent,#000 ${stop}%)` });
const VIEWS: { k: View; label: string }[] = [{ k: "month", label: "Month" }, { k: "week", label: "Week" }, { k: "day", label: "Day" }];

function Hero() {
  return (
    <section aria-labelledby="cal-hero" className="relative isolate min-h-[156px] overflow-hidden rounded-[20px] border border-[#2a5bd0]/60 text-white"
      style={{ background: "radial-gradient(420px 220px at 10% 0%, rgba(120,70,255,.45), transparent 70%), radial-gradient(520px 200px at 50% 120%, rgba(255,150,90,.28), transparent 70%), linear-gradient(100deg,#08174f 0%,#16248a 55%,#2a1f86 100%)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/calendar/hero-bee.webp" alt="" width={532} height={156} className="absolute inset-y-0 right-0 h-full w-auto max-w-none select-none opacity-55 sm:opacity-100" draggable={false} style={mask(26)} />
      <div className="relative z-10 flex min-h-[156px] max-w-[72%] flex-col justify-center p-5 sm:max-w-[58%] md:px-7">
        <h1 id="cal-hero" className="script -rotate-2 text-[30px] leading-[1.02] sm:text-[38px] xl:text-[44px]">Big Plans<br /> Start with a Calendar!</h1>
        <p className="mt-2 max-w-[400px] text-[12.5px] leading-relaxed text-white/90 sm:text-[14px]">Track events, join challenges, never miss an opportunity to grow!</p>
      </div>
    </section>
  );
}

function Chip({ i, now, full }: { i: CalItem; now: number; full?: boolean }) {
  const c = CAT_COLOR[i.cat]; const I = CAT_ICON[i.cat];
  return (
    <Draggable label={i.title} payload={() => calItemCard(i)} className="w-full">
      <div title={`${i.title}, ${itemTime(i)}`} aria-label={`${i.title}, ${itemTime(i)}`} className={`group flex w-full items-center gap-1.5 rounded-lg border px-1.5 py-1 text-left transition ${isPast(i, now) ? "opacity-55" : ""}`} style={{ borderColor: `${c}aa`, background: `linear-gradient(135deg, ${c}40, ${c}18)`, boxShadow: `0 0 14px -6px ${c}` }}>
        <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full text-white" style={{ background: c }}><I size={10} aria-hidden /></span>
        <span className="min-w-0 leading-[1.15]"><span className={`block text-[11.5px] font-semibold ${full ? "" : "truncate"}`}>{i.short && !full ? i.short : i.title}</span><span className="block text-[10px] text-white/70">{itemTime(i)}</span></span>
      </div>
    </Draggable>
  );
}
const Dots = ({ items }: { items: CalItem[] }) => <span className="mt-1 flex flex-wrap justify-center gap-1 sm:hidden" aria-hidden>{items.slice(0, 4).map((i) => <span key={i.id} className="h-1.5 w-1.5 rounded-full" style={{ background: CAT_COLOR[i.cat] }} />)}</span>;

function MonthGrid({ all, cursor, now, go }: { all: CalItem[]; cursor: number; now: number; go: (day: number) => void }) {
  const rows = monthGrid(cursor);
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="grid grid-cols-7 border-b border-line bg-white/[.03]" role="row">{WEEKDAYS.map((d) => <div key={d} role="columnheader" className="py-2.5 text-center text-[12px] font-medium text-mute"><span className="sm:hidden">{d[0]}</span><span className="hidden sm:inline">{d}</span></div>)}</div>
      {rows.map((r, ri) => (
        <div key={ri} className="grid grid-cols-7" role="row">
          {r.map((day, ci) => {
            if (day === null) return <div key={ci} className={`min-h-[64px] border-line sm:min-h-[104px] ${ci < 6 ? "border-r" : ""} ${ri < rows.length - 1 ? "border-b" : ""}`} />;
            const items = itemsOn(all, day); const today = sameDay(day, now);
            return (
              <div key={ci} role="gridcell" onClick={() => go(day)} className={`group min-h-[64px] cursor-pointer border-line p-1 transition hover:bg-white/[.04] sm:min-h-[104px] sm:p-1.5 ${ci < 6 ? "border-r" : ""} ${ri < rows.length - 1 ? "border-b" : ""} ${today ? "bg-primary/10" : ""}`}>
                <button onClick={(e) => { e.stopPropagation(); go(day); }} aria-label={`${new Date(day).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}${items.length ? `, ${items.length} items` : ""}`}
                  className={`grid h-6 min-w-6 place-items-center rounded-full px-1 text-[12px] font-medium ${today ? "bg-honey font-bold text-[var(--on-gold)] shadow-[0_0_12px_rgba(255,198,41,.6)]" : "text-[var(--text)]"}`}>{new Date(day).getDate()}</button>
                <div className="mt-1 hidden space-y-1 sm:block">
                  {items.slice(0, 2).map((i) => <Chip key={i.id} i={i} now={now} />)}
                  {items.length > 2 && <button onClick={(e) => { e.stopPropagation(); go(day); }} className="w-full rounded-md py-0.5 text-center text-[10.5px] font-medium text-primary hover:underline">+{items.length - 2} more</button>}
                </div>
                <Dots items={items} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function WeekView({ all, cursor, now, go }: { all: CalItem[]; cursor: number; now: number; go: (day: number) => void }) {
  const start = startOfWeek(cursor); const days = Array.from({ length: 7 }, (_, k) => addDays(start, k));
  return (
    <div className="grid overflow-hidden rounded-xl border border-line md:grid-cols-7">
      {days.map((d, k) => { const items = itemsOn(all, d); const today = sameDay(d, now);
        return (
          <div key={d} className={`min-h-[120px] border-line p-2 max-md:border-b md:min-h-[300px] ${k < 6 ? "md:border-r" : ""} ${today ? "bg-primary/10" : ""}`}>
            <button onClick={() => go(d)} className="flex w-full items-center gap-2 text-left md:flex-col md:items-start md:gap-0.5">
              <span className="text-[11px] text-mute">{WEEKDAYS[k]}</span>
              <span className={`grid h-7 min-w-7 place-items-center rounded-full px-1.5 text-[13px] font-semibold ${today ? "bg-honey text-[var(--on-gold)]" : ""}`}>{new Date(d).getDate()}</span></button>
            <div className="mt-2 space-y-1.5">{items.length === 0 ? <p className="text-[11px] text-mute/70">Free</p> : items.map((i) => <Chip key={i.id} i={i} now={now} full />)}</div>
          </div>); })}
    </div>
  );
}

function DayView({ all, cursor, now }: { all: CalItem[]; cursor: number; now: number }) {
  const setCreate = useUI((s) => s.setCreateEvent); const items = itemsOn(all, cursor);
  return (
    <div className="rounded-xl border border-line p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3"><h3 className="text-[15px] font-semibold">{dayTitle(cursor)}{sameDay(cursor, now) && <span className="ml-2 rounded-full bg-honey/15 px-2 py-0.5 align-middle text-[10.5px] font-semibold text-honey">Today</span>}</h3>
        <ActionIntentCard label="Add event" hint="Create a new calendar event" onExecute={() => setCreate(true)}><div className="btn-blue rounded-xl px-3 py-1.5 text-center text-[12px]"><Plus size={13} aria-hidden /> Add event</div></ActionIntentCard></div>
      {items.length === 0 ? <div className="grid place-items-center gap-2 px-6 py-14 text-center"><CalendarCheck size={30} className="text-mute" aria-hidden /><p className="text-[15px] font-semibold">Nothing planned</p><p className="max-w-xs text-[13px] text-mute">A clear day. Add an event or join a challenge to fill it.</p></div> : (
      <ul className="mt-3 space-y-2">{items.map((i) => { const c = CAT_COLOR[i.cat]; const I = CAT_ICON[i.cat];
        return <li key={i.id}>
          <Draggable label={i.title} payload={() => calItemCard(i)} className="w-full">
            <div className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${isPast(i, now) ? "opacity-60" : ""}`} style={{ borderColor: `${c}99`, background: `linear-gradient(135deg, ${c}33, ${c}0f)` }}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white" style={{ background: c }}><I size={17} aria-hidden /></span>
              <span className="min-w-0 flex-1 leading-tight"><span className="block truncate text-[14px] font-semibold">{i.title}</span><span className="block truncate text-[12px] text-white/70">{itemTime(i)}{i.where ? ` • ${i.where}` : ""}</span></span>
              <span className="shrink-0 text-[10px] text-mute/60 select-none" aria-hidden>⠿ drag to action zone</span>
            </div>
          </Draggable>
        </li>; })}</ul>)}</div>
  );
}

function MissedBanner({ onClick }: { onClick: () => void }) {
  return (
    <section aria-labelledby="cal-missed" className="relative isolate flex items-center gap-4 overflow-hidden rounded-2xl border border-primary/50 px-4 py-3 text-white" style={{ background: "linear-gradient(100deg,#0a1440,#101c66 60%,#1a1a70)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/calendar/missed-city.webp" alt="" width={360} height={70} className="absolute inset-y-0 right-0 -z-10 hidden h-full w-auto max-w-none select-none opacity-90 md:block" draggable={false} style={mask(30)} />
      <span className="grid h-12 w-12 shrink-0 -rotate-6 place-items-center rounded-xl border border-white/20 bg-gradient-to-br from-[#4f7cff] to-[#2f56d8] shadow-[0_0_18px_rgba(79,124,255,.6)]"><CalendarCheck size={26} aria-hidden /></span>
      <div className="min-w-0 flex-1"><h2 id="cal-missed" className="text-[17px] font-semibold leading-tight sm:text-[20px]">Missed something?</h2><p className="mt-0.5 text-[12px] text-white/85 sm:text-[13px]">Catch up on past events, replays, and resources.</p></div>
      <ActionIntentCard label="View past events" onExecute={onClick} className="relative z-10 shrink-0"><div className="btn-gold rounded-xl px-4 py-2 text-[13px]">View Past Events <ArrowRight size={14} aria-hidden /></div></ActionIntentCard>
    </section>
  );
}

export default function Calendar() {
  const wide = useMedia("(min-width: 1280px)"); const now = useNow();
  const events = useStore((s) => s.events), cells = useStore((s) => s.cells), joined = useActions((s) => s.joined);
  const { view, cursor, q, setView, setCursor, setPast } = useCalendarUI(); const setCreate = useUI((s) => s.setCreateEvent);
  useEffect(() => { useCalendarUI.getState().setCursor(useUI.getState().offsetDays ? Date.now() + useUI.getState().offsetDays * 864e5 : Date.now()); }, []); // always open on today
  const all = useMemo(() => buildItems({ events, cells, joined, opps: OPPORTUNITIES, now }), [events, cells, joined, now]);
  const shown = useMemo(() => (q.trim() ? all.filter((i) => matches(i, q)) : all), [all, q]);
  const step = (dir: 1 | -1) => setCursor(view === "month" ? addMonths(cursor, dir) : addDays(cursor, dir * (view === "week" ? 7 : 1)));
  const go = (day: number) => { setCursor(day); setView("day"); };
  const toGrid = () => { setView("month"); setCursor(now); setTimeout(() => document.getElementById("cal-main")?.scrollIntoView({ behavior: "smooth", block: "start" }), 40); };
  const title = view === "month" ? monthTitle(cursor) : view === "day" ? new Date(cursor).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : (() => { const a = startOfWeek(cursor), b = addDays(a, 6); const f = (m: number, y: boolean) => new Date(m).toLocaleDateString("en-GB", { day: "numeric", month: "short", ...(y ? { year: "numeric" } : {}) }); return `${f(a, false)} – ${f(b, true)}`; })();
  const nav = "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-primary/50 text-primary transition hover:bg-primary/15";
  const todayCount = itemsOn(all, now).length; const inRange = view === "month" ? shown.some((i) => i.start <= addMonths(startOfDay(cursor), 1) && i.end >= startOfDay(cursor)) : true;

  return (
    <div className="mx-auto max-w-[1320px] space-y-4 pb-4">
      <div className={wide ? "grid grid-cols-[1fr_300px] items-start gap-4" : ""}>
        <div className="min-w-0 space-y-4">
          <Hero />
          <section id="cal-main" aria-label="Calendar" className="card scroll-mt-20 border-primary/40 p-3 sm:p-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5">
              <div className="flex items-center gap-2"><button onClick={() => step(-1)} aria-label={`Previous ${view}`} className={nav}><ChevronLeft size={18} /></button><button onClick={() => step(1)} aria-label={`Next ${view}`} className={nav}><ChevronRight size={18} /></button></div>
              <h2 className="min-w-0 text-[20px] font-semibold tracking-tight sm:text-[24px]" aria-live="polite">{title}</h2>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex gap-1.5" role="group" aria-label="Calendar view">{VIEWS.map(({ k, label }) => <button key={k} aria-pressed={view === k} onClick={() => setView(k)} className="pill px-3.5 py-1.5 text-[12.5px] sm:px-5">{label}</button>)}</div>
                <button onClick={() => setCursor(now)} className="btn-blue hidden items-center gap-2 px-3.5 py-2 text-[12.5px] sm:inline-flex"><CalendarCheck size={15} aria-hidden /> Today</button>
              </div>
            </div>
            <div className="mt-3">
              <AnimatePresence mode="wait" initial={false}><motion.div key={`${view}-${title}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}>
                {view === "month" ? <MonthGrid all={shown} cursor={cursor} now={now} go={go} /> : view === "week" ? <WeekView all={shown} cursor={cursor} now={now} go={go} /> : <DayView all={shown} cursor={cursor} now={now} />}
              </motion.div></AnimatePresence>
            </div>
            {q.trim() && !shown.length && <div className="grid place-items-center gap-2 px-6 py-8 text-center"><SearchX size={26} className="text-mute" aria-hidden /><p className="text-[14px] font-semibold">Nothing matches “{q.trim()}”</p></div>}
            {!q.trim() && !inRange && view === "month" && <p className="mt-3 text-center text-[12.5px] text-mute">Nothing scheduled this month. <ActionIntentCard label="Add event" onExecute={() => setCreate(true)}><span className="font-medium text-primary underline">Add an event (drag to execute)</span></ActionIntentCard></p>}
            <p className="mt-2.5 text-[10.5px] text-mute">Shows your events, due dates and joined challenges, plus a sample schedule for the demo. Tap a sample entry to add it to your events.</p>
          </section>
          <MissedBanner onClick={() => setPast(true)} />
        </div>
        {wide && <aside className="space-y-3" aria-label="Today and upcoming"><TodayPanel now={now} count={todayCount} /><UpcomingPanel items={all} now={now} /><QuickActions onToday={() => { setCursor(now); setView("day"); }} onGrid={toGrid} /><PromoCard /></aside>}
      </div>
      {!wide && <div className="grid items-start gap-3 md:grid-cols-2"><div className="space-y-3"><TodayPanel now={now} count={todayCount} /><UpcomingPanel items={all} now={now} /></div><div className="space-y-3"><QuickActions onToday={() => { setCursor(now); setView("day"); }} onGrid={toGrid} /><PromoCard /></div></div>}
      <ItemDialog items={all} now={now} /><ListDialog kind="upcoming" items={all} now={now} /><ListDialog kind="past" items={all} now={now} />
      <CalendarDock />
    </div>
  );
}