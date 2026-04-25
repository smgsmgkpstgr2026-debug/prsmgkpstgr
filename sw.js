const CACHE_NAME = 'inventory-v1'; // Ganti versi setiap kali ada perubahan untuk memicu update

self.addEventListener('install', event => {
  console.log('[SW] Install');
  // Langsung aktif tanpa menunggu tab lama ditutup
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[SW] Activate');
  // Ambil alih semua halaman yang sudah terbuka
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  // Strategi: network first, fallback ke cache (jika diperlukan)
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});