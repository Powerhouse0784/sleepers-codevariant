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
  log: LogEntry[];
}
export interface HiveEvent { id: string; title: string; type: string; date: string; startsAt?: string; venue?: string }
