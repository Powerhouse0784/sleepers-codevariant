"use client";
import { AnimatePresence, motion } from "motion/react";
import { X, MapPin, Users, Trophy, CalendarDays } from "lucide-react";
import { usePeople, usePeopleUI } from "@/lib/peopleStore";
import { GROUP_LABEL, followerCount, fmtBig, fmtK } from "@/features/people/people";
import { Chips } from "./PersonCard";
import { FollowButton, PersonAvatar, StatusDot, Verified } from "./PersonBits";

const joined = (d: number) => (d < 1 ? "Joined today" : d < 30 ? `Joined ${d} days ago` : d < 365 ? `Joined ${Math.round(d / 30)} months ago` : `Joined ${Math.floor(d / 365)}+ year${d >= 730 ? "s" : ""} ago`);

/** One person in a drawer. Opens from a card or from Top Contributors. */
export default function PersonDrawer() {
  const id = usePeopleUI((s) => s.openId), open = usePeopleUI((s) => s.open); const people = usePeople((s) => s.people);
  const p = people.find((x) => x.id === id); const close = () => open(null);
  return (
    <AnimatePresence>
      {p && (
        <>
          <motion.div key="scrim" className="fixed inset-0 z-30 bg-black/50" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside key="drawer" role="dialog" aria-modal="true" aria-label={p.name} onKeyDown={(e) => e.key === "Escape" && close()}
            className="fixed inset-x-0 bottom-0 z-40 max-h-[90dvh] overflow-y-auto rounded-t-3xl border border-line bg-panel md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[420px] md:rounded-none md:rounded-l-3xl"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <div className="relative h-24 overflow-hidden" style={{ background: "radial-gradient(300px 120px at 80% 100%, rgba(255,140,90,.45), transparent 70%), linear-gradient(100deg,#0b1245,#2a1a7a 60%,#3d2a8f)" }}>
              <button autoFocus onClick={close} aria-label="Close profile" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur hover:bg-black/60"><X size={18} /></button></div>
            <div className="px-6 pb-6">
              <div className="-mt-9 flex items-end justify-between gap-3"><PersonAvatar p={p} size={76} className="shadow-[0_0_0_3px_var(--panel),0_0_0_5px_var(--gold)]!" /><FollowButton p={p} size="lg" /></div>
              <h2 className="mt-3 flex items-center gap-1.5 text-2xl font-semibold leading-tight">{p.name}{p.verified && <Verified />}</h2>
              <p className="mt-1 text-[14px]">{p.role}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-mute"><span className="inline-flex items-center gap-1.5"><MapPin size={13} aria-hidden />{p.city}</span><StatusDot status={p.status} className="text-[12px]!" /></div>
              <p className="mt-4 text-[14px] leading-relaxed">{p.bio}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[[Users, fmtK(followerCount(p)), "Followers"], [Trophy, fmtBig(p.points).toLowerCase(), "Points"], [CalendarDays, p.joinedDaysAgo < 30 ? "New" : "Member", joined(p.joinedDaysAgo).replace("Joined ", "")]].map(([I, n, l]) => {
                  const Ic = I as typeof Users; return <div key={l as string} className="rounded-xl border border-line py-2.5 px-1"><Ic size={15} className="mx-auto text-primary" aria-hidden /><p className="mt-1 text-[15px] font-bold leading-none">{n as string}</p><p className="mt-1 text-[10.5px] text-mute">{l as string}</p></div>; })}
              </div>
              <h3 className="mt-5 text-sm font-semibold">Skills</h3><div className="mt-2"><Chips skills={p.skills} max={20} /></div>
              {p.groups.length > 0 && <><h3 className="mt-5 text-sm font-semibold">Community</h3><div className="mt-2 flex flex-wrap gap-1.5">{p.groups.map((g) => <span key={g} className="rounded-md border border-line px-2 py-[3px] text-[11px] text-mute">{GROUP_LABEL[g]}</span>)}</div></>}
              {p.isMe && <p className="mt-5 rounded-xl border border-line p-3 text-[12px] text-mute">This is your community profile. Edit it any time, or leave the directory from the edit dialog.</p>}
            </div>
          </motion.aside>
        </>)}
    </AnimatePresence>
  );
}
