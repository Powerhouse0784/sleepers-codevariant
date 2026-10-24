"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Crown, Zap, CalendarDays, Lightbulb, ShieldCheck, Medal, Trophy, Users, CheckCircle2, ArrowRight, X, Check, Lock, type LucideIcon } from "lucide-react";
import { useActions, useActionsUI } from "@/lib/actionsStore";
import { useIdeas } from "@/lib/ideasStore";
import { useNow } from "@/lib/hooks";
import { myStats } from "@/features/ideas/ideas";
import { AWARD, BADGE_RULES, BASE, ago, countsOf, feedOf, levelOf, xpOf, type Feed, type FeedKind } from "@/features/actions/actions";
import { BeeLogo } from "../Art";
import { ringOf } from "@/features/people/people";

function useProgress() {
  const joined = useActions((s) => s.joined); const ideas = useIdeas((s) => s.ideas);
  const xp = xpOf(joined); const c = countsOf(joined);
  return { joined, xp, lv: levelOf(xp), counts: { ...c, ideas: myStats(ideas).shared } };
}

function XpBar({ pct }: { pct: number }) {
  return <div className="h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="XP to next level">
    <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#FFC629,#FF9F1C)", boxShadow: "0 0 12px rgba(255,198,41,.7)" }} initial={false} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} /></div>;
}

export function ProgressPanel() {
  const { lv, counts } = useProgress(); const setProgress = useActionsUI((s) => s.setProgress);
  const tiles: { label: string; v: number; I: LucideIcon; c: string; href?: string }[] = [
    { label: "Events Joined", v: counts.events, I: CalendarDays, c: "#2F8BFF", href: "/events" }, { label: "Ideas Shared", v: counts.ideas, I: Lightbulb, c: "#8B5CF6", href: "/ideas" },
    { label: "Challenges Done", v: counts.challenges, I: ShieldCheck, c: "#1FD18B" }, { label: "Badges Earned", v: counts.badges, I: Medal, c: "#A855F7" },
  ];
  return (
    <section className="card p-3.5" aria-labelledby="your-progress">
      <div className="flex items-center justify-between"><h2 id="your-progress" className="flex items-center gap-2 text-[16px] font-semibold"><Crown size={22} className="text-honey" fill="currentColor" aria-hidden />Your Progress</h2>
        <button onClick={() => setProgress(true)} className="inline-flex items-center gap-1 rounded-md text-[12px] font-medium text-primary hover:underline">View Details <ArrowRight size={13} aria-hidden /></button></div>
      <div className="mt-3 rounded-xl border border-primary/50 p-3" style={{ background: "linear-gradient(135deg, rgba(35,120,255,.12), transparent 70%)" }}>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-honey bg-[#10224a] shadow-[0_0_14px_rgba(255,198,41,.45)]"><BeeLogo size={30} /></span>
          <span className="leading-tight"><span className="block text-[15px] font-bold">Level {lv.level}</span><span className="block text-[12.5px] text-mute">{lv.name}</span></span>
        </div>
        <div className="mt-3"><XpBar pct={lv.pct} /></div>
        <p className="mt-1.5 text-right text-[11px] font-medium text-mute"><span className="text-[var(--text)]">{lv.into}</span> / {lv.need} XP</p>
      </div>
      <ul className="mt-2.5 grid grid-cols-2 gap-2">
        {tiles.map(({ label, v, I, c, href }) => {
          const inner = <><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border" style={{ borderColor: `${c}88`, background: `${c}22`, color: c }}><I size={16} aria-hidden /></span>
            <span className="leading-tight"><span className="block text-[11px] text-mute">{label}</span><span className="block text-[17px] font-bold">{v}</span></span></>;
          const cls = "tile flex items-center gap-2.5 rounded-xl border px-2.5 py-2.5 transition";
          const st = { "--tint": `${c}55`, background: `linear-gradient(135deg, ${c}1a, transparent 75%)` } as React.CSSProperties;
          return <li key={label}>{href ? <Link href={href} className={`${cls} hover:brightness-125`} style={st}>{inner}</Link> : <div className={cls} style={st}>{inner}</div>}</li>;
        })}
      </ul>
    </section>
  );
}

const FEED_ICON: Record<FeedKind, { I: LucideIcon; c: string }> = {
  challenge: { I: Trophy, c: "#8B5CF6" }, idea: { I: Lightbulb, c: "#A855F7" }, team: { I: Users, c: "#FFC629" }, done: { I: CheckCircle2, c: "#2F8BFF" }, event: { I: CalendarDays, c: "#2F8BFF" },
};
export function FeedAvatar({ f, size = 40 }: { f: Feed; size?: number }) {
  const ring = f.mine ? "#FFC629" : ringOf(f.who);
  return <span aria-hidden className="grid shrink-0 place-items-center overflow-hidden rounded-full" style={{ width: size, height: size, boxShadow: `0 0 0 2px ${ring}, 0 0 12px ${ring}55`, background: "linear-gradient(135deg,#FFD23F,#ff9a3c)" }}>
    {f.avatar ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={f.avatar} alt="" width={size} height={size} className="h-full w-full object-cover" draggable={false} /> : <span className="font-bold text-[#1a1304]">{f.who.slice(0, 1)}</span>}</span>;
}
function FeedRow({ f, now, size }: { f: Feed; now: number; size?: number }) {
  const { I, c } = FEED_ICON[f.kind];
  return (
    <li className="flex items-center gap-3 py-2.5">
      <FeedAvatar f={f} size={size} />
      <span className="min-w-0 flex-1 text-[12.5px] leading-snug"><span className="font-semibold">{f.who}</span> {f.verb}<span className="block truncate font-medium text-[#6aa8ff]">{f.what}</span><span className="block text-[11px] text-mute" suppressHydrationWarning>{ago(f.minsAgo * 60000)}</span></span>
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border" style={{ borderColor: `${c}88`, background: `${c}22`, color: c }} data-now={now}><I size={14} aria-hidden /></span>
    </li>
  );
}
export function useFeed() {
  const joined = useActions((s) => s.joined); const now = useNow(); const [anchor] = useState(() => Date.now());
  return { now, feed: feedOf(joined, Math.max(now, anchor), anchor) };
}
export function ActivityPanel() {
  const { feed, now } = useFeed(); const setFeed = useActionsUI((s) => s.setFeed);
  return (
    <section className="card p-3.5" aria-labelledby="live-activity">
      <div className="flex items-center justify-between"><h2 id="live-activity" className="flex items-center gap-2 text-[15px] font-semibold"><Zap size={20} className="text-honey" fill="currentColor" aria-hidden />Live Community Activity<span aria-hidden className="relative ml-0.5 h-2 w-2"><span className="absolute inset-0 animate-ping rounded-full bg-[#1FD18B] opacity-70" /><span className="absolute inset-0 rounded-full bg-[#1FD18B]" /></span></h2>
        <button onClick={() => setFeed(true)} className="inline-flex shrink-0 items-center gap-1 rounded-md text-[12px] font-medium text-primary hover:underline">View All <ArrowRight size={13} aria-hidden /></button></div>
      <ul className="mt-1 divide-y divide-line" aria-live="polite">{feed.slice(0, 4).map((f) => <FeedRow key={f.id} f={f} now={now} />)}</ul>
      <p className="mt-1 text-[10px] text-mute">Sample community activity. Your own actions show up here too.</p>
    </section>
  );
}

export function PromoCard({ onClick }: { onClick: () => void }) {
  return (
    <section className="relative isolate min-h-[210px] overflow-hidden rounded-2xl border border-primary/40 p-4 text-white" style={{ background: "radial-gradient(260px 200px at 100% 100%, rgba(120,70,255,.4), transparent 70%), linear-gradient(160deg,#0a1440,#0b0a2a 80%)" }}>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[url('/decor/honeycomb.svg')] bg-[length:240px] bg-left-top bg-no-repeat opacity-40" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/action/promo-bee.webp" alt="" width={154} height={229} className="absolute bottom-0 right-0 -z-10 h-[215px] w-auto max-w-none select-none" draggable={false} style={{ maskImage: "linear-gradient(90deg,transparent,#000 35%)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 35%)" }} />
      <p className="script max-w-[150px] -rotate-6 text-[27px] leading-[1.05]">Good Things Take Action!</p>
      <button onClick={onClick} className="btn-gold absolute bottom-4 left-4 inline-flex items-center gap-2 px-3.5 py-2 text-[13px]">Join a Challenge <ArrowRight size={14} aria-hidden /></button>
    </section>
  );
}

export function Dialog({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  useEffect(() => { if (!open) return; const f = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f); }, [open, onClose]);
  return (
    <AnimatePresence>{open && (
      <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()} className="flex max-h-[84dvh] w-full max-w-md flex-col rounded-3xl border border-line bg-panel p-5" initial={{ y: 40, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: 0.97 }}>
          <button autoFocus onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-full p-2 text-mute hover:bg-white/5"><X size={18} /></button>{children}
        </motion.div></motion.div>)}</AnimatePresence>
  );
}

export function ProgressDialog() {
  const open = useActionsUI((s) => s.progressOpen), setProgress = useActionsUI((s) => s.setProgress); const { lv, counts, joined } = useProgress();
  const joinedN = counts.badges - BASE.badges; const unlocked = [joinedN >= 1, joinedN >= 2];
  const earn = [["Join an event", `+${AWARD.event} XP`], ["Join a challenge", `+${AWARD.challenge} XP`], ["Complete a challenge", `+${AWARD.done} XP`]];
  return (
    <Dialog open={open} onClose={() => setProgress(false)} label="Your progress">
      <h2 className="flex items-center gap-2 pr-8 text-lg font-semibold"><Crown size={18} className="text-honey" fill="currentColor" aria-hidden />Level {lv.level} · {lv.name}</h2>
      <div className="mt-3"><XpBar pct={lv.pct} /></div>
      <p className="mt-1.5 text-xs text-mute">{lv.into} / {lv.need} XP. {lv.need - lv.into} XP to Level {lv.level + 1}.</p>
      <div className="scroll-thin mt-4 space-y-4 overflow-y-auto pr-1">
        <div><h3 className="text-[13px] font-semibold">How you earn XP</h3>
          <ul className="mt-1.5 divide-y divide-line rounded-xl border border-line">{earn.map(([l, v]) => <li key={l} className="flex justify-between px-3 py-2 text-[13px]"><span>{l}</span><span className="font-semibold text-honey">{v}</span></li>)}</ul></div>
        <div><h3 className="text-[13px] font-semibold">Badges ({counts.badges})</h3>
          <ul className="mt-1.5 space-y-1.5">
            <li className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-[13px]"><Check size={15} className="text-[#1FD18B]" aria-hidden />{BASE.badges} starter badges</li>
            {BADGE_RULES.map((r, k) => <li key={r} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-[13px]">{unlocked[k] ? <Check size={15} className="text-[#1FD18B]" aria-hidden /> : <Lock size={14} className="text-mute" aria-hidden />}<span className={unlocked[k] ? "" : "text-mute"}>{r}</span></li>)}
          </ul></div>
        <p className="text-[11px] text-mute">You have joined {Object.keys(joined).length} {Object.keys(joined).length === 1 ? "opportunity" : "opportunities"} here. Starting numbers are labelled sample data.</p>
      </div>
    </Dialog>
  );
}
export function FeedDialog() {
  const open = useActionsUI((s) => s.feedOpen), setFeed = useActionsUI((s) => s.setFeed); const { feed, now } = useFeed();
  return (
    <Dialog open={open} onClose={() => setFeed(false)} label="Community activity">
      <h2 className="flex items-center gap-2 pr-8 text-lg font-semibold"><Zap size={18} className="text-honey" fill="currentColor" aria-hidden />Community activity</h2>
      <p className="mt-1 text-xs text-mute">Sample activity, plus everything you do in the Action Center.</p>
      <ul className="scroll-thin mt-2 divide-y divide-line overflow-y-auto pr-1">{feed.map((f) => <FeedRow key={f.id} f={f} now={now} size={36} />)}</ul>
    </Dialog>
  );
}
