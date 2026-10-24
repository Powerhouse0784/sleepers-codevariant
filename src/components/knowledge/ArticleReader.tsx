"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { X, Clock, Eye, ThumbsUp, ThumbsDown, Lightbulb, ArrowRight } from "lucide-react";
import { useKb } from "@/features/knowledge/store";
import { ARTICLES, byId, catOf, fmtViews } from "@/features/knowledge/articles";
import { CAT_ICON, chip } from "./icons";

export default function ArticleReader() {
  const id = useKb((s) => s.articleId), close = useKb((s) => s.close), open = useKb((s) => s.open), vote = useKb((s) => s.vote), setSupport = useKb((s) => s.setSupport);
  const opens = useKb((s) => s.opens), votes = useKb((s) => s.votes); const router = useRouter();
  const box = useRef<HTMLElement>(null); const closeBtn = useRef<HTMLButtonElement>(null);
  // Escape works even if focus was lost (e.g. after switching to a related article); focus returns to the reader and it scrolls to the top.
  useEffect(() => {
    if (!id) return;
    const f = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", f); closeBtn.current?.focus(); box.current?.scrollTo({ top: 0 });
    return () => window.removeEventListener("keydown", f);
  }, [id, close]);
  const art = id ? byId(id) : undefined; const cat = art ? catOf(art.cat) : null; const Icon = art ? CAT_ICON[art.cat] : null;
  const related = art ? ARTICLES.filter((x) => x.cat === art.cat && x.id !== art.id).slice(0, 3) : [];
  return (
    <AnimatePresence>
      {art && cat && Icon && (
        <>
          <motion.div key="scrim" className="fixed inset-0 z-30 bg-black/55" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.article key="reader" ref={box} role="dialog" aria-modal="true" aria-labelledby="art-title"
            className="fixed inset-x-0 bottom-0 z-40 max-h-[92dvh] overflow-y-auto rounded-t-3xl border border-line bg-panel p-6 md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[480px] md:rounded-none md:rounded-l-3xl"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl" style={chip(cat.color)}><Icon size={22} color="#fff" aria-hidden /></span>
              <button ref={closeBtn} onClick={close} aria-label="Close article" className="rounded-full p-2 text-mute hover:bg-white/5"><X size={20} /></button>
            </div>
            <span className="mt-4 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium" style={{ color: cat.color, borderColor: `${cat.color}88`, background: `${cat.color}18` }}>{cat.label}</span>
            <h2 id="art-title" className="mt-2 text-[24px] font-semibold leading-tight">{art.title}</h2>
            <p className="mt-2 flex items-center gap-4 text-[12px] text-mute"><span className="flex items-center gap-1.5"><Clock size={13} aria-hidden />{art.mins} min read</span><span className="flex items-center gap-1.5"><Eye size={13} aria-hidden />{fmtViews(art.views + (opens[art.id] ?? 0))} views</span></p>
            <p className="mt-4 text-[15px] leading-relaxed">{art.blurb}</p>

            <h3 className="mt-6 text-sm font-semibold">Steps</h3>
            <ol className="mt-3 space-y-3">
              {art.steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-[14px] leading-relaxed"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-bold text-[var(--on-gold)]" style={{ background: "linear-gradient(180deg,#FFD23F,#FFC400)" }}>{i + 1}</span><span>{s}</span></li>))}
            </ol>
            {art.tip && <p className="mt-5 flex gap-3 rounded-2xl border border-honey/40 bg-honey/10 p-3.5 text-[13px] leading-relaxed"><Lightbulb size={17} className="mt-0.5 shrink-0 text-honey" aria-hidden /><span><strong className="font-semibold">Tip. </strong>{art.tip}</span></p>}
            {art.cta && <button onClick={() => { close(); if (art.cta!.href === "#support") setSupport(true); else router.push(art.cta!.href); }} className="btn-gold mt-5 inline-flex items-center gap-2 px-4 py-2.5 text-sm">{art.cta.label} <ArrowRight size={15} aria-hidden /></button>}

            <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-line pt-4">
              <p className="text-[13px] text-mute">Was this helpful?</p>
              {([["up", ThumbsUp, "Yes"], ["down", ThumbsDown, "No"]] as const).map(([v, I, l]) => (
                <button key={v} onClick={() => vote(art.id, v)} aria-pressed={votes[art.id] === v} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12px] text-mute transition aria-pressed:border-honey aria-pressed:bg-honey/15 aria-pressed:text-honey"><I size={14} aria-hidden /> {l}</button>))}
              {votes[art.id] === "down" && <button onClick={() => { close(); setSupport(true); }} className="text-[12px] font-medium text-primary hover:underline [[data-theme=dark]_&]:text-honey">Ask support</button>}
              <span role="status" className="sr-only">{votes[art.id] ? "Thanks for the feedback." : ""}</span>
            </div>

            {related.length > 0 && <>
              <h3 className="mt-6 text-sm font-semibold">Related articles</h3>
              <ul className="mt-2 divide-y divide-line">
                {related.map((r) => <li key={r.id}><button onClick={() => open(r.id)} className="flex w-full items-center justify-between gap-3 py-2.5 text-left text-[13px] hover:text-honey"><span className="min-w-0 truncate">{r.title}</span><ArrowRight size={14} className="shrink-0 text-mute" aria-hidden /></button></li>)}
              </ul></>}
          </motion.article>
        </>)}
    </AnimatePresence>
  );
}
