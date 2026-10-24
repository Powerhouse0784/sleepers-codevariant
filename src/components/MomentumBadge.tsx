import { Flame, Sun, Snowflake, Ghost } from "lucide-react";
import { STATE_LABEL, type MomentumState } from "@/features/momentum/momentum";

export const STATE_COLOR: Record<MomentumState, string> = { hot: "#FF477E", warm: "#FFC629", cooling: "#16B9F4", cold: "#A66BFF" };
export const STATE_ICON = { hot: Flame, warm: Sun, cooling: Snowflake, cold: Ghost } as const;

export default function MomentumBadge({ state }: { state: MomentumState }) {
  const Icon = STATE_ICON[state];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ background: `${STATE_COLOR[state]}22`, color: STATE_COLOR[state] }}>
      <Icon size={13} aria-hidden /> {STATE_LABEL[state]}
    </span>
  );
}
