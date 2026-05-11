/* global self, caches */
/**
 * SW_CACHE_VERSION — tăng khi đổi chiến lược cache (C).
 * Đăng ký SW từ app với ?v=... cùng giá trị NEXT_PUBLIC_SW_CACHE_VERSION.
 */
const SW_CACHE_VERSION = 'weather-sw-v4'
const WEATHER_API_CACHE = `${SW_CACHE_VERSION}-weather-get`

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(SW_CACHE_VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

/** GET /api/weather — network-first, fallback cache (offline). */
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname !== '/api/weather') return

  event.respondWith(
    (async () => {
      const cache = await caches.open(WEATHER_API_CACHE)
      try {
        const res = await fetch(request)
        if (res.ok) await cache.put(request, res.clone())
        return res
      } catch {
        const hit = await cache.match(request)
        if (hit) return hit
        return new Response(JSON.stringify({ error: 'offline', message: 'no_cached_weather' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    })(),
  )
})

self.addEventListener('push', (event) => {
  let data = { title: 'Weather Next', body: '', url: '/weather' }
  try {
    if (event.data) data = { ...data, ...event.data.json() }
  } catch {
    /* ignore */
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      data: { url: data.url || '/weather' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/weather'
  event.waitUntil(self.clients.openWindow(url))
})
