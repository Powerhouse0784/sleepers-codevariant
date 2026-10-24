import { monthGrid, sampleItems, buildItems, itemsOn, upcoming, past, matches, tileParts, startOfWeek, addMonths, monthTitle, itemTime, startOfDay } from "./calendar.ts";
import assert from "node:assert/strict";
// Nov 2026 starts on a Sunday and has 30 days -> 5 rows, 5 trailing blanks
const g = monthGrid(new Date(2026, 10, 4).getTime());
assert.equal(g.length, 5); assert.equal(g[0][0], new Date(2026, 10, 1).getTime()); assert.equal(g[4][1], new Date(2026, 10, 30).getTime()); assert.equal(g[4].filter((x) => x === null).length, 5);
// Oct 2026 starts on a Thursday -> 4 leading blanks, 31 days -> 5 rows
const o = monthGrid(new Date(2026, 9, 24).getTime()); assert.equal(o[0].filter((x) => x === null).length, 4); assert.equal(o.length, 5);
const now = new Date(2026, 9, 24, 15, 0).getTime();
const s = sampleItems(now); assert.equal(s.length, 45); // 15 per month x 3, none dropped (day 30 exists in Sep, Oct, Nov)
assert.equal(sampleItems(new Date(2026, 1, 10).getTime()).length, 44); // February has no 30th, so one entry is skipped
const all = buildItems({ events: [], cells: [], joined: {}, opps: [], now });
const oct25 = itemsOn(all, new Date(2026, 9, 25).getTime()); assert.deepEqual(oct25.map((i) => i.title), ["Design Review"]);
assert.equal(itemTime(all.find((i) => i.title === "Challenge")!), "All Day"); assert.equal(itemTime(all.find((i) => i.title === "Final Submission")!), "11:59 PM");
assert.deepEqual(upcoming(all, now, 3).map((i) => i.title), ["Design Review", "Idea Workshop", "Final Submission"]);
assert.ok(past(all, now)[0].start < now && matches(all[0], "online") !== undefined);
// a real event on the same day with the same title replaces the sample entry; multi-day events show on every day and are all-day
const ev = { id: "x", title: "Design Review", type: "Workshop", date: "", startsAt: new Date(2026, 9, 25, 14).toISOString(), endsAt: new Date(2026, 9, 25, 15).toISOString() };
const m1 = itemsOn(buildItems({ events: [ev], cells: [], joined: {}, opps: [], now }), new Date(2026, 9, 25).getTime()); assert.equal(m1.length, 1); assert.equal(m1[0].src, "event");
const multi = { id: "y", title: "Summit", type: "Conference", date: "", startsAt: new Date(2026, 9, 26, 9).toISOString(), endsAt: new Date(2026, 9, 28, 18).toISOString() };
const m2 = buildItems({ events: [multi], cells: [], joined: {}, opps: [], now }); for (const d of [26, 27, 28]) assert.ok(itemsOn(m2, new Date(2026, 9, d).getTime()).some((i) => i.title === "Summit" && i.allDay)); assert.ok(!itemsOn(m2, new Date(2026, 9, 29).getTime()).some((i) => i.title === "Summit"));
// joined opportunity lands on today + inDays at its time; actions with due dates appear; archived/done do not
const opp = { id: "h", kind: "event" as const, title: "Hackathon 2026", blurb: "", inDays: 1, time: "10:00 AM", participants: 1 };
const j = buildItems({ events: [], cells: [], joined: { h: { at: 1 } }, opps: [opp], now }).find((i) => i.src === "joined")!; assert.equal(new Date(j.start).getDate(), 25); assert.equal(new Date(j.start).getHours(), 10);
const cell = (id: string, extra = {}) => ({ id, kind: "action" as const, title: "Send recap", eventId: "e", createdAt: "", lastMeaningfulActivityAt: "", dueAt: new Date(2026, 9, 26, 9).toISOString(), log: [], ...extra });
assert.equal(buildItems({ events: [], cells: [cell("a"), cell("b", { done: true }), cell("c", { archived: true })], joined: {}, opps: [], now }).filter((i) => i.src === "task").length, 1);
assert.deepEqual(tileParts(new Date(2026, 10, 4).getTime()), { d: "04", m: "Nov" }); assert.equal(monthTitle(addMonths(now, 1)), "November 2026");
assert.equal(new Date(startOfWeek(now)).getDay(), 0); assert.equal(startOfDay(now), new Date(2026, 9, 24).getTime());
console.log("calendar ok");
