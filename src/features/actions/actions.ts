/** Action Center logic. XP, level, counts and activity ages are derived from what you joined, never stored. */
export type OppKind = "event" | "challenge" | "idea";
export const KIND_LABEL: Record<OppKind, string> = { event: "Event", challenge: "Challenge", idea: "Idea" };
export const KIND_COLOR: Record<OppKind, string> = { event: "#5B5BF0", challenge: "#13A05B", idea: "#F2701B" };
export const KIND_CTA: Record<OppKind, string> = { event: "Join Event", challenge: "Join Challenge", idea: "Submit Idea" };

export interface Opportunity {
  id: string; kind: OppKind; title: string; blurb: string;
  /** Days from today. Undefined means ongoing. Dates are built from "now", so sample data never goes stale. */
  inDays?: number; time?: string; participants: number; image?: string;
}
export const OPPORTUNITIES: Opportunity[] = [
  { id: "hackathon", kind: "event", title: "Hackathon 2026", blurb: "Build innovative solutions for a brighter future.", inDays: 1, time: "10:00 AM", participants: 245, image: "/action/feat-hack.webp" },
  { id: "green-campus", kind: "challenge", title: "Green Campus Challenge", blurb: "Make your campus more sustainable and eco-friendly.", inDays: 22, time: "09:00 AM", participants: 189, image: "/action/feat-green.webp" },
  { id: "design-workshop", kind: "event", title: "Design Thinking Workshop", blurb: "Learn, ideate and create impactful solutions.", inDays: 35, time: "02:00 PM", participants: 312, image: "/action/feat-design.webp" },
  { id: "innovation-fund", kind: "idea", title: "Student Innovation Fund", blurb: "Get support for your innovative ideas and projects.", participants: 467, image: "/action/feat-idea.webp" },
  { id: "cleanup-sprint", kind: "challenge", title: "Campus Cleanup Sprint", blurb: "One weekend, one team, one much cleaner campus.", inDays: 8, time: "08:00 AM", participants: 134 },
  { id: "pitch-night", kind: "event", title: "Pitch Night", blurb: "Three minutes to pitch your idea to mentors and peers.", inDays: 12, time: "06:30 PM", participants: 98 },
  { id: "zero-waste", kind: "challenge", title: "Zero Waste Week", blurb: "Cut your waste for seven days and log what you learn.", inDays: 18, time: "09:00 AM", participants: 221 },
  { id: "mentor-grants", kind: "idea", title: "Mentor Micro-Grants", blurb: "Pitch a small project and get a mentor plus seed funding.", participants: 156 },
];

export const AWARD = { event: 50, challenge: 25, done: 150 } as const;
export const BASE_XP = 2020; // lands on Level 3, 420 / 800 XP
export const LEVEL_XP = 800;
export const LEVEL_NAMES = ["Fresh Buzz", "Hive Rookie", "Community Explorer", "Idea Spark", "Action Hero", "Hive Champion", "Buzz Legend"];
export const BASE = { events: 5, challenges: 2, badges: 4 };

export interface Joined { at: number; done?: number }
export type JoinMap = Record<string, Joined>;

export function xpOf(j: JoinMap) {
  let xp = BASE_XP;
  for (const o of OPPORTUNITIES) { const r = j[o.id]; if (!r || o.kind === "idea") continue; xp += AWARD[o.kind]; if (r.done) xp += AWARD.done; }
  return xp;
}
export function levelOf(xp: number) {
  const level = Math.floor(xp / LEVEL_XP) + 1;
  return { level, into: xp % LEVEL_XP, need: LEVEL_XP, name: LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)], pct: Math.round(((xp % LEVEL_XP) / LEVEL_XP) * 100) };
}
export function countsOf(j: JoinMap) {
  const has = (k: OppKind) => OPPORTUNITIES.filter((o) => o.kind === k && j[o.id]);
  const events = has("event").length, doneChallenges = has("challenge").filter((o) => j[o.id].done).length;
  const joined = events + has("challenge").length;
  return { events: BASE.events + events, challenges: BASE.challenges + doneChallenges, badges: BASE.badges + (joined >= 3 ? 1 : 0) + (joined >= 6 ? 1 : 0) };
}
export const BADGE_RULES = ["Joined 3 events or challenges", "Joined 6 events or challenges"];

export const participantsOf = (o: Opportunity, j: JoinMap) => o.participants + (j[o.id] ? 1 : 0);
export function whenOf(o: Opportunity, nowMs: number) {
  if (o.inDays === undefined) return "Ongoing";
  const d = new Date(nowMs); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + o.inDays);
  return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}  •  ${o.time}`;
}
export function matches(o: Opportunity, q: string) {
  const t = q.trim().toLowerCase(); return !t || `${o.title} ${o.blurb} ${KIND_LABEL[o.kind]}`.toLowerCase().includes(t);
}
export function ago(ms: number) {
  const m = Math.max(0, Math.floor(ms / 60000));
  return m < 1 ? "just now" : m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m / 60)}h ago` : `${Math.floor(m / 1440)}d ago`;
}

export type FeedKind = "challenge" | "idea" | "team" | "done" | "event";
export interface Feed { id: string; who: string; avatar?: string; verb: string; what: string; kind: FeedKind; minsAgo: number; mine?: boolean }
/** Sample community activity, anchored to the moment you open the screen so it always reads as fresh. */
export const FEED_SEED: Feed[] = [
  { id: "f1", who: "Priya Singh", avatar: "/action/av-priya-singh.webp", verb: "joined the", what: "Design Challenge", kind: "challenge", minsAgo: 2 },
  { id: "f2", who: "Rohan Verma", avatar: "/action/av-rohan-verma.webp", verb: "shared a new idea", what: "Green Campus Initiative", kind: "idea", minsAgo: 5 },
  { id: "f3", who: "Sneha Gupta", avatar: "/action/av-sneha-gupta.webp", verb: "joined the team", what: "Tech Innovators", kind: "team", minsAgo: 12 },
  { id: "f4", who: "Aditya Kumar", avatar: "/action/av-aditya-kumar.webp", verb: "completed", what: "Build a Better Tomorrow", kind: "done", minsAgo: 18 },
  { id: "f5", who: "Neha Sharma", avatar: "/people/av/neha-sharma.webp", verb: "joined the event", what: "Pitch Night", kind: "event", minsAgo: 26 },
  { id: "f6", who: "Karan Malhotra", avatar: "/people/av/karan-malhotra.webp", verb: "shared a new idea", what: "Skill Swap Board", kind: "idea", minsAgo: 43 },
  { id: "f7", who: "Isha Khan", avatar: "/people/av/isha-khan.webp", verb: "joined the", what: "Zero Waste Week", kind: "challenge", minsAgo: 71 },
  { id: "f8", who: "Aryan Sharma", avatar: "/people/av/aryan-sharma.webp", verb: "completed", what: "Campus Cleanup Sprint", kind: "done", minsAgo: 130 },
];
export function feedOf(j: JoinMap, nowMs: number, anchor: number): Feed[] {
  const mine: Feed[] = OPPORTUNITIES.flatMap((o) => {
    const r = j[o.id]; if (!r || o.kind === "idea") return [];
    const base: Feed = { id: `m-${o.id}`, who: "You", avatar: "/action/av-me.webp", verb: o.kind === "event" ? "joined the event" : "joined the", what: o.title, kind: o.kind, minsAgo: (nowMs - r.at) / 60000, mine: true };
    return r.done ? [{ ...base, id: `d-${o.id}`, verb: "completed", what: o.title, kind: "done" as const, minsAgo: (nowMs - r.done) / 60000 }, base] : [base];
  });
  const seeds = FEED_SEED.map((f) => ({ ...f, minsAgo: f.minsAgo + (nowMs - anchor) / 60000 }));
  return [...mine, ...seeds].sort((a, b) => a.minsAgo - b.minsAgo);
}
