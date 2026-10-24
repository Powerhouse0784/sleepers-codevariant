"use client";
import { CalendarCheck, Trophy, Megaphone, UserMinus, CheckCircle2, type LucideIcon } from "lucide-react";
import ActionZone from "../canvas/ActionZone";
import { useCanvas, type Payload, type ZoneDef } from "@/lib/canvas";
import { useActions } from "@/lib/actionsStore";
import { useIdeasUI } from "@/lib/ideasStore";
import { useUI } from "@/lib/store";
import { OPPORTUNITIES, type OppKind, type Opportunity } from "@/features/actions/actions";

export interface OppDragged { kind: "opportunity"; id: string; oppKind: OppKind }
export const oppCard = (o: Opportunity): Payload => ({
  label: o.title,
  sub: o.kind === "event" ? "Event" : o.kind === "challenge" ? "Challenge" : "Idea",
  data: { kind: "opportunity", id: o.id, oppKind: o.kind } satisfies OppDragged,
});

const isOpp = (p: Payload): OppDragged | null => {
  const d = p.data as OppDragged;
  return d?.kind === "opportunity" ? d : null;
};
const getOpp = (p: Payload): Opportunity | undefined => {
  const d = isOpp(p); if (!d) return undefined;
  return OPPORTUNITIES.find((o) => o.id === d.id);
};

const def = (id: string, label: string, hint: string, tone: string,
  accepts: (p: Payload) => true | string, drop: (p: Payload) => string | void): ZoneDef =>
  ({ id, label, hint, tone, accepts, drop });

export const ACTION_ZONES = {
  join: def("act-join", "Join", "Drop to join this event or challenge", "#2F8BFF",
    (p) => {
      const d = isOpp(p); if (!d) return "Not an opportunity card.";
      if (d.oppKind === "idea") return "Drop ideas on Submit Idea instead.";
      const r = useActions.getState().joined[d.id];
      if (r) return "Already joined — drop on Leave to exit.";
      return true;
    },
    (p) => {
      const d = isOpp(p)!; const o = getOpp(p)!; const st = useActions.getState();
      st.join(o.id, Date.now());
      useUI.getState().toast(`You joined ${o.title}. +${o.kind === "event" ? 50 : 25} XP`);
      return `Joined ${o.title}!`;
    },
  ),
  complete: def("act-complete", "Complete", "Drop a challenge to mark it done", "#1FD18B",
    (p) => {
      const d = isOpp(p); if (!d) return "Not an opportunity card.";
      if (d.oppKind !== "challenge") return "Only challenges can be completed here.";
      const r = useActions.getState().joined[d.id];
      if (!r) return "Join the challenge first.";
      if (r.done) return "Already completed!";
      return true;
    },
    (p) => {
      const o = getOpp(p)!; useActions.getState().complete(o.id, Date.now());
      useUI.getState().celebrate();
      return `Challenge complete! +150 XP`;
    },
  ),
  leave: def("act-leave", "Leave", "Drop to leave this opportunity", "#FF6B81",
    (p) => {
      const d = isOpp(p); if (!d) return "Not an opportunity card.";
      if (d.oppKind === "idea") return "Idea opportunities cannot be left.";
      const r = useActions.getState().joined[d.id];
      if (!r) return "You haven't joined this one.";
      return true;
    },
    (p) => {
      const o = getOpp(p)!; useActions.getState().leave(o.id);
      useUI.getState().toast(`You left ${o.title}.`);
    },
  ),
  submit: def("act-submit", "Submit Idea", "Drop an idea opportunity here", "#FFC629",
    (p) => {
      const d = isOpp(p); if (!d) return "Not an opportunity card.";
      if (d.oppKind !== "idea") return "Only idea opportunities go here.";
      return true;
    },
    (_p) => {
      useIdeasUI.getState().setShare(true);
      return "Opening idea composer…";
    },
  ),
};

const ICONS: Record<keyof typeof ACTION_ZONES, LucideIcon> = {
  join: CalendarCheck, complete: CheckCircle2, leave: UserMinus, submit: Megaphone,
};
type ZoneId = keyof typeof ACTION_ZONES;
export const ActZone = ({ id, variant, className }: { id: ZoneId; variant?: "dock" | "strip"; className?: string }) =>
  <ActionZone def={ACTION_ZONES[id]} Icon={ICONS[id]} variant={variant} className={className} />;

/** Dock that appears at the bottom while an opportunity card is being held. */
export function ActionDock() {
  const holding = useCanvas((s) => !!s.drag);
  if (!holding) return null;
  const payload = useCanvas.getState().drag?.payload;
  if (!payload || !isOpp(payload)) return null;
  return (
    <div role="region" aria-label="Action zones" className="fixed inset-x-3 bottom-[88px] z-20 lg:inset-x-6 lg:bottom-4">
      <div className="card mx-auto flex w-fit max-w-full items-stretch gap-3 overflow-x-auto rounded-3xl! border-[color-mix(in_srgb,var(--gold)_35%,var(--line))] p-2.5 shadow-2xl backdrop-blur scroll-thin">
        <ActZone id="join" variant="dock" />
        <span aria-hidden className="w-px shrink-0 bg-[var(--line)]" />
        <ActZone id="complete" variant="dock" />
        <span aria-hidden className="w-px shrink-0 bg-[var(--line)]" />
        <ActZone id="leave" variant="dock" />
        <span aria-hidden className="w-px shrink-0 bg-[var(--line)]" />
        <ActZone id="submit" variant="dock" />
      </div>
    </div>
  );
}
