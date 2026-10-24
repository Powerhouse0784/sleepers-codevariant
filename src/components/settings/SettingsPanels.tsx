"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun, Download, Trash2, Database, ServerOff, Check, ChevronDown, PlayCircle, BookOpen, Command, Users, Leaf, Globe, Clock, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useStore, useUI } from "@/lib/store";
import { ActionIntentCard } from "../canvas/ActionIntent";
import { useSettings, useSettingsUI } from "@/lib/settingsStore";
import { usePeople, usePeopleUI } from "@/lib/peopleStore";
import { useNow } from "@/lib/hooks";
import { LEAD_OPTIONS, tzLabel, viewLabel } from "@/features/settings/settings";
import { Dialog } from "../actions/ActionRail";
import { NotifRows, SocialLinks, Switch } from "./SettingsParts";
import { downloadJson, storageStats, wipeAll } from "./util";

const Card = ({ id, title, sub, children }: { id: string; title: string; sub?: string; children: React.ReactNode }) => (
  <section className="card p-4" aria-labelledby={id}><h2 id={id} className="text-[17px] font-semibold">{title}</h2>{sub && <p className="mt-1 text-[12px] text-mute">{sub}</p>}<div className="mt-3">{children}</div></section>
);
const Row = ({ I, title, sub, children }: { I: React.ComponentType<{ size?: number; className?: string }>; title: string; sub?: string; children: React.ReactNode }) => (
  <li className="flex items-center gap-3 py-3"><I size={21} className="shrink-0 text-primary" /><span className="min-w-0 flex-1 leading-tight"><span className="block text-[13.5px] font-semibold">{title}</span>{sub && <span className="mt-0.5 block text-[12px] text-mute">{sub}</span>}</span>{children}</li>
);

export function NotificationsPanel() {
  const { leadHours, setLead } = useSettings();
  return (
    <div className="space-y-3">
      <Card id="np-title" title="Notification Preferences" sub="Choose what shows up in the bell at the top right."><NotifRows /></Card>
      <Card id="np-lead" title="Event reminders" sub="How early the bell tells you an event is about to start.">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Reminder lead time">{LEAD_OPTIONS.map((o) => <button key={o.h} aria-pressed={leadHours === o.h} onClick={() => setLead(o.h)} className="pill px-4 py-2 text-[12.5px]">{o.label} before</button>)}</div>
        <p className="mt-3 text-[11.5px] text-mute">Mentorship alerts are saved, but nothing sends them yet. They will show up in the bell once mentor matching ships.</p>
      </Card>
    </div>
  );
}

export function PrivacyPanel() {
  const router = useRouter(); const me = usePeople((s) => s.people.find((p) => p.isMe)); const leave = usePeople((s) => s.leave); const { toast } = useUI(); const setConfirm = useSettingsUI((s) => s.setConfirm);
  return (
    <div className="space-y-3">
      <Card id="pv-dir" title="Community visibility" sub="Whether other members can find you in People.">
        <div className="flex items-center gap-3 rounded-xl border border-line p-3"><Users size={22} className="shrink-0 text-primary" aria-hidden />
          <span className="min-w-0 flex-1 leading-tight"><span className="block text-[13.5px] font-semibold">{me ? "You are listed in People" : "You are not listed in People"}</span><span className="mt-0.5 block text-[12px] text-mute">{me ? "Your name, role, city, bio and skills are visible to the community." : "Join the directory to let people follow and find you."}</span></span>
          {me ? <ActionIntentCard label="Remove me from People" hint="Remove your profile from the community directory" onExecute={() => { leave(); toast("You were removed from People."); }} className="shrink-0"><div className="btn-blue rounded-xl px-3.5 py-2 text-center text-[12.5px]">Remove me</div></ActionIntentCard>
            : <ActionIntentCard label="Join People" hint="Open the People screen and join the directory" onExecute={() => { router.push("/people"); usePeopleUI.getState().setProfile(true); }} className="shrink-0"><div className="btn-gold rounded-xl px-3.5 py-2 text-center text-[12.5px]">Join</div></ActionIntentCard>}</div>
      </Card>
      <Card id="pv-data" title="Your data" sub="Everything is saved in this browser only. Nothing is sent to a server.">
        <div className="grid gap-2 @md:grid-cols-2">
          <ActionIntentCard label="Export my data" hint="Download a JSON backup of your app data" onExecute={() => { downloadJson(`event-bee-buzz-${new Date().toISOString().slice(0, 10)}.json`); toast("Your data was downloaded."); }}><div className="btn-blue flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px]"><Download size={16} aria-hidden /> Export my data</div></ActionIntentCard>
          <button onClick={() => setConfirm("delete")} className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#ff6b6b]/50 bg-[#ff6b6b]/10 px-4 py-2.5 text-[13px] font-semibold text-[#ff7a7a] transition hover:bg-[#ff6b6b]/20"><Trash2 size={16} aria-hidden /> Delete everything</button>
        </div>
      </Card>
    </div>
  );
}

function ThemeCard({ mode, on, onPick }: { mode: "dark" | "light"; on: boolean; onPick: () => void }) {
  const dark = mode === "dark";
  return (
    <button onClick={onPick} aria-pressed={on} className={`group rounded-2xl border p-2.5 text-left transition ${on ? "border-honey shadow-[0_0_22px_-6px_rgba(255,196,0,.8)]" : "border-line hover:border-primary/60"}`}>
      <span aria-hidden className="block overflow-hidden rounded-xl border border-black/20" style={{ background: dark ? "#071226" : "#F4F7FF" }}>
        <span className="flex h-24"><span className="w-10" style={{ background: dark ? "#0b1830" : "#fff" }} /><span className="flex-1 space-y-1.5 p-2.5"><span className="block h-3 w-2/3 rounded" style={{ background: dark ? "#1A2D52" : "#DCE5F8" }} /><span className="block h-8 rounded-lg" style={{ background: dark ? "#0D1B36" : "#fff", border: `1px solid ${dark ? "#1A2D52" : "#DCE5F8"}` }} /><span className="block h-2 w-1/3 rounded bg-[#FFC400]" /></span></span></span>
      <span className="mt-2.5 flex items-center justify-between px-0.5 text-[13px] font-semibold"><span className="inline-flex items-center gap-2">{dark ? <Moon size={16} aria-hidden /> : <Sun size={16} aria-hidden />}{dark ? "Dark" : "Light"}</span>{on && <Check size={16} className="text-honey" aria-label="Selected" />}</span>
    </button>
  );
}
export function AppearancePanel() {
  const { theme, setTheme, calm, setCalm } = useStore();
  return (
    <div className="space-y-3">
      <Card id="ap-theme" title="Theme" sub="Pick the look that is easiest on your eyes."><div className="grid max-w-md grid-cols-2 gap-3"><ThemeCard mode="dark" on={theme === "dark"} onPick={() => setTheme("dark")} /><ThemeCard mode="light" on={theme === "light"} onPick={() => setTheme("light")} /></div></Card>
      <Card id="ap-calm" title="Motion" sub="Control how lively the app feels.">
        <div className="flex items-center gap-3 rounded-xl border border-line p-3"><Leaf size={22} className="shrink-0 text-[#1FD18B]" aria-hidden />
          <span className="min-w-0 flex-1 leading-tight"><span className="block text-[13.5px] font-semibold">Calm mode</span><span className="mt-0.5 block text-[12px] text-mute">Turns off page transitions, the cursor glow and card tilt. It is also on automatically if your device asks for reduced motion.</span></span>
          <Switch on={calm} onChange={setCalm} label="Calm mode" /></div>
      </Card>
    </div>
  );
}

export function PreferencesPanel() {
  const view = useSettings((s) => s.defaultView); const now = useNow(); const setViewOpen = useSettingsUI((s) => s.setViewOpen), setLang = useSettingsUI((s) => s.setLangOpen);
  return (
    <Card id="pf" title="App Preferences" sub="Basics for how the app starts and reads.">
      <ul className="divide-y divide-line">
        <Row I={LayoutDashboard} title="Default view" sub={`Opens on ${viewLabel(view)} when you launch the app`}><button onClick={() => setViewOpen(true)} className="btn-blue shrink-0 px-3.5 py-1.5 text-[12px]">Change</button></Row>
        <Row I={Globe} title="Language" sub="English (US)"><button onClick={() => setLang(true)} className="btn-blue shrink-0 px-3.5 py-1.5 text-[12px]">Change</button></Row>
        <Row I={Clock} title="Time zone" sub={tzLabel(new Date(now))}><span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[10.5px] text-mute">Follows your device</span></Row>
      </ul>
    </Card>
  );
}

export function SecurityPanel() {
  const [st, setSt] = useState<{ keys: number; kb: number } | null>(null); const setConfirm = useSettingsUI((s) => s.setConfirm);
  useEffect(() => { setSt(storageStats()); }, []);
  return (
    <div className="space-y-3">
      <Card id="sc" title="Security" sub="How your information is kept.">
        <ul className="divide-y divide-line">
          <Row I={Database} title="Stored on this device" sub={st ? `${st.keys} saved ${st.keys === 1 ? "area" : "areas"}, about ${st.kb} KB in this browser` : "Checking…"}><span /></Row>
          <Row I={ServerOff} title="No server, no account" sub="There is no password to steal. Nothing you add leaves this browser."><span /></Row>
          <Row I={ShieldCheck} title="Shared computer?" sub="Anyone using this browser profile can open the app. Clear your data when you are done."><span /></Row>
        </ul>
      </Card>
      <button onClick={() => setConfirm("delete")} className="inline-flex items-center gap-2 rounded-[10px] border border-[#ff6b6b]/50 bg-[#ff6b6b]/10 px-4 py-2.5 text-[13px] font-semibold text-[#ff7a7a] transition hover:bg-[#ff6b6b]/20"><Trash2 size={16} aria-hidden /> Clear everything on this device</button>
    </div>
  );
}

const FAQ: [string, string][] = [
  ["Where is my data saved?", "In this browser only, in local storage. Export it any time from Privacy, and clearing your browser data removes it."],
  ["How do XP and levels work?", "Joining an event is +50 XP, joining a challenge +25, completing one +150. Every 800 XP is a level. See Your Progress for details."],
  ["What does Time travel do?", "It fast-forwards the clock by up to 45 days so you can watch items cool down in the hive. Nothing is saved, and Back to today undoes it."],
  ["How do I add something to the calendar?", "Use Add Event on the Calendar, or join an event or challenge in the Action Center. They appear on their dates straight away."],
  ["Why does the app look different now?", "Calm mode and the Light theme change the look. Both live under Appearance."],
];
export function HelpPanel() {
  const router = useRouter(); const setTourDone = useStore((s) => s.setTourDone); const { toast } = useUI(); const setPalette = useUI((s) => s.setPalette); const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      <Card id="hp" title="Help & Support" sub="Get unstuck fast.">
        <div className="grid gap-2 @md:grid-cols-3">
          <button onClick={() => { setTourDone(false); router.push("/hive"); toast("Tour restarted."); }} className="btn-blue inline-flex items-center justify-center gap-2 px-3 py-2.5 text-[12.5px]"><PlayCircle size={16} aria-hidden /> Replay the tour</button>
          <button onClick={() => router.push("/knowledge")} className="btn-blue inline-flex items-center justify-center gap-2 px-3 py-2.5 text-[12.5px]"><BookOpen size={16} aria-hidden /> Knowledge Base</button>
          <button onClick={() => setPalette(true)} className="btn-blue inline-flex items-center justify-center gap-2 px-3 py-2.5 text-[12.5px]"><Command size={16} aria-hidden /> Command palette</button>
        </div>
        <p className="mt-3 text-[11.5px] text-mute">Tip: press <kbd className="rounded border border-line px-1.5 py-0.5 text-[10.5px]">Ctrl</kbd> / <kbd className="rounded border border-line px-1.5 py-0.5 text-[10.5px]">⌘</kbd> + <kbd className="rounded border border-line px-1.5 py-0.5 text-[10.5px]">K</kbd> anywhere to jump to any screen or action.</p>
      </Card>
      <Card id="faq" title="Frequently asked">
        <ul className="divide-y divide-line">{FAQ.map(([q, a], k) => (
          <li key={q}><button onClick={() => setOpen(open === k ? null : k)} aria-expanded={open === k} className="flex w-full items-center justify-between gap-3 py-3 text-left text-[13.5px] font-semibold">{q}<ChevronDown size={17} className={`shrink-0 text-mute transition ${open === k ? "rotate-180" : ""}`} aria-hidden /></button>
            <AnimatePresence initial={false}>{open === k && <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pb-3 text-[12.5px] leading-relaxed text-mute">{a}</motion.p>}</AnimatePresence></li>))}</ul>
      </Card>
    </div>
  );
}

export function ConnectedPanel() {
  return <div className="space-y-3"><SocialLinks title="Connected Accounts" sub="Links shown on your profile. Add the places people can find your work." /><p className="px-1 text-[11.5px] text-mute">These are plain links. Nothing is connected or synced, so no passwords or permissions are involved.</p></div>;
}
