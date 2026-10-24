"use client";
import { motion } from "motion/react";

/** Small logo mark for sidebar/top bar. */
export function BeeLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <ellipse cx="22" cy="18" rx="12" ry="8" fill="#bfe1ff" opacity=".85" transform="rotate(-25 22 18)" />
      <ellipse cx="42" cy="18" rx="12" ry="8" fill="#bfe1ff" opacity=".85" transform="rotate(25 42 18)" />
      <ellipse cx="32" cy="38" rx="20" ry="19" fill="#FFC400" />
      <clipPath id="lg"><ellipse cx="32" cy="38" rx="20" ry="19" /></clipPath>
      <g clipPath="url(#lg)" fill="#1a1204"><rect x="8" y="40" width="48" height="6" /><rect x="8" y="52" width="48" height="6" /></g>
      <rect x="15" y="26" width="15" height="10" rx="5" fill="#111" /><rect x="34" y="26" width="15" height="10" rx="5" fill="#111" />
      <path d="M27 32h10" stroke="#111" strokeWidth="2" /><path d="M26 44q6 5 12 0" stroke="#7a3a00" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Instant SVG bee. Shown immediately; the 3D bee fades in over it once loaded. */
export function Mascot({ className = "" }: { className?: string }) {
  return (
    <motion.div className={className} animate={{ y: [0, -8, 0], rotate: [0, 1.5, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}>
      {(
        <svg viewBox="0 0 220 230" className="h-full w-full" aria-hidden>
          <defs><clipPath id="bb"><ellipse cx="108" cy="158" rx="50" ry="56" /></clipPath>
            <radialGradient id="hd" cx=".4" cy=".3"><stop offset="0" stopColor="#FFE36B" /><stop offset="1" stopColor="#FFB800" /></radialGradient></defs>
          <motion.ellipse cx="70" cy="86" rx="38" ry="20" fill="#d9eeff" fillOpacity=".8" style={{ originX: "108px", originY: "120px" }} animate={{ rotate: [-14, 6, -14] }} transition={{ duration: .45, repeat: Infinity }} />
          <motion.ellipse cx="146" cy="86" rx="38" ry="20" fill="#d9eeff" fillOpacity=".8" style={{ originX: "108px", originY: "120px" }} animate={{ rotate: [14, -6, 14] }} transition={{ duration: .45, repeat: Infinity }} />
          <rect x="128" y="128" width="46" height="62" rx="16" fill="#3b2a1d" /><rect x="136" y="150" width="30" height="18" rx="6" fill="#5a4030" />
          <ellipse cx="108" cy="158" rx="50" ry="56" fill="url(#hd)" />
          <g clipPath="url(#bb)" fill="#17110a"><rect x="50" y="150" width="120" height="17" /><rect x="50" y="180" width="120" height="17" /></g>
          <path d="M92 108 L84 84" stroke="#17110a" strokeWidth="4" strokeLinecap="round" /><circle cx="83" cy="82" r="6" fill="#FFC400" />
          <path d="M124 108 L134 84" stroke="#17110a" strokeWidth="4" strokeLinecap="round" /><circle cx="135" cy="82" r="6" fill="#FFC400" />
          <circle cx="108" cy="104" r="46" fill="url(#hd)" />
          <rect x="66" y="92" width="38" height="28" rx="12" fill="#0e0e14" /><rect x="110" y="92" width="38" height="28" rx="12" fill="#0e0e14" />
          <path d="M104 104h6" stroke="#0e0e14" strokeWidth="4" /><path d="M72 98q10-5 22 0" stroke="#fff" strokeOpacity=".5" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M90 130q18 16 36 0" stroke="#8a3d00" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="76" cy="128" r="6" fill="#ff8f6b" fillOpacity=".55" /><circle cx="140" cy="128" r="6" fill="#ff8f6b" fillOpacity=".55" />
          <motion.path d="M150 160 Q186 150 196 118" stroke="#FFC400" strokeWidth="14" strokeLinecap="round" fill="none" animate={{ d: ["M150 160 Q186 150 196 118", "M150 160 Q190 146 202 112", "M150 160 Q186 150 196 118"] }} transition={{ duration: 2.4, repeat: Infinity }} />
        </svg>
      )}
    </motion.div>
  );
}

/** City skyline + crowd silhouette. Deterministic so server and client render the same. */
const cache = new Map<number, ReturnType<typeof build>>();
function build(w: number) {
  let x = 7; const r = () => (x = (x * 16807) % 2147483647) / 2147483647;
  const bs: { x: number; bw: number; bh: number }[] = []; let px = 0;
  while (px < w) { const bw = 16 + r() * 34; bs.push({ x: px, bw, bh: 30 + r() * 62 }); px += bw + 2 + r() * 8; }
  const heads: { x: number; y: number; r: number; row: number }[] = [];
  for (let row = 0; row < 3; row++) for (let hx = -8 + row * 7; hx < w + 10; hx += 15 + r() * 8) heads.push({ x: hx, y: 126 + row * 11 - r() * 5, r: 6 + r() * 2.5, row });
  return { bs, heads };
}
export function Skyline({ className = "", w = 1600 }: { className?: string; w?: number }) {
  if (!cache.has(w)) cache.set(w, build(w));
  const { bs, heads } = cache.get(w)!;
  return (
    <svg viewBox={`0 0 ${w} 150`} preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      <defs><linearGradient id={`hz${w}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff8a3c" stopOpacity="0" /><stop offset="1" stopColor="#ff8a3c" stopOpacity=".32" /></linearGradient></defs>
      <rect x="0" y="40" width={w} height="110" fill={`url(#hz${w})`} />
      {bs.map((b, i) => (<g key={i}><rect x={b.x} y={122 - b.bh} width={b.bw} height={b.bh + 30} fill="var(--sky-building)" />
        {Array.from({ length: Math.floor(b.bh / 11) }).map((_, j) => Array.from({ length: Math.max(1, Math.floor(b.bw / 11)) }).map((__, k) => (
          <rect key={`${j}-${k}`} x={b.x + 4 + k * 10} y={126 - b.bh + j * 11} width="3.5" height="5" fill="var(--sky-window)" opacity={(i + j + k) % 3 ? 0.8 : 0.15} />)))}</g>))}
      {heads.map((h, i) => (<g key={i} fill="var(--crowd)" opacity={1 - h.row * 0.12}>
        <ellipse cx={h.x} cy={h.y + h.r + 7} rx={h.r * 1.7} ry="10" /><circle cx={h.x} cy={h.y} r={h.r} stroke="rgba(255,150,80,.28)" strokeWidth="1" /></g>))}
      <rect x="0" y="146" width={w} height="4" fill="var(--crowd)" />
    </svg>
  );
}

export function HoneyJar() {
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full" aria-hidden>
      <defs><radialGradient id="gl" cx=".5" cy=".5"><stop offset="0" stopColor="#ffc400" stopOpacity=".6" /><stop offset="1" stopColor="#ffc400" stopOpacity="0" /></radialGradient>
        <linearGradient id="jr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFD23F" /><stop offset="1" stopColor="#F59E0B" /></linearGradient></defs>
      <circle cx="110" cy="64" r="56" fill="url(#gl)" />
      <path d="M40 112c-4-26 8-44 26-52-18 2-34 14-36 34zM60 112c10-20 22-26 38-28-16 8-24 18-26 28z" fill="#2f9e5b" opacity=".85" />
      <path d="M180 112c4-26-8-44-26-52 18 2 34 14 36 34zM160 112c-10-20-22-26-38-28 16 8 24 18 26 28z" fill="#2f9e5b" opacity=".85" />
      <rect x="86" y="26" width="48" height="12" rx="4" fill="#8a5a2b" /><rect x="82" y="36" width="56" height="62" rx="22" fill="url(#jr)" />
      <path d="M110 52l9 5v11l-9 5-9-5V57z" fill="#fff" fillOpacity=".4" /><path d="M92 46q-4 20 0 40" stroke="#fff" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M84 36q26 12 52 0" stroke="#d97706" strokeWidth="3" fill="none" />
    </svg>
  );
}

export function Trophy() {
  return (
    <svg viewBox="0 0 90 90" className="h-full w-full" aria-hidden>
      <path d="M24 16h42v22a21 21 0 0 1-42 0z" fill="#FFC400" /><path d="M24 22H10q0 18 16 20M66 22h14q0 18-16 20" stroke="#E8A800" strokeWidth="5" fill="none" />
      <rect x="40" y="58" width="10" height="12" fill="#E8A800" /><rect x="28" y="70" width="34" height="9" rx="3" fill="#B97D00" />
      <path d="M34 22v18" stroke="#fff" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" />
      <motion.path d="M70 8l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#fff" animate={{ opacity: [0, 1, 0], scale: [.6, 1.1, .6] }} style={{ originX: "70px", originY: "16px" }} transition={{ duration: 2.4, repeat: Infinity }} />
    </svg>
  );
}

/** Soft drifting sparkles. Pure CSS, so it costs no JavaScript per frame. */
export function Sparkles({ n = 9 }: { n?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="spark absolute rounded-full bg-[#ffd66b]" style={{ left: `${(i * 37 + 8) % 96}%`, top: `${(i * 53) % 70}%`, width: 2 + (i % 3), height: 2 + (i % 3), animationDelay: `${(i % 6) * 0.7}s`, animationDuration: `${4 + (i % 4)}s` }} />
      ))}
    </div>
  );
}
