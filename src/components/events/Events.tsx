"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, CalendarCheck, CalendarClock, Users, Search, ChevronDown, LayoutGrid, List, Plus, SearchX } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { useNow, useMedia } from "@/lib/hooks";
import { CountUp } from "../dashboard/bits";
import { FILTERS, FILTER_LABEL, SORTS, eventStats, eventStatus, followUpsOpen, type Filter, type SortKey } from "@/features/events/events";
import EventsHero from "./EventsHero";
import EventCard from "./EventCard";
import { KeepAlive, RecentlyRevisited } from "./BuzzRail";
import Hex from "./Hex";
import Draggable from "../canvas/Draggable";
import { ActionIntentCard } from "../canvas/ActionIntent";
import { EventDock, eventCard } from "./EventZones";

const PAGE = 6;

export default function Events() {
  const { events, cells, setEventArchived } = useStore();
  const { openEvent, setCreateEvent, setCapture } = useUI();
  const now = useNow(); const wide = useMedia("(min-width: 1280px)");
  const [q, setQ] = useState(""); const [filter, setFilter] = useState<Filter>("all"); const [sort, setSort] = useState<SortKey>("updated");
  const [view, setView] = useState<"grid" | "list">("grid"); const [limit, setLimit] = useState(PAGE);

  const rows = useMemo(() => events.map((e) => ({ e, status: eventStatus(e, now), stats: eventStats(e, cells) })), [events, cells, now]);
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = rows.filter((r) => (filter === "all" ? r.status !== "archived" : r.status === filter) && (!t || `${r.e.title} ${r.e.venue ?? ""} ${r.e.type} ${(r.e.tags ?? []).join(" ")}`.toLowerCase().includes(t)));
    const start = (x: typeof rows[number]) => Date.parse(x.e.startsAt ?? x.e.date);
    const by: Record<SortKey, (a: typeof rows[number], b: typeof rows[number]) => number> = {
      updated: (a, b) => Date.parse(b.e.updatedAt ?? b.e.date) - Date.parse(a.e.updatedAt ?? a.e.date),
      newest: (a, b) => start(b) - start(a), oldest: (a, b) => start(a) - start(b),
      name: (a, b) => a.e.title.localeCompare(b.e.title), progress: (a, b) => b.stats.progress - a.stats.progress,
    };
    return [...list].sort(by[sort]);
  }, [rows, q, filter, sort]);

  const total = rows.length, upcoming = rows.filter((r) => r.status === "upcoming").length, past = rows.filter((r) => r.status === "past").length;
  const tiles = [
    { n: total, l: "Total events", I: CalendarDays, from: "#4D94FF", to: "#1B5BE0", c: "#2F8BFF" },
    { n: upcoming, l: "Upcoming", I: CalendarCheck, from: "#2EDCA0", to: "#0F9D6B", c: "#22B573" },
    { n: past, l: "Past events", I: CalendarClock, from: "#9B7BFF", to: "#5B35D8", c: "#7B5CFF" },
    { n: followUpsOpen(cells, now), l: "Follow-ups open", I: Users, from: "#FFB45C", to: "#E07A12", c: "#F29A2E" },
  ];
  const reset = () => { setQ(""); setFilter("all"); setSort("updated"); setLimit(PAGE); };
  const explore = () => { const a = rows.find((r) => r.status === "active") ?? rows[0]; if (a) openEvent(a.e.id); };
  const layout = wide && view === "grid" ? "grid" : "row";
  const visible = shown.slice(0, limit);

  return (
    <div className="mx-auto max-w-[1320px] space-y-4 pb-4">
      {wide ? <EventsHero onCreate={() => setCreateEvent(true)} onExplore={explore} /> : (
        <header className="flex items-start justify-between gap-3 pt-1">
          <div><h1 className="text-[26px] font-bold leading-tight">Events</h1><p className="mt-1 text-[13px] text-mute">Every event leaves something worth keeping.</p></div>
          <ActionIntentCard label="Create event" onExecute={() => setCreateEvent(true)} className="shrink-0 rounded-xl"><div className="btn-gold inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px]"><Plus size={15} aria-hidden /> Create event</div></ActionIntentCard>
        </header>)}

      {wide && (
        <section className="grid grid-cols-4 gap-3" aria-label="At a glance">
          {tiles.map(({ n, l, I, from, to, c }, i) => (
            <motion.div key={l} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }} className="card tile flex items-center gap-4 p-4"
              style={{ "--tint": `${c}55`, backgroundImage: `radial-gradient(220px 90px at 0% 0%, ${c}26, transparent 70%)` } as React.CSSProperties}>
              <Hex size={46} from={from} to={to} glow={`${c}88`}><I size={20} color="#fff" aria-hidden /></Hex>
              <p><span className="block text-[28px] font-bold leading-none"><CountUp to={n} /></span><span className="mt-1 block text-[12px] text-mute">{l}</span></p>
            </motion.div>))}
        </section>)}

      <div className={wide ? "grid grid-cols-[1fr_272px] items-start gap-4" : ""}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-[250px] xl:w-[190px] 2xl:w-[230px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" aria-hidden />
              <input value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} onKeyDown={(e) => e.key === "Escape" && setQ("")} aria-label="Search your events" placeholder="Search your events..." className="field w-full py-2.5 pl-10 pr-3 text-[13px]" />
            </div>
            <div className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 py-1 scroll-thin" role="group" aria-label="Filter by status">
              {FILTERS.map((f) => <button key={f} aria-pressed={filter === f} onClick={() => { setFilter(f); setLimit(PAGE); }} className="pill shrink-0 px-3 py-1.5 text-[12px]">{FILTER_LABEL[f]}</button>)}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <label className="relative">
                <span className="sr-only">Sort events</span>
                <select value={sort} onChange={(e) => { setSort(e.target.value as SortKey); setLimit(PAGE); }} className="field appearance-none py-2 pl-3.5 pr-9 text-[12px] font-medium">{SORTS.map((s) => <option key={s.k} value={s.k}>{s.label}</option>)}</select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-mute" aria-hidden />
              </label>
              <div className="flex gap-1" role="group" aria-label="Layout">
                {([["grid", LayoutGrid, "Grid view"], ["list", List, "List view"]] as const).map(([v, I, l]) => (
                  <button key={v} onClick={() => setView(v)} aria-pressed={view === v} aria-label={l} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-mute transition aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-white"><I size={16} aria-hidden /></button>))}
              </div>
            </div>
          </div>

          <p className="sr-only" role="status">{shown.length} events shown</p>
          {shown.length === 0 ? (
            <div className="card mt-3 grid place-items-center gap-3 px-6 py-14 text-center">
              <SearchX size={30} className="text-mute" aria-hidden />
              <p className="text-[15px] font-semibold">{q ? `Nothing matches “${q}”` : `No ${FILTER_LABEL[filter].toLowerCase()} yet`}</p>
              <p className="max-w-xs text-[13px] text-mute">{filter === "archived" ? "Archived events live here so your main list stays focused." : "Try a different filter, or start a new event to capture from."}</p>
              <div className="flex gap-2"><button onClick={reset} className="btn-blue px-4 py-2 text-[13px]">Clear filters</button><ActionIntentCard label="Create event" onExecute={() => setCreateEvent(true)}><div className="btn-gold rounded-xl px-4 py-2 text-center text-[13px]">Create event</div></ActionIntentCard></div>
            </div>
          ) : (
            <motion.ul layout className={`mt-3 grid gap-3 ${layout === "grid" ? "grid-cols-3" : view === "list" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
              <AnimatePresence initial={false}>
                {visible.map(({ e, status, stats }, i) => (
                  <li key={e.id} className="min-w-0 [&>*]:h-full">
                    <Draggable label={e.title} payload={() => eventCard(e.id, e.title, e.type)} className="h-full">
                      <EventCard e={e} status={status} stats={stats} now={now} layout={layout} index={i} onOpen={() => openEvent(e.id)} onCapture={() => setCapture(true, "idea", e.id)} onArchive={() => setEventArchived(e.id, status !== "archived", Date.now())} />
                    </Draggable>
                  </li>))}
              </AnimatePresence>
            </motion.ul>)}
          {shown.length > limit && <button onClick={() => setLimit(limit + PAGE)} className="btn-blue mx-auto mt-4 flex items-center gap-2 px-5 py-2.5 text-[13px]">Show {Math.min(PAGE, shown.length - limit)} more <ChevronDown size={14} aria-hidden /></button>}
        </div>

        {wide && <aside className="sticky top-20 space-y-3" aria-label="Momentum and recent events"><KeepAlive now={now} /><RecentlyRevisited now={now} onViewAll={() => { reset(); window.scrollTo({ top: 0, behavior: "smooth" }); }} /></aside>}
      </div>

      {!wide && <div className="grid items-start gap-3 md:grid-cols-2"><KeepAlive compact now={now} /><RecentlyRevisited now={now} onViewAll={reset} /></div>}
      <EventDock />
    </div>
  );
}
