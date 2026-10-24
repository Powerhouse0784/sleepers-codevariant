import type { Cell, HiveEvent, Kind } from "@/types";
const H = 36e5;
/** Sample workspace. Labelled as demo data in the UI. Timestamps are relative to "now" so the hive always looks alive. */
export function makeSeed(now: number): { events: HiveEvent[]; cells: Cell[] } {
  const ago = (h: number) => new Date(now - h * H).toISOString();
  const events: HiveEvent[] = [
    { id: "e1", title: "HackSphere 2026", type: "Hackathon", date: ago(24 * 5), venue: "Bangalore, India" },
    { id: "e2", title: "DevConnect Delhi", type: "Conference", date: ago(24 * 18), venue: "Delhi, India" },
    { id: "e3", title: "Founders Mixer", type: "Networking", date: ago(24 * 45), venue: "Mumbai, India" },
    { id: "e4", title: "TechSummit 2026", type: "Conference", date: ago(-48), venue: "Bangalore, India",
      startsAt: (() => { const d = new Date(now + 48 * H); d.setHours(9, 0, 0, 0); return d.toISOString(); })() },
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
