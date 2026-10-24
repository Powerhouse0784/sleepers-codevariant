/** People screen logic. Ranking, follower counts, stats and filters are all derived from the stored people, never stored themselves. */
export const GROUPS = ["students", "creators", "mentors", "experts", "teams"] as const;
export type Group = (typeof GROUPS)[number];
export const GROUP_LABEL: Record<Group, string> = { students: "Students", creators: "Creators", mentors: "Mentors", experts: "Experts", teams: "Teams" };
export type Tab = "all" | Group | "followed";
export const TAB_LABEL: Record<Tab, string> = { all: "All People", ...GROUP_LABEL, followed: "Followed" };
export const FAMILIES = ["Developer", "Designer", "Data & AI", "Content", "Mentor", "Team"] as const;
export type Family = (typeof FAMILIES)[number];
export type Status = "online" | "away" | "offline";
export const STATUS_LABEL: Record<Status, string> = { online: "Online", away: "Away", offline: "Offline" };
export const STATUS_COLOR: Record<Status, string> = { online: "#1FD18B", away: "#FFB02E", offline: "#7C8BA8" };
export type SortKey = "popular" | "followers" | "name" | "newest";
export const SORTS: { k: SortKey; label: string }[] = [{ k: "popular", label: "Popular" }, { k: "followers", label: "Most followed" }, { k: "name", label: "Name A to Z" }, { k: "newest", label: "Newest" }];

export interface Person {
  id: string; name: string; role: string; family: Family; city: string; bio: string; skills: string[]; groups: Group[];
  status: Status; verified: boolean;
  /** Followers from other people. Your own follow is added on top via `followed`. */
  followers: number; points: number; joinedDaysAgo: number; avatar?: string; followed: boolean; isMe?: boolean;
}
export const ME_ID = "me";
export const AVATAR_FILE: Record<string, string> = { aryan: "aryan-sharma", priya: "priya-singh", rohan: "rohan-verma", sneha: "sneha-gupta", aditya: "aditya-kumar", neha: "neha-sharma", karan: "karan-malhotra", isha: "isha-khan" };
const RINGS = ["#18C5B0", "#2F8BFF", "#FFC629", "#8B5CF6"];
export const ringOf = (id: string) => RINGS[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % RINGS.length];

export const followerCount = (p: Person) => p.followers + (p.followed ? 1 : 0);
export function fmtK(n: number) { if (n < 1000) return String(n); const k = n / 1000; return `${k >= 10 ? Math.round(k) : (Math.round(k * 10) / 10).toString()}k`; }
export const fmtBig = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(n));

export const byPoints = (all: Person[]) => [...all].sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
export const skillsOf = (all: Person[]) => { const m = new Map<string, number>(); all.forEach((p) => p.skills.forEach((s) => m.set(s, (m.get(s) ?? 0) + 1))); return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([s]) => s); };
export const familiesOf = (all: Person[]) => FAMILIES.filter((f) => all.some((p) => p.family === f));
export function inTab(p: Person, tab: Tab) { return tab === "all" ? true : tab === "followed" ? p.followed && !p.isMe : p.groups.includes(tab); }
export function matches(p: Person, q: string) {
  const t = q.trim().toLowerCase(); if (!t) return true;
  return `${p.name} ${p.role} ${p.city} ${p.bio} ${p.skills.join(" ")} ${p.groups.join(" ")}`.toLowerCase().includes(t);
}
export function sortPeople(list: Person[], k: SortKey) {
  const by: Record<SortKey, (a: Person, b: Person) => number> = {
    popular: (a, b) => b.points - a.points || a.name.localeCompare(b.name), followers: (a, b) => followerCount(b) - followerCount(a), name: (a, b) => a.name.localeCompare(b.name), newest: (a, b) => a.joinedDaysAgo - b.joinedDaysAgo,
  };
  return [...list].sort(by[k]);
}
/** Demo numbers for the whole community (the directory itself is a sample). Real changes, like you joining, add on top. */
export const COMMUNITY = { members: 10200, activeToday: 2600, newThisWeek: 480, positive: 98 };
export function communityStats(all: Person[]) {
  const me = all.some((p) => p.isMe) ? 1 : 0;
  return { members: COMMUNITY.members + me, active: COMMUNITY.activeToday + (all.some((p) => p.isMe && p.status === "online") ? 1 : 0), fresh: COMMUNITY.newThisWeek + me, positive: COMMUNITY.positive };
}

export function makePeople(): Person[] {
  const P = (id: string, name: string, role: string, family: Family, city: string, status: Status, followers: number, points: number, bio: string, skills: string[], groups: Group[], extra: Partial<Person> = {}): Person =>
    ({ id, name, role, family, city, status, followers, points, bio, skills, groups, verified: true, joinedDaysAgo: 200, avatar: AVATAR_FILE[id] ? `/people/av/${AVATAR_FILE[id]}.webp` : undefined, followed: false, ...extra });
  return [
    P("aryan", "Aryan Sharma", "Full Stack Developer", "Developer", "Bangalore, India", "online", 2400, 4800, "Building web apps and loving TypeScript. Always open to collaborate on cool projects!", ["Next.js", "TypeScript", "React", "Node.js", "Tailwind CSS", "PostgreSQL"], ["students", "experts"], { joinedDaysAgo: 420 }),
    P("priya", "Priya Singh", "UI/UX Designer", "Designer", "Delhi, India", "online", 1800, 4200, "Designing beautiful and user-friendly experiences. Let's create something amazing!", ["Figma", "UI/UX", "Design", "Prototyping", "Design Systems"], ["creators"], { joinedDaysAgo: 380 }),
    P("rohan", "Rohan Verma", "AI/ML Enthusiast", "Data & AI", "Noida, India", "online", 1200, 3900, "Exploring the world of AI and machine learning. Open for collaborations and discussions.", ["Python", "Machine Learning", "AI", "TensorFlow"], ["students"], { joinedDaysAgo: 300 }),
    P("sneha", "Sneha Gupta", "Content Creator", "Content", "Jaipur, India", "away", 980, 3500, "Turning ideas into engaging content. Love tech, travel and positive vibes!", ["Content Creation", "Video Editing", "Storytelling", "SEO"], ["creators"], { joinedDaysAgo: 260 }),
    P("aditya", "Aditya Kumar", "Backend Developer", "Developer", "Pune, India", "online", 1500, 3100, "Building scalable systems and APIs. Always learning and improving!", ["Node.js", "Express", "MongoDB", "Docker", "Redis"], ["experts"], { joinedDaysAgo: 340 }),
    P("neha", "Neha Sharma", "Frontend Developer", "Developer", "Gurgaon, India", "online", 1300, 2900, "Crafting responsive and accessible web experiences with modern tech.", ["React", "Next.js", "Tailwind CSS", "Accessibility", "Framer Motion"], ["students", "creators"], { joinedDaysAgo: 220 }),
    P("karan", "Karan Malhotra", "Mobile App Developer", "Developer", "Chandigarh, India", "away", 870, 2600, "Building mobile apps with passion. Love React Native and Firebase!", ["React Native", "Firebase", "Android", "Kotlin"], ["experts"], { joinedDaysAgo: 180 }),
    P("isha", "Isha Khan", "Data Scientist", "Data & AI", "Hyderabad, India", "online", 1100, 2400, "Turning data into insights. Focused on ML, visualization and real-world impact.", ["Python", "Pandas", "Data Analysis", "Tableau"], ["mentors", "experts"], { joinedDaysAgo: 160 }),
    P("dev", "Dev Malhotra", "Engineering Mentor", "Mentor", "Mumbai, India", "offline", 640, 2100, "Ten years of shipping products. Happy to review your portfolio and projects.", ["System Design", "Career Advice", "Go"], ["mentors"], { joinedDaysAgo: 140 }),
    P("meera", "Meera Iyer", "Product Designer", "Designer", "Chennai, India", "online", 720, 1900, "Helping first-time designers land their first role. Portfolio reviews on Fridays.", ["Figma", "User Research", "Portfolio Reviews"], ["mentors", "creators"], { joinedDaysAgo: 90 }),
    P("campus", "Campus Coders", "Student Developer Team", "Team", "Delhi, India", "online", 540, 1600, "A team of 12 students building open-source tools every weekend.", ["Open Source", "React", "Python"], ["teams", "students"], { joinedDaysAgo: 60, verified: false }),
    P("hackhive", "Hack Hive Collective", "Hackathon Team", "Team", "Bangalore, India", "away", 480, 1400, "We form teams for every hackathon. Looking for designers and backend folks!", ["Hackathons", "Teamwork", "Node.js"], ["teams"], { joinedDaysAgo: 21, verified: false }),
  ];
}
