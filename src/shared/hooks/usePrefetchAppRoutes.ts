'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'

/**
 * Prefetch nhẹ (idle): các route bottom nav + chunk tab/map tương ứng để chuyển trang mượt hơn.
 */
export function usePrefetchAppRoutes() {
  const pathname = usePathname()
  const router = useRouter()
  const ran = useRef(false)

  useEffect(() => {
    const path = pathname?.replace(/\/+$/, '') ?? ''
    if (path === '/tien-ich/embed') return
    if (path === '/radar-mua' || path === '/chat-luong-khong-khi' || path === '/gio') return
    if (ran.current) return

    let cancelled = false
    let idleId: number | undefined
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const run = () => {
      if (cancelled || ran.current) return
      ran.current = true
      try {
        router.prefetch('/radar-mua')
        router.prefetch('/chat-luong-khong-khi')
        router.prefetch('/gio')
      } catch {
        /* noop */
      }
      void import('@/features/radar/components/OpenLayersRainMap')
      void import('@/features/radar/components/RadarEmbed')
      void import('@/features/weather/components/tabs/AirQualityTab')
      void import('@/features/weather/components/tabs/WindTab')
    }

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(() => run(), { timeout: 4500 })
      } else {
        timeoutId = setTimeout(run, 2800)
      }
    }

    return () => {
      cancelled = true
      if (idleId != null && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId != null) clearTimeout(timeoutId)
    }
  }, [pathname, router])
}
