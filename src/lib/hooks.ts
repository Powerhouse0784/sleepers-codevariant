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
