"use client";
import { useEffect, useState } from "react";
import { animate } from "motion/react";

export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => { const c = animate(0, to, { duration: 1.1, ease: "easeOut", onUpdate: (x) => setV(Math.round(x)) }); return () => c.stop(); }, [to]);
  return <>{v}{suffix}</>;
}
export function ago(iso: string, nowMs: number) {
  const m = Math.max(0, (nowMs - Date.parse(iso)) / 6e4);
  if (m < 1) return "just now"; if (m < 60) return `${Math.floor(m)} min ago`;
  const h = m / 60; if (h < 24) return `${Math.floor(h)} ${Math.floor(h) === 1 ? "hour" : "hours"} ago`;
  const d = Math.floor(h / 24); return `${d} ${d === 1 ? "day" : "days"} ago`;
}
