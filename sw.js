// PetersWorld Service Worker v1.1
const CACHE = 'petersworld-v1.1';
const ASSETS = [
  './', './index.html', './app.js', './petersworld.wasm',
  './favicon.svg', './manifest.json'
];

self.addEventListener('install', e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()))
);

self.addEventListener('activate', e =>
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()))
);

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // version.json altijd live ophalen (geen cache)
  if (url.pathname.endsWith('version.json')) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).catch(() =>
        new Response(JSON.stringify({ status: 'offline' }), { headers: { 'Content-Type': 'application/json' }})
      )
    );
    return;
  }

  // Stale-while-revalidate voor overige assets
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fresh = fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});

self.addEventListener('message', e => {
  if (e.data?.action === 'skipWaiting') self.skipWaiting();
});
