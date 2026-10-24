"use client";
import { useState } from "react";
import { BookOpen, Search, Sun, Crown } from "lucide-react";
import { Sparkles } from "../Art";
import HeroBee from "../HeroBee";
import { CATS, type CatId } from "@/features/knowledge/articles";

function rng(seed: number) { let x = seed; return () => (x = (x * 16807) % 2147483647) / 2147483647; }

/** Night-sky scene: stars, glow on the horizon, layered mountains and a lit city. Colours come from theme variables. */
function Scene() {
  const r = rng(11); const bs: React.ReactNode[] = []; let x = 120;
  while (x < 640) { const w = 8 + r() * 16, h = 14 + r() * 52 * (1 - Math.abs(x - 380) / 360 + 0.25);
    bs.push(<g key={x}><rect x={x} y={150 - h} width={w} height={h + 40} fill="var(--kb-city)" />{Array.from({ length: Math.floor(h / 8) }).map((_, j) => r() > 0.45 && <rect key={j} x={x + 2 + r() * (w - 5)} y={154 - h + j * 8} width="2" height="2.5" fill="#ffd36b" opacity={0.85} />)}</g>); x += w + 1 + r() * 4; }
  return (
    <svg viewBox="0 0 640 190" preserveAspectRatio="xMaxYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs><radialGradient id="kbglow" cx="62%" cy="74%" r="42%"><stop offset="0" stopColor="#ffb86b" stopOpacity=".95" /><stop offset=".25" stopColor="#ff6fb0" stopOpacity=".55" /><stop offset="1" stopColor="#7a3cff" stopOpacity="0" /></radialGradient></defs>
      <rect width="640" height="190" fill="url(#kbglow)" />
      <polygon points="0,190 0,120 60,92 110,128 180,84 250,132 330,100 410,136 500,90 580,126 640,104 640,190" fill="var(--kb-mtn1)" opacity=".85" />
      {bs}
      <polygon points="0,190 0,150 90,130 170,156 280,138 380,160 480,142 560,158 640,146 640,190" fill="var(--kb-mtn2)" />
    </svg>
  );
}

export default function KbHero({ query, onQuery, onSubmit, onTopic }: { query: string; onQuery: (q: string) => void; onSubmit: () => void; onTopic: (c: CatId) => void }) {
  const [focus, setFocus] = useState(false);
  return (
    <section className="hero-kb p-5 md:p-7" aria-labelledby="kb-title">
      <Sparkles n={14} /><Scene />
      <div className="relative z-10 max-w-full md:max-w-[640px]">
        <div className="flex items-center gap-3">
          <BookOpen size={34} strokeWidth={1.6} className="hero-text shrink-0" aria-hidden />
          <h1 id="kb-title" className="script hero-text text-[40px] leading-none md:text-[54px]">Knowledge Base</h1>
          <Sun size={28} className="shrink-0 fill-[#ffc400] text-[#ffc400] drop-shadow-[0_0_10px_rgba(255,196,0,.8)]" aria-hidden />
        </div>
        <p className="hero-text mt-3 max-w-[420px] text-[14px] leading-relaxed opacity-95 md:text-[15px]">Find helpful guides, tutorials, and resources to make the most of Event Bee Buzz.</p>
        <form role="search" onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className={`relative mt-5 flex max-w-[560px] items-center rounded-2xl border bg-[color-mix(in_srgb,var(--bg)_72%,transparent)] p-1.5 backdrop-blur transition ${focus ? "border-honey shadow-[0_0_0_3px_rgba(255,196,0,.18)]" : "border-[color-mix(in_srgb,var(--primary)_55%,transparent)]"}`}>
          <Search size={17} className="ml-3 shrink-0 text-mute" aria-hidden />
          <input value={query} onChange={(e) => onQuery(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} onKeyDown={(e) => e.key === "Escape" && onQuery("")} aria-label="Search the knowledge base" placeholder="Search for help, how-to guides, or ask a question..." className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[13px] outline-none placeholder:text-mute" />
          <button type="submit" aria-label="Search" className="btn-gold grid h-10 w-12 shrink-0 place-items-center"><Search size={18} aria-hidden /></button>
        </form>
        <ul className="mt-4 flex flex-wrap gap-1.5 sm:gap-2" aria-label="Popular topics">
          {CATS.map((c) => <li key={c.id}><button onClick={() => onTopic(c.id)} className="rounded-full border border-[color-mix(in_srgb,var(--primary)_60%,transparent)] bg-[color-mix(in_srgb,var(--bg)_55%,transparent)] px-3 py-1.5 text-[12px] font-medium backdrop-blur transition hover:border-honey hover:text-honey hero-text">{c.short}</button></li>)}
        </ul>
      </div>
      <HeroBee className="absolute bottom-0 right-[7%] z-10 hidden h-[88%] w-[22%] max-w-[250px] md:block" />
      <svg viewBox="0 0 120 70" className="drift pointer-events-none absolute bottom-[8%] right-[19%] z-20 hidden h-16 w-28 md:block" style={{ filter: "drop-shadow(0 0 16px rgba(255,200,90,.95))" }} aria-hidden>
        <path d="M60 14 C42 6 20 8 6 16 V60 C20 52 42 52 60 62 C78 52 100 52 114 60 V16 C100 8 78 6 60 14Z" fill="#24408f" stroke="#ffd36b" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M60 14 V62" stroke="#ffd36b" strokeWidth="2" /><path d="M16 26 C30 22 44 24 54 30 M16 36 C30 32 44 34 54 40 M66 30 C76 24 90 22 104 26 M66 40 C76 34 90 32 104 36" stroke="#fff" strokeOpacity=".5" strokeWidth="1.6" fill="none" />
      </svg>
      <div className="pointer-events-none absolute bottom-6 right-3 z-20 hidden w-[90px] flex-col items-center md:flex" aria-hidden>
        <Crown size={18} className="ev-gold mb-1" /><p className="script hero-text -rotate-[70deg] whitespace-nowrap text-center text-[19px] leading-[1.15]">Learn<br />Grow<br />Achieve</p>
      </div>
    </section>
  );
}
