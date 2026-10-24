"use client";
import { motion } from "motion/react";
import { MapPin, Users } from "lucide-react";
import { followerCount, fmtK, type Person } from "@/features/people/people";
import { usePeopleUI } from "@/lib/peopleStore";
import { PersonAvatar, StatusDot, Verified } from "./PersonBits";
import Draggable from "../canvas/Draggable";
import { personCard } from "./PeopleZones";

const SHOW = 3;
export function Chips({ skills, max = SHOW }: { skills: string[]; max?: number }) {
  return (
    <ul className="flex flex-wrap items-center gap-1.5" aria-label="Skills">
      {skills.slice(0, max).map((s) => <li key={s} className="rounded-full border border-primary/45 bg-primary/10 px-2.5 py-[3px] text-[10.5px] font-medium">{s}</li>)}
      {skills.length > max && <li className="grid h-[22px] min-w-[22px] place-items-center rounded-full border border-primary/45 bg-primary/10 px-1.5 text-[10.5px] font-medium" aria-label={`${skills.length - max} more skills`}>+{skills.length - max}</li>}
    </ul>
  );
}

export default function PersonCard({ p, index }: { p: Person; index: number }) {
  const open = usePeopleUI((s) => s.open);
  return (
    <Draggable label={p.name} payload={() => personCard(p.id, p.name, p.role)} className="h-full" disabled={p.isMe}>
      <motion.article layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ delay: Math.min(index, 8) * 0.04 }}
        className="card tile group relative flex h-full flex-col p-4 transition hover:-translate-y-0.5 hover:border-primary/60">
        <StatusDot status={p.status} className="absolute right-3.5 top-3" />
        <div className="flex items-start gap-3 pr-10">
          <PersonAvatar p={p} size={54} />
          <div className="min-w-0 pt-0.5">
            <h3 className="flex items-center gap-1 text-[14px] font-semibold leading-tight"><button onClick={() => open(p.id)} className="truncate rounded-sm text-left after:absolute after:inset-0 after:rounded-2xl after:content-['']">{p.name}</button>{p.verified && <Verified />}</h3>
            <p className="mt-0.5 truncate text-[12px]">{p.role}</p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-[10.5px] text-primary"><MapPin size={11} className="shrink-0" aria-hidden />{p.isMe ? "You" : p.city}</p>
          </div>
        </div>
        <p className="mt-3 line-clamp-3 min-h-[3.9em] text-[12px] leading-[1.3] text-mute">{p.bio}</p>
        <div className="mt-3"><Chips skills={p.skills} /></div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="flex items-center gap-1.5 text-[11px] text-mute"><Users size={14} aria-hidden />{fmtK(followerCount(p))} followers</span>
          {p.isMe
            ? <span className="rounded-full border border-honey/50 px-3 py-1 text-[11px] font-semibold text-honey">You</span>
            : <span className="text-[10px] text-mute/60 select-none" aria-hidden>⠿ drag to follow</span>}
        </div>
      </motion.article>
    </Draggable>
  );
}
