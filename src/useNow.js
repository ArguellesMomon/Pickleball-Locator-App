import { useSyncExternalStore } from "react";
const listeners = new Set();
let now = Date.now(),
  timer;
const subscribe = listener => {
  listeners.add(listener);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach(fn => fn());
    }, 60000);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      clearInterval(timer);
      timer = undefined;
    }
  };
};
export default function useNow() {
  return useSyncExternalStore(subscribe, () => now, () => now);
}
