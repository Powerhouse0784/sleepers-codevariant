"use client";
import { ChevronRight, BookOpen, CirclePlay, MessageCircleQuestion, Headphones, Zap, Flame } from "lucide-react";
import { useKb } from "@/features/knowledge/store";
import { ARTICLES, fmtViews } from "@/features/knowledge/articles";
import { chip } from "./icons";

export type Mode = "featured" | "all" | "faq";
const NUM = ["#168BFF", "#168BFF", "#00A96B", "#B8860B", "#B8860B"];

export function QuickLinks({ onMode }: { onMode: (m: Mode) => void }) {
  const setVideo = useKb((s) => s.setVideo), setSupport = useKb((s) => s.setSupport);
  const links = [
    { t: "User Guide", d: "Complete platform guide", I: BookOpen, c: "#168BFF", run: () => onMode("all") },
    { t: "Video Tutorials", d: "Watch and learn", I: CirclePlay, c: "#8B35FF", run: () => setVideo(true) },
    { t: "FAQs", d: "Common questions answered", I: MessageCircleQuestion, c: "#00C982", run: () => onMode("faq") },
    { t: "Contact Support", d: "Get help from our team", I: Headphones, c: "#F5A524", run: () => setSupport(true) },
  ];
  return (
    <section className="card p-4" aria-labelledby="ql">
      <h2 id="ql" className="flex items-center gap-2 text-[18px] font-semibold"><Zap size={20} className="fill-honey text-honey" aria-hidden /> Quick Links</h2>
      <ul className="mt-3 space-y-2">
        {links.map(({ t, d, I, c, run }) => (
          <li key={t}><button onClick={run} className="group flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition hover:-translate-y-0.5" style={{ borderColor: `${c}55`, backgroundImage: `linear-gradient(90deg, ${c}22, transparent 70%)` }}>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={chip(c)}><I size={21} color="#fff" aria-hidden /></span>
            <span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold leading-tight">{t}</span><span className="mt-0.5 block text-[12px] text-mute">{d}</span></span>
            <ChevronRight size={17} className="shrink-0 text-mute transition group-hover:translate-x-0.5" aria-hidden /></button></li>))}
      </ul>
    </section>
  );
}

export function Popular() {
  const open = useKb((s) => s.open), opens = useKb((s) => s.opens);
  const top = [...ARTICLES].map((a) => ({ a, v: a.views + (opens[a.id] ?? 0) })).sort((x, y) => y.v - x.v).slice(0, 5);
  return (
    <section className="card p-4" aria-labelledby="pop">
      <h2 id="pop" className="flex items-center gap-2 text-[18px] font-semibold"><Flame size={20} className="fill-[#ff9a1f] text-[#ff9a1f]" aria-hidden /> Popular Articles</h2>
      <ol className="mt-3 space-y-2">
        {top.map(({ a, v }, i) => (
          <li key={a.id}><button onClick={() => open(a.id)} className="group flex w-full items-center gap-3 rounded-2xl border border-line p-2.5 text-left transition hover:border-honey/60 hover:bg-white/5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[16px] font-bold text-white" style={{ background: `linear-gradient(145deg, ${NUM[i]}, color-mix(in srgb, ${NUM[i]} 60%, #000))`, boxShadow: `0 0 0 2px color-mix(in srgb, ${NUM[i]} 50%, transparent)` }}>{i + 1}</span>
            <span className="min-w-0 flex-1"><span className="line-clamp-2 block text-[12.5px] font-semibold leading-tight">{a.title}</span><span className="mt-0.5 block text-[11px] text-mute">{fmtViews(v)} views</span></span>
            <ChevronRight size={16} className="shrink-0 text-mute" aria-hidden /></button></li>))}
      </ol>
    </section>
  );
}

/** Closing brand panel: honeycomb, small bee, script tagline. Decorative, so hidden from screen readers. */
export function ArtPanel() {
  return (
    <section className="card relative min-h-[150px] overflow-hidden" aria-hidden>
      <div className="honeycomb-bg absolute inset-0 opacity-70 [background-position:right_bottom]" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(260px 140px at 20% 40%, rgba(255,196,0,.18), transparent 70%)" }} />
      <div className="relative flex items-center gap-4 p-5">
        <img src="/decor/bee-mark.svg" alt="" className="drift h-16 w-16 shrink-0" />
        <p className="script -rotate-3 text-[24px] leading-[1.1]">Better<br />Ideas. Bigger<br /><span className="ev-gold">Impact!</span></p>
      </div>
    </section>
  );
}
