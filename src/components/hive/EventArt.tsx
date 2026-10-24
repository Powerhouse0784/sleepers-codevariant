/** Generated stage-light scene so event cards feel alive without photo assets. Deterministic per event. */
const HUES: [string, string][] = [["#5b2cff", "#ff4fa3"], ["#ff8a3c", "#7a2cff"], ["#1a8cff", "#7a2cff"], ["#ff6a3c", "#2b5bff"]];
export default function EventArt({ seed, className = "" }: { seed: string; className?: string }) {
  let h = 0; for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const [a, b] = HUES[h % HUES.length]; const id = `ea${h}`;
  let x = (h % 2147483646) + 1; const r = () => (x = (x * 16807) % 2147483647) / 2147483647;
  const heads = Array.from({ length: 44 }, (_, i) => ({ x: (i % 22) * 11 + (i > 21 ? 5 : 0) - 4, y: i > 21 ? 90 : 80, r: 5 + r() * 2 }));
  const dots = Array.from({ length: 9 }, () => ({ x: r() * 240, y: 8 + r() * 40, r: 1.5 + r() * 3 }));
  return (
    <svg viewBox="0 0 240 100" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs><linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".6" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
      <rect width="240" height="100" fill={`url(#${id}b)`} />
      {[30, 90, 150, 210].map((bx, i) => <polygon key={i} points={`${bx},0 ${bx + 14},0 ${bx + 52 - i * 18},78 ${bx - 38 + i * 18},78`} fill={`url(#${id}l)`} opacity=".35" />)}
      {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#fff" opacity=".45" />)}
      <rect y="60" width="240" height="40" fill="#0a0f24" opacity=".35" />
      {heads.map((p, i) => <g key={i} fill="#080c1f"><ellipse cx={p.x} cy={p.y + p.r + 6} rx={p.r * 1.7} ry="9" /><circle cx={p.x} cy={p.y} r={p.r} /></g>)}
    </svg>
  );
}
