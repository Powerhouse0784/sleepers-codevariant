"use client";
import { UserRound, Palette, type LucideIcon } from "lucide-react";
import ActionZone from "../canvas/ActionZone";
import { useCanvas, type Payload, type ZoneDef } from "@/lib/canvas";
import { useSettingsUI } from "@/lib/settingsStore";
import { useStore } from "@/lib/store";
import type { Section } from "@/features/settings/settings";

export interface SettingsDragged { kind: "settings-nav"; section: string; label: string }
export const settingsCard = (section: string, label: string): Payload => ({
  label, sub: "Settings section",
  data: { kind: "settings-nav", section, label } satisfies SettingsDragged,
});

const isSettings = (p: Payload): SettingsDragged | null => {
  const d = p.data as SettingsDragged;
  return d?.kind === "settings-nav" ? d : null;
};

const def = (id: string, label: string, hint: string, tone: string,
  accepts: (p: Payload) => true | string, drop: (p: Payload) => string | void): ZoneDef =>
  ({ id, label, hint, tone, accepts, drop });

export const SETTINGS_ZONES = {
  open: def("set-open", "Open", "Drop to go to this section", "#2F8BFF",
    (p) => { if (!isSettings(p)) return "Not a settings card."; return true; },
    (p) => { const d = isSettings(p)!; useSettingsUI.getState().setSection(d.section as Section); return `Opened ${d.label}.`; },
  ),
  theme: def("set-theme", "Toggle Theme", "Drop any card to switch theme", "#FFC629",
    (p) => { if (!isSettings(p)) return "Not a settings card."; return true; },
    (_p) => { const s = useStore.getState(); s.setTheme(s.theme === "dark" ? "light" : "dark"); return "Theme switched!"; },
  ),
};

const ICONS: Record<keyof typeof SETTINGS_ZONES, LucideIcon> = { open: UserRound, theme: Palette };
type ZoneId = keyof typeof SETTINGS_ZONES;
export const SetZone = ({ id, variant, className }: { id: ZoneId; variant?: "dock" | "strip"; className?: string }) =>
  <ActionZone def={SETTINGS_ZONES[id]} Icon={ICONS[id]} variant={variant} className={className} />;

export function SettingsDock() {
  const holding = useCanvas((s) => !!s.drag);
  if (!holding) return null;
  const payload = useCanvas.getState().drag?.payload;
  if (!payload || !isSettings(payload)) return null;
  return (
    <div role="region" aria-label="Settings action zones" className="fixed inset-x-3 bottom-[88px] z-20 lg:inset-x-6 lg:bottom-4">
      <div className="card mx-auto flex w-fit max-w-full items-stretch gap-3 overflow-x-auto rounded-3xl! border-[color-mix(in_srgb,var(--gold)_35%,var(--line))] p-2.5 shadow-2xl backdrop-blur scroll-thin">
        <SetZone id="open" variant="dock" />
        <span aria-hidden className="w-px shrink-0 bg-[var(--line)]" />
        <SetZone id="theme" variant="dock" />
      </div>
    </div>
  );
}
