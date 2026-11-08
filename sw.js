const VERSION = 'dang-v1.0.0-20261108-1';
const ROOT = new URL('./', self.location.href);
// Include the repository path: other Pages projects on this origin have their own caches.
const PREFIX = 'dang-app:' + ROOT.pathname + ':';
const CACHE = PREFIX + VERSION;
const FILES = ['index.html', 'app.js', 'store.js', 'i18n.js', 'icons.js', 'themes.js', 'manifest.webmanifest',
  'assets/css/styles.css', 'assets/fonts/vazirmatn-arabic-wght-normal.woff2', 'assets/fonts/vazirmatn-latin-wght-normal.woff2',
  'assets/branding/dang-emblem.webp', 'assets/branding/icon-32.png', 'assets/branding/icon-180.png',
  'assets/branding/icon-192.png', 'assets/branding/icon-512.png', 'assets/branding/icon-maskable-512.png'];
const URLS = FILES.map(file => new URL(file, ROOT).href);

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(URLS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(PREFIX) && name !== CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => { if (event.data?.type === 'ACTIVATE') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  const canonical = url.href.split('?')[0];
  const isHome = event.request.mode === 'navigate' && [ROOT.pathname, new URL('index.html', ROOT).pathname].includes(url.pathname);
  if (!isHome && !URLS.includes(canonical)) return;
  // Serve one installed version as a unit; do not mix old HTML with new scripts.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const response = await cache.match(isHome ? new URL('index.html', ROOT).href : canonical);
    return response || fetch(event.request);
  })());
});
