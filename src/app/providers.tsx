'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useEffect } from 'react'
import { getQueryClient } from '@/shared/lib/query-client'
import { useUiStore } from '@/shared/store/ui-store'

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()
  const theme = useUiStore((s) => s.theme)

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

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
