"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Users, GraduationCap, Sparkles, UserCheck, ShieldCheck, Star, Search, ChevronDown, ArrowDownUp, SearchX, RotateCcw, type LucideIcon } from "lucide-react";
import { usePeople, usePeopleUI } from "@/lib/peopleStore";
import { SORTS, TAB_LABEL, familiesOf, inTab, matches, skillsOf, sortPeople, type SortKey, type Tab } from "@/features/people/people";
import PeopleHero from "./PeopleHero";
import PersonCard from "./PersonCard";
import PersonDrawer from "./PersonDrawer";
import ProfileDialog from "./ProfileDialog";
import JoinStrip from "./JoinStrip";
import { CommunityStats, TopContributors, FindTribe, ContributorsDialog } from "./PeopleRail";
import { useMedia } from "@/lib/hooks";
import { PeopleDock } from "./PeopleZones";

const PAGE = 8;
const TABS: { k: Tab; I: LucideIcon }[] = [{ k: "all", I: Users }, { k: "students", I: GraduationCap }, { k: "creators", I: Sparkles }, { k: "mentors", I: UserCheck }, { k: "experts", I: ShieldCheck }, { k: "teams", I: Users }, { k: "followed", I: Star }];

export default function People() {
  const people = usePeople((s) => s.people);
  const { q, tab, role, skill, sort, setQ, setTab, setRole, setSkill, setSort, clearFilters, setProfile } = usePeopleUI();
  const wide = useMedia("(min-width: 1280px)"); const [limit, setLimit] = useState(PAGE);
  useEffect(() => setLimit(PAGE), [q, tab, role, skill, sort]);

  const roles = useMemo(() => familiesOf(people), [people]); const skills = useMemo(() => skillsOf(people), [people]);
  const shown = useMemo(() => sortPeople(people.filter((p) => inTab(p, tab) && (role === "all" || p.family === role) && (skill === "all" || p.skills.includes(skill)) && matches(p, q)), sort), [people, tab, role, skill, q, sort]);
  const visible = shown.slice(0, limit); const anyFilter = q.trim() || tab !== "all" || role !== "all" || skill !== "all";
  const joined = people.some((p) => p.isMe);
  const tribe = () => { clearFilters(); setTab("teams"); document.getElementById("people-directory")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const select = "field w-full appearance-none py-2.5 pl-3.5 pr-9 text-[12.5px] font-medium";
  const Chev = <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-mute" aria-hidden />;

  return (
    <div className="mx-auto max-w-[1320px] space-y-4 pb-4">
      <PeopleHero />
      <div className={wide ? "grid grid-cols-[1fr_290px] items-start gap-4" : ""}>
        <div className="min-w-0">
          <div id="people-directory" className="-mx-1 flex scroll-mt-20 gap-2 overflow-x-auto px-1 py-1 scroll-thin" role="group" aria-label="Filter by community">
            {TABS.map(({ k, I }) => <button key={k} aria-pressed={tab === k} onClick={() => setTab(k)} className="pill inline-flex shrink-0 items-center gap-1.5 px-4 py-2 text-[12.5px]"><I size={15} aria-hidden />{TAB_LABEL[k]}</button>)}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_repeat(3,minmax(0,150px))]">
            <label className="relative sm:col-span-1"><span className="sr-only">Search people</span><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" aria-hidden />
              <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Escape" && setQ("")} placeholder="Search by name, skills, or interests..." className="field w-full py-2.5 pl-10 pr-3 text-[13px]" /></label>
            <label className="relative"><span className="sr-only">Filter by role</span><select value={role} onChange={(e) => setRole(e.target.value)} className={select}><option value="all">All Roles</option>{roles.map((r) => <option key={r}>{r}</option>)}</select>{Chev}</label>
            <label className="relative"><span className="sr-only">Filter by skill</span><select value={skill} onChange={(e) => setSkill(e.target.value)} className={select}><option value="all">All Skills</option>{skills.map((s) => <option key={s}>{s}</option>)}</select>{Chev}</label>
            <label className="relative"><span className="sr-only">Sort people</span><ArrowDownUp size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" aria-hidden />
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={`${select} pl-8`}>{SORTS.map((s) => <option key={s.k} value={s.k}>Sort by: {s.label}</option>)}</select>{Chev}</label>
          </div>
          {anyFilter && <p className="mt-2 flex items-center gap-2 text-[12px] text-mute"><span>{shown.length} {shown.length === 1 ? "person" : "people"}</span><button onClick={clearFilters} className="inline-flex items-center gap-1 underline-offset-2 hover:text-[var(--text)] hover:underline"><RotateCcw size={12} aria-hidden /> Clear filters</button></p>}
          <p className="sr-only" role="status">{shown.length} people shown</p>

          {shown.length === 0 ? (
            <div className="card mt-3 grid place-items-center gap-3 px-6 py-14 text-center"><SearchX size={30} className="text-mute" aria-hidden />
              <p className="text-[15px] font-semibold">{tab === "followed" && !anyFilter ? "You are not following anyone yet" : q.trim() ? `Nobody matches “${q.trim()}”` : "No one here yet"}</p>
              <p className="max-w-xs text-[13px] text-mute">{tab === "followed" && !anyFilter ? "Follow people from the directory and they will show up here." : "Try different filters, or browse everyone."}</p>
              <button onClick={clearFilters} className="btn-blue px-4 py-2 text-[13px]">{tab === "followed" ? "Browse everyone" : "Clear filters"}</button></div>
          ) : (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
              <AnimatePresence initial={false}>{visible.map((p, k) => <li key={p.id} className="min-w-0"><PersonCard p={p} index={k} /></li>)}</AnimatePresence>
            </ul>)}
          {shown.length > limit && <button onClick={() => setLimit(limit + PAGE)} className="btn-blue mx-auto mt-4 flex items-center gap-2 px-5 py-2.5 text-[13px]">Show {Math.min(PAGE, shown.length - limit)} more <ChevronDown size={14} aria-hidden /></button>}
          <div className="mt-4"><JoinStrip all={people} joined={joined} onJoin={() => setProfile(true)} /></div>
        </div>
        {wide && <aside className="sticky top-20 space-y-3" aria-label="Community"><CommunityStats all={people} /><TopContributors all={people} /><FindTribe onClick={tribe} /></aside>}
      </div>
      {!wide && <div className="grid items-start gap-3 md:grid-cols-2"><div className="space-y-3"><CommunityStats all={people} /><TopContributors all={people} /></div><FindTribe onClick={tribe} /></div>}
      <PersonDrawer /><ContributorsDialog all={people} /><ProfileDialog />
      <PeopleDock />
    </div>
  );
}
