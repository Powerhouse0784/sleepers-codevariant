"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MotionConfig, AnimatePresence, motion } from "motion/react";
import { Home, CalendarDays, Hexagon, Lightbulb, Users, ListChecks, Calendar, BookOpen, Settings, Search, Bell, Sun, Moon, FastForward, Plus, MoreHorizontal, ArrowRight, Command, Leaf, RotateCcw } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { useIdeas, useIdeasUI } from "@/lib/ideasStore";
import { usePeople, usePeopleUI } from "@/lib/peopleStore";
import { useActions, useActionsUI } from "@/lib/actionsStore";
import { useCalendarUI } from "@/lib/calendarStore";
import { useSettings, useSettingsUI } from "@/lib/settingsStore";
import { OPPORTUNITIES, feedOf } from "@/features/actions/actions";
import { buildNotes, sectionHits, type Section } from "@/features/settings/settings";
import { useNow } from "@/lib/hooks";
import { getMomentum } from "@/features/momentum/momentum";
import { BeeLogo, HoneyJar } from "./Art";
import DetailDrawer from "./DetailDrawer";
import QuickCapture from "./QuickCapture";
import { BuddyFab } from "./Buddy";
import Effects from "./Effects";
import { useKb } from "@/features/knowledge/store";
import { searchArticles } from "@/features/knowledge/articles";
import Fx from "./Fx";
import CommandPalette from "./CommandPalette";
import EventDrawer from "./events/EventDrawer";
import CreateEventDialog from "./events/CreateEventDialog";
import IdeaDrawer from "./ideas/IdeaDrawer";
import DragLayer from "./canvas/DragLayer";
import { ActionIntentDock } from "./canvas/ActionIntent";
import { HiveDock } from "./hive/HiveZones";

export const NAV = [
  { href: "/", label: "Daily Buzz", Icon: Home },
  { href: "/events", label: "Events", Icon: CalendarDays },
  { href: "/hive", label: "Momentum Hive", Icon: Hexagon },
  { href: "/ideas", label: "Ideas", Icon: Lightbulb },
  { href: "/people", label: "People", Icon: Users },
  { href: "/actions", label: "Action Center", Icon: ListChecks },
  { href: "/calendar", label: "Calendar", Icon: Calendar },
  { href: "/knowledge", label: "Knowledge Base", Icon: BookOpen },
  { href: "/settings", label: "Settings", Icon: Settings },
];
/** Everything the phone bottom bar has no slot for. */
const MORE = NAV.filter((n) => !["/", "/events", "/ideas"].includes(n.href));

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname(); const router = useRouter();
  const { theme, setTheme, userName, cells, events, calm, setCalm, resetDemo } = useStore();
  const { ready, setReady, offsetDays, setOffset, select, setCapture, setPalette, toast, openEvent } = useUI();
  const now = useNow();
  const [q, setQ] = useState(""); const ideasQ = useIdeasUI((s) => s.q), setIdeasQ = useIdeasUI((s) => s.setQ), setShare = useIdeasUI((s) => s.setShare);
  const peopleQ = usePeopleUI((s) => s.q), setPeopleQ = usePeopleUI((s) => s.setQ);
  const actionsQ = useActionsUI((s) => s.q), setActionsQ = useActionsUI((s) => s.setQ);
  const calQ = useCalendarUI((s) => s.q), setCalQ = useCalendarUI((s) => s.setQ);
  const openArticle = useKb((s) => s.open); const onKb = path === "/knowledge";
  const { profile, notif, leadHours } = useSettings(); const joined = useActions((s) => s.joined); const feedAnchor = useRef(Date.now());
  const onSettings = path === "/settings"; // on Settings the top bar search jumps to the matching section
  const onCalendar = path === "/calendar"; // on the Calendar the top bar search filters what is on the grid
  const onActions = path === "/actions"; // on the Action Center the top bar search filters the opportunities
  const onPeople = path === "/people"; // same idea: on People the top search filters the directory
  const onIdeas = path === "/ideas"; // on the Ideas screen the top search filters the feed instead of opening a dropdown
  const [pop, setPop] = useState<"bell" | "time" | null>(null); const [more, setMore] = useState(false); // phone-size "More" sheet: the sidebar is hidden below lg, so this is how every screen stays reachable
  useEffect(() => setMore(false), [path]);
  const wantsNote = useIdeasUI((s) => s.shareOpen); // "Start an idea" from any screen: go to the Ideas screen, where the note is
  useEffect(() => { if (wantsNote && path !== "/ideas") router.push("/ideas"); }, [wantsNote, path, router]);
  useEffect(() => { if (!more) return; const f = (e: KeyboardEvent) => e.key === "Escape" && setMore(false); window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f); }, [more]);

  useEffect(() => {
    Promise.all([Promise.resolve(useStore.persist.rehydrate()), Promise.resolve(useIdeas.persist.rehydrate()), Promise.resolve(usePeople.persist.rehydrate()), Promise.resolve(useActions.persist.rehydrate()), Promise.resolve(useSettings.persist.rehydrate())]).then(() => {
      const st = useStore.getState(); // untouched sample data re-anchors to "now" so the demo never looks stale
      if (!st.seeded || (!st.edited && Date.now() - st.seededAt > 6 * 36e5)) st.resetDemo();
      const is = useIdeas.getState(); // the Ideas feed follows the same rule, with its own "edited" flag
      if (!is.seeded || (!is.edited && Date.now() - is.seededAt > 6 * 36e5)) is.reset();
      if (!usePeople.getState().seeded) usePeople.getState().reset(); // the directory has no clocks in it, so it only seeds once
      try { // open on the chosen default view, once per browser session and only when the app is launched on the home screen
        const first = !sessionStorage.getItem("ebb:landed"); sessionStorage.setItem("ebb:landed", "1"); const v = useSettings.getState().defaultView;
        if (first && window.location.pathname === "/" && v !== "/") router.replace(v);
      } catch { /* storage blocked: stay on home */ }
      setReady();
    });
  }, [setReady, router]);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => { document.documentElement.classList.toggle("calm", calm); }, [calm]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    if (onSettings) return sectionHits(t).map((x) => ({ id: x.id as string, title: x.label, kind: "setting" as string }));
    if (onIdeas || onPeople || onActions || onCalendar) return [];
    if (onKb) return searchArticles(t).slice(0, 6).map((a) => ({ id: a.id, title: a.title, kind: "article" as string }));
    const evs = events.filter((e) => !e.archived && `${e.title} ${e.venue ?? ""}`.toLowerCase().includes(t)).slice(0, 3).map((e) => ({ id: e.id, title: e.title, kind: "event" as const }));
    const cs = cells.filter((c) => !c.archived && `${c.title} ${c.note ?? ""}`.toLowerCase().includes(t)).slice(0, 6).map((c) => ({ id: c.id, title: c.title, kind: c.kind as string }));
    return [...evs, ...cs].slice(0, 6);
  }, [q, cells, events, onIdeas, onPeople, onActions, onCalendar, onKb, onSettings]);
  const attention = useMemo(() => cells.filter((c) => !c.archived && !c.done && ["cooling", "cold"].includes(getMomentum(c, now).state)).slice(0, 4), [cells, now]);
  const notes = useMemo(() => buildNotes({ prefs: notif, events, joined, opps: OPPORTUNITIES, feed: feedOf(joined, Math.max(now, feedAnchor.current), feedAnchor.current), now, leadHours }), [notif, events, joined, now, leadHours]);
  const urgent = attention.length + notes.filter((n) => n.cat === "events" || n.cat === "challenges").length;
  const initials = userName.slice(0, 1).toUpperCase();

  return (
    <MotionConfig reducedMotion={calm ? "always" : "user"}>
      <div className="min-h-dvh lg:grid lg:grid-cols-[236px_1fr]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-dvh flex-col gap-3 overflow-y-auto border-r border-line p-4 lg:flex" style={{ background: "var(--side)" }}>
          <Link href="/" className="flex items-center gap-2.5 px-1 pt-1" aria-label="Event Bee Buzz home">
            <BeeLogo /><div><p className="text-[17px] font-bold leading-none">Event Bee Buzz</p><p className="script mt-1 text-[17px] leading-none text-honey">Keep the buzz going</p></div>
          </Link>
          <nav aria-label="Main" className="mt-2 flex flex-col gap-1">
            {NAV.map(({ href, label, Icon }) => (
              <Link key={href} href={href} className="nav-item relative" aria-current={path === href ? "page" : undefined}>{path === href && <motion.span layoutId="nav-bar" aria-hidden className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-[var(--gold)]" style={{ boxShadow: "0 0 12px var(--gold)" }} transition={{ type: "spring", stiffness: 420, damping: 34 }} />}<Icon size={19} aria-hidden /> {label}</Link>))}
          </nav>
          <div className="relative mt-auto overflow-hidden rounded-2xl border border-line p-4" style={{ background: "linear-gradient(160deg, color-mix(in srgb,var(--gold) 14%,transparent), transparent 70%)" }}>
            <div className="relative mx-auto h-[84px] w-full overflow-hidden"><HoneyJar /></div>
            {(onIdeas || onPeople || onActions || onCalendar || onKb || onSettings) && <div aria-hidden className="absolute inset-0 bg-[url('/decor/honeycomb.svg')] bg-[length:200px] bg-right-bottom bg-no-repeat opacity-50" />}
            {onKb ? <p className="script relative mt-2 text-[22px] leading-tight">Knowledge builds<br />better tomorrow!</p> : onSettings ? <p className="script relative mt-2 text-[22px] leading-tight">Your journey,<br />your settings!</p> : path === "/hive" || onActions ? <p className="script relative mt-2 text-[22px] leading-tight">Small steps<br />create big impact!</p> : onCalendar ? <p className="script relative mt-2 text-[22px] leading-tight">Plan today,<br />create tomorrow!</p> : onIdeas ? <p className="script relative mt-2 text-[22px] leading-tight">Big ideas build a brighter tomorrow!</p> : onPeople ? <p className="script relative mt-2 text-[22px] leading-tight">Great people make great ideas happen!</p> : <p className="relative mt-2 text-[15px] font-semibold leading-snug">Your ideas<br />deserve a future!</p>}
            {onKb ? <a href="#browse" className="btn-gold relative mt-3 inline-flex items-center gap-2 whitespace-nowrap px-3.5 py-2 text-[13px]">Explore Resources <ArrowRight size={14} aria-hidden /></a>
              : onSettings ? <Link href="/knowledge" className="btn-gold relative mt-3 inline-flex items-center gap-2 px-3.5 py-2 text-[13px]">Explore Features <ArrowRight size={14} aria-hidden /></Link>
              : onIdeas ? <button onClick={() => setShare(true)} className="btn-gold relative mt-3 inline-flex items-center gap-2 px-3.5 py-2 text-[13px]">Start an Idea <ArrowRight size={14} aria-hidden /></button>
              : onCalendar ? <Link href="/events" className="btn-gold relative mt-3 inline-flex items-center gap-2 px-3.5 py-2 text-[13px]">Explore Events <ArrowRight size={14} aria-hidden /></Link>
              : onActions ? <button onClick={() => { const u = useActionsUI.getState(); u.setQ(""); u.setFilter("challenge"); u.setExpanded(true); setTimeout(() => document.getElementById("action-featured")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60); }} className="btn-gold relative mt-3 inline-flex items-center gap-2 px-3.5 py-2 text-[13px]">Explore Challenges <ArrowRight size={14} aria-hidden /></button>
              : onPeople ? <button onClick={() => { usePeopleUI.getState().clearFilters(); document.getElementById("people-directory")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="btn-gold relative mt-3 inline-flex items-center gap-2 px-3.5 py-2 text-[13px]">Explore Community <ArrowRight size={14} aria-hidden /></button>
              : <Link href="/ideas" className="btn-gold relative mt-3 inline-flex items-center gap-2 px-3.5 py-2 text-[13px]">Explore Ideas <ArrowRight size={14} aria-hidden /></Link>}
          </div>
          <Link href="/settings" className="flex items-center gap-3 rounded-2xl border border-line p-2.5 hover:bg-white/5">
            <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full text-sm font-bold text-[#1a1304]" style={{ background: "linear-gradient(135deg,#FFD23F,#ff9a3c)" }}>{initials}{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/action/av-me.webp" alt="" width={40} height={40} className="absolute inset-0 h-full w-full object-cover" draggable={false} /></span>
            <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-semibold">{profile.name}</span><span className="block truncate text-[11px] text-mute">{profile.headline}</span></span>
            <ArrowRight size={16} className="text-mute" aria-hidden />
          </Link>
        </aside>

        <div className="min-w-0 pb-24 lg:pb-8">
          {/* Top bar */}
          <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 backdrop-blur lg:px-6" style={{ background: "color-mix(in srgb,var(--bg) 80%,transparent)" }}>
            <Link href="/" className="lg:hidden" aria-label="Home"><BeeLogo size={34} /></Link>
            <div className="relative min-w-[110px] max-w-[520px] flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" aria-hidden />
              <input value={onIdeas ? ideasQ : onPeople ? peopleQ : onActions ? actionsQ : onCalendar ? calQ : q} onChange={(e) => (onIdeas ? setIdeasQ(e.target.value) : onPeople ? setPeopleQ(e.target.value) : onActions ? setActionsQ(e.target.value) : onCalendar ? setCalQ(e.target.value) : setQ(e.target.value))} onKeyDown={(e) => e.key === "Escape" && (onIdeas ? setIdeasQ("") : onPeople ? setPeopleQ("") : onActions ? setActionsQ("") : onCalendar ? setCalQ("") : setQ(""))} aria-label={onKb ? "Search articles" : onIdeas ? "Search ideas" : onPeople ? "Search people" : onActions || onCalendar ? "Search events, challenges and ideas" : "Search ideas, people and actions"} placeholder={onKb ? "Search articles, guides, or resources..." : onIdeas ? "Search ideas, tags, people, or keywords..." : onPeople ? "Search people, skills, roles, or interests..." : onActions || onCalendar ? "Search events, challenges, resources, or anything..." : "Search ideas, people, events, or actions..."}
                className="card w-full rounded-xl! py-2.5 pl-10 pr-3 text-[13px] placeholder:text-mute" />
              {results.length > 0 && (
                <ul className="card absolute left-0 right-0 top-12 overflow-hidden rounded-xl! p-1.5">
                  {results.map((c) => <li key={c.id}><button onClick={() => { if (c.kind === "article") openArticle(c.id); else if (c.kind === "setting") useSettingsUI.getState().setSection(c.id as Section); else if (c.kind === "event") openEvent(c.id); else select(c.id); setQ(""); }} className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5"><span className="truncate">{c.title}</span><span className="text-xs capitalize text-mute">{c.kind}</span></button></li>)}
                </ul>)}
              {!onIdeas && !onPeople && !onActions && !onCalendar && q.trim() && results.length === 0 && <p className="card absolute left-0 right-0 top-12 rounded-xl! p-3 text-sm text-mute">Nothing matches &ldquo;{q}&rdquo;.</p>}
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="relative">
                <button onClick={() => setPop(pop === "time" ? null : "time")} aria-expanded={pop === "time"} aria-label="Time travel" className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold ${offsetDays ? "border-honey text-honey" : "border-line text-mute"}`}>
                  <FastForward size={14} aria-hidden /> <span className={offsetDays ? "" : "hidden whitespace-nowrap sm:inline"}>{offsetDays ? `+${offsetDays}d` : "Time travel"}</span></button>
                <AnimatePresence>{pop === "time" && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card absolute right-0 top-12 z-30 w-72 p-4">
                    <p className="text-sm font-semibold">Fast-forward the hive</p><p className="mt-1 text-xs text-mute">Watch items cool down. Nothing is saved; drag back to 0 to return.</p>
                    <input type="range" min={0} max={45} value={offsetDays} onChange={(e) => setOffset(+e.target.value)} aria-label="Days to fast-forward" className="mt-3 w-full" />
                    <div className="mt-1 flex justify-between text-xs text-mute"><span>Today</span><span>+{offsetDays} days</span><span>+45</span></div>
                    <div className="mt-3 flex gap-2"><button onClick={() => { setOffset(0); }} className="btn-blue px-3 py-1.5 text-xs">Back to today</button><button onClick={() => { resetDemo(); useIdeas.getState().reset(); usePeople.getState().reset(); useActions.getState().reset(); setOffset(0); toast("Sample data refreshed."); }} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-mute hover:text-text"><RotateCcw size={12} aria-hidden /> Reset sample data</button></div>
                  </motion.div>)}</AnimatePresence>
              </div>
              <button onClick={() => setPalette(true)} aria-label="Open command palette" className="hidden items-center gap-1.5 rounded-full border border-line px-3 py-2 text-xs text-mute hover:text-text md:flex"><Command size={13} aria-hidden /> K</button>
              <button onClick={() => setCalm(!calm)} aria-pressed={calm} aria-label="Calm mode, less motion" title="Calm mode" className={`rounded-full p-2.5 hover:bg-white/5 ${calm ? "text-honey" : "text-mute"}`}><Leaf size={18} /></button>
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} className="rounded-full p-2.5 text-mute hover:bg-white/5">{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>
              <div className="relative">
                <button onClick={() => setPop(pop === "bell" ? null : "bell")} aria-expanded={pop === "bell"} aria-label={`Notifications, ${urgent} need attention`} className="relative rounded-full p-2.5 text-mute hover:bg-white/5">
                  <Bell size={18} />{urgent > 0 && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-honey ring-2 ring-[var(--bg)]" />}</button>
                <AnimatePresence>{pop === "bell" && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card absolute right-0 top-12 z-30 w-80 p-3">
                    <p className="px-2 py-1 text-sm font-semibold">Needs your attention</p>
                    {attention.length === 0 ? <p className="px-2 py-3 text-sm text-mute">Nothing is cooling. Nice work.</p> :
                      attention.map((c) => <button key={c.id} onClick={() => { select(c.id); setPop(null); }} className="block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-white/5"><span className="block truncate">{c.title}</span><span className="text-xs text-mute">{getMomentum(c, now).reason}</span></button>)}
                    {notes.length > 0 && <><p className="mt-1 border-t border-line px-2 pb-1 pt-2.5 text-sm font-semibold">Updates</p>
                      <div className="scroll-thin max-h-60 overflow-y-auto">{notes.map((n) => <button key={n.id} onClick={() => { if (n.eventId) openEvent(n.eventId); else if (n.href) router.push(n.href); setPop(null); }} className="block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-white/5"><span className="block truncate">{n.title}</span><span className="block truncate text-xs text-mute">{n.sub}</span></button>)}</div></>}
                  </motion.div>)}</AnimatePresence>
              </div>
              <span className="relative ml-1 grid h-9 w-9 place-items-center overflow-hidden rounded-full text-sm font-bold text-[#1a1304]" style={{ background: "linear-gradient(135deg,#FFD23F,#ff9a3c)" }} aria-hidden>{initials}{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/action/av-me.webp" alt="" width={36} height={36} className="absolute inset-0 h-full w-full object-cover" draggable={false} /></span>
            </div>
          </header>
          <main className="px-4 lg:px-6">{ready ? children : null}</main>
        </div>

        {/* Mobile bottom nav */}
        <nav aria-label="Mobile" className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 items-center rounded-3xl border border-line px-2 py-2 backdrop-blur lg:hidden" style={{ background: "color-mix(in srgb,var(--surface) 92%,transparent)" }}>
          {[{ h: "/", l: "Home", I: Home }, { h: "/events", l: "Events", I: CalendarDays }].map(({ h, l, I }) => <Link key={h} href={h} aria-current={path === h ? "page" : undefined} className="flex flex-col items-center gap-0.5 py-1 text-[11px] text-mute aria-[current=page]:text-honey"><I size={20} aria-hidden />{l}</Link>)}
          <button onClick={() => setCapture(true)} aria-label="Quick capture" className="btn-gold mx-auto grid h-12 w-12 place-items-center rounded-full!"><Plus size={24} aria-hidden /></button>
          <Link href="/ideas" aria-current={path === "/ideas" ? "page" : undefined} className="flex flex-col items-center gap-0.5 py-1 text-[11px] text-mute aria-[current=page]:text-honey"><Lightbulb size={20} aria-hidden />Ideas</Link>
          <button onClick={() => setMore(!more)} aria-expanded={more} aria-haspopup="dialog" className={`flex flex-col items-center gap-0.5 py-1 text-[11px] ${more || MORE.some((n) => n.href === path) ? "text-honey" : "text-mute"}`}><MoreHorizontal size={20} aria-hidden />More</button>
        </nav>
        <AnimatePresence>{more && (<>
          <motion.div key="more-scrim" className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMore(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div key="more-sheet" role="dialog" aria-label="All screens" className="card fixed inset-x-3 bottom-[88px] z-30 grid grid-cols-3 gap-2 rounded-3xl! p-3 lg:hidden" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}>
            {MORE.map(({ href, label, Icon }) => <Link key={href} href={href} aria-current={path === href ? "page" : undefined} className="flex flex-col items-center gap-1.5 rounded-2xl border border-line px-1 py-3 text-center text-[11.5px] leading-tight text-mute aria-[current=page]:border-honey aria-[current=page]:text-honey"><Icon size={22} aria-hidden />{label}</Link>)}
          </motion.div></>)}</AnimatePresence>
        {ready && path !== "/" && <BuddyFab />}
        <EventDrawer /><IdeaDrawer /><ActionIntentDock /><HiveDock /><DragLayer /><DetailDrawer /><QuickCapture /><CreateEventDialog /><Effects /><Fx /><CommandPalette />
      </div>
    </MotionConfig>
  );
}
