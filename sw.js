// 先连网拿最新版，没网络时才用缓存。改程序后把版本号加一。
const CACHE = 'ziwei-v9';
const FILES = ['./','index.html','core.js','deep.js','manifest.webmanifest','lib/iztro.min.js','lib/lunar.js',
  'icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, {ignoreSearch: true}))
  );
});
