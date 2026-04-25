// Versi cache - UBAH NILAI INI SETIAP KALI ADA UPDATE KODE
const CACHE_VERSION = 'inventory-v2';
const CACHE_NAME = `inventory-cache-${CACHE_VERSION}`;

// Event Install - langsung aktifkan
self.addEventListener('install', (event) => {
  console.log(`[SW v${CACHE_VERSION}] Install`);
  // Skip waiting - langsung ambil alih
  self.skipWaiting();
  
  // Pre-cache halaman utama
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json'
      ]).catch(err => {
        console.log('Pre-cache gagal (mungkin offline):', err);
      });
    })
  );
});

// Event Activate - bersihkan cache lama & klaim clients
self.addEventListener('activate', (event) => {
  console.log(`[SW v${CACHE_VERSION}] Activate`);
  
  // Hapus cache versi lama
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('Menghapus cache lama:', name);
            return caches.delete(name);
          })
      );
    })
  );
  
  // Klaim semua client yang ada (supaya service worker baru langsung mengontrol halaman)
  event.waitUntil(clients.claim());
  
  // Kirim pesan ke semua client bahwa SW sudah aktif (untuk trigger reload)
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'SW_ACTIVATED', version: CACHE_VERSION });
    });
  });
});

// Event Message - untuk menerima perintah skip waiting dari halaman
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Menerima perintah SKIP_WAITING');
    self.skipWaiting();
  }
});

// Event Fetch - strategi Network First, fallback ke cache
self.addEventListener('fetch', (event) => {
  // Hanya handle GET request
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response untuk cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Cache halaman HTML, JS, CSS
          if (event.request.url.includes(window.location.origin)) {
            cache.put(event.request, responseClone);
          }
        });
        return response;
      })
      .catch(() => {
        // Jika offline, ambil dari cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Jika halaman HTML, return halaman utama (untuk SPA)
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          // Return error jika tidak ada di cache
          return new Response('Offline - Halaman tidak tersedia', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

// Logging
console.log(`[SW v${CACHE_VERSION}] Service Worker dimuat`);