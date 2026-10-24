"use client";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Star, ArrowRight, Lightbulb, Users, Clock, Heart, Plus, X, type LucideIcon } from "lucide-react";
import { useIdeasUI } from "@/lib/ideasStore";
import { ranked, myStats, likeCount, SCOPE_LABEL, type Idea, type Scope } from "@/features/ideas/ideas";
import { CountUp } from "../dashboard/bits";

const RANK_COLOR = ["#2F6BFF", "#16B26E", "#2F6BFF", "#8B3DFF", "#F0386F"];

export function TopIdeas({ all }: { all: Idea[] }) {
  const open = useIdeasUI((s) => s.open); const setTop = useIdeasUI((s) => s.setTop);
  const top = ranked(all).slice(0, 5);
  return (
    <section className="card p-4" aria-labelledby="top-ideas">
      <div className="flex items-center justify-between"><h2 id="top-ideas" className="flex items-center gap-2 text-[16px] font-semibold"><Star size={20} className="text-honey" fill="currentColor" aria-hidden />Top Ideas</h2>
        <button onClick={() => setTop(true)} className="inline-flex items-center gap-1 rounded-md text-[12px] font-medium text-primary hover:underline">View All <ArrowRight size={13} aria-hidden /></button></div>
      <ol className="mt-3 space-y-2">
        {top.map((i, k) => (
          <li key={i.id}><button onClick={() => open(i.id)} className="flex w-full items-center gap-3 rounded-xl border border-line px-2.5 py-2 text-left transition hover:border-primary/60 hover:bg-white/5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[14px] font-bold text-white" style={{ background: RANK_COLOR[k], boxShadow: `0 0 14px ${RANK_COLOR[k]}66` }}>{k + 1}</span>
            <span className="min-w-0"><span className="block truncate text-[13px] font-semibold">{i.title}</span><span className="block text-[11px] text-mute">{likeCount(i)} likes</span></span></button></li>))}
      </ol>
    </section>
  );
}

const TILES: { scope: Exclude<Scope, "all">; key: "total" | "shared" | "progress" | "support"; label: string; I: LucideIcon; c: string }[] = [
  { scope: "mine", key: "total", label: "Total Ideas", I: Lightbulb, c: "#FFC629" },
  { scope: "shared", key: "shared", label: "Ideas Shared", I: Users, c: "#8B6BFF" },
  { scope: "progress", key: "progress", label: "In Progress", I: Clock, c: "#FFB02E" },
  { scope: "support", key: "support", label: "Gained Support", I: Heart, c: "#F0386F" },
];
export function IdeaStats({ all }: { all: Idea[] }) {
  const scope = useIdeasUI((s) => s.scope); const setScope = useIdeasUI((s) => s.setScope); const s = myStats(all);
  return (
    <section className="card p-4" aria-labelledby="idea-stats">
      <h2 id="idea-stats" className="flex items-center gap-2 text-[16px] font-semibold"><Lightbulb size={20} className="text-honey" aria-hidden />Your Idea Stats</h2>
      <p className="mt-1 text-[11px] text-mute">Tap a tile to see just those ideas.</p>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {TILES.map(({ scope: sc, key, label, I, c }) => (
          <button key={key} aria-pressed={scope === sc} onClick={() => setScope(scope === sc ? "all" : sc)} title={SCOPE_LABEL[sc]}
            className="flex items-center gap-2.5 rounded-xl border border-line px-2.5 py-3 text-left transition hover:border-primary/60 aria-pressed:border-honey aria-pressed:bg-honey/10">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: `${c}24`, color: c }}><I size={18} aria-hidden /></span>
            <span className="leading-tight"><span className="block text-[20px] font-bold"><CountUp to={s[key]} /></span><span className="block text-[10.5px] text-mute">{label}</span></span></button>))}
      </div>
    </section>
  );
}

export function Promo({ onShare }: { onShare: () => void }) {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl border border-[#c8921a]/40 p-4 text-white" style={{ background: "radial-gradient(260px 160px at 100% 100%, rgba(255,170,40,.3), transparent 70%), linear-gradient(160deg,#1a1204,#0b0a1a 70%)" }}>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[url('/decor/honeycomb.svg')] bg-[length:240px] bg-right-top bg-no-repeat opacity-70" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/ideas/promo-bee.webp" alt="" width={106} height={212} className="absolute bottom-0 right-0 -z-10 h-full w-auto max-w-none select-none" style={{ maskImage: "linear-gradient(90deg,transparent,#000 40%)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 40%)" }} draggable={false} />
      <p className="script max-w-[200px] -rotate-3 text-[23px] leading-[1.1]">Every great idea starts with a single thought.</p>
      <button onClick={onShare} className="btn-gold mt-4 inline-flex items-center gap-2 px-4 py-2 text-[13px]"><Plus size={14} aria-hidden /> Share Your Idea</button>
    </section>
  );
}

/** Full ranking behind "View All". */
export function TopIdeasDialog({ all }: { all: Idea[] }) {
  const topOpen = useIdeasUI((s) => s.topOpen); const setTop = useIdeasUI((s) => s.setTop); const open = useIdeasUI((s) => s.open);
  useEffect(() => { if (!topOpen) return; const f = (e: KeyboardEvent) => e.key === "Escape" && setTop(false); window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f); }, [topOpen, setTop]);
  const list = ranked(all).slice(0, 15);
  return (
    <AnimatePresence>
      {topOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setTop(false)}>
          <motion.div role="dialog" aria-modal="true" aria-label="Top ideas" onClick={(e) => e.stopPropagation()} className="flex max-h-[84dvh] w-full max-w-md flex-col rounded-3xl border border-line bg-panel p-5" initial={{ y: 40, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: 0.97 }}>
            <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-semibold"><Star size={18} className="text-honey" fill="currentColor" aria-hidden />Top ideas</h2><button autoFocus onClick={() => setTop(false)} aria-label="Close" className="rounded-full p-2 text-mute hover:bg-white/5"><X size={18} /></button></div>
            <p className="mt-1 text-xs text-mute">Ranked by likes across the community.</p>
            <ol className="scroll-thin mt-3 space-y-1.5 overflow-y-auto pr-1">
              {list.map((i, k) => <li key={i.id}><button onClick={() => { setTop(false); open(i.id); }} className="flex w-full items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-left hover:border-primary/60 hover:bg-white/5">
                <span className="w-6 text-center text-[13px] font-bold text-mute">{k + 1}</span><span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{i.title}</span><span className="shrink-0 text-[11px] text-mute">{likeCount(i)} likes</span></button></li>)}
            </ol>
          </motion.div>
        </motion.div>)}
    </AnimatePresence>
  );
}
