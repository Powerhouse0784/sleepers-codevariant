"use client";
import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, Star, Clock, Eye, Grid2x2, X, SearchX, BookOpenCheck } from "lucide-react";
import { useKb } from "@/features/knowledge/store";
import { ARTICLES, CATS, FEATURED, byId, catOf, fmtViews, searchArticles, type Article, type CatId } from "@/features/knowledge/articles";
import KbHero from "./KbHero";
import ArticleReader from "./ArticleReader";
import { SupportDialog, VideoDialog } from "./Dialogs";
import { QuickLinks, Popular, ArtPanel, type Mode } from "./RightRail";
import { CAT_ICON, chip } from "./icons";
import Hex from "../events/Hex";

const PAGE = 10;
const ORDER = Object.fromEntries(CATS.map((c, i) => [c.id, i]));

function Row({ a, i, views, onOpen }: { a: Article; i: number; views: number; onOpen: () => void }) {
  const cat = catOf(a.cat), I = CAT_ICON[a.cat];
  return (
    <motion.li initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.045 }}>
      <button onClick={onOpen} className="group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 sm:gap-4" style={{ borderColor: `${cat.color}40`, backgroundImage: `linear-gradient(90deg, ${cat.color}1c, transparent 55%)` }}>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl sm:h-[52px] sm:w-[52px]" style={chip(cat.color)}><I size={23} color="#fff" aria-hidden /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold leading-tight">{a.title}</span>
          <span className="mt-1 line-clamp-2 block text-[12px] leading-snug text-mute">{a.blurb}</span>
          <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-mute sm:hidden"><span className="rounded-full border px-2 py-0.5" style={{ color: cat.color, borderColor: `${cat.color}77` }}>{cat.short}</span><span className="flex items-center gap-1"><Clock size={11} aria-hidden />{a.mins} min read</span><span className="flex items-center gap-1"><Eye size={11} aria-hidden />{fmtViews(views)}</span></span>
        </span>
        <span className="hidden shrink-0 flex-col items-start gap-1.5 sm:flex">
          <span className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium" style={{ color: cat.color, borderColor: `${cat.color}88`, background: `${cat.color}14` }}>{cat.short}</span>
          <span className="flex items-center gap-4 text-[11px] text-mute"><span className="flex items-center gap-1.5"><Clock size={12} aria-hidden />{a.mins} min read</span><span className="flex w-14 items-center gap-1.5"><Eye size={12} aria-hidden />{fmtViews(views)}</span></span>
        </span>
        <ChevronRight size={18} className="shrink-0 text-mute transition group-hover:translate-x-0.5" aria-hidden />
      </button>
    </motion.li>
  );
}

export default function KnowledgeBase() {
  const open = useKb((s) => s.open), opens = useKb((s) => s.opens);
  const [q, setQ] = useState(""); const [cat, setCat] = useState<CatId | null>(null); const [mode, setMode] = useState<Mode>("featured"); const [limit, setLimit] = useState(PAGE);
  const list = useRef<HTMLElement>(null);
  const views = (a: Article) => a.views + (opens[a.id] ?? 0);
  const counts = useMemo(() => Object.fromEntries(CATS.map((c) => [c.id, ARTICLES.filter((a) => a.cat === c.id).length])) as Record<CatId, number>, []);

  const scroll = () => requestAnimationFrame(() => list.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  const pick = (c: CatId | null) => { setCat(c === cat ? null : c); setMode("featured"); setLimit(PAGE); if (c) scroll(); };
  const pickMode = (m: Mode) => { setMode(m); setCat(null); setQ(""); setLimit(PAGE); scroll(); };
  const reset = () => { setQ(""); setCat(null); setMode("featured"); setLimit(PAGE); };

  const view = useMemo(() => {
    const inCat = (a: Article) => !cat || a.cat === cat;
    if (q.trim()) { const r = searchArticles(q).filter(inCat); return { title: `Search results for “${q.trim()}”`, sub: `${r.length} ${r.length === 1 ? "article" : "articles"}`, items: r, paged: true }; }
    if (cat) { const r = ARTICLES.filter((a) => a.cat === cat); return { title: catOf(cat).label, sub: `${r.length} articles`, items: r, paged: true }; }
    if (mode === "faq") { const r = ARTICLES.filter((a) => a.faq); return { title: "Frequently asked questions", sub: `${r.length} articles`, items: r, paged: true }; }
    if (mode === "all") { const r = [...ARTICLES].sort((a, b) => ORDER[a.cat] - ORDER[b.cat]); return { title: "All articles", sub: `${r.length} articles`, items: r, paged: true }; }
    return { title: "Featured Articles", sub: "", items: FEATURED.map((id) => byId(id)!).filter(Boolean), paged: false };
  }, [q, cat, mode]);
  const shown = view.paged ? view.items.slice(0, limit) : view.items;
  const filtered = view.title !== "Featured Articles";

  return (
    <div className="mx-auto max-w-[1360px] pb-4">
      <div className="grid items-start gap-4 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          <KbHero query={q} onQuery={(v) => { setQ(v); setLimit(PAGE); }} onSubmit={scroll} onTopic={(c) => { setQ(""); pick(c); }} />

          <section id="browse" className="card scroll-mt-24 p-4 md:p-5" aria-labelledby="browse-h">
            <div className="flex items-center justify-between gap-3">
              <h2 id="browse-h" className="flex items-center gap-3 text-[18px] font-semibold"><Hex size={26} from="#FFD84D" to="#F2A100"><span className="block h-2 w-2 rounded-sm bg-[#1a1304]" /></Hex> Browse by Category</h2>
              <button onClick={() => pickMode("all")} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline [[data-theme=dark]_&]:text-[#4DA3FF]"><span className="hidden sm:inline">View All Categories</span><span className="sm:hidden">View all</span> <ChevronRight size={14} aria-hidden /></button>
            </div>
            <ul className="mt-4 grid grid-cols-3 gap-2.5 xl:grid-cols-6">
              {CATS.map((c, i) => { const I = CAT_ICON[c.id]; const on = cat === c.id; return (
                <motion.li key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                  <button onClick={() => pick(c.id)} aria-pressed={on} className="flex h-full w-full flex-col items-center gap-2 rounded-2xl border px-1 py-4 text-center sm:px-2 transition hover:-translate-y-0.5 aria-pressed:ring-2 aria-pressed:ring-honey"
                    style={{ borderColor: `${c.color}55`, backgroundImage: `radial-gradient(120px 70px at 50% 0%, ${c.color}30, transparent 75%)` }}>
                    <span className="grid h-12 w-12 place-items-center rounded-full" style={{ ...chip(c.color), boxShadow: `0 0 0 4px ${c.color}22, 0 10px 22px -8px ${c.color}` }}><I size={22} color="#fff" aria-hidden /></span>
                    <span className="max-w-full break-words text-[11.5px] font-semibold leading-tight sm:text-[12.5px]">{c.label}</span>
                    <span className="text-[11px] text-mute">{counts[c.id]} articles</span>
                  </button></motion.li>); })}
            </ul>
          </section>

          <section ref={list} className="card scroll-mt-24 p-4 md:p-5" aria-labelledby="list-h">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="list-h" className="flex items-center gap-3 text-[18px] font-semibold"><Star size={22} className="fill-honey text-honey" aria-hidden /> {view.title}{view.sub && <span className="text-[12px] font-normal text-mute">{view.sub}</span>}</h2>
              {filtered ? <button onClick={reset} className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-[12px] text-mute hover:text-[var(--text)]"><X size={13} aria-hidden /> Clear</button>
                : <button onClick={() => pickMode("all")} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline [[data-theme=dark]_&]:text-[#4DA3FF]">View All <ChevronRight size={14} aria-hidden /></button>}
            </div>
            <p className="sr-only" role="status">{shown.length} articles shown</p>
            {shown.length === 0 ? (
              <div className="grid place-items-center gap-3 px-4 py-12 text-center">
                <SearchX size={30} className="text-mute" aria-hidden />
                <p className="text-[15px] font-semibold">No articles match “{q.trim()}”</p>
                <p className="max-w-sm text-[13px] text-mute">Try fewer or different words, pick a category, or ask support.</p>
                <div className="flex gap-2"><button onClick={reset} className="btn-blue px-4 py-2 text-[13px]">Clear search</button><button onClick={() => useKb.getState().setSupport(true)} className="btn-gold px-4 py-2 text-[13px]">Contact support</button></div>
              </div>
            ) : (
              <ul className="mt-4 space-y-2.5">{shown.map((a, i) => <Row key={a.id} a={a} i={i} views={views(a)} onOpen={() => open(a.id)} />)}</ul>)}
            {view.paged && view.items.length > limit && <button onClick={() => setLimit(limit + PAGE)} className="btn-blue mx-auto mt-4 flex items-center gap-2 px-5 py-2.5 text-[13px]"><Grid2x2 size={14} aria-hidden /> Show {Math.min(PAGE, view.items.length - limit)} more</button>}
            {!filtered && <p className="mt-4 flex items-center gap-2 text-[12px] text-mute"><BookOpenCheck size={14} aria-hidden /> {ARTICLES.length} articles in total. Views include your own reads on this device.</p>}
          </section>
        </div>

        <aside className="space-y-4" aria-label="Help shortcuts">
          <QuickLinks onMode={pickMode} /><Popular /><ArtPanel />
        </aside>
      </div>
      <ArticleReader /><SupportDialog /><VideoDialog />
    </div>
  );
}
