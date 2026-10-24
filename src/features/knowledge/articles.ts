/**
 * Help content for Event Bee Buzz. Every article describes behaviour that exists in this build.
 * `views` is a sample baseline; real opens on this device are added on top (see store.ts).
 */
export type CatId = "start" | "events" | "ideas" | "account" | "features" | "fix";
export type Article = {
  id: string; cat: CatId; title: string; blurb: string; mins: number; views: number;
  steps: string[]; tip?: string; cta?: { label: string; href: string }; featured?: boolean; faq?: boolean;
};

export const CATS: { id: CatId; label: string; short: string; color: string }[] = [
  { id: "start", label: "Getting Started", short: "Getting Started", color: "#168BFF" },
  { id: "events", label: "Events", short: "Events", color: "#8B35FF" },
  { id: "ideas", label: "Ideas", short: "Ideas", color: "#F5A524" },
  { id: "account", label: "Account & Profile", short: "Account", color: "#00C982" },
  { id: "features", label: "Features", short: "Features", color: "#E51A92" },
  { id: "fix", label: "Troubleshooting", short: "Troubleshooting", color: "#F2385A" },
];

type Opt = Partial<Pick<Article, "tip" | "cta" | "featured" | "faq">>;
const slug = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
// Featured guides carry the headline sample view counts; the rest sit lower so Popular reflects the guides most people need.
const a = (cat: CatId, title: string, blurb: string, mins: number, views: number, steps: string[], o: Opt = {}): Article => ({ id: slug(title), cat, title, blurb, mins, views: o.featured ? views : Math.round(views * 0.55), steps, ...o });

export const ARTICLES: Article[] = [
  // ---- Getting Started (12)
  a("start", "Getting Started with Event Bee Buzz", "Learn the basics and get up and running in just a few minutes.", 2, 1200, [
    "Open Daily Buzz. It shows what is warm, what is cooling and your next best action.",
    "Press the gold + (or use Quick Actions) and capture one idea, person, action or note from your last event.",
    "Open Events to add or explore the event it came from, then check the Momentum Hive to watch it glow.",
  ], { featured: true, faq: true, tip: "Capture first, organise later. A rough title now beats a perfect note you never write.", cta: { label: "Open Daily Buzz", href: "/" } }),
  a("start", "What Event Bee Buzz is (and is not)", "A post-event workspace for follow-through, not a ticketing platform.", 2, 410, [
    "Event Bee Buzz starts after the event ends: notes, ideas, people and promises you made.",
    "It does not sell tickets, handle registration or send messages for you.",
    "Everything is kept in your browser, and sample data is clearly labelled.",
  ], { faq: true }),
  a("start", "A two-minute tour of Daily Buzz", "What each card on your home screen tells you.", 2, 520, [
    "The stat tiles count new ideas, pending follow-ups, events this week and people to reconnect with.",
    "Your Momentum Meter shows the share of active items that are still hot or warm.",
    "Upcoming Event, Quick Actions, Recent Activity and Weekly Progress sit below it.",
  ], { cta: { label: "Open Daily Buzz", href: "/" } }),
  a("start", "Capture your first idea in seconds", "Save a thought with a title and, if you like, a note.", 1, 760, [
    "Press the gold + button, or choose Add New Idea in Quick Actions.",
    "Pick the Idea tab, type a title, and choose the event it came from.",
    "Press Add to hive. It appears straight away in the hive and on Daily Buzz.",
  ], { tip: "Press Enter in the title box to save without reaching for the mouse." }),
  a("start", "Add the event you just attended", "Create an event so everything you capture has a home.", 2, 380, [
    "Open Events and choose Create event.",
    "Name it, pick a type, set the dates and add a venue.",
    "Open the new event and capture ideas and people straight into it.",
  ], { cta: { label: "Go to Events", href: "/events" } }),
  a("start", "Explore the sample workspace", "See a lived-in hive before you add your own data.", 2, 300, [
    "A sample hackathon, conference and meetup are loaded the first time you open the app.",
    "Sample events are labelled in their drawer; your own captures are added on top.",
    "Use Reset sample data in the Time travel menu to restore them at any time.",
  ]),
  a("start", "Switch between light and dark", "Pick the theme that is easiest on your eyes.", 1, 270, [
    "Use the sun or moon button in the top bar.",
    "Your choice is remembered on this device.",
  ], { faq: true }),
  a("start", "Find anything with search and Ctrl+K", "Search from the top bar or jump around with the command palette.", 2, 450, [
    "Type in the top bar to find events and items. On this page it searches articles.",
    "Press Ctrl+K (Cmd+K on Mac) to open the command palette.",
    "Type a command such as capture, go to Events, switch theme or fast-forward.",
  ]),
  a("start", "Your first week: a simple routine", "Three small habits that keep follow-ups alive.", 3, 340, [
    "Within 3 days of an event: capture ideas and people while they are hot.",
    "Mid-week: open the hive and follow up with anyone marked warm.",
    "End of week: open Review mode and decide what to revive, pause or archive.",
  ]),
  a("start", "Use Event Bee Buzz on your phone", "The layout adapts, with a bottom bar and a big capture button.", 2, 290, [
    "On small screens the sidebar becomes a bottom bar with Home, Events, +, Ideas and Hive.",
    "Event cards switch to a compact list and the hive stays tappable.",
    "Your data lives in each browser separately, so phone and laptop do not sync.",
  ]),
  a("start", "Replay the Bee guide tour", "Bring back the quick tour on the Momentum Hive.", 1, 220, [
    "Open the Momentum Hive.",
    "Press the question-mark help button, then choose Replay the quick tour.",
  ], { cta: { label: "Open the hive", href: "/hive" } }),
  a("start", "Glossary: cells, momentum and the hive", "The handful of words the app uses.", 2, 330, [
    "A cell is any saved item: an idea, a person, an action or a note.",
    "Momentum is how recently you did something meaningful with an item.",
    "The hive is the honeycomb view of all your active cells.",
  ]),

  // ---- Events (18)
  a("events", "How to Create and Manage Events", "Step-by-step guide to creating, customizing and managing your events.", 4, 856, [
    "Open Events and choose Create event. Add a name, type, start and end dates, venue and tags.",
    "Open any card to see its workspace: progress, captured items and quick capture buttons.",
    "Use the menu on a card to open, capture into, archive or restore an event.",
  ], { featured: true, faq: true, tip: "The end date cannot be before the start date. The form tells you if it is.", cta: { label: "Go to Events", href: "/events" } }),
  a("events", "Event statuses: upcoming, active, past, archived", "How an event gets its status.", 2, 540, [
    "Upcoming means the start date is in the future.",
    "Active means today falls between the start and end dates.",
    "Past means the end date has gone by. Archived is something you choose.",
  ], { tip: "Status is worked out from dates, so it updates itself as time passes." }),
  a("events", "Search your events", "Find an event by name, venue, type or tag.", 1, 360, [
    "Type in Search your events. Results narrow as you type.",
    "Press Escape to clear the box.",
  ]),
  a("events", "Filter events by status", "Focus on what is happening now or what has finished.", 1, 350, [
    "Choose All events, Upcoming, Active, Past or Archived above the cards.",
    "All events hides archived ones so your main list stays focused.",
  ]),
  a("events", "Sort events your way", "Recently updated, date, name or progress.", 1, 240, [
    "Open the sort menu next to the layout buttons.",
    "Choose Recently updated, Date newest, Date oldest, Name A to Z or Most progress.",
  ]),
  a("events", "Switch between grid and list view", "Pick the density that suits your screen.", 1, 210, [
    "Use the two layout buttons beside the sort menu.",
    "Grid shows three cards across on wide screens; list shows one event per row.",
  ]),
  a("events", "Open an event workspace", "See everything captured for one event.", 2, 470, [
    "Click an event card or choose Open event from its menu.",
    "The drawer shows dates, venue, progress, counts and every item you captured there.",
    "Click any item to open its details and log a next step.",
  ]),
  a("events", "Capture into a specific event", "Save an item with the right event preselected.", 2, 430, [
    "Open the event drawer and press Idea, Person, Action or Note.",
    "Quick Capture opens with that event already chosen. Type a title and save.",
    "The event's counts and progress update immediately.",
  ]),
  a("events", "Event progress explained", "What the percentage on a card means.", 3, 520, [
    "Progress is the share of an event's ideas, people and actions you have acted on.",
    "An item counts once it is marked done or has a logged next step beyond Captured.",
    "Sample events start with demo progress; your own items are added on top.",
  ]),
  a("events", "What makes an event Recently updated", "Only real work moves an event up the list.", 2, 260, [
    "Capturing, completing or logging a step on an item in the event marks it updated.",
    "Simply opening an event does not, so the list reflects progress, not clicks.",
  ]),
  a("events", "Recently revisited: how it works", "Jump back to events you opened lately.", 2, 230, [
    "The panel lists the last three events you opened, with how long ago.",
    "Select one to reopen it, or choose View all events to reset the filters.",
  ]),
  a("events", "Archive and restore an event", "Tidy the list without losing anything.", 2, 330, [
    "Choose Archive event from a card's menu or from the drawer.",
    "Open the Archived filter to find it, then choose Restore event.",
  ], { faq: true }),
  a("events", "Event types and cover art", "Conference, Hackathon, Meetup, Networking, Forum and Workshop.", 2, 190, [
    "Pick a type when you create an event. Each type has its own colour and cover scene.",
    "The type appears as a pill on the cover so you can scan a grid quickly.",
  ]),
  a("events", "Add a venue and tags", "Make events easier to find later.", 2, 200, [
    "Fill Venue or link with a city, place or Online.",
    "Add comma separated tags such as AI, founders or design. Search covers them.",
  ]),
  a("events", "Plan an upcoming event", "Create the event before it happens.", 2, 280, [
    "Create an event with a future start date. Its card shows Starts in N days.",
    "Daily Buzz shows the next upcoming event, and Bee Buddy nudges you within three days.",
  ]),
  a("events", "A ten-minute debrief after an event", "Turn a day of impressions into next steps.", 4, 610, [
    "Capture the three most important ideas first, then the people you promised something to.",
    "Add one action for each promise and give the urgent ones a due date.",
    "Open the event and check the progress bar. Aim to act on a few items the same day.",
  ], { tip: "Items are hottest in the first three days. That is the best time to follow up." }),
  a("events", "What Follow-ups open counts", "The number on the Events screen.", 2, 250, [
    "It counts people who are no longer hot, plus actions with a due date that are not done.",
    "Complete an action or follow up with a person and the number goes down.",
  ]),
  a("events", "Sample events and demo data", "Which parts are demo and which are yours.", 2, 240, [
    "Events with a sample note in their drawer start with demo counts and progress.",
    "Anything you capture is real data stored in your browser.",
    "Reset sample data restores the demo set without touching how the app works.",
  ]),

  // ---- Ideas (14)
  a("ideas", "Turn Ideas into Real Projects", "Discover how to capture, organize and track your ideas effectively.", 3, 642, [
    "Capture the idea the moment you have it, with the event it came from.",
    "Log one concrete next step. A step is what keeps the idea warm.",
    "Check the hive weekly, and revive or archive ideas that are cooling.",
  ], { featured: true, faq: true, tip: "Do not wait for a perfect plan. A tiny first step beats a big someday.", cta: { label: "Capture an idea", href: "/hive" } }),
  a("ideas", "Capture an idea in two taps", "The fastest path from thought to saved.", 1, 520, [
    "Open Quick Capture and keep the Idea tab selected.",
    "Type a title and press Enter.",
  ]),
  a("ideas", "Write a useful idea title and note", "Make it understandable in a month.", 2, 330, [
    "Start the title with a verb or the problem: Voice notes that become action items.",
    "Use the note for why it matters or what someone said about it.",
  ]),
  a("ideas", "Link an idea to its event", "Keep the context where the idea was born.", 2, 280, [
    "Choose the event in Quick Capture, or capture from inside the event drawer.",
    "The idea then shows under that event and adds to its idea count.",
  ]),
  a("ideas", "Log a next step", "The one action that counts as meaningful progress.", 2, 480, [
    "Open the idea and type a step in Log a next step.",
    "Press Save step. The idea becomes hot again and the step appears in its history.",
  ]),
  a("ideas", "Revive a cooling idea", "Bring a quiet idea back to life.", 3, 400, [
    "Open any cooling or cold idea. The field asks for the first step to revive it.",
    "Type the step and choose Revive with this step.",
    "It returns to the hot state and the history records the revival.",
  ], { faq: true }),
  a("ideas", "Pin the ideas you care about most", "Keep favourites easy to find.", 1, 190, [
    "Open the hive and use the pin control on an item.",
    "Use the Pinned smart filter to see only pinned items.",
  ]),
  a("ideas", "Decide in one pass with Review mode", "Work through items that need a decision.", 3, 360, [
    "In the Momentum Hive, press R or choose Review.",
    "For each item, revive it, mark it done or archive it.",
  ], { cta: { label: "Open the hive", href: "/hive" } }),
  a("ideas", "Archive ideas without guilt", "Cold is a prompt to review, not a failure.", 2, 270, [
    "Open the idea and choose Archive.",
    "Archived items leave the hive and Daily Buzz but their history is kept.",
  ]),
  a("ideas", "Spot trending ideas", "Quick Insights points to what is gaining momentum.", 2, 220, [
    "Open the Momentum Hive and look at Quick Insights.",
    "Trending Idea highlights an idea with recent activity.",
    "Insights are rule based, not AI, and say why they appear.",
  ]),
  a("ideas", "Pair ideas with notes and people", "Give an idea evidence and allies.", 2, 210, [
    "Capture a note about what someone said and a person you met in the same event.",
    "Check the event drawer to see them side by side.",
  ]),
  a("ideas", "What to do with ideas that went cold", "A 30 day quiet spell is a review prompt.", 2, 300, [
    "Items with no meaningful update for 30 days move to the cold state.",
    "Decide: revive with a step, remix into a new idea, or archive.",
  ]),
  a("ideas", "A weekly idea review habit", "Ten minutes that save good ideas.", 3, 260, [
    "Open the hive and filter to Cooling.",
    "Revive one, pause one and archive one.",
  ]),
  a("ideas", "From idea to action item", "Break a big idea into something doable.", 3, 310, [
    "Capture an Action item in the same event and write the smallest next move.",
    "Give it a due date when a promise is involved.",
    "Mark it done to count it toward event progress.",
  ]),

  // ---- Account & Profile (10)
  a("account", "Change your theme", "Light or dark, remembered per device.", 1, 280, [
    "Press the sun or moon in the top bar, or use Ctrl+K and choose Switch theme.",
  ], { faq: true }),
  a("account", "Turn on calm mode", "Reduce motion across the app.", 1, 240, [
    "Press the leaf button in the top bar or choose Calm mode in the command palette.",
    "Animations stop and text appears instantly.",
  ], { faq: true }),
  a("account", "Where your data is stored", "Everything stays in your browser.", 2, 480, [
    "Items, events and settings are saved in this browser's local storage.",
    "Nothing is uploaded, and there is no account or sign-in.",
    "Clearing site data or switching browsers starts you fresh.",
  ], { faq: true, tip: "Local only means private by default, and also not backed up." }),
  a("account", "Reset the sample data", "Restore the demo workspace.", 1, 320, [
    "Open Time travel in the top bar and choose Reset sample data.",
    "This replaces the current data with a fresh sample workspace.",
  ]),
  a("account", "Keyboard shortcuts", "Move faster without the mouse.", 2, 410, [
    "Ctrl+K or Cmd+K opens the command palette anywhere.",
    "On the Momentum Hive: 1 to 4 filter by state, 0 clears, O C L switch views, / searches, T watches it cool, R starts review.",
    "Escape closes dialogs and drawers.",
  ]),
  a("account", "Privacy: private by default", "What is and is not shared.", 2, 350, [
    "Your notes and contacts stay on your device.",
    "There is no shared wall in this build, so nothing is published.",
  ]),
  a("account", "The notification bell", "What needs attention.", 1, 200, [
    "The bell lists items that are cooling or cold.",
    "Select one to open its details and log a step.",
  ]),
  a("account", "Using more than one device", "Why phone and laptop differ.", 2, 260, [
    "Data is stored per browser, so each device has its own copy.",
    "Cloud sync is not part of this build.",
  ]),
  a("account", "Clear your local data", "Start over from scratch.", 2, 230, [
    "Use Reset sample data to return to the demo set.",
    "To remove everything, clear this site's data in your browser settings.",
  ]),
  a("account", "Accessibility features", "Built for keyboards and screen readers.", 2, 190, [
    "Every dialog traps focus and closes with Escape.",
    "Momentum is shown with icons and words, never colour alone.",
    "Calm mode and your system's reduced motion setting both limit animation.",
  ]),

  // ---- Features (16)
  a("features", "Understanding the Momentum Hive", "Learn how to use the Momentum Meter and track your progress.", 5, 1100, [
    "Each hexagon is a stage: Hot, Warm, Cooling or Cold, with a count of items in it.",
    "Click a stage to filter, or switch to Cells and List to see the items themselves.",
    "Open any item to log a step, mark it done, revive it or archive it.",
  ], { featured: true, faq: true, tip: "A passive visit never resets an item's age. Only a deliberate step does.", cta: { label: "Open the hive", href: "/hive" } }),
  a("features", "Momentum states and thresholds", "Exactly when an item changes state.", 3, 840, [
    "Hot is under 72 hours since the last meaningful activity.",
    "Warm is 72 hours to 7 days, Cooling is 7 to 30 days, and Cold is 30 days or more.",
    "The thresholds live in one place, so every screen agrees.",
  ], { faq: true }),
  a("features", "Hive views: Overview, Cells and List", "Three ways to look at the same items.", 2, 380, [
    "Overview shows the honeycomb of stages.",
    "Cells shows every item as a hex; List shows an accessible table-style list.",
    "Press O, C or L to switch.",
  ]),
  a("features", "Filters and smart filters", "Narrow the hive to what matters.", 3, 420, [
    "Filter by All, Ideas, People or Actions and by a date range.",
    "Smart filters include Overdue, Promises, Needs follow-up and Pinned.",
    "Choose Clear all to reset.",
  ]),
  a("features", "Time travel", "Fast-forward to see what would cool down.", 2, 470, [
    "Open Time travel in the top bar and drag the slider up to 45 days.",
    "Nothing is saved. Drag back to 0 or choose Back to today.",
  ]),
  a("features", "Watch it cool", "A time-lapse of the next 45 days.", 2, 290, [
    "In the hive, press T or choose Watch it cool.",
    "The slider advances day by day and the stages shift. Stop at any time.",
  ]),
  a("features", "The Momentum Meter on Daily Buzz", "The ring and the legend.", 2, 450, [
    "The ring shows the percentage of active items that are hot or warm.",
    "The legend lists how many are Fresh and Active, Need Attention, Cooling Down or Went Cold.",
  ]),
  a("features", "Quick Capture", "One dialog for ideas, people, actions and notes.", 2, 600, [
    "Open it with the gold + button, a Quick Action, or the command palette.",
    "Choose a type, add a title, optionally a note, and pick the event.",
  ]),
  a("features", "Item details drawer", "Everything about one item.", 2, 350, [
    "Click an item anywhere to open it.",
    "See its state, why it has that state, a suggested action and its history.",
    "Log a step, mark an action done or archive it from the drawer.",
  ]),
  a("features", "Quick Insights", "Rule-based highlights for your hive.", 2, 270, [
    "Insights call out a top focus, trending idea, needs attention and positive momentum.",
    "They use simple rules and tell you why. They are not AI.",
  ]),
  a("features", "Bee Buddy tips", "The mascot's nudges.", 2, 240, [
    "Click the bee to hear the next tip.",
    "Tips follow a fixed order: promises, due dates, upcoming events, then cooling ideas.",
    "Dismiss a tip and it stays away.",
  ]),
  a("features", "The command palette", "Search, capture and navigate from the keyboard.", 2, 330, [
    "Press Ctrl+K or Cmd+K.",
    "Type to search items, or pick a command such as Capture an idea or Go to Events.",
  ]),
  a("features", "Weekly Progress", "Your last seven days.", 2, 260, [
    "Each bar counts updates on that day. Today is highlighted in gold.",
    "The counter shows how many of the last 7 days had progress.",
  ]),
  a("features", "Hive health and warmth", "Two numbers that summarise the hive.", 3, 280, [
    "Hive health is the average freshness of your active items.",
    "Warmth is the share that is still hot or warm, with a 14 day trend line.",
  ]),
  a("features", "Progress streak and Bee rank", "Small rewards for follow-through.", 2, 220, [
    "A streak counts consecutive days with real progress.",
    "Bee rank grows as you complete meaningful steps. Taking a break never removes it.",
  ]),
  a("features", "Calm mode and motion", "Choose how lively the app feels.", 2, 200, [
    "Turn on Calm mode to stop animations and sparkles.",
    "The app also respects your system's reduced motion setting.",
  ]),

  // ---- Troubleshooting (8)
  a("fix", "Fixing Common Issues", "Quick solutions to the most common problems you might face.", 3, 518, [
    "Refresh the page. Your data is saved in the browser and will reload.",
    "Check that you are in the same browser and profile you used before.",
    "If something still looks wrong, use Reset sample data or clear the site's data, then try again.",
  ], { featured: true, faq: true, cta: { label: "Contact support", href: "#support" } }),
  a("fix", "My data disappeared", "Why items can vanish and how to avoid it.", 3, 460, [
    "Data lives in this browser only. A private window, another browser or cleared site data shows an empty workspace.",
    "Open the app in the browser where you created your items.",
    "Untouched sample data refreshes itself after a few hours; items you edit are kept.",
  ], { faq: true }),
  a("fix", "Items cooled even though I opened them", "Only meaningful steps reset age.", 2, 380, [
    "Viewing an item does not count as progress.",
    "Log a next step, complete an action, or revive it to reset its age.",
  ], { faq: true }),
  a("fix", "The 3D bee does not appear", "A fallback is used when WebGL is unavailable.", 2, 190, [
    "The app draws a simple bee instantly and loads the 3D one when the browser is idle.",
    "If your device or browser blocks WebGL, the simple bee stays. Everything still works.",
  ]),
  a("fix", "The app feels slow or animated", "Reduce motion and effects.", 2, 260, [
    "Turn on Calm mode with the leaf button.",
    "Close other heavy tabs and avoid running in a development build for demos.",
  ]),
  a("fix", "Search shows nothing", "Try these quick checks.", 1, 240, [
    "Check the spelling. Search matches words in titles, notes, venues and tags.",
    "Archived items are hidden from the top search. Look under the Archived filter.",
  ]),
  a("fix", "An event shows the wrong status", "Status comes from dates.", 2, 230, [
    "Statuses are worked out from the start and end dates, and from archiving.",
    "A time travel offset also shifts them. Choose Back to today.",
  ], { faq: true }),
  a("fix", "The sample data looks stale", "Re-anchor the demo to today.", 1, 210, [
    "Open Time travel and choose Reset sample data.",
    "Dates in the sample workspace are recalculated from today.",
  ]),
];

export const byId = (id: string) => ARTICLES.find((x) => x.id === id);
export const catOf = (id: CatId) => CATS.find((c) => c.id === id)!;
export const FEATURED = ["getting-started-with-event-bee-buzz", "how-to-create-and-manage-events", "turn-ideas-into-real-projects", "understanding-the-momentum-hive", "fixing-common-issues"];

/** Simple ranked search over title, blurb, steps and category. Returns best matches first. */
export function searchArticles(q: string, list: Article[] = ARTICLES): Article[] {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return list;
  return list.map((x) => {
    const t = x.title.toLowerCase(), b = x.blurb.toLowerCase(), s = x.steps.join(" ").toLowerCase(), c = catOf(x.cat).label.toLowerCase();
    let score = 0;
    for (const w of words) {
      const hit = (t.includes(w) ? 6 : 0) + (b.includes(w) ? 3 : 0) + (c.includes(w) ? 2 : 0) + (s.includes(w) ? 1 : 0);
      if (!hit) return { x, score: 0 }; // every word must match somewhere
      score += hit;
    }
    return { x, score };
  }).filter((r) => r.score > 0).sort((p, q2) => q2.score - p.score).map((r) => r.x);
}
export const fmtViews = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : `${n}`);
