"use client";
import { Lightbulb, Plus, Sparkle } from "lucide-react";

/** Night city on the left, drawn in code so the real heading and buttons can sit on it. The bee scene on the right is the supplied artwork. */
export function City() {
  let x = 11; const r = () => (x = (x * 16807) % 2147483647) / 2147483647;
  const bs: React.ReactNode[] = []; let px = 0;
  while (px < 520) { const w = 12 + r() * 22, h = 18 + r() * 58 * (1 - px / 900); bs.push(<g key={px}><rect x={px} y={110 - h} width={w} height={h + 40} fill="#14124f" />
    {Array.from({ length: Math.floor(h / 9) }).map((_, j) => <rect key={j} x={px + 3 + (j % 2) * 6} y={114 - h + j * 9} width="2.6" height="4" fill="#ffd36b" opacity={r() > 0.4 ? 0.8 : 0.15} />)}</g>); px += w + 2; }
  return (
    <svg viewBox="0 0 520 150" preserveAspectRatio="xMinYMax slice" className="absolute bottom-0 left-0 h-[46%] w-[62%] opacity-90" aria-hidden
      style={{ maskImage: "linear-gradient(90deg,#000 55%,transparent)", WebkitMaskImage: "linear-gradient(90deg,#000 55%,transparent)" }}>
      <rect y="96" width="520" height="54" fill="#0c0b3a" />{bs}
      <path d="M0 126 Q130 112 260 128 T520 120" stroke="#6aa8ff" strokeOpacity=".45" fill="none" /><path d="M0 138 Q140 124 280 140 T520 132" stroke="#ff9a5c" strokeOpacity=".35" fill="none" />
    </svg>
  );
}

export default function IdeasHero({ onShare, onExplore }: { onShare: () => void; onExplore: () => void }) {
  return (
    <section aria-labelledby="ideas-hero" className="relative isolate min-h-[250px] overflow-hidden rounded-[20px] border border-[#2a4fb8]/50 text-white"
      style={{ background: "radial-gradient(520px 240px at 48% 108%, rgba(255,140,90,.5), transparent 70%), radial-gradient(420px 260px at 14% -10%, rgba(130,80,255,.55), transparent 70%), linear-gradient(100deg,#0b1245 0%,#241a7a 48%,#3d2a8f 100%)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/ideas/hero-bee.webp" alt="" width={445} height={246} className="absolute inset-y-0 right-0 -z-0 h-full w-auto max-w-none select-none opacity-60 sm:opacity-100"
        style={{ maskImage: "linear-gradient(90deg,transparent,#000 26%)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 26%)" }} draggable={false} />
      <City />
      <div className="relative z-10 flex min-h-[250px] max-w-[62%] flex-col justify-center p-6 sm:max-w-[56%] md:p-8">
        <h1 id="ideas-hero" className="script flex flex-wrap items-center gap-x-3 text-[34px] leading-[1.05] sm:text-[44px] xl:text-[54px]">
          Ideas Spark Change
          <span className="relative hidden sm:inline-grid" aria-hidden><Lightbulb size={40} className="text-[#FFC629] drop-shadow-[0_0_14px_rgba(255,198,41,.9)]" fill="#FFC62933" /><Sparkle size={11} className="absolute -right-2 -top-1 text-[#FFE27A]" fill="#FFE27A" /></span>
        </h1>
        <p className="mt-3 max-w-[380px] text-[13px] leading-relaxed text-white/90 sm:text-[15px]">Share your ideas, explore others, and turn small thoughts into big impact!</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={onShare} className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 text-[13px] sm:text-sm"><Plus size={16} aria-hidden /> Share New Idea</button>
          <button onClick={onExplore} className="btn-ghost inline-flex items-center px-5 py-2.5 text-[13px] sm:text-sm" style={{ color: "#fff", borderColor: "rgba(255,255,255,.35)" }}>Explore Ideas</button>
        </div>
      </div>
    </section>
  );
}
