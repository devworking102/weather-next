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
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-[color:var(--background)]/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden dark:border-white/10"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1 px-2">
        {ITEMS.map(({ href, key, Icon }) => {
          const active = pathname === href || !!pathname?.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-h-[52px] min-w-[44px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-semibold transition-colors',
                active
                  ? 'text-sky-600 dark:text-sky-300'
                  : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200',
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
      </div>
    </nav>
  )
}
