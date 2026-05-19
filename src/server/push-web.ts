import webpush from 'web-push'
import { listPushSubscriptions, type StoredPushSubscription } from '@/server/push-subscription-store'

let configured = false

export function isWebPushConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT,
  )
}

export function configureWebPush(): boolean {
  if (configured) return isWebPushConfigured()
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT
  if (!publicKey || !privateKey || !subject) return false
  webpush.setVapidDetails(subject, publicKey, privateKey)
  configured = true
  return true
}

export function getVapidPublicKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''
}

export async function sendPushToAll(payload: { title: string; body: string; url?: string }): Promise<{
  sent: number
  failed: number
}> {
  if (!configureWebPush()) return { sent: 0, failed: 0 }
  const data = JSON.stringify({ title: payload.title, body: payload.body, url: payload.url ?? '/thoi-tiet' })
  const subs = listPushSubscriptions()
  let sent = 0
  let failed = 0
  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub as webpush.PushSubscription, data, {
        TTL: 3600,
      })
      sent++
    } catch {
      failed++
    }
  }
  return { sent, failed }
}

export async function sendPushToOne(
  sub: StoredPushSubscription,
  payload: { title: string; body: string; url?: string },
): Promise<boolean> {
  if (!configureWebPush()) return false
  const data = JSON.stringify({ title: payload.title, body: payload.body, url: payload.url ?? '/thoi-tiet' })
  try {
    await webpush.sendNotification(sub as webpush.PushSubscription, data, { TTL: 3600 })
    return true
  } catch {
    return false
  }
}
