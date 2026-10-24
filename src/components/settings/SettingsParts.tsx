"use client";
import { useRouter } from "next/navigation";
import { CalendarDays, Bell, Handshake, Trophy, BadgeCheck, MapPin, FileText, ShieldCheck, Globe, Clock, Moon, Sun, LayoutDashboard, ChevronRight, ArrowRight, Zap, Settings as Cog, UserRound, Lock, Palette, SlidersHorizontal, Link2, LifeBuoy, type LucideIcon } from "lucide-react";
import { Github, Linkedin } from "lucide-react";
import { useStore } from "@/lib/store";
import { useSettings, useSettingsUI } from "@/lib/settingsStore";
import { useActionsUI } from "@/lib/actionsStore";
import { usePeople, usePeopleUI } from "@/lib/peopleStore";
import { useNow } from "@/lib/hooks";
import { SECTIONS, SOCIAL_META, monthYear, socialHref, tzLabel, viewLabel, type NotifPrefs, type Section, type SocialKey } from "@/features/settings/settings";
import { FeedAvatar, useFeed } from "../actions/ActionRail";
import { ActionIntentCard } from "../canvas/ActionIntent";

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className="relative h-6 w-[44px] shrink-0 rounded-full border transition-colors"
      style={{ background: on ? "linear-gradient(180deg,#FFD23F,#FFB800)" : "color-mix(in srgb,var(--text) 14%,transparent)", borderColor: on ? "#FFC400" : "var(--line)", boxShadow: on ? "0 0 14px -2px rgba(255,196,0,.7)" : "none" }}>
      <span className="absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all" style={{ left: on ? 22 : 2 }} /></button>
  );
}
const XGlyph = ({ size = 18 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
const NAV_ICON: Record<Section, LucideIcon> = { account: UserRound, notifications: Bell, privacy: ShieldCheck, appearance: Palette, preferences: SlidersHorizontal, security: Lock, connected: Link2, help: LifeBuoy };

export function SettingsNav() {
  const section = useSettingsUI((s) => s.section), setSection = useSettingsUI((s) => s.setSection);
  return (
    <nav aria-label="Settings sections" className="card p-2.5 @2xl:col-span-2 @4xl:col-span-1">
      <div className="mb-2 hidden items-start gap-3 px-1.5 pb-2 pt-1 @4xl:flex">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary/60 bg-primary/10 text-primary shadow-[0_0_16px_rgba(35,120,255,.45)]"><Cog size={22} aria-hidden /></span>
        <div className="leading-tight"><h2 className="text-[15px] font-semibold">Profile Settings</h2><p className="mt-1 text-[11.5px] text-primary/90">Update your personal information and profile details.</p></div>
      </div>
      <ul className="scroll-thin flex gap-1.5 overflow-x-auto @4xl:flex-col @4xl:overflow-visible">
        {SECTIONS.map(({ id, label }) => { const I = NAV_ICON[id]; const on = section === id;
          return <li key={id} className="shrink-0 @4xl:shrink">
            <ActionIntentCard label={label} hint="Open this settings section" onExecute={() => setSection(id)} className="w-full @4xl:w-auto">
              <div aria-current={on ? "page" : undefined}
                className={`flex w-full items-center gap-3 whitespace-nowrap rounded-xl border px-3.5 py-2.5 text-left text-[13.5px] font-medium transition ${on ? "border-honey/70 text-honey shadow-[0_0_18px_-6px_rgba(255,196,0,.8)]" : "border-transparent text-[var(--text)] hover:bg-white/5"}`}
                style={on ? { background: "linear-gradient(90deg, rgba(255,196,0,.22), rgba(255,196,0,.04))" } : undefined}><I size={18} aria-hidden />{label}</div>
            </ActionIntentCard>
          </li>; })}
      </ul>
    </nav>
  );
}

export function ProfileInfo() {
  const { profile } = useSettings(); const setEdit = useSettingsUI((s) => s.setEditProfile); const seededAt = useStore((s) => s.seededAt);
  const since = monthYear(seededAt || Date.now());
  const cell = "flex flex-col gap-1.5 p-3 text-[12px]";
  return (
    <section className="card @container p-4" aria-labelledby="prof-info">
      <div className="flex items-start justify-between gap-3">
        <div><h2 id="prof-info" className="text-[19px] font-semibold">Profile Information</h2><p className="mt-1 text-[12px] text-mute">This information will be visible to other community members.</p></div>
        <button onClick={() => setEdit(true)} className="btn-blue shrink-0 px-3.5 py-2 text-[12.5px]">Edit Profile</button>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <span className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full border-2 border-primary/70 shadow-[0_0_20px_rgba(35,120,255,.5)]">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/action/av-me.webp" alt="" width={72} height={72} className="h-full w-full object-cover" draggable={false} /></span>
        <div className="min-w-0 leading-tight"><p className="truncate text-[20px] font-semibold">{profile.name}</p><p className="mt-1 text-[13px] text-mute">{profile.headline}</p>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#1FD18B]/50 bg-[#1FD18B]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#1FD18B]"><span className="h-1.5 w-1.5 rounded-full bg-[#1FD18B]" />Online</span></div>
      </div>
      <dl className="mt-4 grid divide-y divide-line overflow-hidden rounded-xl border border-line @sm:grid-cols-3 @sm:divide-x @sm:divide-y-0">
        <div className={cell}><dt className="flex items-center gap-2 text-mute"><BadgeCheck size={16} className="text-primary" aria-hidden />Member Since</dt><dd className="text-[13px] font-medium">{since}</dd></div>
        <div className={cell}><dt className="flex items-center gap-2 text-mute"><MapPin size={16} className="text-primary" aria-hidden />Location</dt><dd className="text-[13px] font-medium">{profile.location || <button onClick={() => setEdit(true)} className="text-primary hover:underline">Add location</button>}</dd></div>
        <div className={cell}><dt className="flex items-center gap-2 text-mute"><FileText size={16} className="text-primary" aria-hidden />Bio</dt><dd className="text-[12.5px] leading-snug">{profile.bio || <button onClick={() => setEdit(true)} className="text-primary hover:underline">Add a bio</button>}</dd></div>
      </dl>
    </section>
  );
}

const SOCIAL_ICON: Record<SocialKey, ReactIcon> = { github: ({ size }) => <Github size={size} />, linkedin: ({ size }) => <Linkedin size={size} />, twitter: ({ size }) => <XGlyph size={size} />, portfolio: ({ size }) => <Globe size={size} /> };
type ReactIcon = (p: { size: number }) => React.ReactElement;
export function SocialLinks({ title = "Social Links", sub = "Connect with your community and showcase your work." }: { title?: string; sub?: string }) {
  const social = useSettings((s) => s.social); const setEdit = useSettingsUI((s) => s.setEditSocial);
  return (
    <section className="card p-4" aria-labelledby="social-links">
      <h2 id="social-links" className="text-[17px] font-semibold">{title}</h2><p className="mt-1 text-[12px] text-mute">{sub}</p>
      <ul className="mt-3 space-y-2">
        {(Object.keys(SOCIAL_META) as SocialKey[]).map((k) => { const v = social[k]; const I = SOCIAL_ICON[k];
          return (
            <li key={k} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-primary/50 bg-primary/10 text-[var(--text)]"><I size={19} /></span>
              <span className="min-w-0 flex-1 leading-tight"><span className="block text-[13px] font-semibold">{SOCIAL_META[k].label}</span>
                {v ? <a href={socialHref(v)} target="_blank" rel="noopener noreferrer" className="block truncate text-[12px] text-primary hover:underline">{v}</a> : <span className="block text-[12px] text-mute">Not added yet</span>}</span>
              <button onClick={() => setEdit(k)} className="btn-blue shrink-0 px-3.5 py-1.5 text-[12px]" aria-label={`${v ? "Edit" : "Add"} ${SOCIAL_META[k].label}`}>{v ? "Edit" : "Add"}</button>
              {v ? <a href={socialHref(v)} target="_blank" rel="noopener noreferrer" aria-label={`Open ${SOCIAL_META[k].label}`} className="shrink-0 text-mute hover:text-[var(--text)]"><ChevronRight size={18} /></a> : <ChevronRight size={18} className="shrink-0 text-mute/40" aria-hidden />}
            </li>); })}
      </ul>
    </section>
  );
}

export const NOTIF_ROWS: { k: keyof NotifPrefs; label: string; sub: string; I: LucideIcon }[] = [
  { k: "events", label: "Event Updates", sub: "New events, reminders, changes", I: CalendarDays }, { k: "community", label: "Community Activity", sub: "Comments, likes, follows", I: Bell },
  { k: "mentorship", label: "Mentorship Program", sub: "Mentor matches, sessions", I: Handshake }, { k: "challenges", label: "Challenges & Competitions", sub: "New challenges, results", I: Trophy },
  { k: "platform", label: "Platform Updates", sub: "Feature releases, announcements", I: BadgeCheck },
];
export function NotifRows() {
  const notif = useSettings((s) => s.notif), setNotif = useSettings((s) => s.setNotif);
  return <ul className="divide-y divide-line">{NOTIF_ROWS.map(({ k, label, sub, I }) => (
    <li key={k} className="flex items-center gap-3 py-2.5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-honey/40 bg-honey/10 text-honey"><I size={19} aria-hidden /></span>
      <span className="min-w-0 flex-1 leading-tight"><span className="block text-[13px] font-semibold">{label}</span><span className="block text-[11.5px] text-mute">{sub}</span></span>
      <Switch on={notif[k]} onChange={(v) => setNotif(k, v)} label={label} /></li>))}</ul>;
}
export function NotifCard() {
  return <section className="card p-4" aria-labelledby="notif-prefs"><h2 id="notif-prefs" className="text-[17px] font-semibold">Notification Preferences</h2><p className="mt-1 text-[12px] text-mute">Choose what you want to be notified about.</p><div className="mt-2"><NotifRows /></div></section>;
}

export function QuickSettings() {
  const { theme, setTheme } = useStore(); const view = useSettings((s) => s.defaultView); const setViewOpen = useSettingsUI((s) => s.setViewOpen), setLang = useSettingsUI((s) => s.setLangOpen); const now = useNow();
  const rows: { I: LucideIcon; label: string; value: string; onClick?: () => void }[] = [
    { I: Globe, label: "Language", value: "English (US)", onClick: () => setLang(true) }, { I: Clock, label: "Time Zone", value: tzLabel(new Date(now)) },
    { I: theme === "dark" ? Moon : Sun, label: "Theme", value: theme === "dark" ? "Dark Mode" : "Light Mode", onClick: () => setTheme(theme === "dark" ? "light" : "dark") },
    { I: LayoutDashboard, label: "Default View", value: viewLabel(view), onClick: () => setViewOpen(true) },
  ];
  return (
    <section className="card p-4" aria-labelledby="quick-set"><h2 id="quick-set" className="text-[17px] font-semibold">Quick Settings</h2><p className="mt-1 text-[12px] text-mute">Shortcuts to your most used settings.</p>
      <ul className="mt-2 divide-y divide-line">{rows.map(({ I, label, value, onClick }) => { const body = <>
        <I size={22} className="shrink-0 text-[var(--text)]" aria-hidden /><span className="min-w-0 flex-1 text-left leading-tight"><span className="block text-[13px] font-semibold">{label}</span><span className="block truncate text-[11.5px] text-mute">{value}</span></span>
        {onClick ? <ChevronRight size={17} className="shrink-0 text-mute" aria-hidden /> : <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[10px] text-mute">Auto</span>}</>;
        return <li key={label}>{onClick ? <button onClick={onClick} className="flex w-full items-center gap-3 py-3 transition hover:bg-white/5">{body}</button> : <div className="flex items-center gap-3 py-3">{body}</div>}</li>; })}</ul>
    </section>
  );
}

export function CommunityPanel() {
  const { feed } = useFeed(); const setFeed = useActionsUI((s) => s.setFeed);
  return (
    <section className="card p-3.5" aria-labelledby="comm-act">
      <div className="flex items-center justify-between"><h2 id="comm-act" className="flex items-center gap-2 text-[16px] font-semibold"><Zap size={20} className="text-honey" fill="currentColor" aria-hidden />Community Activity</h2>
        <button onClick={() => setFeed(true)} className="inline-flex items-center gap-1 rounded-md text-[12px] font-medium text-primary hover:underline">View All <ArrowRight size={13} aria-hidden /></button></div>
      <ul className="mt-1 divide-y divide-line">{feed.slice(0, 4).map((f, k) => (
        <li key={f.id}><button onClick={() => setFeed(true)} className="flex w-full items-center gap-2.5 py-2.5 text-left transition hover:bg-white/5">
          <span aria-hidden className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-bold text-white" style={{ background: k === 0 ? "linear-gradient(135deg,#C9892B,#8a5a12)" : "linear-gradient(135deg,#2F6BFF,#1b46c8)" }}>{k + 1}</span>
          <FeedAvatar f={f} size={38} />
          <span className="min-w-0 flex-1 text-[12px] leading-snug"><span className="font-semibold">{f.who}</span> {f.verb}<span className="block truncate font-medium text-[#6aa8ff]">{f.what}</span><span className="block text-[11px] text-mute" suppressHydrationWarning>{Math.max(0, Math.floor(f.minsAgo))}m ago</span></span>
          <ChevronRight size={17} className="shrink-0 text-mute" aria-hidden /></button></li>))}</ul>
    </section>
  );
}

export function Promo() {
  const router = useRouter();
  return (
    <section className="relative isolate min-h-[230px] overflow-hidden rounded-2xl border border-primary/40 p-4 text-white" style={{ background: "radial-gradient(260px 200px at 100% 100%, rgba(120,70,255,.4), transparent 70%), linear-gradient(160deg,#0a1440,#0b0a2a 80%)" }}>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[url('/decor/honeycomb.svg')] bg-[length:240px] bg-left-top bg-no-repeat opacity-40" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/action/promo-bee.webp" alt="" width={154} height={229} className="absolute bottom-0 right-0 -z-10 h-[230px] w-auto max-w-none select-none" draggable={false} style={{ maskImage: "linear-gradient(90deg,transparent,#000 35%)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 35%)" }} />
      <p className="script max-w-[190px] -rotate-6 text-[27px] leading-[1.05]">Small steps lead to big dreams!</p>
      <button onClick={() => router.push("/actions")} className="btn-gold absolute bottom-4 left-4 inline-flex items-center gap-2 px-3.5 py-2 text-[13px]">Explore Now <ArrowRight size={14} aria-hidden /></button>
    </section>
  );
}

export function Hero() {
  const mask = { maskImage: "linear-gradient(90deg,transparent,#000 26%)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 26%)" };
  return (
    <section aria-labelledby="settings-hero" className="relative isolate min-h-[150px] overflow-hidden rounded-[20px] border border-[#2a5bd0]/60 text-white"
      style={{ background: "radial-gradient(420px 220px at 10% 0%, rgba(120,70,255,.45), transparent 70%), radial-gradient(520px 200px at 50% 120%, rgba(255,150,90,.28), transparent 70%), linear-gradient(100deg,#08174f 0%,#16248a 55%,#2a1f86 100%)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/settings/hero-bee.webp" alt="" width={526} height={147} className="absolute inset-y-0 right-0 h-full w-auto max-w-none select-none opacity-55 sm:opacity-100" draggable={false} style={mask} />
      <div className="relative z-10 flex min-h-[150px] max-w-[72%] flex-col justify-center p-5 sm:max-w-[58%] md:px-7">
        <h1 id="settings-hero" className="script text-[38px] leading-[1] sm:text-[50px] xl:text-[56px]">Settings</h1>
        <p className="script mt-1 -rotate-1 text-[15px] leading-snug text-white/95 sm:text-[19px]">Customize your experience, make it yours!</p>
      </div>
    </section>
  );
}

const AV = ["/people/av/priya-singh.webp", "/people/av/rohan-verma.webp", "/people/av/sneha-gupta.webp", "/people/av/aditya-kumar.webp", "/people/av/karan-malhotra.webp"];
export function JoinBanner() {
  const router = useRouter(); const me = usePeople((s) => s.people.some((p) => p.isMe)); const setProfile = usePeopleUI((s) => s.setProfile);
  const go = () => { router.push("/people"); if (!me) setProfile(true); };
  return (
    <section aria-labelledby="join-now" className="relative isolate flex items-center gap-4 overflow-hidden rounded-2xl border border-primary/50 px-4 py-3 text-white" style={{ background: "linear-gradient(100deg,#0a1440,#101c66 60%,#1a1a70)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/calendar/missed-city.webp" alt="" width={360} height={70} className="absolute inset-y-0 right-0 -z-10 hidden h-full w-auto max-w-none select-none opacity-90 md:block" draggable={false} style={{ maskImage: "linear-gradient(90deg,transparent,#000 30%)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 30%)" }} />
      <div aria-hidden className="hidden shrink-0 items-center sm:flex">{AV.map((a, k) => /* eslint-disable-next-line @next/next/no-img-element */ <img key={a} src={a} alt="" width={36} height={36} className="h-9 w-9 rounded-full border-2 border-[#101c66] object-cover" style={{ marginLeft: k ? -10 : 0 }} draggable={false} />)}<span className="-ml-2.5 grid h-9 w-9 place-items-center rounded-full border-2 border-[#101c66] bg-honey text-[11px] font-bold text-[var(--on-gold)]">+</span></div>
      <div className="min-w-0 flex-1"><h2 id="join-now" className="text-[16px] font-semibold leading-tight sm:text-[19px]">Join our growing community</h2><p className="mt-0.5 text-[11.5px] text-white/85 sm:text-[12.5px]">Be a part of 10,000+ creators, learners and innovators.</p></div>
      <button onClick={go} className="btn-gold relative z-10 inline-flex shrink-0 items-center gap-2 px-4 py-2 text-[13px]">{me ? "View People" : "Join Now"} <ArrowRight size={14} aria-hidden /></button>
    </section>
  );
}
