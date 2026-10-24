"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { usePeople, usePeopleUI } from "@/lib/peopleStore";
import { useUI } from "@/lib/store";
import { useSettings } from "@/lib/settingsStore";
import { FAMILIES, GROUPS, GROUP_LABEL, type Family, type Group } from "@/features/people/people";
import { ActionIntentCard } from "../canvas/ActionIntent";

/** "Join Now" and "Edit profile": your own card in the directory. */
export default function ProfileDialog() {
  const open = usePeopleUI((s) => s.profileOpen), setOpen = usePeopleUI((s) => s.setProfile);
  const { people, saveMe, leave } = usePeople(); const myName = useSettings((s) => s.profile.name), headline = useSettings((s) => s.profile.headline); const toast = useUI((s) => s.toast), celebrate = useUI((s) => s.celebrate);
  const me = people.find((p) => p.isMe);
  const [role, setRole] = useState(""); const [family, setFamily] = useState<Family>("Developer"); const [city, setCity] = useState(""); const [bio, setBio] = useState(""); const [skills, setSkills] = useState(""); const [groups, setGroups] = useState<Group[]>(["students"]); const [err, setErr] = useState("");
  useEffect(() => { if (!open) return; setErr(""); setRole(me?.role ?? (headline || "Student · Innovator")); setFamily(me?.family ?? "Developer"); setCity(me?.city ?? ""); setBio(me?.bio ?? ""); setSkills(me?.skills.join(", ") ?? ""); setGroups(me?.groups ?? ["students"]); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const close = () => setOpen(false);
  const toggle = (g: Group) => setGroups((x) => (x.includes(g) ? x.filter((y) => y !== g) : [...x, g]));
  const save = () => {
    if (!role.trim()) return setErr("Tell people what you do.");
    if (!bio.trim()) return setErr("Add a line about yourself.");
    saveMe(myName, { role: role.trim(), family, city: city.trim() || "India", bio: bio.trim(), skills: skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 8), groups });
    close(); if (!me) { celebrate(); toast("Welcome to the community!"); } else toast("Profile updated.");
  };
  const field = "field mt-1.5 w-full px-3 py-2.5 text-sm";
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.form role="dialog" aria-modal="true" aria-label={me ? "Edit your profile" : "Join the community"} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.key === "Escape" && close()} onSubmit={(e) => { e.preventDefault(); setErr("Drag Save profile or Join now onto Execute."); }}
            className="scroll-thin max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-3xl border border-line bg-panel p-6" initial={{ y: 40, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: 0.97 }}>
            <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">{me ? "Edit your profile" : "Join the community"}</h2><button type="button" onClick={close} aria-label="Close" className="rounded-full p-2 text-mute hover:bg-white/5"><X size={18} /></button></div>
            <p className="mt-1 text-xs text-mute">{me ? "This is how you appear in the People directory." : "Add yourself to the People directory so others can find and follow you."}</p>
            <label className="mt-4 block text-xs font-medium text-mute" htmlFor="pf-role">What do you do?</label>
            <input id="pf-role" autoFocus value={role} maxLength={40} onChange={(e) => { setRole(e.target.value); setErr(""); }} placeholder="e.g. Frontend Developer" className={field} />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-mute" htmlFor="pf-family">Area</label><select id="pf-family" value={family} onChange={(e) => setFamily(e.target.value as Family)} className={field}>{FAMILIES.map((f) => <option key={f}>{f}</option>)}</select></div>
              <div><label className="block text-xs font-medium text-mute" htmlFor="pf-city">City</label><input id="pf-city" value={city} maxLength={40} onChange={(e) => setCity(e.target.value)} placeholder="Delhi, India" className={field} /></div>
            </div>
            <div className="mt-4 flex items-end justify-between"><label className="text-xs font-medium text-mute" htmlFor="pf-bio">About you</label><span className="text-[11px] text-mute">{bio.length}/140</span></div>
            <textarea id="pf-bio" value={bio} rows={3} maxLength={140} onChange={(e) => { setBio(e.target.value); setErr(""); }} placeholder="What are you into, and who do you want to meet?" className={`${field} resize-none`} />
            <label className="mt-4 block text-xs font-medium text-mute" htmlFor="pf-skills">Skills (comma separated, up to 8)</label>
            <input id="pf-skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Figma, Public speaking" className={field} />
            <p className="mt-4 text-xs font-medium text-mute" id="pf-groups">Show me under</p>
            <div className="mt-1.5 flex flex-wrap gap-2" role="group" aria-labelledby="pf-groups">{GROUPS.map((g) => <button key={g} type="button" aria-pressed={groups.includes(g)} onClick={() => toggle(g)} className="pill px-3 py-1.5 text-[12px]">{GROUP_LABEL[g]}</button>)}</div>
            <p role="alert" className="mt-3 min-h-5 text-xs text-[#FF6686]">{err}</p>
            <div className="flex gap-2">
              {me && <ActionIntentCard label="Leave the directory" hint="Remove your profile from People" onExecute={() => { leave(); close(); toast("You left the directory."); }}><div className="rounded-xl border border-line px-3 py-3 text-center text-[13px] text-mute">Leave</div></ActionIntentCard>}
              <ActionIntentCard label={me ? "Save profile" : "Join now"} hint={me ? "Save your People profile" : "Join the People directory"} onExecute={save} className="flex-1"><div className="btn-gold rounded-xl py-3 text-center text-sm">{me ? "Save profile" : "Join now"}</div></ActionIntentCard></div>
          </motion.form>
        </motion.div>)}
    </AnimatePresence>
  );
}
