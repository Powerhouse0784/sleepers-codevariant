import { makeIdeas, myStats, ranked, feedOf, badgeOf, likeCount, commentCount, inScope } from "./ideas.ts";
import assert from "node:assert/strict";
const now = Date.now(); const all = makeIdeas(now);
assert.deepEqual(myStats(all), { total: 12, shared: 8, progress: 4, support: 3 });
assert.deepEqual(ranked(all).slice(0, 5).map(likeCount), [124, 98, 76, 62, 54]);
const feed = feedOf(all).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 6);
assert.deepEqual(feed.map(commentCount), [18, 12, 9, 7, 11, 6]);
assert.equal(badgeOf(all, "s1"), "hot"); assert.equal(badgeOf(all, "s2"), "trending"); assert.equal(badgeOf(all, "s3"), null);
assert.equal(all.length - all.filter((i) => inScope(i, "all")).length, 4); // exactly the 4 drafts stay out of the community feed
const liked = all.map((i) => (i.id === "s1" ? { ...i, likedByMe: true } : i)); assert.equal(likeCount(liked[0]), 125);
console.log("ideas: ok");
import { authorName } from "./ideas.ts";
assert.equal(authorName("me", "Rahul Verma"), "Rahul Verma"); assert.equal(authorName("me"), "Saqib Nadeem"); assert.equal(authorName("ayesha", "Rahul Verma"), "Ayesha Khan");
console.log("ideas: author names ok");
import { dropRule } from "./canvas.ts";
const mineIdea = { mine: true, shared: true, stage: "idea" as const }, theirs = { mine: false, shared: true, stage: "idea" as const }, myDraft = { mine: true, shared: false, stage: "idea" as const };
assert.equal(dropRule("support", { kind: "idea", id: "x" }, theirs), true);
assert.equal(typeof dropRule("support", { kind: "idea", id: "x" }, myDraft), "string"); // drafts cannot be supported
assert.equal(dropRule("bin", { kind: "idea", id: "x" }, mineIdea), true);
assert.equal(typeof dropRule("bin", { kind: "idea", id: "x" }, theirs), "string"); // never delete other people's ideas
assert.equal(dropRule("progress", { kind: "idea", id: "x" }, mineIdea), true);
assert.equal(dropRule("progress", { kind: "idea", id: "x" }, { ...mineIdea, stage: "progress" }), "Already in progress.");
assert.equal(typeof dropRule("done", { kind: "idea", id: "x" }, theirs), "string");
assert.equal(dropRule("publish", { kind: "idea", id: "x" }, myDraft), true);
assert.equal(dropRule("publish", { kind: "idea", id: "x" }, mineIdea), "Already shared.");
assert.equal(dropRule("discuss", { kind: "idea", id: "x" }, myDraft), true);
assert.equal(dropRule("publish", { kind: "composer", title: "A", summary: "B" }), true);
assert.equal(dropRule("draft", { kind: "composer", title: "A", summary: "B" }), true);
assert.equal(dropRule("publish", { kind: "composer", title: " ", summary: "B" }), "Give your idea a title first.");
assert.equal(dropRule("publish", { kind: "composer", title: "A", summary: "" }), "Add a sentence or two first.");
assert.equal(typeof dropRule("bin", { kind: "composer", title: "A", summary: "B" }), "string"); // a new note cannot be binned or liked
assert.equal(dropRule("post", { kind: "comment", text: "nice" }), true);
assert.equal(dropRule("post", { kind: "comment", text: "  " }), "Write something first.");
assert.equal(typeof dropRule("support", { kind: "comment", text: "hi" }), "string");
assert.equal(typeof dropRule("post", { kind: "idea", id: "x" }, mineIdea), "string");
assert.equal(typeof dropRule("support", { kind: "idea", id: "gone" }), "string");
console.log("ideas: canvas rules ok");
