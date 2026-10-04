// Small service worker: the site opens instantly and the app shell works offline.
// Map tiles and other sites are never cached here (they go straight to the network).
const CACHE = "pickle-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/", "/manifest.webmanifest"])));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/")) return;

  // Pages: always try the network first so updates show up, fall back to the saved app shell offline
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(() => caches.match("/")));
    return;
  }
  // Files (JS, CSS, images): use the saved copy and refresh it in the background
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const saved = await cache.match(req);
      const fresh = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => saved);
      return saved || fresh;
    })
  );
});
