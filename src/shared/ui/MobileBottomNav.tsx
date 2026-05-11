'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useT } from '@/shared/hooks/useT'
import { cn } from '@/shared/lib/cn'

const ITEMS: { href: string; key: 'weather' | 'radar' | 'aqi' | 'wind' }[] = [
  { href: '/weather', key: 'weather' },
  { href: '/radar', key: 'radar' },
  { href: '/aqi', key: 'aqi' },
  { href: '/wind', key: 'wind' },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const t = useT()
  const path = pathname?.replace(/\/+$/, '') ?? ''

  if (path === '/widget/embed') return null

  const label = {
    weather: t.bottomNav.weather,
    radar: t.bottomNav.radar,
    aqi: t.bottomNav.aqi,
    wind: t.bottomNav.wind,
  } as const

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-[color:var(--background)]/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden dark:border-white/10"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1 px-2">
        {ITEMS.map(({ href, key }) => {
          const active = pathname === href || (href !== '/' && pathname?.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-h-[48px] min-w-[44px] flex-1 flex-col items-center justify-center rounded-xl px-1 text-[11px] font-semibold transition-colors',
                active
                  ? 'text-sky-600 dark:text-sky-300'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100',
              )}
            >
              <span className="text-lg leading-none" aria-hidden>
                {key === 'weather' ? '🌤️' : key === 'radar' ? '🌧️' : key === 'aqi' ? '💨' : '🗺️'}
              </span>
              <span className="mt-0.5 truncate">{label[key]}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
