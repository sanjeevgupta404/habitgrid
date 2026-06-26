/**
 * HabitGrid Service Worker
 * ─────────────────────────
 * Strategy: Cache-first for the app shell (all static JS/CSS/HTML).
 * Data lives exclusively in localStorage — no fetch calls needed for data,
 * so no network-first complexity required.
 *
 * Cache versioning: bump CACHE_VERSION when deploying new code.
 * Old caches are deleted in the activate phase.
 */

const CACHE_VERSION = 'v2.0.0';
const CACHE_NAME    = `habitgrid-${CACHE_VERSION}`;

// All files that make up the app shell.
// These are cached on install so the app works fully offline.
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './icons/icon.svg',
  './src/main.js',
  './src/core/constants.js',
  './src/core/api.js',
  './src/core/store.js',
  './src/core/router.js',
  './src/core/theme.js',
  './src/core/pwa.js',
  './src/utils/date.js',
  './src/utils/stats.js',
  './src/utils/io.js',
  './src/components/topbar.js',
  './src/components/bottomNav.js',
  './src/components/modal.js',
  './src/components/habitModal.js',
  './src/components/toast.js',
  './src/components/shared.js',
  './src/pages/auth.js',
  './src/pages/tracker.js',
  './src/pages/history.js',
  './src/pages/settings.js',
];

// ── Install: pre-cache app shell ─────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())   // activate new SW immediately
  );
});

// ── Activate: delete old caches ───────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k.startsWith('habitgrid-') && k !== CACHE_NAME)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())  // take control of existing pages
  );
});

// ── Fetch: cache-first, fall back to network ──────────────────────────────────
self.addEventListener('fetch', event => {
  // Only handle GET requests for our own origin
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip cross-origin requests (e.g. Google Fonts)
  // — they are nice-to-have but not required for offline functionality
  if (url.origin !== self.location.origin) {
    // For Google Fonts: try network, fall back to nothing (UI degrades gracefully)
    event.respondWith(
      fetch(event.request).catch(() => new Response('', { status: 408 }))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;

        // Not in cache — fetch, cache it, return it
        return fetch(event.request).then(response => {
          // Only cache valid responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const toCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
          return response;
        });
      })
      .catch(() => {
        // Offline and not in cache — return index.html for navigation requests
        // so the SPA still loads correctly
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('Offline', { status: 503 });
      })
  );
});

// ── Background sync placeholder (ready for backend) ──────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-habits') {
    // TODO: when backend is added, replay queued writes here
    console.log('[SW] Background sync triggered — no-op for now');
  }
});

// ── Push notifications placeholder ───────────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data?.json() ?? { title: 'HabitGrid', body: 'Time to check your habits!' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icons/icon-192.png',
      badge: './icons/icon.svg',
      vibrate: [200, 100, 200],
      tag: 'habitgrid-reminder',
    })
  );
});
