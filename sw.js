const CACHE = 'medico-v17';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './pins.js', './plus.js', './combine.js', './mobile.js'];
self.addEventListener('install', e => {
  // Cache each file separately so one missing file cannot stop the whole install
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      // Only cache good responses (or opaque CDN ones); never overwrite with a 404
      if (res.ok || res.type === 'opaque') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      }
      return caches.match(e.request).then(r => r || res);
    }).catch(() => caches.match(e.request).then(r => r || (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
