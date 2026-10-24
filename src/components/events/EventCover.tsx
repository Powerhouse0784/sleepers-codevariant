"use client";
import { useId } from "react";

/**
 * Illustrated event covers (theme independent, like photos). Each type gets its own scene so the grid reads
 * at a glance. Deterministic randomness keeps server and client markup identical.
 */
function rng(seed: number) { let x = seed % 2147483647 || 7; return () => (x = (x * 16807) % 2147483647) / 2147483647; }
function hash(s: string) { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 2147483647; return h; }

type Scene = (p: { id: string; r: () => number }) => React.ReactNode;

const Crowd = ({ r, y, rows, fill, rim, step = 13 }: { r: () => number; y: number; rows: number; fill: string; rim: string; step?: number }) => (
  <g>{Array.from({ length: rows }).flatMap((_, row) => {
    const out: React.ReactNode[] = []; let x = -6 + row * 6;
    while (x < 340) { const rad = 5 + r() * 2.2, cy = y + row * 10 - r() * 4;
      out.push(<g key={`${row}-${x}`}><ellipse cx={x} cy={cy + rad + 7} rx={rad * 1.9} ry="9" fill={fill} /><circle cx={x} cy={cy} r={rad} fill={fill} stroke={rim} strokeWidth="1" strokeOpacity=".55" /></g>);
      x += step + r() * 6; }
    return out; })}</g>
);

const conference: Scene = ({ id, r }) => (
  <>
    <defs>
      <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a1688" /><stop offset=".55" stopColor="#3b5bff" /><stop offset="1" stopColor="#1a0f4d" /></linearGradient>
      <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff5de1" stopOpacity=".75" /><stop offset="1" stopColor="#6aa8ff" stopOpacity="0" /></linearGradient>
      <radialGradient id={`${id}c`}><stop offset="0" stopColor="#9be3ff" stopOpacity=".9" /><stop offset="1" stopColor="#9be3ff" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="320" height="130" fill={`url(#${id}a)`} />
    <ellipse cx="160" cy="62" rx="120" ry="34" fill={`url(#${id}c)`} />
    {[28, 78, 130, 190, 244, 296].map((x, i) => <polygon key={i} points={`${x - 3},0 ${x + 3},0 ${x + (i % 2 ? 46 : -46)},100 ${x + (i % 2 ? 20 : -20)},100`} fill={`url(#${id}b)`} opacity={0.55} />)}
    <rect x="86" y="40" width="148" height="30" rx="3" fill="#cfeaff" opacity=".85" /><rect x="94" y="46" width="132" height="18" rx="2" fill="#7b5bff" opacity=".8" />
    {Array.from({ length: 14 }).map((_, i) => <circle key={i} cx={r() * 320} cy={r() * 70} r={1 + r() * 2.2} fill="#ffd6ff" opacity={0.7} />)}
    <Crowd r={r} y={96} rows={3} fill="#0d0a2e" rim="#ff7ad9" />
  </>
);
const hackathon: Scene = ({ id, r }) => (
  <>
    <defs><linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0f1d44" /><stop offset="1" stopColor="#1b1534" /></linearGradient>
      <radialGradient id={`${id}b`}><stop offset="0" stopColor="#ffb24a" stopOpacity=".7" /><stop offset="1" stopColor="#ffb24a" stopOpacity="0" /></radialGradient></defs>
    <rect width="320" height="130" fill={`url(#${id}a)`} />
    <circle cx="272" cy="22" r="50" fill={`url(#${id}b)`} />
    {[[30, 34], [118, 28], [206, 36]].map(([x, y], i) => (
      <g key={i}><rect x={x} y={y} width="78" height="44" rx="4" fill="#0b1226" stroke="#3b6cff" strokeOpacity=".6" />
        <rect x={x + 4} y={y + 4} width="70" height="36" rx="2" fill={i === 1 ? "#2f8bff" : "#5b3bff"} opacity=".75" />
        {Array.from({ length: 5 }).map((__, k) => <rect key={k} x={x + 9} y={y + 9 + k * 6} width={18 + r() * 38} height="2.5" fill="#d8ecff" opacity=".8" />)}
      </g>))}
    <rect y="92" width="320" height="38" fill="#0a0e22" />
    {[44, 130, 218, 290].map((x, i) => <g key={i} fill="#05070f"><circle cx={x} cy={84} r="11" /><path d={`M${x - 24} 130 q4 -34 24 -34 q20 0 24 34z`} /></g>)}
  </>
);
const meetup: Scene = ({ id, r }) => (
  <>
    <defs><linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a2f1a" /><stop offset="1" stopColor="#2a140c" /></linearGradient>
      <radialGradient id={`${id}b`}><stop offset="0" stopColor="#ffc46b" stopOpacity=".9" /><stop offset="1" stopColor="#ffc46b" stopOpacity="0" /></radialGradient></defs>
    <rect width="320" height="130" fill={`url(#${id}a)`} />
    <rect x="18" y="14" width="60" height="62" rx="3" fill="#ffd9a0" opacity=".5" /><rect x="244" y="14" width="60" height="62" rx="3" fill="#ffd9a0" opacity=".45" />
    {[70, 160, 250].map((x) => <g key={x}><line x1={x} y1="0" x2={x} y2="20" stroke="#150a05" strokeWidth="1.5" /><circle cx={x} cy="30" r="30" fill={`url(#${id}b)`} /><circle cx={x} cy="26" r="7" fill="#ffe3a8" /></g>)}
    <ellipse cx="160" cy="98" rx="104" ry="15" fill="#20100a" /><ellipse cx="160" cy="94" rx="100" ry="12" fill="#6b3a1c" />
    {[52, 108, 160, 212, 268].map((x0, i) => { const x = x0 + (r() - 0.5) * 18; return <g key={i} fill="#140a06" stroke="#ffb35a" strokeOpacity=".4"><circle cx={x} cy={62 - (i % 2) * 5 - r() * 5} r={10 + r() * 2.5} /><path d={`M${x - 22} 100 q2 -26 22 -26 q20 0 22 26z`} /></g>; })}
    {Array.from({ length: 6 }).map((_, i) => <circle key={i} cx={40 + r() * 240} cy={110 + r() * 14} r="3" fill="#f6c27a" opacity=".5" />)}
  </>
);
const networking: Scene = ({ id, r }) => {
  const b: React.ReactNode[] = []; let x = 0;
  while (x < 320) { const w = 14 + r() * 26, h = 28 + r() * 52; b.push(<rect key={x} x={x} y={100 - h} width={w} height={h + 40} fill="#2a1a4a" opacity=".9" />); x += w + 2; }
  return (
    <>
      <defs><linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2b86" /><stop offset=".55" stopColor="#ff7a4a" /><stop offset="1" stopColor="#ffb14a" /></linearGradient></defs>
      <rect width="320" height="130" fill={`url(#${id}a)`} />{b}
      {Array.from({ length: 16 }).map((_, i) => <rect key={i} x={r() * 310} y={50 + r() * 44} width="3" height="4" fill="#ffe29a" />)}
      <path d="M0 52 Q80 70 160 50 T320 56" stroke="#ffe9a8" strokeWidth="1" fill="none" opacity=".8" />
      {Array.from({ length: 18 }).map((_, i) => <circle key={i} cx={i * 18 + 6} cy={52 + Math.sin(i * 0.9) * 8 + 6} r="2.4" fill="#fff2b8" />)}
      <rect y="108" width="320" height="22" fill="#170d2e" />
      {[34, 92, 150, 214, 274].map((x, i) => <g key={i} fill="#0b0618"><circle cx={x} cy={80} r="9" /><path d={`M${x - 17} 130 q3 -30 17 -30 q14 0 17 30z`} /></g>)}
    </>
  );
};
const forum: Scene = ({ id, r }) => (
  <>
    <defs><linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b2a7a" /><stop offset="1" stopColor="#081238" /></linearGradient>
      <radialGradient id={`${id}b`}><stop offset="0" stopColor="#7fd2ff" stopOpacity=".95" /><stop offset="1" stopColor="#7fd2ff" stopOpacity="0" /></radialGradient></defs>
    <rect width="320" height="130" fill={`url(#${id}a)`} />
    <ellipse cx="160" cy="46" rx="150" ry="46" fill={`url(#${id}b)`} opacity=".7" />
    <rect x="64" y="22" width="192" height="52" rx="3" fill="#cfefff" /><rect x="70" y="28" width="180" height="40" rx="2" fill="#2f8bff" opacity=".85" />
    <rect x="86" y="38" width="70" height="4" fill="#fff" opacity=".9" /><rect x="86" y="48" width="120" height="3" fill="#fff" opacity=".6" /><rect x="86" y="55" width="96" height="3" fill="#fff" opacity=".6" />
    <Crowd r={r} y={84} rows={4} fill="#050a1f" rim="#59b4ff" step={11} />
  </>
);
const SCENES: Record<string, Scene> = { Conference: conference, Hackathon: hackathon, Meetup: meetup, Networking: networking, Forum: forum, Workshop: hackathon };

export default function EventCover({ type, seed = "", className = "" }: { type: string; seed?: string; className?: string }) {
  const id = useId().replace(/:/g, "");
  const Scene = SCENES[type] ?? meetup;
  return (
    <svg viewBox="0 0 320 130" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <Scene id={id} r={rng(hash(type + seed))} />
    </svg>
  );
}

/** Type pill colours, matching the reference (purple, blue, pink, orange, teal). */
export const TYPE_STYLE: Record<string, { bg: string; fg: string }> = {
  Conference: { bg: "linear-gradient(90deg,#8b3dff,#c13dff)", fg: "#fff" },
  Hackathon: { bg: "linear-gradient(90deg,#1f8bff,#2f6bff)", fg: "#fff" },
  Meetup: { bg: "linear-gradient(90deg,#ff3d8b,#ff5fb0)", fg: "#fff" },
  Networking: { bg: "linear-gradient(90deg,#ff7a1f,#ffa23d)", fg: "#fff" },
  Forum: { bg: "linear-gradient(90deg,#14c8a0,#1fe0b4)", fg: "#06231c" },
  Workshop: { bg: "linear-gradient(90deg,#6a5cff,#8f7bff)", fg: "#fff" },
};
export function TypePill({ type, className = "" }: { type: string; className?: string }) {
  const t = TYPE_STYLE[type] ?? TYPE_STYLE.Meetup;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-[3px] text-[10px] font-semibold shadow-md ${className}`} style={{ background: t.bg, color: t.fg }}>{type}</span>;
}
