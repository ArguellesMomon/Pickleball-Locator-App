import { useState, useEffect } from "react";

// "Install app" support: the browser fires beforeinstallprompt once, so we catch it as early as possible
let deferred = null;
const subs = new Set();
const notify = () => subs.forEach((fn) => fn());
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; notify(); });
  window.addEventListener("appinstalled", () => { deferred = null; notify(); });
}

export default function useInstall() {
  const [, tick] = useState(0);
  useEffect(() => { const fn = () => tick((n) => n + 1); subs.add(fn); return () => subs.delete(fn); }, []);
  const installed = !!(window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone);
  return {
    canInstall: !!deferred, installed,
    install: async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; notify(); },
  };
}
