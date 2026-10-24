export type Kind = "idea" | "person" | "action" | "note";
export type LogEntry = { at: string; text: string };
export interface Cell {
  id: string;
  kind: Kind;
  title: string;
  note?: string;
  eventId: string;
  createdAt: string;
  lastMeaningfulActivityAt: string; // only deliberate actions move this
  dueAt?: string;
  done?: boolean;
  archived?: boolean;
  pinned?: boolean;
  log: LogEntry[];
}

export const EVENT_TYPES = ["Conference", "Hackathon", "Meetup", "Networking", "Forum", "Workshop"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export interface HiveEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  startsAt?: string;
  endsAt?: string;
  venue?: string;
  tags?: string[];
  archived?: boolean;
  /** Bumped when something is captured or completed in this event (never by passive visits). */
  updatedAt?: string;
  /** Last time the user opened the event. Only feeds "Recently revisited". */
  visitedAt?: string;
  /** Demo-only: records that live outside the seeded cells, so sample events look lived-in. `progress` is 0..100. */
  sample?: { ideas: number; people: number; actions: number; progress: number };
}
