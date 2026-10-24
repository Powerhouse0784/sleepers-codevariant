"use client";
import { useId } from "react";
import { Code, GraduationCap, Leaf, BarChart3, Users, MoreHorizontal, type LucideIcon } from "lucide-react";
import { CATEGORY_COLOR, CATEGORY_LABEL, AVATAR_TINT, type Category } from "@/features/ideas/ideas";

/** Illustrated covers, one scene per category (theme independent, like photos). Deterministic so server and client match. */
function rng(seed: number) { let x = seed % 2147483647 || 7; return () => (x = (x * 16807) % 2147483647) / 2147483647; }
function hash(s: string) { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 2147483647; return h; }
type Scene = (p: { id: string; r: () => number }) => React.ReactNode;
const Stars = ({ r, n, h = 110 }: { r: () => number; n: number; h?: number }) => <>{Array.from({ length: n }).map((_, i) => <circle key={i} cx={r() * 320} cy={r() * h} r={0.6 + r() * 1.4} fill="#fff" opacity={0.35 + r() * 0.6} />)}</>;

const tech: Scene = ({ id, r }) => {
  const nodes = Array.from({ length: 22 }).map(() => ({ x: 168 + r() * 118, y: 14 + r() * 100 }));
  return (<>
    <defs><linearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#050b2e" /><stop offset="1" stopColor="#0b2a8a" /></linearGradient>
      <radialGradient id={`${id}b`}><stop offset="0" stopColor="#4fd2ff" stopOpacity=".85" /><stop offset="1" stopColor="#4fd2ff" stopOpacity="0" /></radialGradient></defs>
    <rect width="320" height="130" fill={`url(#${id}a)`} />
    {[22, 40, 58, 76, 94].map((y, i) => <path key={y} d={`M0 ${y} H${40 + i * 18} l10 -8 H${110 + i * 8}`} stroke="#2f8bff" strokeOpacity=".5" fill="none" />)}
    {[22, 40, 58, 76, 94].map((y, i) => <circle key={y} cx={110 + i * 8} cy={y - 8} r="2.4" fill="#7fd2ff" />)}
    <ellipse cx="228" cy="64" rx="86" ry="64" fill={`url(#${id}b)`} />
    <path d="M196 120 C186 96 190 78 198 68 C192 50 206 24 236 22 C266 20 286 40 282 66 C280 80 270 88 262 96 L262 120Z" fill="#0a1c5c" stroke="#7fd2ff" strokeWidth="1.4" />
    {nodes.map((a, i) => nodes.slice(i + 1, i + 3).map((b, k) => <line key={`${i}-${k}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#8fe0ff" strokeOpacity=".5" />))}
    {nodes.map((n, i) => <circle key={i} cx={n.x} cy={n.y} r={1.6 + (i % 3) * 0.7} fill="#c9f1ff" />)}
    <Stars r={r} n={18} h={120} />
  </>);
};
const environment: Scene = ({ id, r }) => (<>
  <defs><linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9be86a" /><stop offset=".55" stopColor="#1f9d55" /><stop offset="1" stopColor="#0b4f2a" /></linearGradient>
    <radialGradient id={`${id}g`} cx=".4" cy=".35"><stop offset="0" stopColor="#7fd8ff" /><stop offset=".6" stopColor="#1f7de0" /><stop offset="1" stopColor="#0c3f9a" /></radialGradient>
    <radialGradient id={`${id}b`}><stop offset="0" stopColor="#fff7b0" stopOpacity=".9" /><stop offset="1" stopColor="#fff7b0" stopOpacity="0" /></radialGradient></defs>
  <rect width="320" height="130" fill={`url(#${id}a)`} />
  <circle cx="170" cy="50" r="80" fill={`url(#${id}b)`} />
  {[[40, 108, -20], [86, 114, 10], [250, 110, 24], [292, 116, -12], [20, 70, -40], [300, 70, 40]].map(([x, y, a], i) => <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}><path d="M0 0 C-16 -18 -10 -44 8 -54 C22 -36 16 -14 0 0Z" fill={i % 2 ? "#2fbf6a" : "#127a3c"} /><path d="M0 0 L8 -50" stroke="#a6f08a" strokeOpacity=".6" /></g>)}
  <circle cx="160" cy="62" r="40" fill={`url(#${id}g)`} />
  <path d="M138 48 q10 -10 22 -4 q6 10 -4 16 q-12 4 -18 -12Z M164 70 q12 -6 20 4 q2 12 -10 14 q-10 -4 -10 -18Z M146 76 q8 4 4 12 q-8 0 -4 -12Z" fill="#3fd47a" />
  <ellipse cx="150" cy="46" rx="16" ry="8" fill="#fff" opacity=".18" />
  {Array.from({ length: 10 }).map((_, i) => <circle key={i} cx={r() * 320} cy={r() * 120} r={1 + r() * 1.5} fill="#fffbc0" opacity=".7" />)}
</>);
const education: Scene = ({ id, r }) => (<>
  <defs><linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe2b0" /><stop offset="1" stopColor="#d98a4a" /></linearGradient>
    <radialGradient id={`${id}b`}><stop offset="0" stopColor="#fff1c2" stopOpacity=".95" /><stop offset="1" stopColor="#fff1c2" stopOpacity="0" /></radialGradient></defs>
  <rect width="320" height="130" fill={`url(#${id}a)`} />
  <rect x="236" y="10" width="68" height="56" rx="3" fill="#bfe3ff" /><path d="M270 10V66M236 38H304" stroke="#fff" strokeWidth="2" /><circle cx="270" cy="38" r="56" fill={`url(#${id}b)`} />
  <rect x="10" y="46" width="130" height="4" fill="#7a3f17" />
  {Array.from({ length: 11 }).map((_, i) => { const h = 20 + r() * 12; return <rect key={i} x={14 + i * 11.5} y={46 - h} width="9.5" height={h} rx="1" fill={["#e5484d", "#2f6bff", "#f5b301", "#2fbf6a", "#8b3dff"][i % 5]} />; })}
  <rect y="96" width="320" height="34" fill="#7a3f17" /><rect y="96" width="320" height="4" fill="#a65a24" />
  <rect x="40" y="82" width="64" height="14" rx="2" fill="#2f6bff" /><rect x="46" y="68" width="54" height="14" rx="2" fill="#e5484d" /><rect x="38" y="54" width="62" height="14" rx="2" fill="#f5b301" />
  {[[40, 82], [46, 68], [38, 54]].map(([x, y], i) => <rect key={i} x={x + 4} y={y + 4} width="40" height="2.5" fill="#fff" opacity=".5" />)}
  <path d="M146 96 L172 86 L198 96Z" fill="#fffdf6" /><path d="M172 86V96" stroke="#c9b48a" /><path d="M150 94 q22 -10 44 0" stroke="#e8dcc0" fill="none" />
  <rect x="206" y="62" width="5" height="34" fill="#3a2410" /><path d="M194 62 L224 62 L216 44 L202 44Z" fill="#ffd966" /><ellipse cx="209" cy="64" rx="28" ry="15" fill={`url(#${id}b)`} />
</>);
const business: Scene = ({ id, r }) => {
  const b: React.ReactNode[] = []; let x = -4;
  while (x < 320) { const w = 14 + r() * 22, h = 34 + r() * 66; b.push(<g key={x}><rect x={x} y={124 - h} width={w} height={h + 10} fill={r() > 0.5 ? "#173a8f" : "#0f2a73"} />
    {Array.from({ length: Math.floor(h / 9) }).map((_, j) => Array.from({ length: Math.max(1, Math.floor(w / 7)) }).map((__, k) => <rect key={`${j}${k}`} x={x + 3 + k * 6} y={128 - h + j * 9} width="3" height="4" fill="#ffe07a" opacity={r() > 0.35 ? 0.85 : 0.15} />))}</g>); x += w + 1; }
  return (<>
    <defs><linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a3f9a" /><stop offset=".6" stopColor="#5aa7ff" /><stop offset="1" stopColor="#ffb86b" /></linearGradient></defs>
    <rect width="320" height="130" fill={`url(#${id}a)`} />
    <Stars r={r} n={10} h={50} />{b}
    <rect y="120" width="320" height="10" fill="#0a1a4a" />
  </>);
};
const social: Scene = ({ id, r }) => (<>
  <defs><linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7a2a8f" /><stop offset=".5" stopColor="#ff6a3d" /><stop offset="1" stopColor="#ffb14a" /></linearGradient>
    <radialGradient id={`${id}b`}><stop offset="0" stopColor="#fff2b8" stopOpacity=".95" /><stop offset="1" stopColor="#fff2b8" stopOpacity="0" /></radialGradient></defs>
  <rect width="320" height="130" fill={`url(#${id}a)`} />
  <circle cx="160" cy="70" r="70" fill={`url(#${id}b)`} /><circle cx="160" cy="70" r="20" fill="#fff6c8" />
  {[[34, 82, 11], [78, 74, 12], [122, 80, 11], [200, 78, 12], [244, 72, 11], [288, 82, 12]].map(([x, y, rad], i) => <g key={i} fill="#1a0b2e" stroke="#ffb35a" strokeOpacity=".5"><circle cx={x} cy={y} r={rad + r() * 1.5} /><path d={`M${x - 24} 130 q3 -34 24 -34 q21 0 24 34z`} /></g>)}
  {[100, 180].map((x, i) => <g key={i} fill="#120720"><circle cx={x} cy={92} r="10" /><path d={`M${x - 22} 130 q2 -26 22 -26 q20 0 22 26z`} /></g>)}
  <path d="M148 40 c-8 -10 -22 -4 -16 8 c4 6 16 12 16 12 s12 -6 16 -12 c6 -12 -8 -18 -16 -8z" fill="#ff477e" opacity=".9" transform="translate(12 -6) scale(.8)" />
</>);
const others: Scene = ({ id, r }) => (<>
  <defs><linearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#070a2a" /><stop offset="1" stopColor="#1b1065" /></linearGradient>
    <radialGradient id={`${id}p`} cx=".3" cy=".3"><stop offset="0" stopColor="#7fd2ff" /><stop offset=".5" stopColor="#2f6bff" /><stop offset="1" stopColor="#0a1a66" /></radialGradient>
    <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd24a" /><stop offset="1" stopColor="#ff5a1f" stopOpacity="0" /></linearGradient></defs>
  <rect width="320" height="130" fill={`url(#${id}a)`} />
  <Stars r={r} n={40} h={130} />
  <circle cx="270" cy="96" r="78" fill={`url(#${id}p)`} /><path d="M205 70 q40 -26 100 -10" stroke="#9fd8ff" strokeOpacity=".5" fill="none" strokeWidth="2" />
  <circle cx="60" cy="30" r="13" fill="#ffb37a" opacity=".9" /><ellipse cx="60" cy="30" rx="24" ry="5" fill="none" stroke="#ffd9b0" strokeOpacity=".7" transform="rotate(-18 60 30)" />
  <g transform="translate(150 66) rotate(38)"><path d="M0 -34 C10 -22 10 -4 8 12 H-8 C-10 -4 -10 -22 0 -34Z" fill="#f4f7ff" /><path d="M-8 6 L-20 22 L-8 18Z M8 6 L20 22 L8 18Z" fill="#e5484d" /><circle cx="0" cy="-14" r="5" fill="#2f8bff" stroke="#bfe3ff" strokeWidth="1.5" /><path d="M-6 14 H6 L0 56Z" fill={`url(#${id}f)`} /></g>
</>);
const SCENES: Record<Category, Scene> = { tech, environment, education, business, social, others };

export default function IdeaCover({ category, seed = "", className = "" }: { category: Category; seed?: string; className?: string }) {
  const id = useId().replace(/:/g, "");
  const Scene = SCENES[category];
  return <svg viewBox="0 0 320 130" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden><Scene id={id} r={rng(hash(category + seed))} /></svg>;
}

export const CATEGORY_ICON: Record<Category, LucideIcon> = { tech: Code, education: GraduationCap, environment: Leaf, business: BarChart3, social: Users, others: MoreHorizontal };
export function CategoryPill({ category, className = "" }: { category: Category; className?: string }) {
  const I = CATEGORY_ICON[category];
  return <span className={`inline-flex items-center gap-1 rounded-md px-2 py-[3px] text-[10px] font-semibold text-white shadow-md ${className}`} style={{ background: CATEGORY_COLOR[category] }}><I size={11} aria-hidden />{CATEGORY_LABEL[category]}</span>;
}
export function Avatar({ id, name, size = 28 }: { id: string; name: string; size?: number }) {
  const [a, b] = AVATAR_TINT[id] ?? ["#9bb6ff", "#4a6fd0"];
  return <span aria-hidden className="grid shrink-0 place-items-center rounded-full font-bold text-[#1a1304]" style={{ width: size, height: size, fontSize: size * 0.4, background: `linear-gradient(135deg,${a},${b})` }}>{name.slice(0, 1).toUpperCase()}</span>;
}
