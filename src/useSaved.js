import { useSyncExternalStore } from "react";
import courts from "./data/courts.json";
import { showToast } from "./components/Toaster.jsx";

// Saved courts live in this browser's localStorage (no login needed).
const KEY = "pickle-saved";
const listeners = new Set();
const valid = new Set(courts.map((c) => c.id));
const read = () => { try { return (JSON.parse(localStorage.getItem(KEY)) || []).filter((id) => valid.has(id)); } catch { return []; } };
let saved = read();

function write(next) {
  saved = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode: still works until reload */ }
  listeners.forEach((fn) => fn());
}
if (typeof window !== "undefined") window.addEventListener("storage", e => { if (e.key === KEY || e.key === null) { saved = read(); listeners.forEach(fn => fn()); } });
const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

export default function useSaved() {
  const ids = useSyncExternalStore(subscribe, () => saved, () => saved);
  const toggle = (id) => {
    const name = courts.find((c) => c.id === id)?.name || "Court";
    const was = ids.includes(id);
    write(was ? ids.filter((x) => x !== id) : [...ids, id]);
    showToast(was ? `Removed ${name}` : `Saved ${name}`, () => write(was ? [...saved, id] : saved.filter((x) => x !== id)));
  };
  return {
    ids,
    isSaved: (id) => ids.includes(id),
    toggle,
    addMany: (list) => { const fresh = [...new Set(list)].filter((id) => valid.has(id) && !ids.includes(id)); write([...ids, ...fresh]); showToast(fresh.length ? `Added ${fresh.length} ${fresh.length === 1 ? "court" : "courts"} to your list` : "Those courts are already saved"); },
    clear: () => { const before = ids; write([]); showToast("Cleared your saved courts", () => write(before)); },
  };
}
