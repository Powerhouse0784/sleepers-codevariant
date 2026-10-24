/** Ideas screen logic. Everything shown (ranking, badges, stats) is derived from the stored ideas, never stored itself. */
export const CATEGORIES = ["tech", "education", "environment", "business", "social", "others"] as const;
export type Category = (typeof CATEGORIES)[number];
export const CATEGORY_LABEL: Record<Category, string> = { tech: "Tech & Innovation", education: "Education", environment: "Environment", business: "Business", social: "Social Impact", others: "Others" };
export const CATEGORY_COLOR: Record<Category, string> = { tech: "#2F6BFF", education: "#2F8BFF", environment: "#16B26E", business: "#3B6CFF", social: "#F0386F", others: "#6B7A99" };

export type Stage = "idea" | "progress" | "done";
export const STAGE_LABEL: Record<Stage, string> = { idea: "Idea", progress: "In progress", done: "Done" };
export interface IdeaComment { id: string; authorId: string; text: string; at: string }
export interface Idea {
  id: string; title: string; summary: string; category: Category; authorId: string; createdAt: string;
  /** Likes from other people. Your own like is added on top via `likedByMe`. */
  likes: number; likedByMe: boolean;
  /** Demo-only: comments that exist but are not stored one by one, so sample ideas look lived-in. */
  baseComments: number; comments: IdeaComment[];
  stage: Stage; shared: boolean;
}
export const ME = "me";
export const AUTHORS: Record<string, string> = { me: "Saqib Nadeem", ayesha: "Ayesha Khan", rohan: "Rohan Verma", priya: "Priya Singh", arjun: "Arjun Patel", neha: "Neha Sharma", kabir: "Kabir Mehta", zoya: "Zoya Ali" };
export const AVATAR_TINT: Record<string, [string, string]> = { me: ["#FFD23F", "#ff9a3c"], ayesha: ["#FF8FB1", "#C2417A"], rohan: ["#7FB2FF", "#2F5FD0"], priya: ["#C9A3FF", "#7B4FD8"], arjun: ["#7CE0B4", "#1E9E75"], neha: ["#FFB36B", "#E0701F"], kabir: ["#8FD3FF", "#2A7FC4"], zoya: ["#F6A5A5", "#C94C4C"] };

/** A like is worth showing as "support" from this many likes. */
export const SUPPORT_AT = 25;
export const likeCount = (i: Idea) => i.likes + (i.likedByMe ? 1 : 0);
export const commentCount = (i: Idea) => i.baseComments + i.comments.length;
export const authorName = (id: string, userName?: string) => (id === ME && userName ? `${userName} Nadeem` : AUTHORS[id] ?? "Someone");

export const feedOf = (all: Idea[]) => all.filter((i) => i.shared);
export const ranked = (all: Idea[]) => [...feedOf(all)].sort((a, b) => likeCount(b) - likeCount(a) || Date.parse(b.createdAt) - Date.parse(a.createdAt));
/** The most liked idea is "Hot", the runner-up is "Trending". */
export function badgeOf(all: Idea[], id: string): "hot" | "trending" | null { const r = ranked(all); return r[0]?.id === id ? "hot" : r[1]?.id === id ? "trending" : null; }

export type Scope = "all" | "mine" | "shared" | "progress" | "support";
export const SCOPE_LABEL: Record<Scope, string> = { all: "All ideas", mine: "All of your ideas", shared: "Ideas you shared", progress: "Ideas in progress", support: "Ideas that gained support" };
export function myStats(all: Idea[]) {
  const mine = all.filter((i) => i.authorId === ME);
  return { total: mine.length, shared: mine.filter((i) => i.shared).length, progress: mine.filter((i) => i.stage === "progress").length, support: mine.filter((i) => i.shared && likeCount(i) >= SUPPORT_AT).length };
}
export function inScope(i: Idea, scope: Scope) {
  if (scope === "all") return i.shared;
  if (i.authorId !== ME) return false;
  return scope === "mine" ? true : scope === "shared" ? i.shared : scope === "progress" ? i.stage === "progress" : i.shared && likeCount(i) >= SUPPORT_AT;
}
export function matches(i: Idea, q: string, userName?: string) {
  const t = q.trim().toLowerCase(); if (!t) return true;
  return `${i.title} ${i.summary} ${CATEGORY_LABEL[i.category]} ${authorName(i.authorId, userName)}`.toLowerCase().includes(t);
}
export function when(iso: string, nowMs: number) {
  const d = Math.floor(Math.max(0, nowMs - Date.parse(iso)) / 864e5);
  if (d < 1) { const h = Math.floor(Math.max(0, nowMs - Date.parse(iso)) / 36e5); return h < 1 ? "just now" : `${h} ${h === 1 ? "hour" : "hours"} ago`; }
  if (d < 7) return `${d} ${d === 1 ? "day" : "days"} ago`;
  const w = Math.floor(d / 7); return w < 5 ? `${w} ${w === 1 ? "week" : "weeks"} ago` : `${Math.floor(d / 30)} mo ago`;
}

/** Sample feed. Counts are tuned so the first screen reads like the design. Timestamps are relative to "now". */
export function makeIdeas(now: number): Idea[] {
  const D = 864e5; const ago = (d: number) => new Date(now - d * D).toISOString();
  const I = (id: string, title: string, summary: string, category: Category, authorId: string, days: number, likes: number, baseComments: number, extra: Partial<Idea> = {}, comments: IdeaComment[] = []): Idea =>
    ({ id, title, summary, category, authorId, createdAt: ago(days), likes, likedByMe: false, baseComments, comments, stage: "idea", shared: true, ...extra });
  const cm = (id: string, authorId: string, text: string, days: number): IdeaComment => ({ id, authorId, text, at: ago(days) });
  return [
    I("s1", "AI-Powered Learning Assistant", "An AI tool that helps students learn with personalized lessons based on their pace and style.", "tech", ME, 2, 124, 16, { stage: "progress" }, [cm("s1a", "ayesha", "Offline mode would make this work in low-connectivity classrooms.", 1), cm("s1b", "rohan", "Happy to help with the lesson-planning logic.", 1)]),
    I("s2", "Waste to Wealth Platform", "Turn waste into useful products and create income for local communities.", "environment", "ayesha", 3, 98, 11, {}, [cm("s2a", "arjun", "Could partner with local recycling collectives.", 2)]),
    I("s3", "Digital Study Notes Sharing", "A platform where students can share and access quality study notes for free.", "education", "rohan", 4, 76, 8, {}, [cm("s3a", "neha", "Peer ratings would keep quality high.", 3)]),
    I("s4", "Local Business Support App", "A mobile app to help local shops and small businesses grow online.", "business", "priya", 5, 62, 6, {}, [cm("s4a", "kabir", "WhatsApp ordering would be a great first feature.", 4)]),
    I("s5", "Mental Health Awareness", "A community-driven platform to support mental health and well-being.", "social", "arjun", 6, 54, 10, {}, [cm("s5a", "zoya", "Peer listeners with simple training could help a lot.", 5)]),
    I("s6", "Space Tourism for Students", "Make space experiences accessible to students through affordable programs.", "others", "neha", 7, 41, 5, {}, [cm("s6a", "me", "Start with planetarium and simulator partnerships.", 6)]),
    I("m2", "Campus Tour AR Guide", "An AR guide that walks new students around campus and tells the story of each place.", "tech", ME, 9, 51, 8, { stage: "progress" }),
    I("m3", "Alumni Intro Matcher", "Match students with alumni who can open doors in the field they care about.", "business", ME, 12, 40, 5, {}),
    I("m4", "Voice Notes to Action Items", "Turn rambling voice notes into a short list of things to do.", "tech", ME, 15, 18, 3, { stage: "progress" }),
    I("m5", "Hive-style Standup Board", "A visual standup board where every update is a warm or cooling cell.", "business", ME, 19, 9, 2, {}),
    I("m6", "Open Notes for Exams", "Past papers and notes from seniors, grouped by subject and year.", "education", ME, 24, 7, 1, {}),
    I("m7", "Neighbourhood Tool Library", "Borrow tools from neighbours instead of buying them for one weekend.", "social", ME, 30, 3, 0, {}),
    I("m8", "Skill Swap Board", "Trade an hour of what you know for an hour of what you want to learn.", "education", ME, 34, 4, 1, {}),
    // Drafts: yours, not shared yet
    I("d1", "Study Group Matchmaker", "Pair people by course and schedule so nobody studies alone.", "education", ME, 1, 0, 0, { shared: false, stage: "progress" }),
    I("d2", "Solar Bench Charging Spots", "Campus benches that charge phones from the sun.", "environment", ME, 2, 0, 0, { shared: false }),
    I("d3", "Micro-grants for Student Projects", "Small grants decided by community vote.", "social", ME, 3, 0, 0, { shared: false }),
    I("d4", "Event Memory Cards", "Shareable recap cards for every event you attend.", "others", ME, 4, 0, 0, { shared: false }),
  ];
}
