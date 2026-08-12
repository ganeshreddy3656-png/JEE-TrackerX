const CACHE = "jee-tracker-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Install: cache all assets
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network first, fall back to cache
// This means app always tries to get latest version from GitHub first
self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request)
      .then(networkResponse => {
        // Got fresh response — update the cache
        const clone = networkResponse.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return networkResponse;
      })
      .catch(() => {
        // No internet — serve from cache
        return caches.match(e.request);
      })
  );
});
