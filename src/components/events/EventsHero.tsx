"use client";
import { Plus } from "lucide-react";
import { Sparkles, Skyline } from "../Art";
import HeroBee from "../HeroBee";
import EventCover from "./EventCover";

function Honeycomb() {
  const cells: React.ReactNode[] = []; const R = 26, W = Math.sqrt(3) * R;
  for (let row = 0; row < 7; row++) for (let col = 0; col < 16; col++) {
    const cx = col * W + (row % 2 ? W / 2 : 0), cy = row * R * 1.5;
    const pts = Array.from({ length: 6 }, (_, k) => { const a = (Math.PI / 3) * k - Math.PI / 2; return `${(cx + R * Math.cos(a)).toFixed(1)},${(cy + R * Math.sin(a)).toFixed(1)}`; }).join(" ");
    const lit = (row * 7 + col * 3) % 11 === 0;
    cells.push(<polygon key={`${row}-${col}`} points={pts} fill={lit ? "rgba(255,196,41,.16)" : "none"} stroke="#FFC629" strokeWidth={lit ? 1.6 : 1} strokeOpacity={lit ? 0.9 : 0.35} />);
  }
  return (
    <svg viewBox="0 0 420 190" preserveAspectRatio="xMaxYMid slice" className="absolute inset-y-0 right-0 h-full w-[68%]" aria-hidden
      style={{ maskImage: "linear-gradient(90deg,transparent,#000 45%)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 45%)", filter: "drop-shadow(0 0 5px rgba(255,196,41,.45))" }}>{cells}</svg>
  );
}

function Poster({ type, seed, className, style }: { type: string; seed: string; className: string; style?: React.CSSProperties }) {
  return <div className={`poster drift absolute ${className}`} style={style}><EventCover type={type} seed={seed} className="block aspect-[4/3] w-full" /></div>;
}

export default function EventsHero({ onCreate, onExplore }: { onCreate: () => void; onExplore: () => void }) {
  return (
    <section className="hero-ev min-h-[250px] p-7" aria-labelledby="events-hero">
      <Sparkles />
      <div className="only-dark"><Honeycomb /></div>
      <Skyline className="absolute inset-x-0 bottom-0 h-[38%] w-full opacity-80" />
      <div className="relative z-10 max-w-[40%]">
        <h1 id="events-hero" className="serif hero-text text-[44px] leading-[1.05] 2xl:text-[52px]">Your moments.<br /><span className="ev-gold">Their momentum.</span></h1>
        <p className="hero-text mt-3 max-w-[360px] text-[14px] leading-relaxed opacity-90">Collect your event takeaways, reconnect with the people you met, and turn your memories into meaningful action.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={onCreate} className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 text-sm"><Plus size={16} aria-hidden /> Create event</button>
          <button onClick={onExplore} className="btn-ghost inline-flex items-center px-5 py-2.5 text-sm">Explore sample event</button>
        </div>
      </div>
      <HeroBee className="absolute bottom-3 left-[40%] z-10 h-[82%] w-[19%] max-w-[230px]" />
      <svg viewBox="0 0 60 68" className="drift pointer-events-none absolute left-[58%] top-[22%] z-10 h-14 w-12" style={{ filter: "drop-shadow(0 0 14px rgba(255,196,41,.9))" }} aria-hidden>
        <path d="M30 3 L55 17 V49 L30 63 L5 49 V17 Z" fill="#FFC629" stroke="#FFE27A" strokeWidth="4" strokeLinejoin="round" /><path d="M30 3 L55 17" stroke="#fff" strokeOpacity=".6" strokeWidth="2" />
      </svg>
      <Poster type="Conference" seed="h1" className="right-[17%] top-[9%] z-10 w-[17%] -rotate-[5deg]" />
      <Poster type="Forum" seed="h2" className="right-[19%] bottom-[11%] z-10 w-[17%] rotate-[4deg]" />
      <Poster type="Networking" seed="h3" className="right-[3%] top-[22%] z-10 w-[15%] rotate-[3deg]" />
      <p className="script hero-text pointer-events-none absolute bottom-4 right-6 z-10 w-[150px] -rotate-6 text-center text-[19px] leading-[1.05]">
        <span className="only-dark">Great events create better futures</span><span className="only-light">Good vibes. Lasting impact</span> ♡</p>
    </section>
  );
}
