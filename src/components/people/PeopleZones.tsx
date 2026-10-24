"use client";
import { UserPlus, UserCheck, UserRound, Star } from "lucide-react";
import ActionZone from "../canvas/ActionZone";
import { useCanvas, type Payload, type ZoneDef } from "@/lib/canvas";
import { usePeople, usePeopleUI } from "@/lib/peopleStore";
import { ME_ID } from "@/features/people/people";

/** Shape of data carried by a person card. */
export interface PersonDragged { kind: "person"; id: string }
export const personCard = (id: string, name: string, role: string): Payload => ({
  label: name, sub: role, data: { kind: "person", id } satisfies PersonDragged,
});

const isPerson = (p: Payload): PersonDragged | null => {
  const d = p.data as PersonDragged;
  return d?.kind === "person" ? d : null;
};
const getPerson = (p: Payload) => {
  const d = isPerson(p); if (!d) return undefined;
  return usePeople.getState().people.find((x) => x.id === d.id);
};

const def = (id: string, label: string, hint: string, tone: string,
  accepts: (p: Payload) => true | string, drop: (p: Payload) => string | void): ZoneDef =>
  ({ id, label, hint, tone, accepts, drop });

export const PEOPLE_ZONES = {
  follow: def("ppl-follow", "Follow", "Drop to follow this person", "#FFC629",
    (p) => {
      const person = getPerson(p); if (!person) return "Not a person card.";
      if (person.isMe) return "You can't follow yourself.";
      if (person.followed) return "Already following — drop on Unfollow.";
      return true;
    },
    (p) => { const person = getPerson(p)!; usePeople.getState().toggleFollow(person.id); return `Now following ${person.name}.`; },
  ),
  unfollow: def("ppl-unfollow", "Unfollow", "Drop to stop following", "#9CA8C4",
    (p) => {
      const person = getPerson(p); if (!person) return "Not a person card.";
      if (person.isMe) return "You can't unfollow yourself.";
      if (!person.followed) return "Not following — drop on Follow.";
      return true;
    },
    (p) => { const person = getPerson(p)!; usePeople.getState().toggleFollow(person.id); return `Unfollowed ${person.name}.`; },
  ),
  view: def("ppl-view", "View Profile", "Drop to open profile", "#2F8BFF",
    (p) => { const person = getPerson(p); if (!person) return "Not a person card."; return true; },
    (p) => { const d = isPerson(p)!; usePeopleUI.getState().open(d.id); },
  ),
};

const ICONS = { follow: UserPlus, unfollow: UserCheck, view: UserRound };
type ZoneId = keyof typeof PEOPLE_ZONES;
const Zone = ({ id, variant, className }: { id: ZoneId; variant?: "dock" | "strip"; className?: string }) =>
  <ActionZone def={PEOPLE_ZONES[id]} Icon={ICONS[id]} variant={variant} className={className} />;

/** Dock that slides up while a person card is being held. */
export function PeopleDock() {
  const holding = useCanvas((s) => !!s.drag);
  if (!holding) return null;
  const payload = useCanvas.getState().drag?.payload;
  if (!payload || !isPerson(payload)) return null;
  return (
    <div role="region" aria-label="People action zones" className="fixed inset-x-3 bottom-[88px] z-20 lg:inset-x-6 lg:bottom-4">
      <div className="card mx-auto flex w-fit max-w-full items-stretch gap-3 overflow-x-auto rounded-3xl! border-[color-mix(in_srgb,var(--gold)_35%,var(--line))] p-2.5 shadow-2xl backdrop-blur scroll-thin">
        <Zone id="view" variant="dock" />
        <span aria-hidden className="w-px shrink-0 bg-[var(--line)]" />
        <Zone id="follow" variant="dock" />
        <Zone id="unfollow" variant="dock" />
      </div>
    </div>
  );
}
