'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getQueryClient } from '@/shared/lib/query-client'
import { useUiStore } from '@/shared/store/ui-store'
import { ChatWidget } from '@/features/weather/components/ChatWidget'
import { ServiceWorkerRegister } from '@/features/pwa/components/ServiceWorkerRegister'
import { MobileBottomNav } from '@/shared/ui/MobileBottomNav'
import { usePrefetchAppRoutes } from '@/shared/hooks/usePrefetchAppRoutes'

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()
  const pathname = usePathname()
  usePrefetchAppRoutes()
  const theme = useUiStore((s) => s.theme)
  // Chỉ ẩn chat trong trang iframe nhúng (`/widget/embed`), không ẩn ở `/widget` (trang lấy mã).
  const path = pathname?.replace(/\/+$/, '') ?? ''
  const showChat = path !== '/widget/embed'

  // Áp dụng class `dark` lên <html> theo theme + media query hệ thống
  useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const isDark = theme === 'dark' || (theme === 'system' && systemDark)
      root.classList.toggle('dark', isDark)
    }
    apply()
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])

  return (
    <QueryClientProvider client={queryClient}>
      <ServiceWorkerRegister />
      <div
        id="__content"
        tabIndex={-1}
        className="outline-none pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:pb-0"
      >
        {children}
      </div>
      <MobileBottomNav />
      {showChat ? <ChatWidget /> : null}
    </QueryClientProvider>
  )
}
