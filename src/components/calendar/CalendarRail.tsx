"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarCheck, CalendarDays, CalendarPlus, Trophy, Lightbulb, Star, ArrowRight, MapPin, Clock, Plus, type LucideIcon } from "lucide-react";
import { useUI } from "@/lib/store";
import { useIdeasUI } from "@/lib/ideasStore";
import { useActionsUI } from "@/lib/actionsStore";
import { useCalendarUI } from "@/lib/calendarStore";
import { CAT_COLOR, CAT_LABEL, CAT_TYPE, isPast, itemTime, longDay, past, tileParts, upcoming, type CalItem } from "@/features/calendar/calendar";
import { useStore } from "@/lib/store";
import { Dialog } from "../actions/ActionRail";
import { ActionIntentCard } from "../canvas/ActionIntent";
import Draggable from "../canvas/Draggable";
import { calItemCard } from "./CalendarZones";

export const CatDot = ({ cat }: { cat: CalItem["cat"] }) => <span aria-hidden className="inline-block h-2 w-2 rounded-full" style={{ background: CAT_COLOR[cat], boxShadow: `0 0 8px ${CAT_COLOR[cat]}` }} />;

export function TodayPanel({ now, count }: { now: number; count: number }) {
  return (
    <section className="card p-3.5" aria-labelledby="cal-today">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/60 bg-primary/10 text-primary"><CalendarCheck size={24} aria-hidden /></span>
        <div className="min-w-0 flex-1 leading-tight"><h2 id="cal-today" className="text-[16px] font-semibold">Today</h2><p className="mt-0.5 text-[12px] text-mute">{new Date(now).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p></div>
        {count > 0 && <span className="shrink-0 rounded-full border border-honey/50 bg-honey/10 px-2.5 py-1 text-[11px] font-semibold text-honey">{count} today</span>}
      </div>
      <div className="relative mt-3 flex min-h-[74px] items-center overflow-hidden rounded-xl border border-primary/40 px-3.5" style={{ background: "radial-gradient(160px 80px at 100% 50%, rgba(255,170,40,.18), transparent 70%), linear-gradient(135deg, rgba(35,120,255,.1), transparent 70%)" }}>
        <p className="script max-w-[170px] -rotate-3 text-[22px] leading-[1.05] text-honey">Small steps lead to big dreams!</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/calendar/today-bee.webp" alt="" width={63} height={70} className="absolute bottom-0 right-2 h-[68px] w-auto select-none" draggable={false} />
      </div>
    </section>
  );
}

export function UpcomingPanel({ items, now }: { items: CalItem[]; now: number }) {
  const setUp = useCalendarUI((s) => s.setUpcoming); const next = upcoming(items, now, 5);
  return (
    <section className="card p-3.5" aria-labelledby="cal-upcoming">
      <div className="flex items-center justify-between"><h2 id="cal-upcoming" className="flex items-center gap-2 text-[15px] font-semibold"><CalendarDays size={20} className="text-primary" aria-hidden />Upcoming Events</h2>
        <button onClick={() => setUp(true)} className="inline-flex items-center gap-1 rounded-md text-[12px] font-medium text-primary hover:underline">View All <ArrowRight size={13} aria-hidden /></button></div>
      {next.length === 0 ? <p className="py-6 text-center text-[13px] text-mute">Nothing coming up. Add an event to get started.</p> : (
        <ul className="mt-2 divide-y divide-line">{next.map((i) => { const t = tileParts(Math.max(i.start, now > i.start ? now : i.start)); const c = CAT_COLOR[i.cat];
          return <li key={i.id}><Draggable label={i.title} payload={() => calItemCard(i)} className="w-full"><div className="flex w-full items-center gap-3 rounded-lg py-2 text-left transition hover:bg-white/5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border leading-none" style={{ borderColor: `${c}99`, background: `${c}26`, boxShadow: `0 0 12px ${c}33` }}><span className="text-[17px] font-bold">{t.d}</span><span className="-mt-2 text-[10px] text-mute">{t.m}</span></span>
            <span className="min-w-0 flex-1 leading-tight"><span className="block truncate text-[13px] font-semibold">{i.title}</span><span className="block truncate text-[11px] text-mute">{itemTime(i)}{i.where ? ` • ${i.where}` : ""}</span></span><span className="text-[10px] text-mute/70">Drag</span></div></Draggable></li>; })}</ul>)}
    </section>
  );
}

export function QuickActions({ onToday, onGrid }: { onToday: () => void; onGrid: () => void }) {
  const setCreate = useUI((s) => s.setCreateEvent), router = useRouter();
  const challenge = () => { const u = useActionsUI.getState(); u.setQ(""); u.setFilter("challenge"); u.setExpanded(true); router.push("/actions"); };
  const tile = "flex min-h-[64px] flex-col items-center justify-center gap-1.5 rounded-xl border border-primary/40 px-2 py-2 text-center text-[11.5px] font-medium text-[var(--text)] transition hover:border-primary hover:bg-primary/10";
  const T = ({ I, label, onClick }: { I: LucideIcon; label: string; onClick: () => void }) => <ActionIntentCard label={label} onExecute={onClick} className="w-full"><div className={tile}><I size={20} className="text-[#8fbaff]" aria-hidden />{label}</div></ActionIntentCard>;
  return (
    <section className="card p-3.5" aria-labelledby="cal-quick">
      <h2 id="cal-quick" className="flex items-center gap-2 text-[15px] font-semibold"><Star size={19} className="text-honey" fill="currentColor" aria-hidden />Quick Actions</h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <T I={CalendarPlus} label="Add Event" onClick={() => setCreate(true)} /><T I={Trophy} label="Join Challenge" onClick={challenge} /><T I={Lightbulb} label="Create Idea" onClick={() => useIdeasUI.getState().setShare(true)} />
      </div>
      <div className="mt-2 grid grid-cols-[64px_1fr] gap-2"><T I={CalendarCheck} label="Today" onClick={onToday} /><button onClick={onGrid} className={`${tile} text-[12.5px]`}>View Calendar</button></div>
    </section>
  );
}

export function PromoCard() {
  return (
    <section className="relative isolate min-h-[170px] overflow-hidden rounded-2xl border border-primary/40 p-4 text-white" style={{ background: "radial-gradient(240px 180px at 100% 100%, rgba(120,70,255,.4), transparent 70%), linear-gradient(160deg,#0a1440,#0b0a2a 80%)" }}>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[url('/decor/honeycomb.svg')] bg-[length:200px] bg-left-top bg-no-repeat opacity-50" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/calendar/promo-bee.webp" alt="" width={116} height={153} className="absolute bottom-0 right-0 -z-10 h-full w-auto max-w-none select-none" draggable={false} style={{ maskImage: "linear-gradient(90deg,transparent,#000 30%)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 30%)" }} />
      <p className="script max-w-[130px] -rotate-6 text-[27px] leading-[1.05]">Make It Happen!</p>
      <Link href="/actions" className="btn-gold absolute bottom-4 left-4 inline-flex items-center gap-2 px-3.5 py-2 text-[13px]">Explore Now <ArrowRight size={14} aria-hidden /></Link>
    </section>
  );
}

function Row({ i, now }: { i: CalItem; now: number }) {
  const t = tileParts(i.start), c = CAT_COLOR[i.cat];
  return <li><Draggable label={i.title} payload={() => calItemCard(i)} className="w-full"><div className="flex w-full items-center gap-3 py-2.5 text-left transition hover:bg-white/5">
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border leading-none" style={{ borderColor: `${c}99`, background: `${c}26` }}><span className="text-[17px] font-bold">{t.d}</span><span className="-mt-2 text-[10px] text-mute">{t.m}</span></span>
    <span className="min-w-0 flex-1 leading-tight"><span className="block truncate text-[13px] font-semibold">{i.title}</span><span className="block truncate text-[11px] text-mute">{CAT_LABEL[i.cat]} • {itemTime(i)}{i.where ? ` • ${i.where}` : ""}</span></span>
    {isPast(i, now) && <span className="shrink-0 text-[10px] text-mute">Past</span>}<span className="text-[10px] text-mute/70">Drag</span></div></Draggable></li>;
}
export function ListDialog({ kind, items, now }: { kind: "upcoming" | "past"; items: CalItem[]; now: number }) {
  const isUp = kind === "upcoming"; const openState = useCalendarUI((s) => (isUp ? s.upcomingOpen : s.pastOpen)); const set = useCalendarUI((s) => (isUp ? s.setUpcoming : s.setPast));
  const list = (isUp ? upcoming(items, now, 40) : past(items, now).slice(0, 60)); const router = useRouter();
  return (
    <Dialog open={openState} onClose={() => set(false)} label={isUp ? "Upcoming events" : "Past events"}>
      <h2 className="pr-8 text-lg font-semibold">{isUp ? "Upcoming events" : "Past events"}</h2>
      <p className="mt-1 text-xs text-mute">{isUp ? "Everything coming up, soonest first." : "Catch up on what you missed, newest first. Open an event for its notes and follow-ups."}</p>
      <ul className="scroll-thin mt-2 divide-y divide-line overflow-y-auto pr-1">{list.length === 0 ? <li className="py-8 text-center text-sm text-mute">Nothing here yet.</li> : list.map((i) => <Row key={i.id} i={i} now={now} />)}</ul>
      {!isUp && <button onClick={() => { set(false); router.push("/events"); }} className="btn-blue mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 text-[13px]">Open Events <ArrowRight size={14} aria-hidden /></button>}
    </Dialog>
  );
}

export function ItemDialog({ items, now }: { items: CalItem[]; now: number }) {
  const id = useCalendarUI((s) => s.openId), open = useCalendarUI((s) => s.open); const router = useRouter();
  const { openEvent, select } = useUI();
  const i = items.find((x) => x.id === id) ?? null; const c = i ? CAT_COLOR[i.cat] : "#2F8BFF"; const close = () => open(null);
  const navigate = () => {
    if (!i) return;
    if (i.src === "event" && i.refId) { close(); openEvent(i.refId); }
    else if (i.src === "task" && i.refId) { close(); select(i.refId); }
    else if (i.src === "joined") { close(); router.push("/actions"); }
  };
  return (
    <Dialog open={!!i} onClose={close} label="Calendar item">
      {i && <>
        <span className="w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white" style={{ background: c }}>{CAT_LABEL[i.cat]}</span>
        <h2 className="mt-2 pr-8 text-xl font-semibold leading-tight">{i.title}</h2>
        <ul className="mt-3 space-y-2 text-[13px] text-mute">
          <li className="flex items-center gap-2"><CalendarDays size={15} aria-hidden />{i.allDay && !isSameDayItem(i) ? `${longDay(i.start)} – ${longDay(i.end)}` : longDay(i.start)}</li>
          <li className="flex items-center gap-2"><Clock size={15} aria-hidden />{itemTime(i)}{!i.allDay ? ` – ${new Date(i.end).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}` : ""}{isPast(i, now) ? " · already happened" : ""}</li>
          {i.where && <li className="flex items-center gap-2"><MapPin size={15} aria-hidden />{i.where}</li>}
        </ul>
        {i.blurb && <p className="mt-3 text-[12.5px] text-mute">{i.blurb}</p>}
        {i.src === "sample"
          ? <p className="mt-5 rounded-xl border border-dashed border-honey/50 bg-honey/10 px-3.5 py-2.5 text-center text-[12.5px] text-honey">Close this dialog, then <strong>drag this item</strong> onto the <strong>Add to Events</strong> zone. ⠿</p>
          : <ActionIntentCard label={i.src === "event" ? "Open event" : i.src === "task" ? "Open item" : "Open Action Center"} onExecute={navigate} className="mt-5"><div className="btn-gold flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px]">{i.src === "event" ? <>Open event <ArrowRight size={14} aria-hidden /></> : i.src === "task" ? <>Open item <ArrowRight size={14} aria-hidden /></> : <>Open Action Center <ArrowRight size={14} aria-hidden />}</div></ActionIntentCard>
        }
      </>}
    </Dialog>
  );
}
const isSameDayItem = (i: CalItem) => new Date(i.start).toDateString() === new Date(i.end).toDateString();
