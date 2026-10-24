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
