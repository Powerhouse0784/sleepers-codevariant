"use client";
import { motion } from "motion/react";
import { Flame, Sun, Snowflake, Ghost } from "lucide-react";
import type { MomentumState } from "@/features/momentum/momentum";
import { STATE_COLOR } from "../MomentumBadge";
import { BeeLogo } from "../Art";
import { CountUp } from "../dashboard/bits";

const R = 66, W = Math.sqrt(3) * R;
const pts = (r: number) => Array.from({ length: 6 }, (_, i) => { const a = (Math.PI / 180) * (60 * i - 30); return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`; }).join(" ");
const SLOT: Record<MomentumState | "total", [number, number]> = { hot: [-W / 2, -1.5 * R], warm: [W / 2, -1.5 * R], total: [0, 0], cooling: [-W / 2, 1.5 * R], cold: [W / 2, 1.5 * R] };
const META = { hot: { I: Flame, l: "Hot" }, warm: { I: Sun, l: "Warm" }, cooling: { I: Snowflake, l: "Cooling" }, cold: { I: Ghost, l: "Cold" } } as const;
const LATTICE = (() => { const o: [number, number][] = []; for (let r = -2; r <= 2; r++) for (let q = -5; q <= 5; q++) { const x = W * (q + r / 2), y = 1.5 * R * r; if (!Object.values(SLOT).some(([sx, sy]) => Math.hypot(sx - x, sy - y) < 10) && Math.abs(x) < 330) o.push([x, y]); } return o; })();

export default function HexOverview({ counts, selected, onPick }: { counts: Record<MomentumState | "total", number>; selected: MomentumState | null; onPick: (s: MomentumState | null) => void }) {
  return (
    <svg viewBox="-300 -180 600 360" className="mx-auto h-auto w-full max-w-[640px] overflow-hidden" role="group" aria-label="Momentum overview. Choose a state to see its items.">
      {LATTICE.map(([x, y], i) => <polygon key={i} points={pts(R - 4)} transform={`translate(${x} ${y})`} fill="none" stroke="var(--line)" strokeOpacity=".6" strokeWidth="1.5" />)}
      {LATTICE.filter((_, i) => i % 7 === 3).map(([x, y], i) => <polygon key={`e${i}`} points={pts(R - 4)} transform={`translate(${x} ${y})`} fill="#FF477E" fillOpacity=".07" stroke="#FF477E" strokeOpacity=".25" />)}
      {(["hot", "warm", "cooling", "cold"] as const).map((s, i) => {
        const [x, y] = SLOT[s], { I, l } = META[s], c = STATE_COLOR[s], on = selected === s;
        return (
          <motion.g key={s} transform={`translate(${x} ${y})`} role="button" tabIndex={0} aria-pressed={on} aria-label={`${l}: ${counts[s]} items`} className="cell"
            onClick={() => onPick(on ? null : s)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(on ? null : s); } }}
            initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.05 }} transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 240, damping: 18 }}>
            <polygon className="body" points={pts(R - 4)} style={{ fill: `color-mix(in srgb, ${c} ${on ? 24 : 12}%, var(--surface))`, filter: `drop-shadow(0 0 ${on ? 18 : 9}px ${c}${on ? "" : "88"})` }} stroke={c} strokeWidth={on ? 4 : 3} />
            <I x={-11} y={-44} width={22} height={22} color={c} aria-hidden />
            <text y="10" textAnchor="middle" fontSize="34" fontWeight="700" fill="var(--text)"><CountUp to={counts[s]} /></text>
            <text y="30" textAnchor="middle" fontSize="12" fill="var(--text)" opacity=".85">{l}</text>
          </motion.g>);
      })}
      <motion.g transform="translate(0 0)" role="button" tabIndex={0} aria-label={`Total: ${counts.total} items. Show all.`} className="cell" onClick={() => onPick(null)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(null); } }} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: [1, 1.02, 1] }} whileHover={{ scale: 1.05 }}
        transition={{ opacity: { duration: 0.4 }, scale: { duration: 4, repeat: Infinity } }}>
        <polygon className="body" points={pts(R + 2)} style={{ fill: "color-mix(in srgb, #FFC629 10%, var(--surface))", filter: "drop-shadow(0 0 16px rgba(255,198,41,.6))" }} stroke="#FFC629" strokeWidth="4" />
        <g transform="translate(-17 -52)"><BeeLogo size={34} /></g>
        <text y="12" textAnchor="middle" fontSize="38" fontWeight="700" fill="var(--text)"><CountUp to={counts.total} /></text>
        <text y="32" textAnchor="middle" fontSize="12" fill="var(--text)" opacity=".85">Total</text>
      </motion.g>
    </svg>
  );
}
