import { usePeople } from "@/lib/peopleStore";
/** The signed-in person's directory entry, if they have joined People. */
export const seededMe = () => usePeople.getState().people.find((p) => p.isMe);
/** Everything this app keeps in the browser, as one object. Used for export and the storage meter. */
export function readAll(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (typeof localStorage === "undefined") return out;
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!k || !k.startsWith("ebb:")) continue; const raw = localStorage.getItem(k) ?? ""; try { out[k] = JSON.parse(raw); } catch { out[k] = raw; } }
  return out;
}
export const storageStats = () => { const all = readAll(); const bytes = new Blob([JSON.stringify(all)]).size; return { keys: Object.keys(all).length, kb: Math.max(1, Math.round(bytes / 1024)) }; };
export function downloadJson(name: string) {
  const blob = new Blob([JSON.stringify({ app: "Event Bee Buzz", exportedAt: new Date().toISOString(), data: readAll() }, null, 2)], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
/** Removes every Event Bee Buzz key, then reloads so each store re-seeds from scratch. */
export function wipeAll() {
  const keys: string[] = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k?.startsWith("ebb:")) keys.push(k); }
  keys.forEach((k) => localStorage.removeItem(k)); try { sessionStorage.clear(); } catch { /* ignore */ }
  window.location.assign("/");
}
