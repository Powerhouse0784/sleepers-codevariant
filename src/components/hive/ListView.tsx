"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lightbulb, UserRound, CheckSquare, FileText, Pin, Archive, RotateCw } from "lucide-react";
import { getMomentum } from "@/features/momentum/momentum";
import type { Cell } from "@/types";
import MomentumBadge from "../MomentumBadge";
import { useStore, useUI } from "@/lib/store";
import Draggable from "../canvas/Draggable";
import { hiveCellCard } from "./HiveZones";
import { ActionIntentCard } from "../canvas/ActionIntent";

const KI = { idea: Lightbulb, person: UserRound, action: CheckSquare, note: FileText } as const;
const SORTS = { hottest: "Hottest first", coldest: "Coldest first", newest: "Newest", az: "A to Z" } as const;
type Sort = keyof typeof SORTS;

/** List with sorting and bulk actions. Reviving many items still needs one deliberate next step. */
export default function ListView({ cells, now }: { cells: Cell[]; now: number }) {
  const { touchMany, archiveMany } = useStore(); const { select, toast, celebrate } = useUI();
  const [sort, setSort] = useState<Sort>("hottest"); const [sel, setSel] = useState<string[]>([]); const [step, setStep] = useState("");
  const rows = useMemo(() => [...cells].sort((a, b) => {
    if (sort === "az") return a.title.localeCompare(b.title);
    if (sort === "newest") return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    const d = getMomentum(b, now).heat - getMomentum(a, now).heat; return sort === "hottest" ? d : -d;
  }), [cells, sort, now]);
  const ids = sel.filter((id) => cells.some((c) => c.id === id));
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <label className="flex items-center gap-2 text-xs text-mute">Sort <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-lg border border-line bg-transparent px-2 py-1 text-xs text-text">{Object.entries(SORTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
        <button onClick={() => setSel(ids.length === rows.length ? [] : rows.map((c) => c.id))} className="ml-auto text-xs text-mute hover:text-text">{ids.length === rows.length && rows.length ? "Clear selection" : "Select all"}</button>
      </div>
      <AnimatePresence>{ids.length > 0 && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-2 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-honey/40 bg-honey/10 p-2.5">
            <span className="text-xs font-semibold">{ids.length} selected</span>
            <input value={step} onChange={(e) => setStep(e.target.value)} aria-label="Next step for all selected items" placeholder="One next step for all of them" className="min-w-[160px] flex-1 rounded-lg border border-line bg-ink px-2.5 py-1.5 text-xs" />
            <ActionIntentCard label="Revive selected items" hint="Record a next step and revive selected items" onExecute={() => { if (!step.trim()) { toast("Add a next step first."); return; } touchMany(ids, `Revived: ${step.trim()}`, now); celebrate(); toast(`Revived ${ids.length} ${ids.length === 1 ? "item" : "items"}.`); setSel([]); setStep(""); }}><div className={`btn-gold inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs ${!step.trim() ? "opacity-50" : ""}`}><RotateCw size={13} aria-hidden /> Revive</div></ActionIntentCard>
            <ActionIntentCard label="Archive selected items" hint="Archive the selected items" onExecute={() => { archiveMany(ids, now); toast(`Archived ${ids.length}.`); setSel([]); }}><div className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs"><Archive size={13} aria-hidden /> Archive</div></ActionIntentCard>
          </div></motion.div>)}</AnimatePresence>
      <ul className="divide-y divide-line">
        {rows.map((c) => { const m = getMomentum(c, now), I = KI[c.kind]; return (
          <li key={c.id} className="flex items-center gap-2 px-1">
            <input type="checkbox" checked={sel.includes(c.id)} onChange={() => toggle(c.id)} aria-label={`Select ${c.title}`} className="h-4 w-4 accent-[#FFC629]" />
            <Draggable label={c.title} payload={() => hiveCellCard(c)} className="min-w-0 flex-1"><div className="flex min-w-0 items-center gap-3 px-1.5 py-3 text-left hover:bg-white/5"><MomentumBadge state={m.state} /><I size={14} className="shrink-0 text-mute" aria-hidden />
              <span className="flex-1 truncate text-sm">{c.pinned && <Pin size={12} className="mr-1 inline text-honey" aria-label="Pinned" />}{c.title}</span><span className="hidden text-xs text-mute md:block">{m.reason}</span><span className="text-[10px] text-mute/70">Drag</span></div></Draggable>
          </li>); })}
      </ul>
    </div>
  );
}
