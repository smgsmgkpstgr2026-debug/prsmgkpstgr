const CACHE_NAME = 'inventory-v2';

// Install service worker dan langsung aktif
self.addEventListener('install', event => {
  console.log('[SW inventory-v2] Install');
  self.skipWaiting();
});

// Activate dan ambil alih halaman yang sudah terbuka
self.addEventListener('activate', event => {
  console.log('[SW inventory-v2] Activate');
  event.waitUntil(clients.claim());
});

// Strategy: network first, fallback tidak ada (kita tidak cache)
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});

// Saat ada update, beri tahu pengguna dan reload
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});