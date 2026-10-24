"use client";
import { Component, useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Mascot } from "./Art";

const Bee3D = dynamic(() => import("./Bee3D"), { ssr: false });
class Guard extends Component<{ children: ReactNode }, { bad: boolean }> {
  state = { bad: false }; static getDerivedStateFromError() { return { bad: true }; }
  render() { return this.state.bad ? null : this.props.children; } // no WebGL? the SVG bee simply stays
}

/** SVG bee paints instantly; the 3D bee loads when the browser is idle and fades in on top. */
export default function HeroBee({ className = "", onClick }: { className?: string; onClick?: () => void }) {
  const [mount, setMount] = useState(false); const [live, setLive] = useState(false);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (n: number) => void };
    if (w.requestIdleCallback) { const id = w.requestIdleCallback(() => setMount(true), { timeout: 1500 }); return () => w.cancelIdleCallback?.(id); }
    const t = setTimeout(() => setMount(true), 800); return () => clearTimeout(t);
  }, []);
  return (
    <button type="button" onClick={onClick} aria-label="Ask the bee for a tip" className={`${className} cursor-pointer`}>
      <Mascot className={`absolute inset-0 transition-opacity duration-700 ${live ? "opacity-0" : "opacity-100"}`} />
      {mount && <Guard><Bee3D onReady={() => setLive(true)} /></Guard>}
    </button>
  );
}
