"use client";
import { useState } from "react";
import { Check, TriangleAlert } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { useSettings, useSettingsUI } from "@/lib/settingsStore";
import { usePeople } from "@/lib/peopleStore";
import { SOCIAL_META, VIEW_OPTIONS, clampText, cleanSocial, firstName, type SocialKey } from "@/features/settings/settings";
import { Dialog } from "../actions/ActionRail";
import { ActionIntentCard } from "../canvas/ActionIntent";
import { wipeAll } from "./util";

const Field = ({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) => (
  <div><label htmlFor={id} className="text-[12px] font-medium text-mute">{label}</label><div className="mt-1">{children}</div>{hint && <p className="mt-1 text-[11px] text-mute">{hint}</p>}</div>
);

function ProfileForm({ onDone }: { onDone: () => void }) {
  const profile = useSettings((s) => s.profile); const { toast } = useUI();
  const [name, setName] = useState(profile.name), [headline, setHeadline] = useState(profile.headline), [location, setLocation] = useState(profile.location), [bio, setBio] = useState(profile.bio); const [err, setErr] = useState("");
  const save = () => {
    const n = clampText(name, 60); if (!n) return setErr("Your name cannot be empty.");
    const next = { name: n, headline: clampText(headline, 60), location: clampText(location, 60), bio: clampText(bio, 240) };
    useSettings.getState().saveProfile(next); useStore.setState({ userName: firstName(n) });
    const me = usePeople.getState().people.find((p) => p.isMe);
    if (me) usePeople.getState().saveMe(n, { role: me.role, family: me.family, city: next.location || me.city, bio: next.bio || me.bio, skills: me.skills, groups: me.groups });
    toast("Profile updated."); onDone();
  };
  const submit = (e: React.FormEvent) => { e.preventDefault(); setErr("Drag the Save card onto Execute to save your profile."); };
  return (
    <form onSubmit={submit} className="scroll-thin -mr-1 space-y-3 overflow-y-auto pr-1">
      <Field id="pf-name" label="Full name"><input id="pf-name" value={name} onChange={(e) => { setName(e.target.value); setErr(""); }} maxLength={60} autoComplete="name" className="field w-full px-3 py-2.5 text-[14px]" /></Field>
      <Field id="pf-head" label="Headline" hint="Shown under your name, for example Student · Innovator."><input id="pf-head" value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={60} className="field w-full px-3 py-2.5 text-[14px]" /></Field>
      <Field id="pf-loc" label="Location"><input id="pf-loc" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={60} placeholder="City, State" autoComplete="address-level2" className="field w-full px-3 py-2.5 text-[14px]" /></Field>
      <Field id="pf-bio" label="Bio" hint={`${bio.length}/240`}><textarea id="pf-bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={240} rows={3} className="field w-full resize-none px-3 py-2.5 text-[14px]" /></Field>
      {err && <p role="alert" className="text-[12.5px] text-[#ff7a7a]">{err}</p>}
      <div className="flex items-center justify-end gap-2 pt-1"><button type="button" onClick={onDone} className="btn-blue px-4 py-2 text-[13px]">Cancel</button><ActionIntentCard label="Save profile" hint="Save your profile changes" onExecute={save}><div className="btn-gold rounded-xl px-5 py-2 text-center text-[13px]">Save</div></ActionIntentCard></div>
    </form>
  );
}
export function EditProfileDialog() {
  const open = useSettingsUI((s) => s.editProfile), set = useSettingsUI((s) => s.setEditProfile);
  return <Dialog open={open} onClose={() => set(false)} label="Edit profile"><h2 className="pr-8 text-lg font-semibold">Edit profile</h2><p className="mb-3 mt-1 text-xs text-mute">If you have joined People, your name, location and bio stay in step there.</p>{open && <ProfileForm onDone={() => set(false)} />}</Dialog>;
}

function SocialForm({ k, onDone }: { k: SocialKey; onDone: () => void }) {
  const cur = useSettings((s) => s.social[k]); const setSocial = useSettings((s) => s.setSocial); const { toast } = useUI(); const [v, setV] = useState(cur); const [err, setErr] = useState("");
  const save = () => { const r = cleanSocial(k, v); if (!r.ok) return setErr(r.error); setSocial(k, r.value); toast(r.value ? `${SOCIAL_META[k].label} saved.` : `${SOCIAL_META[k].label} removed.`); onDone(); };
  const submit = (e: React.FormEvent) => { e.preventDefault(); setErr("Drag the Save card onto Execute to save this link."); };
  return (
    <form onSubmit={submit} className="space-y-3">
      <Field id="soc" label={SOCIAL_META[k].label} hint={`Accepts ${SOCIAL_META[k].hint}.`}><input id="soc" value={v} onChange={(e) => { setV(e.target.value); setErr(""); }} autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="url" className="field w-full px-3 py-2.5 text-[14px]" aria-invalid={!!err} aria-describedby={err ? "soc-err" : undefined} /></Field>
      {err && <p id="soc-err" role="alert" className="text-[12.5px] text-[#ff7a7a]">{err}</p>}
      <div className="flex items-center justify-between gap-2 pt-1">{cur ? <button type="button" onClick={() => { setSocial(k, ""); toast(`${SOCIAL_META[k].label} removed.`); onDone(); }} className="text-[12.5px] text-[#ff7a7a] hover:underline">Remove</button> : <span />}
        <span className="flex gap-2"><button type="button" onClick={onDone} className="btn-blue px-4 py-2 text-[13px]">Cancel</button><ActionIntentCard label="Save social link" hint="Save this social link" onExecute={save}><div className="btn-gold rounded-xl px-5 py-2 text-center text-[13px]">Save</div></ActionIntentCard></span></div>
    </form>
  );
}
export function EditSocialDialog() {
  const k = useSettingsUI((s) => s.editSocial), set = useSettingsUI((s) => s.setEditSocial);
  return <Dialog open={!!k} onClose={() => set(null)} label="Edit social link"><h2 className="mb-3 pr-8 text-lg font-semibold">{k ? SOCIAL_META[k].label : ""} link</h2>{k && <SocialForm key={k} k={k} onDone={() => set(null)} />}</Dialog>;
}

export function ViewDialog() {
  const open = useSettingsUI((s) => s.viewOpen), set = useSettingsUI((s) => s.setViewOpen); const cur = useSettings((s) => s.defaultView), setView = useSettings((s) => s.setDefaultView); const { toast } = useUI();
  return (
    <Dialog open={open} onClose={() => set(false)} label="Default view">
      <h2 className="pr-8 text-lg font-semibold">Default view</h2><p className="mb-2 mt-1 text-xs text-mute">The screen the app opens on when you launch it.</p>
      <ul className="scroll-thin overflow-y-auto pr-1" role="radiogroup" aria-label="Default view">{VIEW_OPTIONS.map((o) => (
        <li key={o.href}><button role="radio" aria-checked={cur === o.href} onClick={() => { setView(o.href); toast(`${o.label} is now your default view.`); set(false); }} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-[14px] transition hover:bg-white/5"><span className={cur === o.href ? "font-semibold text-honey" : ""}>{o.label}</span>{cur === o.href && <Check size={17} className="text-honey" aria-hidden />}</button></li>))}</ul>
    </Dialog>
  );
}
export function LangDialog() {
  const open = useSettingsUI((s) => s.langOpen), set = useSettingsUI((s) => s.setLangOpen);
  return (
    <Dialog open={open} onClose={() => set(false)} label="Language">
      <h2 className="pr-8 text-lg font-semibold">Language</h2>
      <div className="mt-3 flex items-center justify-between rounded-xl border border-honey/50 bg-honey/10 px-3 py-3 text-[14px] font-semibold text-honey">English (US)<Check size={17} aria-hidden /></div>
      <p className="mt-3 text-xs text-mute">English is the only language available right now. More are planned.</p>
      <button onClick={() => set(false)} className="btn-blue mt-4 px-4 py-2 text-[13px]">Close</button>
    </Dialog>
  );
}
export function ConfirmDialog() {
  const c = useSettingsUI((s) => s.confirm), set = useSettingsUI((s) => s.setConfirm);
  return (
    <Dialog open={c === "delete"} onClose={() => set(null)} label="Delete everything">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-[#ff6b6b]/15 text-[#ff7a7a]"><TriangleAlert size={22} aria-hidden /></span>
      <h2 className="mt-3 pr-8 text-lg font-semibold">Delete everything?</h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-mute">This erases your events, captured items, ideas, People profile, joined challenges and settings from this browser, then starts fresh. It cannot be undone. Export first if you want a copy.</p>
      <div className="mt-5 flex justify-end gap-2"><button onClick={() => set(null)} className="btn-blue px-4 py-2 text-[13px]">Cancel</button><ActionIntentCard label="Delete everything" hint="Permanently clear local app data" onExecute={wipeAll}><div className="rounded-[10px] bg-[#ff5a5a] px-4 py-2 text-center text-[13px] font-semibold text-white">Delete everything</div></ActionIntentCard></div>
    </Dialog>
  );
}
