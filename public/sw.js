/* global self, caches */
/**
 * SW_CACHE_VERSION — tăng khi đổi chiến lược cache (C).
 * Đăng ký SW từ app với ?v=... cùng giá trị NEXT_PUBLIC_SW_CACHE_VERSION.
 */
const SW_CACHE_VERSION = 'weather-sw-v6'
const WEATHER_API_CACHE = `${SW_CACHE_VERSION}-weather-get`
const AQI_API_CACHE = `${SW_CACHE_VERSION}-aqi-get`
const SHELL_CACHE = `${SW_CACHE_VERSION}-shell`

const PRECACHE_URLS = ['/offline.html', '/icon.svg', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  )
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

/** GET API — network-first, cache bản thành công để dùng offline. */
function networkFirstGet(request, cacheName, offlineBody) {
  return (async () => {
    const cache = await caches.open(cacheName)
    try {
      const res = await fetch(request)
      if (res.ok) await cache.put(request, res.clone())
      return res
    } catch {
      const hit = await cache.match(request)
      if (hit) return hit
      return new Response(JSON.stringify(offlineBody), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  })()
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  /** Trang HTML: lỗi mạng → offline shell (không cache bản online để tránh HTML cũ). */
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request)
        } catch {
          const shell = await caches.open(SHELL_CACHE)
          const offline = await shell.match('/offline.html')
          if (offline) return offline
          return new Response(
            '<!doctype html><meta charset="utf-8"><title>Offline</title><p>Không có mạng.</p><p><a href="/thoi-tiet">Về dự báo</a></p>',
            { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
          )
        }
      })(),
    )
    return
  }

  if (url.pathname === '/api/weather') {
    event.respondWith(
      networkFirstGet(request, WEATHER_API_CACHE, {
        ok: false,
        error: {
          code: 'offline',
          message: 'Bạn đang offline và chưa có dự báo đã lưu cho vị trí này.',
        },
      }),
    )
    return
  }
  if (url.pathname === '/api/aqi') {
    event.respondWith(
      networkFirstGet(request, AQI_API_CACHE, {
        ok: false,
        error: {
          code: 'offline',
          message: 'Bạn đang offline và chưa có AQI đã lưu cho vị trí này.',
        },
      }),
    )
    return
  }
})

self.addEventListener('push', (event) => {
  let data = { title: 'Trời Hôm Nay', body: '', url: '/thoi-tiet' }
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
      data: { url: data.url || '/thoi-tiet' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/thoi-tiet'
  event.waitUntil(self.clients.openWindow(url))
})
