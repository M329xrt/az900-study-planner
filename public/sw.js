/* Momentum service worker — keeps the planner usable with no signal.
   Strategy: network-first for pages (so updates land), cache-first for static
   assets and fonts (so opening the app costs almost no data), and nothing at
   all for API traffic so study data is never served stale. */
const CACHE = 'momentum-v1';
const CORE = ['/', '/index.html', '/manifest.json', '/mark.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(CORE).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Fonts: cache-first, so we never re-download them.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        try {
          const response = await fetch(request);
          if (response && response.ok) cache.put(request, response.clone());
          return response;
        } catch (error) {
          return hit || Response.error();
        }
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Pages: network-first with an offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put('/index.html', copy)).catch(() => undefined);
          return response;
        })
        .catch(() => caches.match('/index.html').then((hit) => hit || caches.match('/')))
    );
    return;
  }

  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/functions')) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(request);
      if (hit) return hit;
      try {
        const response = await fetch(request);
        if (response && response.ok && response.type === 'basic') cache.put(request, response.clone());
        return response;
      } catch (error) {
        return hit || Response.error();
      }
    })
  );
});
