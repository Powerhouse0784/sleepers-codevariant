"use client";
import { useMedia } from "@/lib/hooks";
import { useSettingsUI } from "@/lib/settingsStore";
import { ProgressDialog, FeedDialog, ProgressPanel } from "../actions/ActionRail";
import { CommunityPanel, Hero, JoinBanner, NotifCard, ProfileInfo, Promo, QuickSettings, SettingsNav, SocialLinks } from "./SettingsParts";
import { AppearancePanel, ConnectedPanel, HelpPanel, NotificationsPanel, PreferencesPanel, PrivacyPanel, SecurityPanel } from "./SettingsPanels";
import { ConfirmDialog, EditProfileDialog, EditSocialDialog, LangDialog, ViewDialog } from "./SettingsDialogs";
import { SettingsDock } from "./SettingsZones";

export default function Settings() {
  const wide = useMedia("(min-width: 1280px)"); const section = useSettingsUI((s) => s.section);
  const panel = { notifications: <NotificationsPanel />, privacy: <PrivacyPanel />, appearance: <AppearancePanel />, preferences: <PreferencesPanel />, security: <SecurityPanel />, connected: <ConnectedPanel />, help: <HelpPanel /> } as const;
  const rail = <><ProgressPanel /><CommunityPanel /><Promo /></>;
  return (
    <div className="mx-auto max-w-[1320px] space-y-4 pb-4">
      <div className={wide ? "grid grid-cols-[1fr_300px] items-start gap-4" : ""}>
        <div className="@container min-w-0 space-y-4">
          <Hero />
          <div className="grid grid-cols-1 items-start gap-3 @2xl:grid-cols-2 @4xl:grid-cols-[220px_minmax(0,1fr)_270px]">
            <SettingsNav />
            {section === "account" ? (
              <><div className="min-w-0 space-y-3"><ProfileInfo /><SocialLinks /></div><div className="min-w-0 space-y-3"><NotifCard /><QuickSettings /></div></>
            ) : <div key={section} className="min-w-0 @2xl:col-span-2 @4xl:col-span-2">{panel[section]}</div>}
          </div>
          <JoinBanner />
        </div>
        {wide && <aside className="space-y-3" aria-label="Your progress and community">{rail}</aside>}
      </div>
      {!wide && <div className="grid items-start gap-3 md:grid-cols-2"><div className="space-y-3"><ProgressPanel /><Promo /></div><CommunityPanel /></div>}
      <EditProfileDialog /><EditSocialDialog /><ViewDialog /><LangDialog /><ConfirmDialog /><ProgressDialog /><FeedDialog />
      <SettingsDock />
    </div>
  );
}
