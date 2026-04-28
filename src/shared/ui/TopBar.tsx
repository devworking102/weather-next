'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SettingsMenu } from './SettingsMenu'
import { InstallButton } from '@/features/pwa/components/InstallButton'
import { cn } from '@/shared/lib/cn'

const nav = [
  { href: '/weather', label: ' 🌤️ Thời tiết'},
  { href: '/news', label: ' 📰 Tin tức' },
  { href: '/earthquakes', label: ' 🌍 Địa chấn' },
  { href: '/calendar', label: ' 🕒 Lịch âm' },
  { href: '/aqi', label: '💨 Không khí' },
  { href: '/health', label: '❤️ Sức khỏe' },
  { href: '/wind', label: '🗺️ Bản đồ gió' },
  { href: '/alerts', label: '⚠️ Cảnh báo' },
  { href: '/widget', label: '🔗 Nhúng' },
]

export function TopBar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[color:var(--background)]/85 backdrop-blur dark:border-white/5">
      <div className="mx-auto flex container items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="inline-flex items-center gap-2 font-bold tracking-tight">
          <span className="text-xl" aria-hidden>
            🌤️
          </span>
          <span className="hidden sm:inline">Weather</span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto whitespace-nowrap">
          {nav.map(({ href, label }) => {
            const active = pathname?.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
                  active
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5',
                )}
              >
                <span className="hidden sm:inline">{label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="flex items-center gap-2">
          <InstallButton />
          <SettingsMenu />
        </div>
      </div>
    </header>
  )
}
