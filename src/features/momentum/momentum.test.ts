import { getMomentum } from "./momentum.ts";
const base = Date.parse("2026-10-24T12:00:00Z");
const at = (h: number) => new Date(base - h * 36e5).toISOString();
const s = (h: number) => getMomentum({ kind: "idea", createdAt: at(h), lastMeaningfulActivityAt: at(h) }, base).state;
const cases: [number, string][] = [[0,"hot"],[71.99,"hot"],[72,"warm"],[167.99,"warm"],[168,"cooling"],[719.99,"cooling"],[720,"cold"]];
let bad = 0;
for (const [h, want] of cases) { const got = s(h); if (got !== want) { bad++; console.error(`FAIL ${h}h: ${got} != ${want}`); } }
console.log(bad ? `${bad} failed` : `momentum: ${cases.length}/${cases.length} threshold edges pass`);
process.exit(bad ? 1 : 0);
