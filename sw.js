// Zikr Hisoblagich — offline ishlashi uchun
const CACHE = 'zikr-v1';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-512-maskable.png', './icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Avval keshdan beradi (internetsiz ham ochiladi), orqada yangilaydi
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(e.request, { ignoreSearch: true })
      || (e.request.mode === 'navigate' ? await cache.match('./index.html') : null);
    const fresh = fetch(e.request).then(res => {
      if (res && res.ok && new URL(e.request.url).origin === location.origin) cache.put(e.request, res.clone());
      return res;
    }).catch(() => cached);
    return cached || fresh;
  }));
});
