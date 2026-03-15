/**
 * sw.js – Service Worker cho PWA
 * Mục đích: Cache tài nguyên tĩnh để game chạy hoàn toàn offline.
 * Chiến lược: Cache-first với fallback network.
 */

const CACHE_NAME = 'kbb-v1';

// Danh sách file cần cache khi cài PWA
const PRECACHE_URLS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './game/engine.js',
  './game/ai.js',
  './game/storage.js',
  './ui/dom.js',
  './ui/animations.js',
  './ui/sounds.js',
  './assets/icons.svg',
  './manifest.webmanifest',
];

// ─── Cài đặt: Pre-cache các file cốt lõi ─────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // Kích hoạt ngay không chờ tab cũ đóng
  self.skipWaiting();
});

// ─── Kích hoạt: Xóa cache cũ ─────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch: Cache-first ───────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  // Bỏ qua request không phải GET hoặc không phải http(s)
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  // Bỏ qua Google Fonts (luôn fetch từ mạng)
  if (event.request.url.includes('fonts.googleapis') || event.request.url.includes('fonts.gstatic')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      // Nếu không có trong cache, fetch từ mạng và cache lại
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
