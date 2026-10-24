/** Settings logic: defaults, link cleaning, time zone label, settings search and the notification list the bell shows. All pure. */
import type { HiveEvent } from "../../types/index";
import type { Feed, JoinMap, Opportunity } from "../actions/actions";

export type Section = "account" | "notifications" | "privacy" | "appearance" | "preferences" | "security" | "connected" | "help";
export const SECTIONS: { id: Section; label: string; words: string }[] = [
  { id: "account", label: "Account", words: "profile name bio location headline edit member since" },
  { id: "notifications", label: "Notifications", words: "notify alerts reminders event updates community mentorship challenges platform bell" },
  { id: "privacy", label: "Privacy", words: "directory visible people export download delete data erase" },
  { id: "appearance", label: "Appearance", words: "theme dark light calm motion animation mode look" },
  { id: "preferences", label: "App Preferences", words: "default view start page language time zone timezone landing" },
  { id: "security", label: "Security", words: "data device storage local clear sign session safe" },
  { id: "connected", label: "Connected Accounts", words: "github linkedin twitter x portfolio social links website" },
  { id: "help", label: "Help & Support", words: "help support tour faq shortcuts keyboard guide knowledge base" },
];
export const sectionHits = (q: string) => { const t = q.trim().toLowerCase(); return t ? SECTIONS.filter((s) => `${s.label} ${s.words}`.toLowerCase().includes(t)) : []; };

export type SocialKey = "github" | "linkedin" | "twitter" | "portfolio";
export type Social = Record<SocialKey, string>;
export const SOCIAL_META: Record<SocialKey, { label: string; hint: string }> = {
  github: { label: "GitHub", hint: "username or github.com/username" }, linkedin: { label: "LinkedIn", hint: "username or linkedin.com/in/username" },
  twitter: { label: "Twitter / X", hint: "@handle or x.com/handle" }, portfolio: { label: "Portfolio", hint: "your site, e.g. yourname.dev" },
};
/** Turns whatever was typed into the clean form we store and show. Empty clears the link. Anything unsafe or unparseable is an error. */
export function cleanSocial(kind: SocialKey, raw: string): { ok: true; value: string } | { ok: false; error: string } {
  let t = raw.trim(); if (!t) return { ok: true, value: "" };
  if (/^(javascript|data|vbscript):/i.test(t)) return { ok: false, error: "That does not look like a web address." };
  t = t.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/[?#].*$/, "").replace(/\/+$/, "");
  if (/\s/.test(t)) return { ok: false, error: "Spaces are not allowed in a link." };
  const handle = (s: string) => /^@?[A-Za-z0-9_-]{1,50}$/.test(s) ? s.replace(/^@/, "") : "";
  if (kind === "portfolio") return /^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+(\/[^\s]*)?$/.test(t) ? { ok: true, value: t } : { ok: false, error: "Enter a site like yourname.dev." };
  const host: Record<Exclude<SocialKey, "portfolio">, { re: RegExp; make: (h: string) => string }> = {
    github: { re: /^github\.com\/([^/]+)/i, make: (h) => `github.com/${h}` }, linkedin: { re: /^linkedin\.com\/in\/([^/]+)/i, make: (h) => `linkedin.com/in/${h}` },
    twitter: { re: /^(?:x|twitter)\.com\/([^/]+)/i, make: (h) => `x.com/${h}` },
  };
  const { re, make } = host[kind]; const m = t.match(re); const h = handle(m ? m[1] : t);
  return h ? { ok: true, value: make(h) } : { ok: false, error: `Enter a ${SOCIAL_META[kind].label} ${kind === "twitter" ? "handle" : "username"} or link.` };
}
export const socialHref = (v: string) => (v ? `https://${v}` : "");

export interface NotifPrefs { events: boolean; community: boolean; mentorship: boolean; challenges: boolean; platform: boolean }
export const NOTIF_DEFAULTS: NotifPrefs = { events: true, community: true, mentorship: true, challenges: true, platform: true };
export const LEAD_OPTIONS = [{ h: 1, label: "1 hour" }, { h: 24, label: "1 day" }, { h: 72, label: "3 days" }];
export const VIEW_OPTIONS = [{ href: "/", label: "Daily Buzz" }, { href: "/events", label: "Events" }, { href: "/hive", label: "Momentum Hive" }, { href: "/ideas", label: "Ideas" }, { href: "/people", label: "People" }, { href: "/actions", label: "Action Center" }, { href: "/calendar", label: "Calendar" }, { href: "/knowledge", label: "Knowledge Base" }];
export const viewLabel = (href: string) => VIEW_OPTIONS.find((v) => v.href === href)?.label ?? "Daily Buzz";

export const firstName = (full: string) => full.trim().split(/\s+/)[0] || "Friend";
export const clampText = (s: string, n: number) => s.replace(/\s+/g, " ").trim().slice(0, n);
export const monthYear = (ms: number) => new Date(ms).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

/** "(GMT+05:30) India Standard Time" from the device. Falls back gracefully when the runtime cannot name the zone. */
export function tzLabel(now: Date, tz?: string) {
  const zone = tz ?? (typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC");
  let name = zone; let off = "";
  try {
    name = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "long" }).formatToParts(now).find((p) => p.type === "timeZoneName")?.value ?? zone;
    off = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "longOffset" }).formatToParts(now).find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch { /* unknown zone: keep the id */ }
  return `(${off.replace("GMT", "GMT") || "GMT"}) ${name}`.replace("(GMT)", "(GMT+00:00)");
}

export type NoteCat = "events" | "community" | "challenges" | "platform";
export interface Note { id: string; cat: NoteCat; title: string; sub: string; eventId?: string; href?: string }
export interface NoteInput { prefs: NotifPrefs; events: HiveEvent[]; joined: JoinMap; opps: Opportunity[]; feed: Feed[]; now: number; leadHours: number }
const inLabel = (ms: number) => { const m = Math.round(ms / 6e4); return m < 60 ? `in ${Math.max(m, 1)} min` : m < 1440 ? `in ${Math.round(m / 60)} h` : `in ${Math.round(m / 1440)} d`; };
/** What the bell shows besides items that need attention. Each category follows its switch; nothing is invented. */
export function buildNotes({ prefs, events, joined, opps, feed, now, leadHours }: NoteInput): Note[] {
  const out: Note[] = [];
  if (prefs.events) for (const e of events) {
    if (e.archived) continue; const s = Date.parse(e.startsAt ?? e.date); if (Number.isNaN(s)) continue; const en = e.endsAt ? Date.parse(e.endsAt) : s + 36e5;
    if (s >= now && s - now <= leadHours * 36e5) out.push({ id: `n-e-${e.id}`, cat: "events", title: `Starting soon: ${e.title}`, sub: `${inLabel(s - now)}${e.venue ? ` · ${e.venue}` : ""}`, eventId: e.id });
    else if (s < now && en >= now) out.push({ id: `n-e-${e.id}`, cat: "events", title: `Happening now: ${e.title}`, sub: e.venue ?? "Live", eventId: e.id });
  }
  if (prefs.challenges) for (const o of opps) { const r = joined[o.id]; if (o.kind === "challenge" && r && !r.done) out.push({ id: `n-c-${o.id}`, cat: "challenges", title: o.title, sub: o.inDays === undefined ? "Joined · mark it complete when done" : `Joined · starts in ${o.inDays} ${o.inDays === 1 ? "day" : "days"}`, href: "/actions" }); }
  if (prefs.community) { const f = feed.find((x) => !x.mine); if (f) out.push({ id: `n-f-${f.id}`, cat: "community", title: `${f.who} ${f.verb} ${f.what}`, sub: "Community activity", href: "/actions" }); }
  if (prefs.platform) out.push({ id: "n-p-1", cat: "platform", title: "New: Action Center, Calendar and Settings", sub: "Platform update", href: "/settings" });
  return out.slice(0, 8);
}
