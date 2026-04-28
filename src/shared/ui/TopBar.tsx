'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SettingsMenu } from './SettingsMenu'
import { InstallButton } from '@/features/pwa/components/InstallButton'
import { cn } from '@/shared/lib/cn'

const nav = [
  { href: '/weather', label: '🌤️ Thời tiết' },
  { href: '/news', label: '📰 Tin tức' },
  { href: '/earthquakes', label: '🌍 Địa chấn' },
  { href: '/calendar', label: '🕒 Lịch âm' },
  { href: '/aqi', label: '💨 Không khí' },
  { href: '/health', label: '❤️ Sức khỏe' },
  { href: '/wind', label: '🗺️ Bản đồ gió' },
  { href: '/alerts', label: '⚠️ Cảnh báo' },
  { href: '/widget', label: '🔗 Nhúng' },
]

export function TopBar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/5 bg-[color:var(--background)]/85 backdrop-blur dark:border-white/5">
        <div className="mx-auto flex container items-center justify-between gap-4 px-4 py-3 md:px-6">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 font-bold tracking-tight">
            <span className="text-xl" aria-hidden>🌤️</span>
            <span>Weather</span>
          </Link>

          {/* Desktop nav — hidden on mobile/tablet */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto whitespace-nowrap">
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
                  {label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <InstallButton />
            <SettingsMenu />

            {/* Hamburger button — visible on mobile/tablet only */}
            <button
              type="button"
              aria-label="Mở menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <rect y="3" width="20" height="2" rx="1" fill="currentColor" />
                <rect y="9" width="20" height="2" rx="1" fill="currentColor" />
                <rect y="15" width="20" height="2" rx="1" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile/tablet side drawer */}
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={cn(
          'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Drawer panel */}
      <aside
        aria-label="Navigation menu"
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-72 bg-[color:var(--background)] shadow-2xl transition-transform duration-300 ease-in-out lg:hidden',
          'flex flex-col',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4 dark:border-white/5">
          <Link href="/" className="inline-flex items-center gap-2 font-bold tracking-tight" onClick={() => setOpen(false)}>
            <span className="text-xl" aria-hidden>🌤️</span>
            <span>Weather</span>
          </Link>
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-3">
          {nav.map(({ href, label }) => {
            const active = pathname?.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors',
                  active
                    ? 'bg-slate-100 text-slate-900 dark:bg-white/8 dark:text-white'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5',
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
