'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Cloud, CloudRain, Wind, Compass } from 'lucide-react'
import { useT } from '@/shared/hooks/useT'
import { cn } from '@/shared/lib/cn'

const ITEMS = [
  { href: '/weather', key: 'weather', Icon: Cloud },
  { href: '/radar',   key: 'radar',   Icon: CloudRain },
  { href: '/aqi',     key: 'aqi',     Icon: Wind },
  { href: '/wind',    key: 'wind',    Icon: Compass },
] as const

export function MobileBottomNav() {
  const pathname = usePathname()
  const t = useT()
  const path = pathname?.replace(/\/+$/, '') ?? ''

  if (path === '/widget/embed') return null

  const label: Record<string, string> = {
    weather: t.bottomNav.weather,
    radar:   t.bottomNav.radar,
    aqi:     t.bottomNav.aqi,
    wind:    t.bottomNav.wind,
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden pointer-events-none">
      <nav
        className="mx-auto flex max-w-md items-stretch justify-around gap-1 rounded-2xl border border-black/5 bg-white/80 p-1.5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 pointer-events-auto"
        aria-label="Mobile navigation"
      >
        {ITEMS.map(({ href, key, Icon }) => {
          const active = pathname === href || !!pathname?.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-h-[52px] min-w-[44px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-semibold transition-colors',
                active
                  ? 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-white/5 dark:hover:text-slate-200',
              )}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2 : 1.5}
                className="transition-all"
                aria-hidden
              />
              <span className="truncate">{label[key]}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
