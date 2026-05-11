/**
 * Lưu subscription Web Push trong bộ nhớ process (phù hợp dev / single instance).
 * Production nhiều instance: thay bằng Redis / DB (Upstash, v.v.).
 */
export interface StoredPushSubscription {
  endpoint: string
  keys: { p256dh: string; auth: string }
  expirationTime?: number | null
}

const G = globalThis as typeof globalThis & { __WEATHER_PUSH_SUBS__?: Map<string, StoredPushSubscription> }

function map(): Map<string, StoredPushSubscription> {
  if (!G.__WEATHER_PUSH_SUBS__) G.__WEATHER_PUSH_SUBS__ = new Map()
  return G.__WEATHER_PUSH_SUBS__
}

export function savePushSubscription(sub: StoredPushSubscription): void {
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) return
  map().set(sub.endpoint, sub)
}

export function removePushSubscription(endpoint: string): void {
  map().delete(endpoint)
}

export function listPushSubscriptions(): StoredPushSubscription[] {
  return [...map().values()]
}
