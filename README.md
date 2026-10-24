<div align="center">

# 🐝 Event Bee Buzz

**Keep the buzz going after the event.**

Turn the ideas, people and promises from every event into momentum, before they go cold.

[**Live demo**](https://sleepers-codevariant.vercel.app/) · [**Repository**](https://github.com/Powerhouse0784/sleepers-codevariant)

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel)

</div>

---

## Overview

Most of the value of an event happens after it ends: the idea you sketched, the person you promised to email, the action you meant to take. It usually fades within days.

**Event Bee Buzz** is a frontend-first product built for hackathon problem statement **PS 04 – "After the Event"**. It keeps those follow-ups visible and alive through a **momentum hive**: every idea, person and action is a hexagon whose state (hot, warm, cooling, cold) is derived from your own deliberate activity. It is not a to-do list that nags you.

> **Team Sleepers**: Sushant Kumar Suman · Saqib Nadeem · Vivek Kumar

## Highlights

- **Momentum Hive.** One pure, tested function decides whether something is hot, warm, cooling or cold. Only deliberate actions (a note, a follow-up, a completion) count; passive views never do.
- **Nine connected screens.** Daily Buzz, Events, Momentum Hive, Ideas, People, Action Center, Calendar, Knowledge Base and Settings share one design system, in light and dark themes.
- **Derived, not stored.** Event status, counts, progress, rankings, XP and levels are all computed from source data, so they cannot drift out of sync.
- **Canvas Protocol.** Primary data mutations and item-opening actions use draggable data/action cards and named Action Zones across Daily Buzz, Events, Momentum Hive, Ideas, People, Action Center, Calendar, Knowledge Base and Settings. Mouse, touch and keyboard dragging are supported. Secondary controls such as filters, tabs, modal close, and view selectors remain conventional controls.
- **A shared motion layer.** Page transitions, scroll-reveal cards, a pointer spotlight, magnetic buttons and an animated backdrop, switched off automatically for reduced motion and Calm mode.
- **Rule-based insights.** Insights and Bee Buddy tips come from transparent rules, not an AI service.
- **Accessible by default.** Dialogs close with Esc, filters expose `aria-pressed`, status is never conveyed by colour alone, and Calm mode removes motion.

## Screens

| Route | Screen | What it does |
| --- | --- | --- |
| `/` | **Daily Buzz** | Greeting, momentum meter, Bee Buddy tips and today's priorities |
| `/events` | **Events** | Event spaces with status, progress, follow-ups, create and archive |
| `/hive` | **Momentum Hive** | Hexagon view of every idea, person and action by momentum state |
| `/ideas` | **Ideas** | Shared idea feed, rankings, your stats and a share flow |
| `/people` | **People** | Community directory, follows, top contributors and your profile |
| `/actions` | **Action Center** | Events and challenges to join, with XP, levels and a live activity feed |
| `/calendar` | **Calendar** | Month, week and day views built from your real data |
| `/knowledge` | **Knowledge Base** | Searchable guides, categories, reader, FAQ and support |
| `/settings` | **Settings** | Profile, notifications, privacy, appearance, data export and wipe |

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4, CSS variables for theming (`data-theme="dark\|light"`) |
| Motion | Motion (`motion/react`), CSS scroll-driven animations |
| 3D | React Three Fiber |
| State | Zustand with `persist` (browser `localStorage`) |
| Icons | Lucide React |

## Getting started

**Requirements:** Node.js 18.18 or newer.

```bash
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # production build, use this for demos
```

### Tests

The domain logic is plain functions with their own tests.

```bash
npm run test:momentum
npm run test:ideas
npm run test:people
npm run test:actions
npm run test:calendar
npm run test:settings
```

## Keyboard shortcuts

| Keys | Where | Action |
| --- | --- | --- |
| `Ctrl` / `⌘` + `K` | Anywhere | Open the command palette |
| `1`–`4` | `/hive` | Filter by state (hot, warm, cooling, cold) |
| `0` | `/hive` | Clear filters |
| `O` `C` `L` | `/hive` | Overview, Cells and List views |
| `/` | `/hive` | Focus search |
| `T` | `/hive` | Watch it cool (time-lapse) |
| `R` | `/hive` | Review mode |
| `?` | `/hive` | Help |

## Canvas Protocol

For the mid-hackathon challenge, primary actions are done **only by dragging a data card onto an Action Zone**. No standard button executes them.

| Input | How it works |
| --- | --- |
| Mouse and pen | Drag the card onto a zone |
| Touch | Press and hold, then drag (scrolling still works) |
| Keyboard | Focus a card, `Space` or `Enter` to lift, arrow keys or `Tab` to pick a zone, `Enter` to drop, `Esc` to cancel |

The engine is shared and each screen declares its own zones and rules:

- `src/lib/canvas.ts`: store, zone registry and `commitDrag`
- `src/components/canvas/`: `Draggable`, `ActionZone` and `DragLayer` (floating card, keyboard dragging, screen-reader announcements)
- `src/features/<screen>/canvas.ts`: plain, tested rules for what each zone accepts

**Status:** The core Canvas Protocol paths are now wired across all nine screens. Ideas uses Support, Discuss, stage changes, Publish, Save draft, Bin and Post comment zones. Event cards expose Open, Capture, Archive and Restore; People cards expose View Profile, Follow and Unfollow; opportunity cards expose Join, Complete, Leave and Submit Idea; calendar cards expose Open, Add to Events, Open Event and date-list zones; Hive cards expose Open and Archive. Forms that create or save primary data use drag-only action cards and a shared Execute zone. Some secondary navigation and preference controls intentionally remain click-based.

## How it works

### Momentum

Every item has a `lastMeaningfulActivityAt` timestamp. `getMomentum()` turns the time since then into a state using fixed thresholds:

| State | Time since last meaningful activity |
| --- | --- |
| Hot | up to 72 hours |
| Warm | up to 168 hours (7 days) |
| Cooling | up to 720 hours (30 days) |
| Cold | longer than that |

Only deliberate actions move the timestamp. The rules live in `src/features/momentum/momentum.ts`, with edge-case tests.

### Data

- There is **no backend**. Data lives in browser `localStorage`, alongside clearly labelled sample data.
- Each area has its own persisted store, so one never overwrites another:

| Store | Key |
| --- | --- |
| Events and hive | `ebb:v3` |
| Ideas | `ebb:ideas:v1` |
| People | `ebb:people:v1` |
| Action Center | `ebb:actions:v1` |
| Knowledge Base | `ebb:kb:v1` |
| Settings | `ebb:settings:v1` |

- Untouched sample data **re-anchors to "now" every 6 hours**, so the demo always looks alive. **Reset sample data** lives in the *Time travel* menu and the command palette.
- Derived values (status, counts, progress, XP, rankings, follow-ups) are never stored.

## Project structure

```
src/
├── app/                 # App Router routes, global styles, page template
├── components/          # Shell, motion layer (Fx), shared UI
│   ├── events/  hive/  ideas/  people/  actions/
│   ├── calendar/  knowledge/  settings/  canvas/  dashboard/
├── features/            # Pure domain logic and tests, per screen
│   └── momentum/  hive/  events/  ideas/  people/  actions/  calendar/  knowledge/  settings/
├── lib/                 # Zustand stores, seed data, canvas engine, hooks
└── types/               # Shared types
public/                  # Image assets and decor
```

## Screen notes

<details>
<summary><b>Events</b> (<code>/events</code>)</summary>

- Status (upcoming, active, past, archived), counts and progress are derived from dates and cells.
- Sample events carry a baseline so they look lived-in; anything you capture adds on top.
- `/hive?state=hot|warm|cooling|cold` preselects a hive filter.
- Covers are illustrated SVGs, one scene per event type.
</details>

<details>
<summary><b>Ideas</b> (<code>/ideas</code>)</summary>

- Hot and Trending badges, Top Ideas and your stats are computed from the ideas.
- Your stat tiles filter the feed to your own ideas (Total, Shared, In Progress, Gained Support).
- On this screen the top-bar search filters the feed.
</details>

<details>
<summary><b>People</b> (<code>/people</code>)</summary>

- Twelve-person sample directory; "Popular" sorts by points, which also ranks Top Contributors.
- Tabs: All People, Students, Creators, Mentors, Experts, Teams, Followed.
- Community Stats are labelled sample numbers; joining adds you on top.
- Separate from the people you capture at events (the hive's person cells).
</details>

<details>
<summary><b>Action Center</b> (<code>/actions</code>)</summary>

- Eight sample opportunities (four featured, four behind "View All"), with dates built from today.
- XP, level, participants and the activity feed update instantly when you join or complete something. Level-ups toast and burst confetti.
- "Ideas Shared" is your real count from the Ideas store.
</details>

<details>
<summary><b>Calendar</b> (<code>/calendar</code>)</summary>

- Entries are built from your events (multi-day events show on each day), dated action cells, joined opportunities and a labelled sample schedule. Nothing is stored.
- Opens on today and follows the Time travel slider. Events open the event drawer; sample entries offer "Add to my events".
- On phones the month grid shows coloured dots and the Day view carries the detail.
</details>

<details>
<summary><b>Knowledge Base</b> (<code>/knowledge</code>)</summary>

- 78 articles across six categories, with weighted search (title, summary, category, steps).
- Reader with steps, helpful votes and related articles; FAQ and User Guide modes.
- Views and votes persist. Video tutorials are marked "coming soon" and Support opens a pre-filled email.
</details>

<details>
<summary><b>Settings</b> (<code>/settings</code>)</summary>

- Profile changes flow through the sidebar, greeting, Ideas feed and People entry.
- Notification switches decide what the bell lists. Privacy can export all data as JSON or wipe everything.
- Social links accept a handle or URL and reject anything unsafe. They start empty on purpose.
</details>

## Motion layer

A single shared layer (`src/components/Fx.tsx`, `src/app/template.tsx` and the "Motion layer" block in `globals.css`) gives every screen the same feel:

- Page transitions on every route change, a scroll progress bar and a slow animated backdrop with a light that trails the cursor.
- Cards rise in as they appear and as they scroll into view, then follow the pointer with a soft spotlight.
- Hero banners catch the light; gold buttons shine and lean toward the cursor; the sidebar indicator slides between screens.

It is skipped on touch devices, with `prefers-reduced-motion`, and in **Calm mode**.

## Honest limits

This is a frontend build, and we would rather be clear about its edges:

- No accounts or servers. Security shows what is stored on the device instead of 2FA.
- Language is English (US) only; time zone follows the device.
- Mentorship alerts are saved but nothing sends them yet.
- Several images are crops of design mockups and are low-resolution upscales. Swap in originals for production.
- Community numbers, the sample directory and the sample schedule are labelled sample data.

## Roadmap

- [ ] Convert the remaining screens to the Canvas Protocol (Hive, Events, People, Action Center, Calendar, Settings, Knowledge Base, Daily Buzz)
- [ ] Real backend and authentication
- [ ] Real notifications for mentorship and reminders
- [ ] Video tutorials for the Knowledge Base
- [ ] Production photography for event and idea covers

## Team

**Sleepers**, building for PS 04 "After the Event":

- Sushant Kumar Suman
- Saqib Nadeem
- Vivek Kumar

## Links

- **Live:** https://sleepers-codevariant.vercel.app/
- **Source:** https://github.com/Powerhouse0784/sleepers-codevariant