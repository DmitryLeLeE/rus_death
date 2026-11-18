const CACHE_NAME = "rus-death-v2";
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./ru/index.html",
  "./css/core.css",
  "./css/plates.css",
  "./css/pages.css",
  "./css/motion.css",
  "./css/print.css",
  "./js/app.js",
  "./js/nav.js",
  "./js/search.js",
  "./js/sound.js",
  "./search-index.json",
  "./ru/search-index.json",
  "./manifest.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => k !== CACHE_NAME ? caches.delete(k) : null))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).then((resp) => {
      if (resp && resp.status === 200 && resp.type === "basic") {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
      }
      return resp;
    })).catch(() => caches.match("./index.html"))
  );
});
