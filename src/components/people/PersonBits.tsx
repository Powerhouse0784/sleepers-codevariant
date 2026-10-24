"use client";
import { BadgeCheck, UserPlus, UserCheck, Pencil } from "lucide-react";
import { STATUS_COLOR, STATUS_LABEL, ringOf, type Person } from "@/features/people/people";
import { usePeople, usePeopleUI } from "@/lib/peopleStore";

export function PersonAvatar({ p, size = 54, className = "" }: { p: Pick<Person, "id" | "name" | "avatar">; size?: number; className?: string }) {
  const ring = ringOf(p.id);
  return (
    <span aria-hidden className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full ${className}`} style={{ width: size, height: size, boxShadow: `0 0 0 2px ${ring}, 0 0 14px ${ring}55`, background: "linear-gradient(135deg,#FFD23F,#ff9a3c)" }}>
      {p.avatar
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={p.avatar} alt="" width={size} height={size} className="h-full w-full object-cover" draggable={false} />
        : <span className="font-bold text-[#1a1304]" style={{ fontSize: size * 0.42 }}>{p.name.slice(0, 1).toUpperCase()}</span>}
    </span>
  );
}
export const Verified = () => <BadgeCheck size={15} className="shrink-0 text-primary" fill="currentColor" stroke="var(--surface)" aria-label="Verified" />;
export function StatusDot({ status, className = "" }: { status: Person["status"]; className?: string }) {
  return <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${className}`} style={{ color: STATUS_COLOR[status] }}><span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[status], boxShadow: `0 0 6px ${STATUS_COLOR[status]}` }} />{STATUS_LABEL[status]}</span>;
}
/** Follow / Following. Your own card gets "Edit" instead, because you can't follow yourself. */
export function FollowButton({ p, size = "sm" }: { p: Person; size?: "sm" | "lg" }) {
  const toggle = usePeople((s) => s.toggleFollow); const setProfile = usePeopleUI((s) => s.setProfile);
  const pad = size === "lg" ? "px-5 py-2.5 text-[13px]" : "px-3.5 py-1.5 text-[12px]";
  if (p.isMe) return <button onClick={() => setProfile(true)} className={`btn-blue relative z-10 inline-flex items-center gap-1.5 ${pad}`}><Pencil size={13} aria-hidden /> Edit</button>;
  return p.followed
    ? <button onClick={() => toggle(p.id)} aria-pressed className={`relative z-10 inline-flex items-center gap-1.5 rounded-[10px] border border-honey/60 bg-honey/10 font-semibold text-honey transition hover:bg-honey/20 ${pad}`} aria-label={`Unfollow ${p.name}`}><UserCheck size={13} aria-hidden /> Following</button>
    : <button onClick={() => toggle(p.id)} aria-pressed={false} aria-label={`Follow ${p.name}`} className={`relative z-10 inline-flex items-center gap-1.5 rounded-[10px] bg-[#1B7BFF] font-semibold text-white shadow-[0_6px_16px_-6px_rgba(27,123,255,.8)] transition hover:brightness-110 ${pad}`}><UserPlus size={13} aria-hidden /> Follow</button>;
}
