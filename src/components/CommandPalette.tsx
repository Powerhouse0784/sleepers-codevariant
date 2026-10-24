"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Search, Lightbulb, UserRound, CheckSquare, FileText, ArrowRight, Moon, FastForward, RotateCcw, Leaf, type LucideIcon } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { useIdeas, useIdeasUI } from "@/lib/ideasStore";
import { usePeople, usePeopleUI } from "@/lib/peopleStore";
import { useActions } from "@/lib/actionsStore";

type Cmd = { id: string; label: string; hint?: string; Icon: LucideIcon; run: () => void };
const PAGES: [string, string][] = [["Daily Buzz", "/"], ["Momentum Hive", "/hive"], ["Events", "/events"], ["Ideas", "/ideas"], ["People", "/people"], ["Action Center", "/actions"], ["Calendar", "/calendar"], ["Knowledge Base", "/knowledge"], ["Settings", "/settings"]];

/** Ctrl/Cmd+K. Search items, jump to a screen, capture, or flip a setting without touching the mouse. */
export default function CommandPalette() {
  const open = useUI((s) => s.paletteOpen), setOpen = useUI((s) => s.setPalette);
  const { cells, theme, setTheme, calm, setCalm, resetDemo } = useStore();
  const { setOffset, offsetDays, setCapture, select, toast } = useUI(); const router = useRouter();
  const [q, setQ] = useState(""); const [i, setI] = useState(0);

  useEffect(() => {
    const f = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(!useUI.getState().paletteOpen); } };
    window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f);
  }, [setOpen]);
  useEffect(() => { if (open) { setQ(""); setI(0); } }, [open]);

  const cmds = useMemo<Cmd[]>(() => [
    { id: "ci", label: "Capture an idea", Icon: Lightbulb, run: () => setCapture(true, "idea") },
    { id: "si", label: "Start a new idea note", hint: "Ideas", Icon: Lightbulb, run: () => { router.push("/ideas"); useIdeasUI.getState().setShare(true); } },
    { id: "jc", label: "Join or edit your community profile", hint: "People", Icon: UserRound, run: () => { router.push("/people"); usePeopleUI.getState().setProfile(true); } },
    { id: "cp", label: "Save a contact", Icon: UserRound, run: () => setCapture(true, "person") },
    { id: "ca", label: "Add an action item", Icon: CheckSquare, run: () => setCapture(true, "action") },
    { id: "cn", label: "Capture a note", Icon: FileText, run: () => setCapture(true, "note") },
    ...PAGES.map(([l, h]): Cmd => ({ id: h, label: `Go to ${l}`, Icon: ArrowRight, run: () => router.push(h) })),
    { id: "th", label: `Switch to ${theme === "dark" ? "light" : "dark"} theme`, Icon: Moon, run: () => setTheme(theme === "dark" ? "light" : "dark") },
    { id: "ff", label: "Fast-forward 7 days", hint: "Time travel", Icon: FastForward, run: () => { setOffset(Math.min(45, offsetDays + 7)); toast("Fast-forwarded. Watch the hive cool."); } },
    { id: "bt", label: "Back to today", hint: "Time travel", Icon: FastForward, run: () => setOffset(0) },
    { id: "cm", label: calm ? "Turn calm mode off" : "Turn calm mode on", hint: "Less motion", Icon: Leaf, run: () => setCalm(!calm) },
    { id: "rs", label: "Reset sample data", Icon: RotateCcw, run: () => { resetDemo(); useIdeas.getState().reset(); usePeople.getState().reset(); useActions.getState().reset(); setOffset(0); toast("Sample data refreshed."); } },
  ], [theme, calm, offsetDays, router, setCapture, setTheme, setCalm, setOffset, resetDemo, toast]);

  const items = useMemo<Cmd[]>(() => {
    const t = q.trim().toLowerCase();
    const found = t ? cells.filter((c) => !c.archived && `${c.title} ${c.note ?? ""}`.toLowerCase().includes(t)).slice(0, 6).map((c): Cmd => ({ id: `cell:${c.id}`, label: c.title, hint: c.kind, Icon: Search, run: () => select(c.id) })) : [];
    return [...found, ...cmds.filter((c) => !t || c.label.toLowerCase().includes(t))];
  }, [q, cmds, cells, select]);
  const run = (c?: Cmd) => { if (!c) return; setOpen(false); c.run(); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/60 p-4 pt-[14vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
          <motion.div role="dialog" aria-modal="true" aria-label="Command palette" onClick={(e) => e.stopPropagation()} className="card w-full max-w-lg overflow-hidden" initial={{ y: -14, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: -10, opacity: 0 }}>
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search size={17} className="text-mute" aria-hidden />
              <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setI(0); }} aria-label="Type a command or search" placeholder="Type a command or search your hive..." className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-mute"
                onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setI((i + 1) % Math.max(1, items.length)); } else if (e.key === "ArrowUp") { e.preventDefault(); setI((i - 1 + items.length) % Math.max(1, items.length)); } else if (e.key === "Enter") run(items[i]); else if (e.key === "Escape") setOpen(false); }} />
              <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[10px] text-mute">Esc</kbd>
            </div>
            <ul role="listbox" className="scroll-thin max-h-[48vh] overflow-y-auto p-1.5">
              {items.length === 0 && <li className="px-3 py-6 text-center text-sm text-mute">Nothing found. Try another word.</li>}
              {items.map((c, k) => (
                <li key={c.id} role="option" aria-selected={k === i}><button onMouseEnter={() => setI(k)} onClick={() => run(c)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${k === i ? "bg-honey/15 text-text" : "text-mute"}`}>
                  <c.Icon size={16} aria-hidden className={k === i ? "text-honey" : ""} /><span className="flex-1 truncate">{c.label}</span>{c.hint && <span className="text-xs capitalize text-mute">{c.hint}</span>}</button></li>))}
            </ul>
          </motion.div>
        </motion.div>)}
    </AnimatePresence>
  );
}
