import { useSyncExternalStore } from "react";
import courts from "./data/courts.json";
import { showToast } from "./components/Toaster.jsx";
const listeners = new Set();
const valid = new Set(courts.map(c => c.id));
let ids = [];
try {
  ids = JSON.parse(sessionStorage.getItem("pickle-compare") || "[]").filter(id => valid.has(id)).slice(0, 3);
} catch {}
const write = next => {
  ids = next;
  try {
    sessionStorage.setItem("pickle-compare", JSON.stringify(ids));
  } catch {}
  listeners.forEach(fn => fn());
};
export default function useCompare() {
  const selected = useSyncExternalStore(fn => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, () => ids, () => ids);
  return {
    ids: selected,
    clear: () => write([]),
    toggle: id => {
      if (!valid.has(id)) return;
      if (selected.includes(id)) write(selected.filter(x => x !== id));else if (selected.length < 3) write([...selected, id]);else showToast("Compare up to 3 courts. Remove one to add another.");
    }
  };
}
