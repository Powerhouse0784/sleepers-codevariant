"use client";
import { useEffect, useMemo, useState } from "react";
import { useStore, useUI } from "./store";

/** Current time, shifted by the time-travel slider. Ticks each minute. */
export function useNow() {
  const offset = useUI((s) => s.offsetDays);
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((n) => n + 1), 60_000); return () => clearInterval(t); }, []);
  return useMemo(() => Date.now() + offset * 864e5, [offset, tick]); // eslint-disable-line react-hooks/exhaustive-deps
}
export function useActiveCells() {
  const cells = useStore((s) => s.cells);
  return useMemo(() => cells.filter((c) => !c.archived && !c.done), [cells]);
}

/** Types text out letter by letter. Pass enabled=false (calm mode) to show it instantly. */
export function useTypewriter(text: string, enabled = true) {
  const [n, setN] = useState(enabled ? 0 : text.length);
  useEffect(() => {
    if (!enabled) { setN(text.length); return; }
    setN(0); let i = 0;
    const t = setInterval(() => { i++; setN(i); if (i >= text.length) clearInterval(t); }, 22);
    return () => clearInterval(t);
  }, [text, enabled]);
  return text.slice(0, n);
}

/** Client-only media query. Safe here because the Shell renders pages only after hydration. */
export function useMedia(query: string) {
  const [m, setM] = useState(() => (typeof window === "undefined" ? false : window.matchMedia(query).matches));
  useEffect(() => { const q = window.matchMedia(query); const f = () => setM(q.matches); f(); q.addEventListener("change", f); return () => q.removeEventListener("change", f); }, [query]);
  return m;
}
