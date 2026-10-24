"use client";
import { useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Lightbulb, CalendarCheck, Users, UserPlus, ListPlus, StickyNote, ChevronRight, MapPin, CalendarDays, Clock, Flame, UserRound, CheckCircle2, FileText } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { useNow } from "@/lib/hooks";
import { getMomentum } from "@/features/momentum/momentum";
import { Skyline, Sparkles, Trophy } from "../Art";
import HeroBee from "../HeroBee";
import { BuddyBubble, useBuddy } from "../Buddy";
import MomentumBadge from "../MomentumBadge";
import { CountUp, ago } from "./bits";
import type { Cell, Kind } from "@/types";

const DAY = 864e5;
const LEGEND = [
  { key: "hot", label: "Fresh & Active", color: "#4ADE80" },
  { key: "warm", label: "Needs Attention", color: "#FFB020" },
  { key: "cooling", label: "Cooling Down", color: "#B07CFF" },
  { key: "cold", label: "Went Cold", color: "#5B8DEF" },
] as const;

function activityLabel(c: Cell, text: string) {
  if (text.startsWith("Revived")) return "Item revived";
  if (text === "Marked done") return "Action completed";
  if (text.startsWith("Follow-up")) return "Follow-up scheduled";
  if (text.startsWith("Step")) return "Next step logged";
  return ({ idea: "New idea captured", person: "New contact added", action: "Action added", note: "Note captured" } as Record<Kind, string>)[c.kind];
}
const KIND_COLOR: Record<Kind, string> = { idea: "#FFB020", person: "#B07CFF", action: "#4ADE80", note: "#5B8DEF" };
const KIND_ICON = { idea: Lightbulb, person: UserRound, action: CheckCircle2, note: FileText } as const;

export default function Dashboard() {
  const buddy = useBuddy();
  const { cells, events, userName } = useStore();
  const setCapture = useUI((s) => s.setCapture), select = useUI((s) => s.select);
  const now = useNow();
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const d = useMemo(() => {
    const active = cells.filter((c) => !c.archived && !c.done);
    const st = active.map((c) => ({ c, s: getMomentum(c, now).state }));
    const count = (s: string) => st.filter((x) => x.s === s).length;
    const counts = { hot: count("hot"), warm: count("warm"), cooling: count("cooling"), cold: count("cold") };
    const pct = active.length ? Math.round(((counts.hot + counts.warm) / active.length) * 100) : 0;
    const upcoming = events.filter((e) => e.startsAt && Date.parse(e.startsAt) > now).sort((a, b) => Date.parse(a.startsAt!) - Date.parse(b.startsAt!));
    const logs = cells.flatMap((c) => c.log.map((l) => ({ c, ...l }))).sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 4);
    const days = Array.from({ length: 7 }, (_, i) => { const end = now - (6 - i) * DAY; return cells.reduce((n, c) => n + c.log.filter((l) => Date.parse(l.at) <= end && Date.parse(l.at) > end - DAY).length, 0); });
    return {
      counts, pct, total: active.length, archived: cells.filter((c) => c.archived).length, next: upcoming[0], logs, days,
      newIdeas: cells.filter((c) => c.kind === "idea" && now - Date.parse(c.createdAt) < 7 * DAY).length,
      pending: active.filter((c) => c.kind === "action" && c.dueAt).length,
      thisWeek: upcoming.filter((e) => Date.parse(e.startsAt!) - now < 7 * DAY).length,
      reconnect: st.filter((x) => x.c.kind === "person" && (x.s === "cooling" || x.s === "cold")).length,
    };
  }, [cells, events, now]);

  const stats = [
    { n: d.newIdeas, l1: "New Ideas", l2: "Captured", I: Lightbulb, c: "#7B5CFF" },
    { n: d.pending, l1: "Follow-ups", l2: "Pending", I: CalendarCheck, c: "#F0457B" },
    { n: d.thisWeek, l1: "Event", l2: "This Week", I: CalendarDays, c: "#22B573" },
    { n: d.reconnect, l1: "People to", l2: "Reconnect", I: Users, c: "#2F8BFF" },
  ];
  const quick = [
    { l: "Add New Idea", I: Lightbulb, c: "#FFB020", k: "idea" as Kind }, { l: "Save Contact", I: UserPlus, c: "#2F8BFF", k: "person" as Kind },
    { l: "Add Action Item", I: ListPlus, c: "#22B573", k: "action" as Kind }, { l: "Capture Note", I: StickyNote, c: "#B07CFF", k: "note" as Kind },
  ];
  const maxBar = Math.max(1, ...d.days);
  const dayLetters = Array.from({ length: 7 }, (_, i) => new Date(now - (6 - i) * DAY).toLocaleDateString("en", { weekday: "narrow" }));
  const goals = d.days.filter((n) => n > 0).length;
  const ev = d.next; const evDays = ev ? Math.max(1, Math.ceil((Date.parse(ev.startsAt!) - now) / DAY)) : 0;
  const C = 2 * Math.PI * 52;

  return (
    <div className="mx-auto max-w-[1320px] space-y-4 pb-4">
      {/* Hero */}
      <section className="hero min-h-[230px] p-5 md:min-h-[300px] md:p-8" aria-labelledby="greet">
        <Sparkles />
        <Skyline className="absolute inset-x-0 bottom-0 h-[44%] w-full" />
        <div className="relative z-10 max-w-[56%] md:max-w-[52%]">
          <h1 id="greet" className="script hero-text text-[34px] leading-none md:text-[52px]">{greet}, {userName}! <span aria-hidden>☀️</span></h1>
          <p className="hero-text mt-3 text-[13px] leading-relaxed opacity-90 md:text-[15px]">Every great journey continues after the event.<br className="hidden md:block" /> Let&rsquo;s turn your ideas into real progress today!</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="#meter" className="btn-gold inline-flex items-center gap-2 px-4 py-2.5 text-sm">My Dashboard <ChevronRight size={15} aria-hidden /></a>
            <Link href="/events" className="btn-ghost inline-flex items-center px-4 py-2.5 text-sm">Explore Events</Link>
          </div>
        </div>
        <HeroBee onClick={buddy.next} className="absolute bottom-0 right-3 z-10 h-[62%] w-[34%] max-w-[250px] md:right-14 md:h-[58%]" />
        <BuddyBubble tail className="absolute right-5 top-4 z-20 hidden w-[272px] p-3.5 md:block" />
      </section>

      <BuddyBubble className="p-3.5 md:hidden" />

      {/* Stat tiles */}
      <section className="grid grid-cols-4 gap-2 md:gap-3" aria-label="At a glance">
        {stats.map(({ n, l1, l2, I, c }, i) => (
          <motion.div key={l1} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07 }}
            className="card tile flex flex-col items-center gap-2 p-3 text-center md:flex-row md:gap-3 md:p-4 md:text-left" style={{ "--tint": `${c}66`, backgroundImage: `radial-gradient(200px 90px at 0% 0%, ${c}33, transparent 70%)` } as React.CSSProperties}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl md:h-12 md:w-12" style={{ background: `linear-gradient(145deg, ${c}, ${c}99)`, boxShadow: `inset 0 1px 0 rgba(255,255,255,.45), 0 8px 20px -6px ${c}` }}><I size={22} color="#fff" aria-hidden /></span>
            <p className="min-w-0"><span className="block text-[24px] font-bold leading-none md:text-[30px]"><CountUp to={n} /></span><span className="mt-1 block text-[10px] leading-tight text-mute md:text-[12px]">{l1}<br />{l2}</span></p>
          </motion.div>))}
      </section>

      {/* Meter / Event / Quick actions */}
      <section className="grid gap-4 lg:grid-cols-[1.35fr_1.1fr_0.9fr]">
        <div id="meter" className="card p-5 scroll-mt-24">
          <h2 className="text-[16px] font-semibold">Your Momentum Meter</h2>
          <div className="mt-4 flex items-center gap-5">
            <div className="relative h-[132px] w-[132px] shrink-0" role="img" aria-label={`${d.pct} percent of your items are active`}>
              <svg viewBox="0 0 132 132" className="-rotate-90"><circle cx="66" cy="66" r="52" fill="none" stroke="var(--line)" strokeWidth="12" />
                <motion.circle cx="66" cy="66" r="52" fill="none" stroke="#FFC400" strokeWidth="12" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - d.pct / 100) }} transition={{ duration: 1.3, ease: "easeOut" }} style={{ filter: "drop-shadow(0 0 8px rgba(255,196,0,.5))" }} /></svg>
              <div className="absolute inset-0 grid place-content-center text-center"><span className="text-[30px] font-bold leading-none"><CountUp to={d.pct} suffix="%" /></span><span className="mt-1 text-xs text-mute">Active</span></div>
            </div>
            <ul className="flex-1 space-y-2.5 text-[13px]">
              {LEGEND.map((x) => <li key={x.key} className="flex items-center gap-2.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: x.color }} aria-hidden /><span className="flex-1 text-mute">{x.label}</span><span className="font-semibold"><CountUp to={d.counts[x.key]} /></span></li>)}
            </ul>
          </div>
          <Link href="/hive" className="btn-gold ml-auto mt-3 flex w-fit items-center gap-1.5 px-3.5 py-2 text-xs">View Details <ChevronRight size={13} aria-hidden /></Link>
        </div>

        <div className="card flex flex-col p-5">
          <div className="flex items-center justify-between"><h2 className="text-[16px] font-semibold">Upcoming Event</h2>{ev && <span className="btn-blue px-2.5 py-1 text-[11px]">In {evDays} {evDays === 1 ? "day" : "days"}</span>}</div>
          {ev ? (
            <div className="mt-4 flex flex-1 gap-4">
              <div className="relative h-[132px] w-[104px] shrink-0 overflow-hidden rounded-xl" style={{ background: "linear-gradient(180deg,#3a1fd1,#2a7bff 55%,#ff8a3c)" }} aria-hidden>
                <div className="absolute left-1/2 top-2 h-16 w-20 -translate-x-1/2 rounded-full bg-fuchsia-300/40 blur-xl" /><Skyline w={320} className="absolute inset-x-0 bottom-0 h-3/4 w-full" /></div>
              <div className="min-w-0 flex-1 text-[13px]">
                <p className="text-[17px] font-bold leading-tight">{ev.title}</p>
                <p className="mt-2 flex items-center gap-2 text-mute"><CalendarDays size={14} aria-hidden />{new Date(ev.startsAt!).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                <p className="mt-1 flex items-center gap-2 text-mute"><Clock size={14} aria-hidden />{new Date(ev.startsAt!).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</p>
                <p className="mt-1 flex items-center gap-2 text-mute"><MapPin size={14} aria-hidden />{ev.venue}</p>
                <Link href="/events" className="btn-blue mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs">View Event <ChevronRight size={13} aria-hidden /></Link>
              </div>
            </div>) : <p className="mt-6 text-sm text-mute">No upcoming event yet. Capture something from your last one to keep it warm.</p>}
        </div>

        <div className="card p-5"><h2 className="text-[16px] font-semibold">Quick Actions</h2>
          <ul className="mt-3 space-y-2">
            {quick.map(({ l, I, c, k }) => (
              <li key={l}><button onClick={() => setCapture(true, k)} className="group flex w-full items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-left text-[13px] font-medium transition hover:border-honey/60 hover:bg-white/5">
                <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: c }}><I size={16} color="#fff" aria-hidden /></span><span className="flex-1">{l}</span>
                <ChevronRight size={15} className="text-mute transition group-hover:translate-x-0.5" aria-hidden /></button></li>))}
          </ul></div>
      </section>

      {/* Activity / Weekly */}
      <section className="grid gap-4 lg:grid-cols-[1.9fr_1fr]">
        <div className="card p-5">
          <div className="flex items-center justify-between"><h2 className="text-[16px] font-semibold">Recent Activity</h2><Link href="/hive" className="text-xs font-medium text-honey hover:underline">Open hive</Link></div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {d.logs.map((l, i) => { const I = KIND_ICON[l.c.kind], col = KIND_COLOR[l.c.kind]; const ev = events.find((e) => e.id === l.c.eventId); return (
              <motion.li key={`${l.c.id}-${l.at}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.07 }}>
                <button onClick={() => select(l.c.id)} className="group flex h-full w-full flex-col rounded-2xl border p-3.5 text-left transition hover:-translate-y-0.5" style={{ borderColor: `${col}40`, backgroundImage: `radial-gradient(180px 90px at 0% 0%, ${col}26, transparent 75%)` }}>
                  <span className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: `linear-gradient(145deg, ${col}, ${col}99)`, boxShadow: `inset 0 1px 0 rgba(255,255,255,.4), 0 6px 16px -6px ${col}` }}><I size={16} color="#fff" aria-hidden /></span>
                    <span className="text-[13px] font-semibold leading-tight">{activityLabel(l.c, l.text)}</span></span>
                  <span className="mt-2.5 line-clamp-2 text-[13px] leading-snug">{l.c.title}</span>
                  {ev && <span className="mt-1 truncate text-[11px] text-mute">from {ev.title}</span>}
                  <span className="mt-auto flex items-center justify-between gap-2 pt-3 text-[11px] text-mute"><span>{ago(l.at, now)}</span>{!l.c.done && !l.c.archived && <MomentumBadge state={getMomentum(l.c, now).state} />}</span>
                </button></motion.li>); })}
          </ul></div>

        <div className="card relative flex flex-col overflow-hidden p-5">
          <div className="flex items-center justify-between"><h2 className="text-[16px] font-semibold">Weekly Progress</h2><span className="text-[11px] text-mute">Last 7 days</span></div>
          <div className="mt-4 flex items-start justify-between gap-3">
            <div><p className="text-[36px] font-bold leading-none"><CountUp to={goals} />/7</p><p className="mt-1.5 text-[12px] text-mute">days with progress</p></div>
            <div className="relative h-[72px] w-[64px] shrink-0"><span className="absolute inset-2 rounded-full bg-honey/30 blur-xl" aria-hidden /><Trophy /></div>
          </div>
          <div className="mt-4 flex h-[84px] items-end gap-2" role="img" aria-label={`Activity over the last 7 days: ${d.days.join(", ")} updates`}>
            {d.days.map((n, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5" title={`${n} update${n === 1 ? "" : "s"}`}>
                <motion.span className="w-full rounded-md" style={{ background: i === 6 ? "linear-gradient(#FFD23F,#FFC400)" : n ? "linear-gradient(#4b93ff,#2378FF)" : "var(--line)", boxShadow: i === 6 ? "0 0 14px rgba(255,196,0,.45)" : undefined }}
                  initial={{ height: 0 }} animate={{ height: `${n ? Math.max(18, Math.sqrt(n / maxBar) * 100) : 8}%` }} transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 170, damping: 18 }} />
                <span className={`text-[10px] ${i === 6 ? "font-semibold text-honey" : "text-mute"}`}>{i === 6 ? "Today" : dayLetters[i]}</span>
              </div>))}
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line"><motion.div className="h-full rounded-full bg-honey" initial={{ width: 0 }} animate={{ width: `${(goals / 7) * 100}%` }} transition={{ delay: 0.5, duration: 0.9 }} /></div>
          <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-mute"><Flame size={13} className="text-honey" aria-hidden /> {goals >= 5 ? "Keep going! You\u2019re doing great!" : "One small step today keeps the hive warm."}</p>
        </div>
      </section>
    </div>
  );
}
