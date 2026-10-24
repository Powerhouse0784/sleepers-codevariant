/** Canvas Protocol rules for the Ideas screen: which card may go in which Action Zone, and why not. No imports, so it can be tested on its own. */
export type ZoneId = "support" | "discuss" | "backlog" | "progress" | "done" | "publish" | "draft" | "bin" | "post";
export type Dragged =
  | { kind: "idea"; id: string }
  | { kind: "composer"; title: string; summary: string }
  | { kind: "comment"; text: string };
export interface Facts { mine: boolean; shared: boolean; stage: "idea" | "progress" | "done" }
const STAGE_NAME = { idea: "just an idea", progress: "in progress", done: "done" } as const;

/** `true` means the zone accepts the card. A string is the reason it does not, shown to the person. */
export function dropRule(zone: ZoneId, d: Dragged, f?: Facts): true | string {
  if (d.kind === "composer") {
    if (zone !== "publish" && zone !== "draft") return "A new idea goes to Publish or Save draft.";
    if (!d.title.trim()) return "Give your idea a title first.";
    if (!d.summary.trim()) return "Add a sentence or two first.";
    return true;
  }
  if (d.kind === "comment") {
    if (zone !== "post") return "Comments go to the Post zone.";
    return d.text.trim() ? true : "Write something first.";
  }
  if (zone === "post") return "Drop a comment note here.";
  if (!f) return "That idea is gone.";
  switch (zone) {
    case "support": return f.shared ? true : "Share it first, then people can support it.";
    case "discuss": return true;
    case "backlog": case "progress": case "done": {
      const to = zone === "backlog" ? "idea" : zone;
      if (!f.mine) return "Only you can move your own ideas.";
      return f.stage === to ? `Already ${STAGE_NAME[to]}.` : true;
    }
    case "publish": return !f.mine ? "Only your own drafts can be published." : f.shared ? "Already shared." : true;
    case "draft": return "Drop a new idea note here to keep it as a draft.";
    case "bin": return f.mine ? true : "Only your own ideas can be deleted.";
    default: return "Not here.";
  }
}
