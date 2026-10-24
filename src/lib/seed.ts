import type { Cell, HiveEvent, Kind } from "@/types";
const H = 36e5;
const D = 24 * H;
/** Sample workspace. Labelled as demo data in the UI. Timestamps are relative to "now" so the hive always looks alive. */
export function makeSeed(now: number): { events: HiveEvent[]; cells: Cell[] } {
  const ago = (h: number) => new Date(now - h * H).toISOString();
  /** Day offset from today (negative = past) at a given local hour. */
  const day = (offset: number, hour = 9) => { const d = new Date(now + offset * D); d.setHours(hour, 0, 0, 0); return d.toISOString(); };
  const ev = (e: Omit<HiveEvent, "date"> & { date?: string }): HiveEvent => ({ date: e.startsAt ?? ago(0), ...e });

  const events: HiveEvent[] = [
    // The 4 events the dashboard has always used keep their ids and names.
    ev({ id: "e1", title: "HackSphere 2026", type: "Hackathon", venue: "Bangalore, India", startsAt: day(-7), endsAt: day(-5, 18), date: ago(24 * 5), updatedAt: ago(24 * 9), tags: ["AI", "Offline-first"] }),
    ev({ id: "e2", title: "DevConnect Delhi", type: "Conference", venue: "Delhi, India", startsAt: day(-19), endsAt: day(-18, 18), date: ago(24 * 18), updatedAt: ago(24 * 19), tags: ["Dev tools"] }),
    ev({ id: "e3", title: "Founders Mixer", type: "Networking", venue: "Mumbai, India", startsAt: day(-45, 18), endsAt: day(-45, 21), date: ago(24 * 45), updatedAt: ago(24 * 45), archived: true }),
    ev({ id: "e4", title: "TechSummit 2026", type: "Conference", venue: "Bangalore, India", date: day(2, 9), startsAt: day(2, 9), endsAt: day(4, 18), updatedAt: ago(24 * 10), tags: ["Keynotes"] }),
    // Sample events for the Events screen (counts and progress come from `sample` plus anything the user captures).
    ev({ id: "e5", title: "Cloud Native Summit", type: "Conference", venue: "Bangalore, India", startsAt: day(-1, 9), endsAt: day(1, 18), updatedAt: ago(2), visitedAt: ago(2), sample: { ideas: 12, people: 8, actions: 4, progress: 75 }, tags: ["Cloud", "Platform"] }),
    ev({ id: "e6", title: "Build for Tomorrow", type: "Hackathon", venue: "Online", startsAt: day(-2, 10), endsAt: day(1, 20), updatedAt: ago(24), visitedAt: ago(24), sample: { ideas: 8, people: 5, actions: 2, progress: 60 }, tags: ["Climate", "Teams"] }),
    ev({ id: "e7", title: "Design Forward Meetup", type: "Meetup", venue: "Delhi, India", startsAt: day(-30, 17), endsAt: day(-30, 21), updatedAt: ago(72), visitedAt: ago(72), sample: { ideas: 15, people: 11, actions: 6, progress: 100 }, tags: ["Design"] }),
    ev({ id: "e8", title: "Startup Connect", type: "Networking", venue: "Mumbai, India", startsAt: day(-45, 17), endsAt: day(-45, 21), updatedAt: ago(24 * 4), sample: { ideas: 6, people: 4, actions: 3, progress: 70 }, tags: ["Founders"] }),
    ev({ id: "e9", title: "AI & Impact Forum", type: "Forum", venue: "New Delhi, India", startsAt: day(-60, 10), endsAt: day(-60, 17), updatedAt: ago(24 * 6), sample: { ideas: 10, people: 7, actions: 5, progress: 70 }, tags: ["AI", "Policy"] }),
    ev({ id: "e10", title: "Product Makers Night", type: "Meetup", venue: "Bangalore, India", startsAt: day(-80, 18), endsAt: day(-80, 22), updatedAt: ago(24 * 8), sample: { ideas: 14, people: 9, actions: 4, progress: 90 }, tags: ["Product"] }),
    ev({ id: "e11", title: "Women in Tech Summit", type: "Conference", venue: "Pune, India", startsAt: day(12, 9), endsAt: day(13, 18), updatedAt: ago(24 * 11), tags: ["Community"] }),
    ev({ id: "e12", title: "Open Source Weekend", type: "Hackathon", venue: "Online", startsAt: day(20, 10), endsAt: day(21, 20), updatedAt: ago(24 * 12), tags: ["Open source"] }),
  ];
  const c = (id: string, kind: Kind, title: string, eventId: string, h: number, note?: string, extra: Partial<Cell> = {}): Cell => ({
    id, kind, title, note, eventId, createdAt: ago(h + 6), lastMeaningfulActivityAt: ago(h),
    log: [{ at: ago(h), text: "Captured" }], ...extra,
  });
  const cells: Cell[] = [
    // HOT (11)
    c("c1", "idea", "Build an AI study buddy", "e1", 0.04, "Judges loved the offline angle. Needs a tiny prototype."),
    c("c4", "idea", "Voice notes that become action items", "e1", 20),
    c("i3", "idea", "Campus tour AR guide", "e1", 30),
    c("c3", "person", "Priya Sharma (recruiter, Google)", "e1", 3, "Promised: send my project draft."),
    c("p4", "person", "Ananya (mentor, Razorpay)", "e1", 8, "Promised: send her the architecture diagram."),
    c("p5", "person", "Alex Johnson (PM, Atlassian)", "e1", 1, "Wants to see the demo.", { log: [{ at: ago(1), text: "Follow-up scheduled" }, { at: ago(30), text: "Captured" }] }),
    c("c2", "action", "Push the HackSphere repo to GitHub", "e1", 1, undefined, { dueAt: ago(-6) }),
    c("a3", "action", "Draft the project README", "e1", 10),
    c("a4", "action", "Book a demo slot with the mentor", "e1", 40),
    c("c14", "note", "Mentor tip: demo the offline flow first", "e1", 5),
    c("n2", "note", "Pitch the problem before the tech", "e1", 18),
    // WARM (7)
    c("c6", "person", "Rohan (backend, Zepto)", "e1", 110, "Offered a referral. Ask about the Bengaluru team."),
    c("p6", "person", "Dev (founder, Nimbus)", "e2", 155, "Interested in the follow-up studio idea."),
    c("p9", "person", "Sara (design lead, Figma)", "e2", 150, "Promised: share the talk slides."),
    c("c5", "action", "Email Ananya the architecture diagram", "e1", 100, "Promised during the mentor round.", { dueAt: ago(30) }),
    c("a5", "action", "Share slides with the team", "e1", 105),
    c("a6", "action", "Add the HackSphere project to LinkedIn", "e1", 160),
    c("n3", "note", "Talk quote: ship the boring version first", "e2", 90),
    // COOLING (3)
    c("c7", "idea", "Hive-style visual for team standups", "e2", 24 * 9),
    c("c8", "person", "Meera (DevRel, Vercel)", "e2", 24 * 12, "Promised: share the talk slides."),
    c("p7", "person", "Imran (ML engineer, Swiggy)", "e2", 24 * 15, "Asked for the dataset link."),
    // COLD (2)
    c("c11", "person", "Karan (founder, Bloop)", "e3", 24 * 38, "Wanted an intro to my designer friend."),
    c("c12", "idea", "Micro-SaaS: alumni intro matcher", "e3", 24 * 44),
    // Done (not in the hive, but feeds Recent Activity)
    c("d1", "action", "Send project draft", "e1", 2, undefined, { done: true, log: [{ at: ago(2), text: "Marked done" }, { at: ago(30), text: "Captured" }] }),
    c("c9", "action", "Write up the 3 talk takeaways", "e2", 24 * 14, undefined, { archived: true }),
  ];
  return { events, cells };
}
