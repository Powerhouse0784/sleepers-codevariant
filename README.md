# Event Bee Buzz
```
npm install
npm run dev                 # http://localhost:3000
npm run build && npm start  # production build: use this for demos
npm run test:momentum
```
Shortcuts: Ctrl/Cmd+K command palette. On /hive: 1-4 filter state, 0 clear, O/C/L views, / search, T watch it cool, R review, ? help.
Data is browser localStorage plus labelled sample data. Untouched sample data re-anchors to "now" every 6 hours; "Reset sample data" lives in the Time travel menu.
Momentum rules: src/features/momentum/momentum.ts. Hive stats: src/features/hive/stats.ts. Insights and Bee Buddy tips are rule-based, not AI.

## Events screen (`/events`)
- `src/components/events/*`: `Events` (page), `EventsHero`, `EventCard`, `BuzzRail` (Keep the buzz alive + Recently revisited), `EventDrawer`, `CreateEventDialog`, `EventCover` (illustrated covers), `Hex`.
- `src/features/events/events.ts` derives status (upcoming/active/past/archived), counts and progress from dates and cells. Nothing derived is stored.
- Sample events carry a `sample` baseline so they look lived-in; anything you capture adds on top. Storage key is `ebb:v3`, so older local data reseeds once.
- `/hive?state=hot|warm|cooling|cold` preselects that filter.

## Ideas screen (`/ideas`)
- `src/components/ideas/*`: `Ideas` (page), `IdeasHero`, `IdeaCard`, `IdeaCover` (one illustrated cover per category, plus pills and avatars), `Rail` (Top Ideas, Your Idea Stats, motivation panel, "View All" ranking), `IdeaDrawer` and `ShareIdeaDialog` (both mounted in the Shell so they open from anywhere).
- `src/features/ideas/ideas.ts` holds the types, sample feed and every derived value. Hot/Trending badges, the Top Ideas ranking and your stats are computed from the ideas, never stored.
- `src/lib/ideasStore.ts` is a separate persisted store (`ebb:ideas:v1`), so it never touches your events and hive data. Same rule as the hive: untouched sample data re-anchors every 6 hours; "Reset sample data" resets both.
- Your stats are tiles you can tap: Total (incl. drafts), Shared, In Progress, Gained Support (25+ likes) filter the feed to your own ideas.
- On `/ideas` the top bar search filters the feed. Elsewhere it searches events and hive items as before.
- `public/ideas/*.webp` are crops of the supplied mockup (hero bee scene, promo bee). `public/decor/honeycomb.svg` is from the asset pack.
- `npm run test:ideas`

## People screen (`/people`)
- `src/components/people/*`: `People` (page), `PeopleHero`, `PersonCard`, `PersonBits` (avatar, status, Follow button), `PeopleRail` (Community Stats, Top Contributors + "View All", "Find Your Tribe"), `JoinStrip`, `PersonDrawer`, `ProfileDialog` ("Join Now" / "Edit profile").
- `src/features/people/people.ts`: types, the 12-person sample directory, and every derived value. "Popular" sorts by points, which is also what ranks Top Contributors. Follower counts are the sample base plus your own follow.
- `src/lib/peopleStore.ts`: its own persisted store (`ebb:people:v1`, only follows and your own profile). "Reset sample data" resets it too.
- Tabs: All People, Students, Creators, Mentors, Experts, Teams, Followed. Role and Skill dropdowns are built from the directory. The top bar search and the in-page search share one query.
- Community Stats (10.2K / 2.6K / 480 / 98%) are labelled sample numbers; joining adds you on top.
- `public/people/*.webp` are crops of the supplied mockup (hero, promo and join-strip bees, cleaned avatars). The first eight people use the supplied avatars; the rest show initials.
- This is separate from the people you capture at events (the hive's person cells). `npm run test:people`.

## Action Center screen (`/actions`)
- `src/components/actions/*`: `ActionCenter` (page: hero, four quick-action cards, Featured Action Opportunities, community banner) and `ActionRail` (Your Progress, Live Community Activity, promo card, plus the "View Details" and "View All" dialogs).
- `src/features/actions/actions.ts`: the 8 sample opportunities (4 featured, 4 behind "View All"), XP/level rules and the activity feed. XP, level, counts, participant totals and "x min ago" are derived from what you joined, never stored. Dates are built from today, so they never go stale. `npm run test:actions` (add `"test:actions": "node --experimental-strip-types src/features/actions/actions.test.ts"` to package.json scripts).
- `src/lib/actionsStore.ts`: its own persisted store (`ebb:actions:v1`, only what you joined or completed) plus screen state (search, filter, expanded). "Reset sample data" resets it too.
- Live behaviour: Join Event / Join Challenge update XP, participants, the progress panel and the activity feed instantly. Joined challenges get "Mark Complete" (+150 XP). Level-ups toast and burst confetti. Submit Idea opens the shared Share Idea dialog. Find Teams opens People on the Teams tab. "Ideas Shared" is your real count from the Ideas store.
- Top bar search on `/actions` filters the opportunities. "Explore Challenges" / "Join a Challenge" filter to challenges and scroll to them.
- `public/action/*.webp` are crops of the supplied mockup (hero bee scene, promo bee, join-banner bees, four featured photos, avatars). Photos are low-res upscales, so swap in originals when you have them. The profile photo now also shows in the sidebar and top bar on every screen.

## Calendar screen (`/calendar`)
- `src/components/calendar/*`: `Calendar` (page: hero, Month / Week / Day views with prev / next / Today, "Missed something?" banner) and `CalendarRail` (Today, Upcoming Events, Quick Actions, "Make It Happen!" promo, plus the item, "View All" and "View Past Events" dialogs).
- `src/features/calendar/calendar.ts`: builds every entry from live data and derives the rest. Sources: your events (multi-day events show on each day as All Day), action cells with a due date (not done or archived), opportunities you joined in the Action Center, and a labelled sample schedule laid over last, this and next month so the demo always looks lived-in. A real event with the same title on the same day replaces its sample twin. Nothing is stored. `npm run test:calendar`.
- `src/lib/calendarStore.ts`: screen state only (view, date cursor, search, open dialogs). Opens on today, and follows the Time travel slider.
- Behaviour: tap a day for its Day view, "+N more" for overflow, any entry for details. Events open the event drawer, due dates open the item, joined items open the Action Center, and sample entries offer "Add to my events". Quick Actions: Add Event opens the Create event dialog, Join Challenge opens the Action Center on challenges, Create Idea opens Share Idea. Top bar search filters the grid. On phones the month grid shows coloured dots and the Day view carries the detail.
- `public/calendar/*.webp` are crops of the supplied mockup (hero bee scene, promo bee, city strip, Today bee). Text and buttons are rebuilt as live components.


## Motion layer
One shared layer (`src/components/Fx.tsx`, `src/app/template.tsx` and the "Motion layer" block in `globals.css`) gives every screen the same feel:
- Page transitions on every route change, a scroll progress bar and a slow aurora backdrop with a light that trails the cursor.
- Cards rise in as they appear and again as they scroll into view, then follow the pointer with a soft spotlight and lift on hover.
- Hero banners catch the light under the pointer; gold buttons shine and are pulled slightly toward the cursor; the sidebar indicator slides between screens.
- Counters, headline shine and the notification pulse are included.
All of it is skipped on touch devices, with `prefers-reduced-motion`, and in Calm mode.

## Settings screen (`/settings`)
- `src/components/settings/*`: `Settings` (page: hero, section nav, Account view with Profile Information, Social Links, Notification Preferences and Quick Settings, plus the shared progress / community / promo rail and join banner), `SettingsPanels` (Notifications, Privacy, Appearance, App Preferences, Security, Connected Accounts, Help & Support), `SettingsDialogs` (edit profile, edit link, default view, language, delete everything) and `util.ts` (export, storage stats, wipe).
- `src/features/settings/settings.ts`: link cleaning (GitHub, LinkedIn, X and portfolio accept a handle or a URL and reject anything unsafe), the device time zone label, settings search, and the bell's notification list. `npm run test:settings`.
- `src/lib/settingsStore.ts`: its own persisted store (`ebb:settings:v1`: profile, links, notification switches, reminder lead time, default view). Everything is cleaned again on load. Screen state is separate and not saved.
- What each control really does: Edit Profile changes the sidebar name and headline, the greeting name, and your People entry if you joined. Notification switches and the reminder lead time decide what the bell lists (events starting soon or live, challenges you joined, latest community activity, platform news). Theme and Calm mode are the same switches as the top bar. Default View opens that screen once per browser session when the app is launched on the home screen. Privacy can remove you from or send you to join the People directory, export all saved data as JSON, or wipe everything and restart. Replay the tour restarts it on the hive. The top bar search on this screen jumps to the matching section.
- Honest limits: there are no accounts or servers, so Security shows what is stored on the device instead of 2FA. Language has only English (US). Time zone follows the device. Mentorship alerts are saved but nothing sends them yet. Social links start empty so nobody gets linked to an account that is not theirs.
- `public/settings/hero-bee.webp` is cropped from the supplied mockup; text, toggles and buttons are rebuilt as live components.

## Review fixes
- Ideas and People now read your full name from Settings (`profile.name`), so renaming yourself there renames you in the Ideas feed, comments and the People directory. Before, they appended a fixed surname to the first name.
- The command palette's "Reset sample data" now also resets the Action Center, like the top-bar reset does.
- Phones: the bottom bar's last slot is now **More**, a sheet listing Momentum Hive, People, Action Center, Calendar, Knowledge Base and Settings. Below 1024px the sidebar is hidden, so these screens had no way in.

## Canvas Protocol (mid-hackathon challenge)
Primary actions (submit, save, delete, like, move, post) are done only by dragging a data card onto an Action Zone. No standard buttons execute them. Done screen by screen, on one shared engine:
- `src/lib/canvas.ts` (store, zone registry, `commitDrag`), `src/components/canvas/Draggable.tsx` (any card becomes draggable), `ActionZone.tsx` (drop targets that light up, grow, or explain a refusal) and `DragLayer.tsx` (the floating card, keyboard dragging and screen-reader announcements). Mounted once in the Shell.
- Mouse and pen: drag. Touch: press and hold, then drag (scrolling still works). Keyboard: focus a card, Space or Enter to lift, arrow keys or Tab to pick a zone, Enter to drop, Esc to cancel.
- Each screen declares its zones and the rules for what each accepts. The rules are plain functions with tests (`src/features/<screen>/canvas.ts`).
- **Ideas (done):** zones Support, Discuss, Just an idea, In progress, Done, Publish, Save draft, Bin and Post comment. A new idea is a note you write on and drag onto Publish or Save draft; a comment is a note you drag onto Post. "Start an idea" from any screen takes you to the note.
- Still to convert: Hive, Events, People, Action Center, Calendar, Settings, Knowledge Base, Daily Buzz.
