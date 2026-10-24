"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { NOTIF_DEFAULTS, LEAD_OPTIONS, VIEW_OPTIONS, cleanSocial, clampText, type NotifPrefs, type Section, type Social, type SocialKey } from "@/features/settings/settings";

export interface Profile { name: string; headline: string; location: string; bio: string }
export const PROFILE_DEFAULTS: Profile = { name: "Saqib Nadeem", headline: "Student · Innovator", location: "", bio: "Building cool things, learning every day, and making an impact." };
const SOCIAL_DEFAULTS: Social = { github: "", linkedin: "", twitter: "", portfolio: "" };

type SettingsStore = {
  profile: Profile; social: Social; notif: NotifPrefs; leadHours: number; defaultView: string;
  saveProfile: (p: Profile) => void; setSocial: (k: SocialKey, v: string) => void;
  setNotif: (k: keyof NotifPrefs, on: boolean) => void; setLead: (h: number) => void; setDefaultView: (href: string) => void; reset: () => void;
};
/** Its own key, so Settings never touches events, hive, ideas, people or actions. Everything is cleaned again on load, so a hand-edited save cannot break the screen. */
export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      profile: PROFILE_DEFAULTS, social: SOCIAL_DEFAULTS, notif: NOTIF_DEFAULTS, leadHours: 24, defaultView: "/",
      saveProfile: (profile) => set({ profile }),
      setSocial: (k, v) => set((s) => ({ social: { ...s.social, [k]: v } })),
      setNotif: (k, on) => set((s) => ({ notif: { ...s.notif, [k]: on } })),
      setLead: (leadHours) => set({ leadHours }), setDefaultView: (defaultView) => set({ defaultView }),
      reset: () => set({ profile: PROFILE_DEFAULTS, social: SOCIAL_DEFAULTS, notif: NOTIF_DEFAULTS, leadHours: 24, defaultView: "/" }),
    }),
    {
      name: "ebb:settings:v1", version: 1, skipHydration: true,
      merge: (saved, cur) => {
        const s = (saved ?? {}) as Partial<SettingsStore>; const p = (s.profile ?? {}) as Partial<Profile>; const str = (v: unknown, d: string, n: number) => (typeof v === "string" ? clampText(v, n) : d);
        const social = { ...SOCIAL_DEFAULTS }; for (const k of Object.keys(social) as SocialKey[]) { const r = cleanSocial(k, String((s.social as Social | undefined)?.[k] ?? "")); if (r.ok) social[k] = r.value; }
        const notif = { ...NOTIF_DEFAULTS }; for (const k of Object.keys(notif) as (keyof NotifPrefs)[]) if (typeof s.notif?.[k] === "boolean") notif[k] = s.notif[k];
        return { ...cur, profile: { name: str(p.name, cur.profile.name, 60) || PROFILE_DEFAULTS.name, headline: str(p.headline, cur.profile.headline, 60), location: str(p.location, "", 60), bio: str(p.bio, cur.profile.bio, 240) }, social, notif,
          leadHours: LEAD_OPTIONS.some((o) => o.h === s.leadHours) ? (s.leadHours as number) : 24, defaultView: VIEW_OPTIONS.some((v) => v.href === s.defaultView) ? (s.defaultView as string) : "/" };
      },
    },
  ),
);

type SettingsUI = {
  section: Section; editProfile: boolean; editSocial: SocialKey | null; viewOpen: boolean; langOpen: boolean; confirm: "delete" | null; feedHint: number;
  setSection: (s: Section) => void; setEditProfile: (o: boolean) => void; setEditSocial: (k: SocialKey | null) => void; setViewOpen: (o: boolean) => void; setLangOpen: (o: boolean) => void; setConfirm: (c: "delete" | null) => void;
};
/** Screen state only. Not persisted. */
export const useSettingsUI = create<SettingsUI>((set) => ({
  section: "account", editProfile: false, editSocial: null, viewOpen: false, langOpen: false, confirm: null, feedHint: 0,
  setSection: (section) => set({ section }), setEditProfile: (editProfile) => set({ editProfile }), setEditSocial: (editSocial) => set({ editSocial }),
  setViewOpen: (viewOpen) => set({ viewOpen }), setLangOpen: (langOpen) => set({ langOpen }), setConfirm: (confirm) => set({ confirm }),
}));
