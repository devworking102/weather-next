'use client'

import { useEffect } from 'react'
import { SW_SCRIPT_QUERY } from '@/shared/lib/sw-register'

/** Đăng ký SW: cache GET /api/weather (C) + nhận push (A). Query ?v= để ép cập nhật script. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    const url = `/sw.js?v=${encodeURIComponent(SW_SCRIPT_QUERY)}`
    void navigator.serviceWorker.register(url, { updateViaCache: 'none' }).catch(() => {})
  }, [])
  return null
}
