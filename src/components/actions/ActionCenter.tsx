"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, Trophy, Lightbulb, Users, Star, ArrowRight, SearchX, RotateCcw, type LucideIcon } from "lucide-react";
import { useActions, useActionsUI } from "@/lib/actionsStore";
import { useIdeasUI } from "@/lib/ideasStore";
import { usePeopleUI } from "@/lib/peopleStore";
import { useUI } from "@/lib/store";
import Draggable from "../canvas/Draggable";
import { oppCard, ActionDock } from "./ActionZones";
import { useMedia, useNow } from "@/lib/hooks";
import { KIND_COLOR, KIND_LABEL, OPPORTUNITIES, levelOf, matches, participantsOf, whenOf, xpOf, type JoinMap, type OppKind, type Opportunity } from "@/features/actions/actions";
import { City } from "../ideas/IdeasHero";
import { ActivityPanel, FeedDialog, ProgressDialog, ProgressPanel, PromoCard } from "./ActionRail";

const KIND_ICON: Record<OppKind, LucideIcon> = { event: CalendarDays, challenge: Trophy, idea: Lightbulb };
const mask = (stop: number) => ({ maskImage: `linear-gradient(90deg,transparent,#000 ${stop}%)`, WebkitMaskImage: `linear-gradient(90deg,transparent,#000 ${stop}%)` });
const toFeatured = () => document.getElementById("action-featured")?.scrollIntoView({ behavior: "smooth", block: "start" });

/** Navigation helpers. XP / join / leave actions are handled by the canvas drag zones. */
function useOppActions() {
  const router = useRouter();
  const findTeams = () => { const p = usePeopleUI.getState(); p.clearFilters(); p.setTab("teams"); router.push("/people"); };
  const filterTo = (k: OppKind | "all") => { const u = useActionsUI.getState(); u.setQ(""); u.setFilter(k); u.setExpanded(k !== "all"); setTimeout(toFeatured, 60); };
  return { findTeams, filterTo, router };
}

function Hero() {
  return (
    <section aria-labelledby="action-hero" className="relative isolate min-h-[190px] overflow-hidden rounded-[20px] border border-[#2a5bd0]/60 text-white"
      style={{ background: "radial-gradient(420px 220px at 12% 0%, rgba(120,70,255,.45), transparent 70%), radial-gradient(520px 240px at 45% 120%, rgba(255,160,70,.25), transparent 70%), linear-gradient(100deg,#08174f 0%,#13268a 55%,#1b1a7a 100%)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/action/hero-bee.webp" alt="" width={532} height={196} className="absolute inset-y-0 right-0 h-full w-auto max-w-none select-none opacity-55 sm:opacity-100" draggable={false} style={mask(26)} />
      <div className="relative z-10 flex min-h-[190px] max-w-[70%] flex-col justify-center p-5 sm:max-w-[58%] md:px-7">
        <h1 id="action-hero" className="script -rotate-2 text-[32px] leading-[1.02] sm:text-[42px] xl:text-[48px]">Take Action,<br className="hidden sm:block" /> Make an Impact!</h1>
        <p className="mt-2 max-w-[430px] text-[12.5px] leading-relaxed text-white/90 sm:text-[14px]">Turn your ideas into real actions. Explore challenges, join events, and be a part of something bigger!</p>
        <button onClick={toFeatured} className="btn-gold mt-3.5 inline-flex w-fit items-center gap-2 px-4 py-2 text-[13px]">Explore Now <ArrowRight size={14} aria-hidden /></button>
      </div>
    </section>
  );
}

function QuickCard({ I, c, title, blurb, cta, onClick }: { I: LucideIcon; c: string; title: string; blurb: string; cta: string; onClick: () => void }) {
  return (
    <li className="card group relative flex flex-col overflow-hidden p-3.5 transition hover:-translate-y-0.5" style={{ background: `radial-gradient(180px 120px at 100% 0%, ${c}1f, transparent 70%), var(--surface)` }}>
      <span aria-hidden className="absolute right-3 top-3 text-[12px] text-white/60 transition group-hover:scale-125" style={{ color: c }}>✦</span>
      <span className="grid h-[54px] w-[54px] place-items-center rounded-full border-2" style={{ borderColor: c, background: `${c}22`, color: c, boxShadow: `0 0 20px ${c}66` }}><I size={26} aria-hidden /></span>
      <h2 className="mt-2.5 text-[17px] font-semibold leading-tight">{title}</h2>
      <p className="mt-1 min-h-[36px] text-[12.5px] leading-snug text-mute">{blurb}</p>
      <button onClick={onClick} className="btn-blue mt-3 inline-flex w-full items-center justify-center gap-2 py-2 text-[12.5px]">{cta}<ArrowRight size={13} aria-hidden /></button>
    </li>
  );
}

function OppCard({ o, joined, now, index }: { o: Opportunity; joined: JoinMap; now: number; index: number }) {
  const r = joined[o.id]; const c = KIND_COLOR[o.kind]; const KI = KIND_ICON[o.kind];
  const statusLabel = o.kind === "idea" ? "Drag → Submit Idea" : !r ? `Drag → Join` : o.kind === "event" ? "Joined ✓ • Drag → Leave" : r.done ? "Completed ✓" : "In Progress • Drag → Complete";
  const statusColor = !r ? c : r.done ? "#1FD18B" : o.kind === "event" ? "#1FD18B" : "#FF9F1C";
  return (
    <motion.li layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ delay: Math.min(index, 7) * 0.04 }} className="min-w-0">
      <Draggable label={o.title} payload={() => oppCard(o)} className="h-full">
        <article className="flex h-full flex-col rounded-2xl border border-primary/50 p-2.5 shadow-[0_0_26px_-10px_rgba(35,120,255,.7)]" style={{ background: "linear-gradient(180deg, rgba(35,120,255,.08), transparent 60%), var(--surface)" }}>
          <div className="relative h-[92px] overflow-hidden rounded-xl" style={{ background: `linear-gradient(135deg, ${c}66, #0b1830 85%)` }}>
            {o.image
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={o.image} alt="" width={200} height={92} className="h-full w-full object-cover" draggable={false} loading="lazy" />
              : <><div aria-hidden className="absolute inset-0 bg-[url('/decor/honeycomb.svg')] bg-[length:170px] bg-right-bottom bg-no-repeat opacity-60" /><KI size={44} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/55" aria-hidden /></>}
            <span className="absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-md" style={{ background: c }}>{KIND_LABEL[o.kind]}</span>
          </div>
          <h3 className="mt-2.5 text-[15.5px] font-semibold leading-tight">{o.title}</h3>
          <p className="mt-1 min-h-[34px] text-[12px] leading-snug text-mute">{o.blurb}</p>
          <p className="mt-2 flex items-center gap-2 text-[11.5px] text-[#9fc2ff]"><CalendarDays size={14} className="shrink-0" aria-hidden /><span className="whitespace-pre">{whenOf(o, now)}</span></p>
          <p className="mt-1.5 flex items-center gap-2 text-[11.5px] text-[#9fc2ff]"><Users size={14} className="shrink-0" aria-hidden />{participantsOf(o, joined)} participants</p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-3">
            <span className="text-[11px] font-medium" style={{ color: statusColor }}>{statusLabel}</span>
            <span className="text-[10px] text-mute/50 select-none" aria-hidden>⠿ drag</span>
          </div>
        </article>
      </Draggable>
    </motion.li>
  );
}

const CHIPS: { k: OppKind | "all"; label: string }[] = [{ k: "all", label: "All" }, { k: "event", label: "Events" }, { k: "challenge", label: "Challenges" }, { k: "idea", label: "Ideas" }];

export default function ActionCenter() {
  const wide = useMedia("(min-width: 1280px)"); const now = useNow(); const joined = useActions((s) => s.joined);
  const { q, filter, expanded, setFilter, setExpanded, clear } = useActionsUI(); const { findTeams, filterTo, router } = useOppActions();
  const list = useMemo(() => OPPORTUNITIES.filter((o) => (filter === "all" || o.kind === filter) && matches(o, q)), [filter, q]);
  const open = expanded || filter !== "all" || !!q.trim(); const shown = open ? list : list.slice(0, 4);
  const community = () => { usePeopleUI.getState().clearFilters(); router.push("/people"); };
  const rail = <><ProgressPanel /><ActivityPanel /><PromoCard onClick={() => filterTo("challenge")} /></>;

  return (
    <div className="mx-auto max-w-[1320px] space-y-4 pb-4">
      <div className={wide ? "grid grid-cols-[1fr_300px] items-start gap-4" : ""}>
        <div className="@container min-w-0 space-y-4">
          <Hero />
          <ul className="grid grid-cols-2 gap-3 @3xl:grid-cols-4" aria-label="Quick actions">
            <QuickCard I={CalendarDays} c="#2F8BFF" title="Upcoming Events" blurb="Discover and join exciting events happening soon." cta="View Events" onClick={() => router.push("/events")} />
            <QuickCard I={Trophy} c="#8B5CF6" title="Challenges" blurb="Take on fun challenges and earn rewards." cta="Explore Challenges" onClick={() => filterTo("challenge")} />
            <QuickCard I={Lightbulb} c="#FFC629" title="Submit Idea" blurb="Share your ideas and get community support." cta="Share Idea" onClick={() => useIdeasUI.getState().setShare(true)} />
            <QuickCard I={Users} c="#1FD18B" title="Join Teams" blurb="Collaborate with like-minded people and build together." cta="Find Teams" onClick={findTeams} />
          </ul>

          <section id="action-featured" aria-labelledby="featured-title" className="card scroll-mt-20 p-3 sm:p-3.5">
            <div className="flex items-center justify-between gap-3">
              <h2 id="featured-title" className="flex items-center gap-2 text-[16px] font-semibold"><Star size={21} className="text-honey" fill="currentColor" aria-hidden />Featured Action Opportunities</h2>
              {!q.trim() && filter === "all" && <button onClick={() => setExpanded(!expanded)} aria-expanded={expanded} className="inline-flex items-center gap-1 rounded-md text-[12.5px] font-medium text-primary hover:underline">{expanded ? "Show less" : "View All"} <ArrowRight size={13} aria-hidden /></button>}
            </div>
            {open && <div className="-mx-1 mt-2.5 flex gap-2 overflow-x-auto px-1 py-0.5 scroll-thin" role="group" aria-label="Filter opportunities">
              {CHIPS.map(({ k, label }) => <button key={k} aria-pressed={filter === k} onClick={() => setFilter(k)} className="pill shrink-0 px-3.5 py-1.5 text-[12px]">{label}</button>)}
              {(q.trim() || filter !== "all") && <button onClick={clear} className="inline-flex shrink-0 items-center gap-1 px-2 text-[12px] text-mute underline-offset-2 hover:text-[var(--text)] hover:underline"><RotateCcw size={12} aria-hidden /> Clear</button>}
            </div>}
            <p className="sr-only" role="status">{list.length} opportunities shown</p>
            {list.length === 0 ? (
              <div className="grid place-items-center gap-3 px-6 py-12 text-center"><SearchX size={28} className="text-mute" aria-hidden />
                <p className="text-[15px] font-semibold">{q.trim() ? `Nothing matches “${q.trim()}”` : "Nothing here yet"}</p>
                <button onClick={clear} className="btn-blue px-4 py-2 text-[13px]">Show everything</button></div>
            ) : (
              <ul className="mt-3 grid grid-cols-1 gap-3 @lg:grid-cols-2 @4xl:grid-cols-4"><AnimatePresence initial={false} mode="popLayout">{shown.map((o, k) => <OppCard key={o.id} o={o} joined={joined} now={now} index={k} />)}</AnimatePresence></ul>)}
          </section>

          <section aria-labelledby="community-banner" className="relative isolate flex items-center gap-4 overflow-hidden rounded-2xl border border-primary/50 px-4 py-3 text-white md:pl-[250px]"
            style={{ background: "radial-gradient(420px 120px at 90% 100%, rgba(150,90,255,.3), transparent 70%), linear-gradient(100deg,#0a1440,#101c66 60%,#1a1a70)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/action/join-bees.webp" alt="" width={235} height={73} className="absolute inset-y-0 left-0 hidden h-full w-auto max-w-none select-none md:block" draggable={false} style={{ maskImage: "linear-gradient(90deg,#000 80%,transparent)", WebkitMaskImage: "linear-gradient(90deg,#000 80%,transparent)" }} />
            <div aria-hidden className="absolute inset-y-0 right-0 -z-10 hidden w-[48%] -scale-x-100 opacity-70 md:block"><City /></div>
            <div className="min-w-0 flex-1"><h2 id="community-banner" className="text-[16px] font-semibold leading-tight sm:text-[19px]">Be a part of a growing community</h2>
              <p className="mt-0.5 text-[11.5px] text-white/85 sm:text-[12.5px]">Share ideas <span className="text-honey">◆</span> Take action <span className="text-honey">◆</span> Build the future together</p></div>
            <button onClick={community} className="btn-gold relative z-10 inline-flex shrink-0 items-center gap-2 px-4 py-2 text-[13px]">Explore Community <ArrowRight size={14} aria-hidden /></button>
          </section>
        </div>
        {wide && <aside className="space-y-3" aria-label="Your progress and community">{rail}</aside>}
      </div>
      {!wide && <div className="grid items-start gap-3 md:grid-cols-2"><div className="space-y-3"><ProgressPanel /><PromoCard onClick={() => filterTo("challenge")} /></div><ActivityPanel /></div>}
      <ProgressDialog /><FeedDialog />
      <ActionDock />
    </div>
  );
}
