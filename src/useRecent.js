import courts from "./data/courts.json";

// The last few courts you opened, kept in this browser
const KEY = "pickle-recent";
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
export function recordView(id) { try { localStorage.setItem(KEY, JSON.stringify([id, ...read().filter((x) => x !== id)].slice(0, 8))); } catch { /* private mode */ } }
export const recentCourts = () => read().map((id) => courts.find((c) => c.id === id)).filter(Boolean);
