const CACHE_NAME = 'manas-store-v2'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/globals.css',
]

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (!event.request.url.includes(self.location.origin)) {
    return
  }

  // Skip API requests - handle separately
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => response)
        .catch(() => {
          // Return offline response
          return new Response(JSON.stringify({ offline: true }), {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'application/json' }),
          })
        })
    )
    return
  }

  // For page navigations, prefer fresh HTML and only fall back to cache offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clonedResponse = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clonedResponse)
            })
          }
          return response
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request)
          return cachedResponse || caches.match('/')
        })
    )
    return
  }

  // For other same-origin assets, try cache first, then network.
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }

      return fetch(event.request).then((response) => {
        // Only cache successful responses
        if (response && response.status === 200) {
          const clonedResponse = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse)
          })
        }
        return response
      })
    })
  )
})

// Message event - handle sync messages from app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})


