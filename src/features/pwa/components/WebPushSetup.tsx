'use client'

import { useCallback, useEffect, useState } from 'react'
import { useT } from '@/shared/hooks/useT'
import { cn } from '@/shared/lib/cn'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export function WebPushSetup() {
  const t = useT()
  const [configured, setConfigured] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const isDev = process.env.NODE_ENV === 'development'

  useEffect(() => {
    void (async () => {
      try {
        const r = await fetch('/api/push/vapid-public')
        const j = (await r.json()) as { configured?: boolean }
        setConfigured(Boolean(j.configured))
      } catch {
        setConfigured(false)
      }
    })()
  }, [])

  const subscribe = useCallback(async () => {
    setMsg(null)
    setBusy(true)
    try {
      const r = await fetch('/api/push/vapid-public')
      const j = (await r.json()) as { configured?: boolean; publicKey?: string | null }
      if (!j.configured || !j.publicKey) {
        setMsg(t.push.vapidMissing)
        return
      }
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setMsg(t.push.notSupported)
        return
      }
      const reg = await navigator.serviceWorker.ready
      const key = urlBase64ToUint8Array(j.publicKey)
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        // DOM typings expect ArrayBuffer-backed views; our Uint8Array is runtime-correct.
        applicationServerKey: key as BufferSource,
      })
      const json = sub.toJSON()
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        setMsg(t.push.subscribeFailed)
        return
      }
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
          expirationTime: json.expirationTime ?? null,
        }),
      })
      if (!res.ok) {
        setMsg(t.push.subscribeFailed)
        return
      }
      setMsg(t.push.subscribed)
    } catch {
      setMsg(t.push.subscribeFailed)
    } finally {
      setBusy(false)
    }
  }, [t])

  const sendTest = useCallback(async () => {
    if (!isDev) return
    setMsg(null)
    setBusy(true)
    try {
      const res = await fetch('/api/push/test', { method: 'POST' })
      const j = (await res.json()) as { ok?: boolean; sent?: number; failed?: number; error?: string }
      if (!res.ok) {
        setMsg(j.error === 'vapid_not_configured' ? t.push.vapidMissing : t.push.testFailed)
        return
      }
      setMsg(t.push.testResult(j.sent ?? 0, j.failed ?? 0))
    } catch {
      setMsg(t.push.testFailed)
    } finally {
      setBusy(false)
    }
  }, [isDev, t])

  if (!configured) {
    return (
      <p className="text-[10px] leading-snug text-amber-600 dark:text-amber-400">{t.push.vapidMissing}</p>
    )
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void subscribe()}
        className={cn(
          'w-full rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors',
          'border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100',
          busy && 'opacity-60',
        )}
      >
        {t.push.subscribeServer}
      </button>
      {isDev ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void sendTest()}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          {t.push.sendTestDev}
        </button>
      ) : (
        <p className="text-[10px] leading-snug text-slate-400 dark:text-slate-500">{t.push.testProdHint}</p>
      )}
      {msg ? <p className="text-[10px] leading-snug text-slate-500 dark:text-slate-400">{msg}</p> : null}
    </div>
  )
}
