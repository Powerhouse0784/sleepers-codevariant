"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MotionConfig, AnimatePresence, motion } from "motion/react";
import { Home, CalendarDays, Hexagon, Lightbulb, Users, ListChecks, Calendar, BookOpen, Settings, Search, Bell, Sun, Moon, FastForward, Plus, MoreHorizontal, ArrowRight } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { useNow } from "@/lib/hooks";
import { getMomentum } from "@/features/momentum/momentum";
import { BeeLogo, HoneyJar } from "./Art";
import DetailDrawer from "./DetailDrawer";
import QuickCapture from "./QuickCapture";
import { BuddyFab } from "./Buddy";

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

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { theme, setTheme, userName, cells } = useStore();
  const { ready, setReady, offsetDays, setOffset, select, setCapture } = useUI();
  const now = useNow();
  const [q, setQ] = useState(""); const [pop, setPop] = useState<"bell" | "time" | null>(null);

  useEffect(() => {
    Promise.resolve(useStore.persist.rehydrate()).then(() => {
      if (!useStore.getState().seeded) useStore.getState().resetDemo();
      setReady();
    });
  }, [setReady]);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? cells.filter((c) => !c.archived && `${c.title} ${c.note ?? ""}`.toLowerCase().includes(t)).slice(0, 6) : [];
  }, [q, cells]);
  const attention = useMemo(() => cells.filter((c) => !c.archived && !c.done && ["cooling", "cold"].includes(getMomentum(c, now).state)).slice(0, 4), [cells, now]);
  const initials = userName.slice(0, 1).toUpperCase();

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh lg:grid lg:grid-cols-[236px_1fr]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-dvh flex-col gap-4 border-r border-line p-4 lg:flex" style={{ background: "var(--side)" }}>
          <Link href="/" className="flex items-center gap-2.5 px-1 pt-1" aria-label="Event Bee Buzz home">
            <BeeLogo /><div><p className="text-[17px] font-bold leading-none">Event Bee Buzz</p><p className="script mt-1 text-[17px] leading-none text-honey">Keep the buzz going</p></div>
          </Link>
          <nav aria-label="Main" className="mt-2 flex flex-col gap-1">
            {NAV.map(({ href, label, Icon }) => (
              <Link key={href} href={href} className="nav-item" aria-current={path === href ? "page" : undefined}><Icon size={19} aria-hidden /> {label}</Link>))}
          </nav>
          <div className="relative mt-auto overflow-hidden rounded-2xl border border-line p-4" style={{ background: "linear-gradient(160deg, color-mix(in srgb,var(--gold) 14%,transparent), transparent 70%)" }}>
            <div className="relative mx-auto -mt-1 h-28 w-full"><HoneyJar /></div>
            {path === "/hive" ? <p className="script relative text-[22px] leading-tight">Small steps<br />create big impact!</p> : <p className="relative text-[15px] font-semibold leading-snug">Your ideas<br />deserve a future!</p>}
            <Link href="/ideas" className="btn-gold relative mt-3 inline-flex items-center gap-2 px-3.5 py-2 text-[13px]">Explore Ideas <ArrowRight size={14} aria-hidden /></Link>
          </div>
          <Link href="/settings" className="flex items-center gap-3 rounded-2xl border border-line p-2.5 hover:bg-white/5">
            <span className="grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-[#1a1304]" style={{ background: "linear-gradient(135deg,#FFD23F,#ff9a3c)" }}>{initials}</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-semibold">{userName} Nadeem</span><span className="block text-[11px] text-mute">Student · Innovator</span></span>
            <ArrowRight size={16} className="text-mute" aria-hidden />
          </Link>
        </aside>

        <div className="min-w-0 pb-24 lg:pb-8">
          {/* Top bar */}
          <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 backdrop-blur lg:px-6" style={{ background: "color-mix(in srgb,var(--bg) 80%,transparent)" }}>
            <Link href="/" className="lg:hidden" aria-label="Home"><BeeLogo size={34} /></Link>
            <div className="relative max-w-[520px] flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" aria-hidden />
              <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Escape" && setQ("")} aria-label="Search ideas, people and actions" placeholder="Search ideas, people, events, or actions..."
                className="card w-full rounded-xl! py-2.5 pl-10 pr-3 text-[13px] placeholder:text-mute" />
              {results.length > 0 && (
                <ul className="card absolute left-0 right-0 top-12 overflow-hidden rounded-xl! p-1.5">
                  {results.map((c) => <li key={c.id}><button onClick={() => { select(c.id); setQ(""); }} className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5"><span className="truncate">{c.title}</span><span className="text-xs capitalize text-mute">{c.kind}</span></button></li>)}
                </ul>)}
              {q.trim() && results.length === 0 && <p className="card absolute left-0 right-0 top-12 rounded-xl! p-3 text-sm text-mute">Nothing matches &ldquo;{q}&rdquo;.</p>}
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="relative">
                <button onClick={() => setPop(pop === "time" ? null : "time")} aria-expanded={pop === "time"} aria-label="Time travel" className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold ${offsetDays ? "border-honey text-honey" : "border-line text-mute"}`}>
                  <FastForward size={14} aria-hidden /> {offsetDays ? `+${offsetDays}d` : "Time travel"}</button>
                <AnimatePresence>{pop === "time" && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card absolute right-0 top-12 z-30 w-72 p-4">
                    <p className="text-sm font-semibold">Fast-forward the hive</p><p className="mt-1 text-xs text-mute">Watch items cool down. Nothing is saved; drag back to 0 to return.</p>
                    <input type="range" min={0} max={45} value={offsetDays} onChange={(e) => setOffset(+e.target.value)} aria-label="Days to fast-forward" className="mt-3 w-full" />
                    <div className="mt-1 flex justify-between text-xs text-mute"><span>Today</span><span>+{offsetDays} days</span><span>+45</span></div>
                    <button onClick={() => { setOffset(0); }} className="btn-blue mt-3 px-3 py-1.5 text-xs">Back to today</button>
                  </motion.div>)}</AnimatePresence>
              </div>
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} className="rounded-full p-2.5 text-mute hover:bg-white/5">{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>
              <div className="relative">
                <button onClick={() => setPop(pop === "bell" ? null : "bell")} aria-expanded={pop === "bell"} aria-label={`Notifications, ${attention.length} need attention`} className="relative rounded-full p-2.5 text-mute hover:bg-white/5">
                  <Bell size={18} />{attention.length > 0 && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-honey ring-2 ring-[var(--bg)]" />}</button>
                <AnimatePresence>{pop === "bell" && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card absolute right-0 top-12 z-30 w-80 p-3">
                    <p className="px-2 py-1 text-sm font-semibold">Needs your attention</p>
                    {attention.length === 0 ? <p className="px-2 py-3 text-sm text-mute">Nothing is cooling. Nice work.</p> :
                      attention.map((c) => <button key={c.id} onClick={() => { select(c.id); setPop(null); }} className="block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-white/5"><span className="block truncate">{c.title}</span><span className="text-xs text-mute">{getMomentum(c, now).reason}</span></button>)}
                  </motion.div>)}</AnimatePresence>
              </div>
              <span className="ml-1 grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-[#1a1304]" style={{ background: "linear-gradient(135deg,#FFD23F,#ff9a3c)" }} aria-hidden>{initials}</span>
            </div>
          </header>
          <main className="px-4 lg:px-6">{ready ? children : null}</main>
        </div>

        {/* Mobile bottom nav */}
        <nav aria-label="Mobile" className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 items-center rounded-3xl border border-line px-2 py-2 backdrop-blur lg:hidden" style={{ background: "color-mix(in srgb,var(--surface) 92%,transparent)" }}>
          {[{ h: "/", l: "Home", I: Home }, { h: "/events", l: "Events", I: CalendarDays }].map(({ h, l, I }) => <Link key={h} href={h} aria-current={path === h ? "page" : undefined} className="flex flex-col items-center gap-0.5 py-1 text-[11px] text-mute aria-[current=page]:text-honey"><I size={20} aria-hidden />{l}</Link>)}
          <button onClick={() => setCapture(true)} aria-label="Quick capture" className="btn-gold mx-auto grid h-12 w-12 place-items-center rounded-full!"><Plus size={24} aria-hidden /></button>
          {[{ h: "/ideas", l: "Ideas", I: Lightbulb }, { h: "/hive", l: "Hive", I: MoreHorizontal }].map(({ h, l, I }) => <Link key={h} href={h} aria-current={path === h ? "page" : undefined} className="flex flex-col items-center gap-0.5 py-1 text-[11px] text-mute aria-[current=page]:text-honey"><I size={20} aria-hidden />{l}</Link>)}
        </nav>
        {ready && path !== "/" && <BuddyFab />}
        <DetailDrawer /><QuickCapture />
      </div>
    </MotionConfig>
  );
}
