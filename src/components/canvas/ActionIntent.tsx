"use client";
import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import Draggable from "./Draggable";
import ActionZone from "./ActionZone";
import { useCanvas, type Payload, type ZoneDef } from "@/lib/canvas";

type IntentData = { kind: "action-intent"; run: () => string | void };
const isIntent = (p: Payload): IntentData | null => {
  const data = p.data as IntentData;
  return data?.kind === "action-intent" && typeof data.run === "function" ? data : null;
};

/** A non-button action card. The action is only executed after dropping it on Execute. */
export function ActionIntentCard({ label, hint = "Drag to Execute", onExecute, children, className = "" }: {
  label: string;
  hint?: string;
  onExecute: () => string | void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Draggable label={label} payload={() => ({ label, sub: hint, data: { kind: "action-intent", run: onExecute } satisfies IntentData })} className={className}>
      <div className="cursor-grab select-none" aria-label={`${label}. Drag this card to the Execute action zone.`}>
        {children}
        <span className="mt-1 block text-[10px] font-medium text-mute">⠿ Drag to execute</span>
      </div>
    </Draggable>
  );
}

const executeZone: ZoneDef = {
  id: "intent-execute",
  label: "Execute",
  hint: "Drop the action card here to run it",
  tone: "#FFC629",
  accepts: (p) => isIntent(p) ? true : "This zone accepts action-intent cards.",
  drop: (p) => isIntent(p)?.run(),
};

/** Shared execute zone for drag-only actions in forms and across screens. */
export function ActionIntentDock() {
  const holding = useCanvas((s) => !!s.drag);
  if (!holding || !isIntent(useCanvas.getState().drag!.payload)) return null;
  return (
    <div role="region" aria-label="Canvas Protocol execute zone" className="fixed inset-x-3 bottom-[88px] z-[35] lg:inset-x-6 lg:bottom-4">
      <div className="card mx-auto flex w-fit max-w-full items-center gap-3 rounded-3xl! border-[color-mix(in_srgb,var(--gold)_45%,var(--line))] p-2.5 shadow-2xl backdrop-blur">
        <ActionZone def={executeZone} Icon={CheckCircle2} variant="dock" className="min-w-[104px]" />
      </div>
    </div>
  );
}
