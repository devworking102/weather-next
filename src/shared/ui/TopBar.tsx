'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SettingsMenu } from './SettingsMenu'
import { InstallButton } from '@/features/pwa/components/InstallButton'
import { useT } from '@/shared/hooks/useT'
import { cn } from '@/shared/lib/cn'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { ChevronDown, Menu, Star, X } from 'lucide-react'

export function TopBar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const t = useT()
  const pinned = useLocationStore((s) => s.pinned)
  const currentLoc = useLocationStore((s) => s.current)
  const setCurrent = useLocationStore((s) => s.setCurrent)

  const primaryNavItems = [
    { href: '/thoi-tiet', label: 'Thời tiết' },
    { href: '/radar', label: 'Radar' },
    { href: '/aqi', label: 'AQI' },
    { href: '/alerts', label: 'Cảnh báo' },
  ]
  const moreNavItems = [
    { href: '/news', label: 'Tin tức' },
    { href: '/earthquakes', label: 'Địa chấn' },
    { href: '/calendar', label: 'Lịch âm' },
    { href: '/wind', label: 'Gió' },
    { href: '/widget', label: 'Nhúng' },
  ]

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/40 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-[#1C1C1E]/70 transition-colors duration-300">
        <div className="mx-auto flex container items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link href="/" className="inline-flex items-center gap-2 font-bold tracking-tight shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" width={28} height={28} className="rounded-lg" aria-hidden />
            <span className="bg-gradient-to-r from-[#4F8CFF] to-[#56E0FF] bg-clip-text text-transparent">
              Trời Hôm Nay
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto whitespace-nowrap">
            {primaryNavItems.map(({ href, label }) => {
              const active = pathname?.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-300',
                    active
                      ? 'bg-black/5 text-sky-600 dark:bg-white/10 dark:text-sky-400'
                      : 'text-slate-500 hover:bg-black/5 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200',
                  )}
                >
                  {label}
                </Link>
              )
            })}
            <div className="group relative">
              <button
                type="button"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 transition-all duration-300 hover:bg-black/5 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
                aria-haspopup="menu"
              >
                Thêm
                <ChevronDown size={15} aria-hidden />
              </button>
              <div className="invisible absolute right-0 top-full z-50 min-w-44 translate-y-2 rounded-2xl border border-black/5 bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-1 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-1 group-focus-within:opacity-100 dark:border-white/10 dark:bg-slate-950">
                {moreNavItems.map(({ href, label }) => {
                  const active = pathname?.startsWith(href)
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'block rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5',
                      )}
                    >
                      {label}
                    </Link>
                  )
                })}
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <InstallButton />
            <SettingsMenu />
            <button
              type="button"
              aria-label={t.nav.openMenu}
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="lg:hidden inline-flex items-center justify-center rounded-xl p-2 text-slate-600 transition-colors hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/5"
            >
              <Menu size={21} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer backdrop */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={cn(
          'fixed inset-0 z-50 bg-black/20 backdrop-blur-md transition-opacity duration-300 lg:hidden dark:bg-black/50',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Mobile drawer */}
      <aside
        aria-label="Navigation menu"
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-72 bg-white/80 backdrop-blur-2xl backdrop-saturate-200 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden dark:bg-[#1C1C1E]/90 dark:border-r dark:border-white/10',
          'flex flex-col',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4 dark:border-white/5">
          <Link href="/" className="inline-flex items-center gap-2 font-bold tracking-tight" onClick={() => setOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" width={26} height={26} className="rounded-lg" aria-hidden />
            <span className="bg-gradient-to-r from-[#4F8CFF] to-[#56E0FF] bg-clip-text text-transparent whitespace-nowrap">
              Trời Hôm Nay
            </span>
          </Link>
          <button
            type="button"
            aria-label={t.nav.closeMenu}
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
          >
            <X size={19} aria-hidden />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {/* Personalization: Favorite Locations */}
          {Array.isArray(pinned) && pinned.length > 0 && (
            <div className="mb-4 px-2">
              <div className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                {t.favorites.title}
              </div>
              <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 px-2">
                {pinned.map((loc) => {
                  const isActive = currentLoc?.id === loc.id
                  return (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setCurrent(loc)
                        setOpen(false)
                      }}
                      className={cn(
                        'snap-center shrink-0 flex w-[120px] flex-col items-start gap-1.5 rounded-2xl p-3 text-sm font-medium transition-colors border text-left',
                        isActive
                          ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/20 dark:text-sky-300 shadow-sm'
                          : 'border-black/5 bg-white/50 text-slate-600 hover:bg-white dark:border-white/10 dark:bg-black/20 dark:text-slate-300 dark:hover:bg-white/5',
                      )}
                    >
                      <div className="flex w-full items-center justify-between">
                        <Star size={14} className={isActive ? 'fill-current text-sky-500' : 'text-slate-400'} />
                        {isActive && <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />}
                      </div>
                      <span className="w-full truncate">{loc.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mb-2 px-5 text-xs font-bold uppercase tracking-wider text-slate-400">
            Menu
          </div>
          {primaryNavItems.map(({ href, label }) => {
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
          <div className="mb-2 mt-4 px-5 text-xs font-bold uppercase tracking-wider text-slate-400">
            Thêm
          </div>
          {moreNavItems.map(({ href, label }) => {
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
