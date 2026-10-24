"use client";
import { useEffect, useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { useStore } from "@/lib/store";

/**
 * The shared motion layer. One component, mounted once in the Shell, so every screen gets the same feel:
 *  - a scroll progress bar and a slow aurora backdrop that follows the cursor
 *  - a soft spotlight inside whatever card or hero the pointer is over (CSS variables, no re-renders)
 *  - magnetic pull on the gold buttons
 * Everything is skipped for touch devices, reduced motion and Calm mode.
 */
export default function Fx() {
  const calm = useStore((s) => s.calm);
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (calm) return;
    const fine = window.matchMedia("(pointer: fine)").matches, still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || still) return;
    let raf = 0, x = 0, y = 0, target: Element | null = null, mag: HTMLElement | null = null;
    const root = document.documentElement;
    const frame = () => {
      raf = 0;
      glow.current?.style.setProperty("--cx", `${x}px`); glow.current?.style.setProperty("--cy", `${y}px`);
      const t = target;
      if (t) { const r = t.getBoundingClientRect(); (t as HTMLElement).style.setProperty("--mx", `${x - r.left}px`); (t as HTMLElement).style.setProperty("--my", `${y - r.top}px`); }
      if (mag) { const r = mag.getBoundingClientRect(); mag.style.setProperty("--bx", `${Math.max(-5, Math.min(5, (x - (r.left + r.width / 2)) * 0.12))}px`); mag.style.setProperty("--by", `${Math.max(-4, Math.min(4, (y - (r.top + r.height / 2)) * 0.18))}px`); }
    };
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      const el = e.target as Element | null;
      target = el?.closest?.(".card, .hero, .hero-ev, .hero-kb") ?? null;
      const m = (el?.closest?.(".btn-gold") as HTMLElement | null) ?? null;
      if (mag && mag !== m) { mag.style.removeProperty("--bx"); mag.style.removeProperty("--by"); }
      mag = m;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const leave = () => { if (mag) { mag.style.removeProperty("--bx"); mag.style.removeProperty("--by"); mag = null; } };
    window.addEventListener("pointermove", move, { passive: true }); document.addEventListener("pointerleave", leave);
    root.classList.add("fx-on");
    return () => { window.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave); root.classList.remove("fx-on"); if (raf) cancelAnimationFrame(raf); };
  }, [calm]);

  return (
    <>
      <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left" style={{ scaleX: bar, background: "linear-gradient(90deg,#FFC629,#ff7a1f,#8b3dff,#2f8bff)" }} />
      <div ref={glow} aria-hidden className="fx-back pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <span className="fx-blob fx-b1" /><span className="fx-blob fx-b2" /><span className="fx-blob fx-b3" /><span className="fx-cursor" />
      </div>
    </>
  );
}
