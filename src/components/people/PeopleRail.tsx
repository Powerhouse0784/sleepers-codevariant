"use client";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Users, Zap, Sparkles, Heart, ChevronRight, X, Trophy, type LucideIcon } from "lucide-react";
import { usePeopleUI } from "@/lib/peopleStore";
import { byPoints, communityStats, fmtBig, type Person } from "@/features/people/people";
import { PersonAvatar } from "./PersonBits";

const TILES: { key: "members" | "active" | "fresh" | "positive"; label: string; I: LucideIcon; c: string; suffix?: string }[] = [
  { key: "members", label: "Total Members", I: Users, c: "#2F8BFF" }, { key: "active", label: "Active Today", I: Zap, c: "#8B5CF6" },
  { key: "fresh", label: "New This Week", I: Sparkles, c: "#1FD18B" }, { key: "positive", label: "Positive Vibes", I: Heart, c: "#F0386F", suffix: "%" },
];
export function CommunityStats({ all }: { all: Person[] }) {
  const s = communityStats(all);
  return (
    <section className="card p-4" aria-labelledby="community-stats">
      <h2 id="community-stats" className="flex items-center gap-2.5 text-[16px] font-semibold"><Users size={22} className="text-primary" aria-hidden />Community Stats</h2>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {TILES.map(({ key, label, I, c, suffix }) => (
          <div key={key} className="tile flex items-center gap-2.5 rounded-xl border px-2.5 py-3" style={{ "--tint": `${c}66`, background: `linear-gradient(135deg, ${c}1f, transparent 70%)` } as React.CSSProperties}>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white" style={{ background: c }}><I size={17} aria-hidden /></span>
            <span className="leading-tight"><span className="block text-[18px] font-bold">{key === "positive" ? `${s[key]}${suffix}` : fmtBig(s[key])}</span><span className="block text-[10.5px] text-mute">{label}</span></span>
          </div>))}
      </div>
      <p className="mt-2 text-[10px] text-mute">Sample community numbers.</p>
    </section>
  );
}

const MEDAL = ["#FFC629", "#2F8BFF", "#2F8BFF", "#2F8BFF", "#2F8BFF"];
export function TopContributors({ all }: { all: Person[] }) {
  const open = usePeopleUI((s) => s.open), setTop = usePeopleUI((s) => s.setTop);
  const top = byPoints(all).slice(0, 5);
  return (
    <section className="card p-4" aria-labelledby="top-contrib">
      <div className="flex items-center justify-between"><h2 id="top-contrib" className="flex items-center gap-2.5 text-[16px] font-semibold"><Trophy size={21} className="text-honey" fill="currentColor" aria-hidden />Top Contributors</h2>
        <button onClick={() => setTop(true)} className="inline-flex items-center gap-1 rounded-md text-[12px] font-medium text-primary hover:underline">View All <ChevronRight size={13} aria-hidden /></button></div>
      <ol className="mt-2 divide-y divide-line">
        {top.map((p, k) => (
          <li key={p.id}><button onClick={() => open(p.id)} className="flex w-full items-center gap-3 rounded-lg py-2.5 text-left transition hover:bg-white/5">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[11px] font-bold" style={{ borderColor: MEDAL[k], color: MEDAL[k], background: `${MEDAL[k]}1f` }}>{k + 1}</span>
            <PersonAvatar p={p} size={36} />
            <span className="min-w-0 flex-1 leading-tight"><span className="block truncate text-[13px] font-semibold">{p.name}</span><span className="block text-[11px] text-primary">{fmtBig(p.points).toLowerCase()} points</span></span>
            <ChevronRight size={16} className="shrink-0 text-mute" aria-hidden /></button></li>))}
      </ol>
    </section>
  );
}

export function FindTribe({ onClick }: { onClick: () => void }) {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl border border-[#c8921a]/40 p-4 text-white" style={{ background: "radial-gradient(260px 160px at 100% 100%, rgba(255,170,40,.3), transparent 70%), linear-gradient(160deg,#1a1204,#0b0a1a 70%)" }}>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[url('/decor/honeycomb.svg')] bg-[length:240px] bg-left-top bg-no-repeat opacity-60" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/people/promo-bee.webp" alt="" width={95} height={212} className="absolute bottom-0 right-0 -z-10 h-full w-auto max-w-none select-none" draggable={false} style={{ maskImage: "linear-gradient(90deg,transparent,#000 40%)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 40%)" }} />
      <p className="script max-w-[190px] -rotate-3 text-[24px] leading-[1.1]">Good People Build Great Ideas!</p>
      <button onClick={onClick} className="btn-gold mt-5 inline-flex items-center gap-2 px-4 py-2 text-[13px]">Find Your Tribe<ChevronRight size={14} aria-hidden /></button>
    </section>
  );
}

/** Full leaderboard behind "View All". */
export function ContributorsDialog({ all }: { all: Person[] }) {
  const topOpen = usePeopleUI((s) => s.topOpen), setTop = usePeopleUI((s) => s.setTop), open = usePeopleUI((s) => s.open);
  useEffect(() => { if (!topOpen) return; const f = (e: KeyboardEvent) => e.key === "Escape" && setTop(false); window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f); }, [topOpen, setTop]);
  return (
    <AnimatePresence>
      {topOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setTop(false)}>
          <motion.div role="dialog" aria-modal="true" aria-label="Top contributors" onClick={(e) => e.stopPropagation()} className="flex max-h-[84dvh] w-full max-w-md flex-col rounded-3xl border border-line bg-panel p-5" initial={{ y: 40, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: 0.97 }}>
            <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-semibold"><Trophy size={18} className="text-honey" fill="currentColor" aria-hidden />Top contributors</h2><button autoFocus onClick={() => setTop(false)} aria-label="Close" className="rounded-full p-2 text-mute hover:bg-white/5"><X size={18} /></button></div>
            <p className="mt-1 text-xs text-mute">Ranked by community points.</p>
            <ol className="scroll-thin mt-3 space-y-1.5 overflow-y-auto pr-1">
              {byPoints(all).map((p, k) => <li key={p.id}><button onClick={() => { setTop(false); open(p.id); }} className="flex w-full items-center gap-3 rounded-xl border border-line px-3 py-2 text-left hover:border-primary/60 hover:bg-white/5">
                <span className="w-5 text-center text-[13px] font-bold text-mute">{k + 1}</span><PersonAvatar p={p} size={32} /><span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{p.name}</span><span className="shrink-0 text-[11px] text-mute">{fmtBig(p.points).toLowerCase()} pts</span></button></li>)}
            </ol>
          </motion.div>
        </motion.div>)}
    </AnimatePresence>
  );
}
