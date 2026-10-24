<div align="center">

# Event Bee Buzz

### Keep the momentum going after every event.

Turn the ideas, people, and promises you collect at events into meaningful next steps—before they go cold.

[**Live Application**](https://sleepers-codevariant.vercel.app/) · [**Video Demo**](https://drive.google.com/file/d/1AL5ABFn-K18PZ4bw9WDCUGTAZ-Q4SGYc/view?usp=drivesdk) · [**Source Code**](https://github.com/Powerhouse0784/sleepers-codevariant)

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Deployment](https://img.shields.io/badge/Deployment-Vercel-000000?logo=vercel&logoColor=white)

</div>

---

## Overview

The value of an event often comes from what happens afterward: following up with someone you met, developing an idea, sharing a resource, or completing a promise. Without a clear system, those opportunities can quickly be forgotten.

**Event Bee Buzz** is a frontend-first event follow-through experience created for hackathon problem statement **PS 04 — “After the Event.”** It brings event-related ideas, people, and actions into one workspace and uses a visual **Momentum Hive** to help users recognize what needs attention.

Rather than behaving like a conventional to-do list, the application emphasizes meaningful activity and the momentum of each item.

## Demo

- **Live application:** [sleepers-codevariant.vercel.app](https://sleepers-codevariant.vercel.app/)
- **Video demonstration:** [Watch the Event Bee Buzz demo](https://drive.google.com/file/d/1AL5ABFn-K18PZ4bw9WDCUGTAZ-Q4SGYc/view?usp=drivesdk)
- **GitHub repository:** [Powerhouse0784/sleepers-codevariant](https://github.com/Powerhouse0784/sleepers-codevariant)

## Key Features

- **Momentum Hive:** Visualizes ideas, people, and actions using four momentum states—Hot, Warm, Cooling, and Cold—based on the time since meaningful activity.
- **Nine connected screens:** Daily Buzz, Events, Momentum Hive, Ideas, People, Action Center, Calendar, Knowledge Base, and Settings share a consistent interface and application state where applicable.
- **Canvas Protocol:** Supports drag-and-drop interactions between data cards and named Action Zones. Keyboard and touch interactions are supported alongside mouse input.
- **Event follow-through:** Capture event-related items, organize follow-ups, and review progress in context.
- **Ideas and community:** Explore an idea feed, contributor information, profiles, and sample community opportunities.
- **Calendar views:** Review relevant event and action information in month, week, and day layouts.
- **Rule-based guidance:** Insights and Bee Buddy suggestions are generated from application rules; they do not depend on an external AI service.
- **Personalization:** Includes light and dark themes, Calm mode, settings, and local data export/reset controls.
- **Motion and interaction design:** Shared transitions and visual effects enhance the experience, with reduced-motion preferences and Calm mode respected.

## Application Screens

| Route | Screen | Purpose |
| --- | --- | --- |
| `/` | **Daily Buzz** | Review momentum, suggested priorities, and daily activity. |
| `/events` | **Events** | Create and manage event spaces, status, progress, and follow-ups. |
| `/hive` | **Momentum Hive** | Explore ideas, people, and actions by momentum state. |
| `/ideas` | **Ideas** | Browse, share, and track ideas and their activity. |
| `/people` | **People** | Explore the sample community directory and manage follows/profile information. |
| `/actions` | **Action Center** | Browse sample opportunities and track participation and progress. |
| `/calendar` | **Calendar** | View events and relevant actions in month, week, or day layouts. |
| `/knowledge` | **Knowledge Base** | Search guides, articles, FAQs, and support information. |
| `/settings` | **Settings** | Manage profile, appearance, notification preferences, privacy, and local data. |

## Technology Stack

| Area | Technology |
| --- | --- |
| Framework and routing | Next.js 15 App Router |
| UI library | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 and CSS variables |
| State management and persistence | Zustand with browser `localStorage` persistence |
| Animation | Motion (`motion/react`) and CSS animations |
| 3D visuals | Three.js and React Three Fiber |
| Icons | Lucide React |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18.18 or later for the Next.js application.
- npm.
- A modern browser with JavaScript enabled.

> The test scripts use Node's `--experimental-strip-types` option, so use a Node.js release that supports this option when running the test suite.

### Installation

1. Clone the repository and move into the project directory:

   ```bash
   git clone https://github.com/Powerhouse0784/sleepers-codevariant.git
   cd sleepers-codevariant
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

Create and run a production build locally:

```bash
npm run build
npm start
```

## Tests

The project includes tests for key domain logic. Run the available test scripts individually:

```bash
npm run test:momentum
npm run test:ideas
npm run test:people
npm run test:actions
npm run test:calendar
npm run test:settings
```

## Interaction Model: Canvas Protocol

The Canvas Protocol is the shared interaction pattern for primary data actions. Users drag a data card to a named Action Zone to invoke an allowed action. Mouse, touch, and keyboard interactions are supported; conventional controls remain in place for secondary tasks such as filters, tabs, view selection, and closing dialogs.

**Keyboard interaction:** Focus a card, press `Space` or `Enter` to pick it up, use the arrow keys or `Tab` to choose a zone, press `Enter` to drop, or press `Esc` to cancel.

Implementation is organized around:

- `src/lib/canvas.ts` — shared canvas state, zone registry, and drag commit logic.
- `src/components/canvas/` — draggable cards, action zones, drag layer, and interaction announcements.
- `src/features/<screen>/canvas.ts` — screen-specific rules for supported actions.

## Momentum Model

Each item records a `lastMeaningfulActivityAt` timestamp. The `getMomentum()` function derives its current state from the elapsed time since that activity.

| State | Time since meaningful activity |
| --- | --- |
| **Hot** | Up to 72 hours |
| **Warm** | More than 72 hours, up to 7 days |
| **Cooling** | More than 7 days, up to 30 days |
| **Cold** | More than 30 days |

Meaningful actions can refresh an item's timestamp; simply viewing an item does not. The thresholds and logic are implemented in `src/features/momentum/momentum.ts`.

## Data and Privacy

Event Bee Buzz is currently a **frontend prototype**. It does not include a backend, user accounts, or cloud synchronization. Application data is persisted locally in the browser using Zustand and `localStorage`.

- Different feature areas use separate local stores to reduce unintended overwrites.
- Some screens include clearly labelled sample data to make the demonstration useful from the first visit.
- Untouched sample data is re-anchored to the current time periodically so the demo remains representative.
- Derived values such as momentum states, counts, progress, XP, and rankings are calculated from source data rather than stored independently.
- Settings provide local data export and reset/wipe controls.

Because data is stored in the current browser, it does not automatically follow a user to another device or browser. Do not treat the prototype as a cloud-backed production service.

## Accessibility and Motion

The interface includes keyboard support for Canvas Protocol interactions, dialog dismissal with `Esc`, accessible state attributes for filters, and status indicators that do not rely on color alone. Shared motion effects are designed to respect `prefers-reduced-motion` and Calm mode; some effects are also disabled on touch-oriented devices.

## Project Structure

```text
src/
├── app/          # App Router routes, global styles, and page template
├── components/   # Shared UI, page components, motion, and Canvas Protocol
├── features/     # Screen-specific domain logic and tests
├── lib/          # Stores, seed data, canvas engine, and hooks
└── types/        # Shared TypeScript types
public/           # Image assets and decorative resources
```

## Current Scope and Limitations

- The application is frontend-only; authentication, backend persistence, and cross-device synchronization are not implemented.
- Notification settings affect the in-app experience, but scheduled external notifications are not sent.
- Some community, opportunity, and schedule content is sample data for demonstration purposes.
- The interface currently supports English (US), with time-zone behavior based on the user's device.
- Some visual assets may need replacement with original, high-resolution artwork before a production release.
- Knowledge Base video tutorials are not yet available; the interface identifies them as coming soon.

## Team

**Team Sleepers** — Hackathon problem statement **PS 04: “After the Event”**

- Sushant Kumar Suman
- Saqib Nadeem
- Vivek Kumar

---

<div align="center">

**Event Bee Buzz** · Keep the buzz going after the event.

[Live Application](https://sleepers-codevariant.vercel.app/) · [Video Demo](https://drive.google.com/file/d/1AL5ABFn-K18PZ4bw9WDCUGTAZ-Q4SGYc/view?usp=drivesdk) · [GitHub Repository](https://github.com/Powerhouse0784/sleepers-codevariant)

</div>
