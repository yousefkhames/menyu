/* Menyu service worker: network first, cache fallback, so the app and menu keep working offline after one visit. */
const CACHE = 'menyu-v3';
const PRE = ['./', 'index.html', 'menu.html', 'css/fonts.css', 'fonts/cairo-arabic-400-normal.woff2', 'fonts/cairo-arabic-700-normal.woff2', 'fonts/cairo-latin-400-normal.woff2', 'fonts/cairo-latin-700-normal.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRE)).catch(() => {}).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
