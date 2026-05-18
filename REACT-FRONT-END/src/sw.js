/**
 * Service Worker — BLINKED PWA
 * 
 * Workbox 7 custom SW with offline-first caching, background sync,
 * and push notification support.
 */

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, CacheFirst, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

const SW_VERSION = '1.0.0';
const CACHE_PREFIX = 'bsv-pwa';

// ── Precache manifest injected at build time ──────────────────────────────
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// ── App Shell: Network First with 3s timeout fallback ─────────────────────
const appShellStrategy = new NetworkFirst({
  cacheName: `${CACHE_PREFIX}-app-shell`,
  plugins: [
    new CacheableResponsePlugin({ statuses: [0, 200] }),
    new ExpirationPlugin({
      maxAgeSeconds: 60 * 60, // 1 hour
      maxEntries: 50,
    }),
  ],
  networkTimeoutSeconds: 3,
});

// Navigation requests (HTML pages)
registerRoute(
  new NavigationRoute(
    createHandlerBoundToURL('/index.html'),
    {
      denylist: [/^\/api\//, /^\/auth\//],
    }
  )
);

// ── Static Assets: Cache First, long TTL ──────────────────────────────────
// JS, CSS with content hashes — immutable
registerRoute(
  ({ request, url }) => {
    return (
      request.destination === 'script' ||
      request.destination === 'style'
    ) && url.pathname.match(/\.[a-f0-9]{8,}\.(js|css)$/);
  },
  new CacheFirst({
    cacheName: `${CACHE_PREFIX}-static-immutable`,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        maxEntries: 100,
      }),
    ],
  })
);

// Fonts — Cache First, 1 year
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: `${CACHE_PREFIX}-fonts`,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxAgeSeconds: 365 * 24 * 60 * 60,
        maxEntries: 30,
      }),
    ],
  })
);

// Images — Cache First, 30 days
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: `${CACHE_PREFIX}-images`,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60,
        maxEntries: 200,
      }),
    ],
  })
);

// ── API Routes ─────────────────────────────────────────────────────────────

// Auth routes — Network Only, never cache
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/auth/') || url.pathname.startsWith('/api/v1/auth/'),
  new NetworkOnly()
);

// GET requests — Stale While Revalidate
registerRoute(
  ({ url, request }) => {
    return url.pathname.startsWith('/api/') && request.method === 'GET';
  },
  new StaleWhileRevalidate({
    cacheName: `${CACHE_PREFIX}-api-data`,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxAgeSeconds: 5 * 60, // 5 minutes
        maxEntries: 200,
      }),
    ],
  })
);

// Mutations (POST, PUT, PATCH, DELETE) — Network Only + Background Sync
const bgSyncPlugin = new BackgroundSyncPlugin('api-mutations-queue', {
  maxRetentionTime: 24 * 60, // 24 hours in minutes
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request.clone());
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('[SW] Replay failed:', entry.request.url, error);
        }
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
  },
});

// Single route handler for all mutation methods
registerRoute(
  ({ url, request }) => {
    return url.pathname.startsWith('/api/') && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
  },
  new NetworkOnly({
    plugins: [bgSyncPlugin],
  })
);

// ── Offline Fallback ───────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html') || caches.match('/index.html');
      })
    );
  }
});

// ── Push Notifications ─────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'BLINKED';
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/badge-72.png',
    tag: data.tag || 'default',
    renotify: true,
    data: {
      url: data.url || '/',
      ...data,
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if found
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// ── Skip Waiting ───────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── Activation ─────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

if (import.meta.env.DEV) {
  console.log(`[SW ${SW_VERSION}] Loaded`);
}
