const CACHE_NAME = 'bariatrica-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_CACHE_URLS);
      })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache with fallback strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API calls (Supabase) - Network First
  if (url.origin.includes('supabase') || url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response for cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets - Cache First
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request).then((response) => {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
            return response;
          });
        })
    );
    return;
  }

  // Handle HTML pages - Stale While Revalidate
  if (request.destination === 'document') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
              return networkResponse;
            });

          // Return cached version immediately if available, update cache in background
          return cachedResponse || fetchPromise;
        })
        .catch(() => {
          // Offline fallback
          return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Bariatrica em Casa - Offline</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f0fdf4; }
                .container { max-width: 400px; margin: 0 auto; }
                .icon { font-size: 64px; margin-bottom: 20px; }
                h1 { color: #10B981; margin-bottom: 10px; }
                p { color: #6b7280; margin-bottom: 20px; }
                .retry { background: #10B981; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; }
                .retry:hover { background: #059669; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="icon">🏠</div>
                <h1>Você está offline</h1>
                <p>Verifique sua conexão com a internet e tente novamente.</p>
                <button class="retry" onclick="window.location.reload()">Tentar Novamente</button>
              </div>
            </body>
            </html>
          `, {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
  }
});