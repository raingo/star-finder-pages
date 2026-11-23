// Star Finder Service Worker v3.0 - Network-First for HTML/JS
const CACHE_NAME = 'starfinder-cache-v3.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './assets/milkyway.jpg',
  './js/astronomy.js',
  './js/stars-data.js',
  './js/sensors.js',
  './js/renderer.js',
  './js/app.js',
  './icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/icon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  // Never intercept/cache cross-origin requests (e.g. live ISS telemetry API)
  if (url.origin !== self.location.origin) return;

  const isNav = event.request.mode === 'navigate';
  const isNavOrCode = isNav ||
                      event.request.headers.get('accept')?.includes('text/html') ||
                      url.pathname.endsWith('.js') ||
                      url.pathname.endsWith('.css');

  if (isNavOrCode) {
    // Network First strategy: Always serve fresh code if online, but fall back to cache on any error/5xx/404
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            return response;
          }
          // If server returns an error (e.g. 530 Tunnel Not Found or 404), fall back to cache
          return caches.match(event.request, { ignoreSearch: true }).then((cached) => {
            if (cached) return cached;
            return isNav ? caches.match('./index.html', { ignoreSearch: true }) : response;
          });
        })
        .catch(() => {
          // Offline fallback: ignoreSearch matches precached ./js/app.js for ./js/app.js?v=3.0
          return caches.match(event.request, { ignoreSearch: true }).then((cached) => {
            if (cached) return cached;
            return isNav ? caches.match('./index.html', { ignoreSearch: true }) : Response.error();
          });
        })
    );
  } else {
    // Cache First for static media / icons
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        });
      })
    );
  }
});
