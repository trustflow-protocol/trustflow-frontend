/* ─── TrustFlow Service Worker ────────────────────────────────
 *  Cache-first for static assets, network-first for API calls,
 *  offline fallback, and background transaction queue support.
 * ───────────────────────────────────────────────────────────── */

const CACHE_NAME = 'trustflow-v1'
const STATIC_CACHE = 'trustflow-static-v1'
const API_CACHE = 'trustflow-api-v1'

// Assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/explore',
  '/create-gig',
  '/leaderboard',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
]

// ── Install ────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS)
    })
  )
  // Force the waiting service worker to become the active one
  self.skipWaiting()
})

// ── Activate ───────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== API_CACHE && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  // Start controlling all clients immediately
  self.clients.claim()
})

// ── Fetch ──────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests (POST, PUT, etc.) — don't cache mutations
  if (request.method !== 'GET') return

  // Skip browser extensions and non-http(s) requests
  if (!url.protocol.startsWith('http')) return

  // API / data requests — network-first with cache fallback
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('stellar') ||
    url.hostname.includes('soroban')
  ) {
    event.respondWith(networkFirstWithFallback(request))
    return
  }

  // Navigation requests — network-first for fresh HTML, cache as fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request))
    return
  }

  // Static assets (JS, CSS, fonts, images, icons) — cache-first
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|svg|png|jpg|jpeg|webp|avif|ico)$/) ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(cacheFirstWithRefresh(request))
    return
  }

  // Everything else — network-first
  event.respondWith(networkFirstWithFallback(request))
})

// ── Cache Strategies ───────────────────────────────────────────

/**
 * Cache-first: serve from cache immediately, update cache in background.
 */
async function cacheFirstWithRefresh(request) {
  const cached = await caches.match(request)
  if (cached) {
    // Fire-and-forget: update cache in background
    fetch(request).then((response) => {
      if (response.ok) {
        caches.open(STATIC_CACHE).then((cache) => cache.put(request, response))
      }
    }).catch(() => { /* offline, ignore */ })
    return cached
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
  }
}

/**
 * Network-first: try the network, fall back to cache, then offline page.
 */
async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request)
    if (response.ok && response.type === 'basic') {
      const cache = await caches.open(API_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached

    // For navigation requests, serve the cached dashboard as SPA fallback
    if (request.mode === 'navigate') {
      const fallback = await caches.match('/dashboard')
      if (fallback) return fallback
    }

    return new Response(
      JSON.stringify({ error: 'You are offline. Some features may be unavailable.' }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// ── Message Relay (for transaction queue sync) ─────────────────

self.addEventListener('message', (event) => {
  if (!event.data) return

  const { type, payload } = event.data

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break

    case 'QUEUE_SYNC':
      // Notify all clients about a queued transaction
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'QUEUE_SYNC', payload })
        })
      })
      break

    case 'CLEAR_CACHE':
      caches.delete(STATIC_CACHE)
      caches.delete(API_CACHE)
      caches.delete(CACHE_NAME)
      break

    default:
      break
  }
})

// ── Periodic Background Sync (if available) ────────────────────

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-transaction-queue') {
    event.waitUntil(syncTransactionQueue())
  }
})

async function syncTransactionQueue() {
  // The actual queue processing logic runs in the client via the
  // useTransactionQueue hook. This periodic sync tag is a trigger
  // that wakes the page to process the queue.
  const clients = await self.clients.matchAll({ type: 'window' })
  clients.forEach((client) => {
    client.postMessage({ type: 'PERIODIC_SYNC_TRIGGER' })
  })
}
