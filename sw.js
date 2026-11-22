// Bulletproof Offline Service Worker for Mr. DODO Mobile App
// Enables 100% full offline operation without laptop or internet
const CACHE_NAME = 'mr-dodo-offline-v6';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './app-icon-512.png',
  './logo-icon.png',
  './logo-text.png',
  './logo-icon-white.png',
  './logo-text-white.png'
];

// 1. INSTALL: Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE: Purge old caches and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH: Offline-first routing strategy
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Bypass service worker caching on localhost / dev environments
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.port === '5173') {
    return;
  }

  // A. Navigation requests (opening or reloading the app)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          // LAPTOP OFF OR NO INTERNET: Serve cached index.html immediately!
          return caches.match('./index.html').then((cached) => {
            return cached || caches.match('./') || caches.match('index.html') || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // B. Static assets: JS, CSS, images, icons, fonts
  // Strategy: Cache-First (instant offline load), then update cache from network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to keep cache fresh when online
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
          })
          .catch(() => {
            // Offline: silent, already serving cached
          });

        return cachedResponse;
      }

      // If not in cache, fetch from network and cache for future offline use
      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback for images or sub-resources if missing
          if (request.destination === 'image') {
            return caches.match('./app-icon-512.png') || caches.match('/app-icon-512.png');
          }
        });
    })
  );
});
