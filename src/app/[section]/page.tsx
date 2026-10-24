import Link from "next/link";
const COPY: Record<string, [string, string]> = {
  events: ["Events", "Your event spaces, with notes, people and actions for each one."],
  ideas: ["Ideas", "Every idea, its history, and its next step."],
  people: ["People", "Who you met, what you discussed, and what you promised."],
  actions: ["Action Center", "Commitments, due dates and reminders in one place."],
  calendar: ["Calendar", "Upcoming events and follow-up dates."],
  knowledge: ["Knowledge Base", "Takeaways and resources from every event."],
  settings: ["Settings", "Theme, privacy and your data."],
};
export function generateStaticParams() { return Object.keys(COPY).map((section) => ({ section })); }
export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params; const [title, blurb] = COPY[section] ?? ["Not found", "This page does not exist."];
  return (
    <div className="mx-auto mt-16 max-w-md text-center"><h1 className="script text-5xl text-honey">{title}</h1>
      <p className="mt-3 text-mute">{blurb}</p><p className="mt-1 text-sm text-mute">This screen is the next one we build.</p>
      <Link href="/" className="btn-gold mt-6 inline-block px-5 py-2.5 text-sm">Back to Daily Buzz</Link></div>
  );
}
