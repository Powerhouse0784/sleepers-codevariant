"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { LayoutGrid, ChevronDown, SearchX, RotateCcw, type LucideIcon } from "lucide-react";
import { useIdeas, useIdeasUI } from "@/lib/ideasStore";
import { useStore } from "@/lib/store";
import { useNow, useMedia } from "@/lib/hooks";
import { CATEGORIES, CATEGORY_LABEL, SCOPE_LABEL, inScope, matches, type Category } from "@/features/ideas/ideas";
import IdeasHero from "./IdeasHero";
import IdeaCard from "./IdeaCard";
import { CATEGORY_ICON } from "./IdeaCover";
import { TopIdeas, IdeaStats, Promo, TopIdeasDialog } from "./Rail";

const PAGE = 6;

export default function Ideas() {
  const ideas = useIdeas((s) => s.ideas); const userName = useStore((s) => s.userName);
  const { q, category, scope, setCategory, setScope, clearFilters, setShare } = useIdeasUI();
  const now = useNow(); const wide = useMedia("(min-width: 1280px)"); const [limit, setLimit] = useState(PAGE); const filters = useRef<HTMLDivElement>(null);
  useEffect(() => setLimit(PAGE), [q, category, scope]);

  const shown = useMemo(() => ideas.filter((i) => inScope(i, scope) && (category === "all" || i.category === category) && matches(i, q, userName)).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)), [ideas, scope, category, q, userName]);
  const visible = shown.slice(0, limit); const anyFilter = q.trim() || category !== "all" || scope !== "all";
  const explore = () => filters.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const chips: { k: Category | "all"; l: string; I: LucideIcon }[] = [{ k: "all", l: "All Ideas", I: LayoutGrid }, ...CATEGORIES.map((c) => ({ k: c, l: CATEGORY_LABEL[c], I: CATEGORY_ICON[c] }))];

  const rail = <><TopIdeas all={ideas} /><IdeaStats all={ideas} /><Promo onShare={() => setShare(true)} /></>;
  return (
    <div className="mx-auto max-w-[1320px] space-y-4 pb-4">
      <IdeasHero onShare={() => setShare(true)} onExplore={explore} />
      <div className={wide ? "grid grid-cols-[1fr_300px] items-start gap-4" : ""}>
        <div className="min-w-0">
          <div ref={filters} className="-mx-1 flex scroll-mt-20 gap-2 overflow-x-auto px-1 py-1 scroll-thin" role="group" aria-label="Filter by category">
            {chips.map(({ k, l, I }) => <button key={k} aria-pressed={category === k} onClick={() => setCategory(k)} className="pill inline-flex shrink-0 items-center gap-1.5 px-3.5 py-2 text-[12px]"><I size={14} aria-hidden />{l}</button>)}
          </div>
          {(scope !== "all" || q.trim()) && (
            <p className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-mute">
              {scope !== "all" && <span className="rounded-full border border-honey/60 bg-honey/10 px-3 py-1 font-medium text-honey">{SCOPE_LABEL[scope]}</span>}
              {q.trim() && <span>Matching &ldquo;{q.trim()}&rdquo;</span>}
              <button onClick={clearFilters} className="inline-flex items-center gap-1 underline-offset-2 hover:text-[var(--text)] hover:underline"><RotateCcw size={12} aria-hidden /> Clear</button></p>)}
          <p className="sr-only" role="status">{shown.length} ideas shown</p>
          {shown.length === 0 ? (
            <div className="card mt-3 grid place-items-center gap-3 px-6 py-14 text-center"><SearchX size={30} className="text-mute" aria-hidden />
              <p className="text-[15px] font-semibold">{q.trim() ? `Nothing matches “${q.trim()}”` : "No ideas here yet"}</p>
              <p className="max-w-xs text-[13px] text-mute">{anyFilter ? "Try another category or clear the filters." : "Be the first to share one."}</p>
              <div className="flex gap-2">{anyFilter && <button onClick={clearFilters} className="btn-blue px-4 py-2 text-[13px]">Clear filters</button>}<button onClick={() => setShare(true)} className="btn-gold px-4 py-2 text-[13px]">Share an idea</button></div></div>
          ) : (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence initial={false}>{visible.map((i, k) => <li key={i.id} className="min-w-0"><IdeaCard idea={i} all={ideas} now={now} index={k} /></li>)}</AnimatePresence>
            </ul>)}
          {shown.length > limit && <button onClick={() => setLimit(limit + PAGE)} className="btn-blue mx-auto mt-4 flex items-center gap-2 px-5 py-2.5 text-[13px]">Show {Math.min(PAGE, shown.length - limit)} more <ChevronDown size={14} aria-hidden /></button>}
        </div>
        {wide && <aside className="sticky top-20 space-y-3" aria-label="Top ideas and your stats">{rail}</aside>}
      </div>
      {!wide && <div className="grid items-start gap-3 md:grid-cols-2"><div className="space-y-3">{<TopIdeas all={ideas} />}<IdeaStats all={ideas} /></div><Promo onShare={() => setShare(true)} /></div>}
      <TopIdeasDialog all={ideas} />
    </div>
  );
}
