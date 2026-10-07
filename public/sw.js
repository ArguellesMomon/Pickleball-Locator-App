// Cache the complete application shell; map tiles and live weather require a connection.
const CACHE = "pickle-v3";
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache=await caches.open(CACHE);
    await cache.addAll(["/","/manifest.webmanifest","/images/court-illustration-0.svg","/images/court-illustration-1.svg","/images/court-illustration-2.svg","/images/court-illustration-3.svg","/images/placeholder.svg"]);
    const response=await fetch("/asset-manifest.json",{cache:"no-store"});
    if(!response.ok) throw new Error("Asset manifest unavailable");
    const manifest=await response.json();
    const assets=[...new Set(Object.values(manifest).flatMap(entry=>[entry.file,...(entry.css||[]),...(entry.assets||[])].filter(Boolean)).map(file=>"/"+file))];
    await cache.addAll(assets);
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("pickle-")&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const req=event.request,url=new URL(req.url);
  if(req.method!=="GET"||url.origin!==location.origin||url.pathname.startsWith("/api/"))return;
  if(req.mode==="navigate"){
    event.respondWith(fetch(req).then(async response=>{if(response.ok){const cache=await caches.open(CACHE);await cache.put("/",response.clone());}return response;}).catch(()=>caches.match("/")));
    return;
  }
  event.respondWith((async()=>{const cache=await caches.open(CACHE);const saved=await cache.match(req);if(saved)return saved;try{const response=await fetch(req);if(response.ok)await cache.put(req,response.clone());return response;}catch{return new Response("Unavailable offline",{status:503});}})());
});
