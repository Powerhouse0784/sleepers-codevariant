import type { ReactNode } from "react";

/** Rounded pointy-top hexagon, the hive's building block. `from`/`to` make the fill gradient. */
export default function Hex({ size = 48, from, to, stroke, glow, children, className = "" }: { size?: number; from: string; to: string; stroke?: string; glow?: string; children?: ReactNode; className?: string }) {
  const id = `hx${from.replace(/\W/g, "")}${to.replace(/\W/g, "")}`;
  return (
    <span className={`relative inline-grid shrink-0 place-items-center ${className}`} style={{ width: size, height: size * 1.12, filter: glow ? `drop-shadow(0 0 ${size / 5}px ${glow})` : undefined }}>
      <svg viewBox="0 0 100 112" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={from} /><stop offset="1" stopColor={to} /></linearGradient></defs>
        <path d="M50 8 L90 31 V81 L50 104 L10 81 V31 Z" fill={`url(#${id})`} stroke={stroke ?? from} strokeWidth="9" strokeLinejoin="round" />
        <path d="M50 8 L90 31" stroke="#fff" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
      <span className="relative z-10 grid place-items-center text-center">{children}</span>
    </span>
  );
}
