import { useSyncExternalStore } from "react";
import courts from "./data/courts.json";

// Your position, shared by every page. Kept for this browser session so "near me" works everywhere.
const KEY = "pickle-geo";
const saved = (() => { try { return JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch { return {}; } })();
let state = { pos: saved.pos || null, source: saved.source || null, label: saved.label || "", status: saved.pos ? "ok" : "idle", dialog: false, tracking: false };
const listeners = new Set();
function set(patch) {
  state = { ...state, ...patch };
  try { sessionStorage.setItem(KEY, JSON.stringify({ pos: state.pos, source: state.source, label: state.label })); } catch { /* private mode */ }
  listeners.forEach((fn) => fn());
}
const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export default function useGeo() { return useSyncExternalStore(subscribe, () => state, () => state); }

const avg = (list, key) => list.reduce((s, c) => s + c[key], 0) / list.length;
export function townCenters() {
  const g = {};
  courts.forEach((c) => (g[c.municipality] ||= []).push(c));
  return Object.entries(g).map(([name, list]) => ({ name, count: list.length, lat: avg(list, "lat"), lng: avg(list, "lng") })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

const ask = (opts) => new Promise((ok, no) => (navigator.geolocation ? navigator.geolocation.getCurrentPosition(ok, no, opts) : no({ code: 0 })));
const toPos = (p) => ({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy });

// Ask the browser for your location. Must be called from a tap so phones show their permission prompt.
export async function locate({ track = false } = {}) {
  if (state.status === "asking") return false;
  set({ status: "asking" });
  try {
    let p;
    try { p = await ask({ enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }); } // quick, works indoors
    catch (e) { if (e.code === 3) p = await ask({ enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }); else throw e; } // timed out: try GPS
    set({ status: "ok", dialog: false, pos: toPos(p), source: "gps", label: "" });
    if (track) startTracking();
    return true;
  } catch (e) {
    set({ status: e.code === 1 ? "denied" : e.code === 0 ? "unsupported" : "error", dialog: true }); // explain what to do instead of failing silently
    return false;
  }
}

let watchId = null;
export function startTracking() {
  if (watchId != null || !navigator.geolocation) return;
  set({ tracking: true });
  watchId = navigator.geolocation.watchPosition((p) => set({ status: "ok", pos: toPos(p), source: "gps", label: "" }), () => {}, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
}
export function stopTracking() {
  if (watchId != null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
  if (state.tracking) set({ tracking: false });
}
// Fallback when location is blocked: "near me" uses the middle of the town you pick
export function chooseTown(name) {
  const t = townCenters().find((x) => x.name === name);
  if (t) set({ pos: { lat: t.lat, lng: t.lng, accuracy: 0 }, source: "town", label: name, status: "ok", dialog: false });
}
export function clearGeo() { stopTracking(); set({ pos: null, source: null, label: "", status: "idle" }); }
export const openGeoHelp = () => set({ dialog: true });
export const closeGeoHelp = () => set({ dialog: false });
