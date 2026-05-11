'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SettingsMenu } from './SettingsMenu'
import { InstallButton } from '@/features/pwa/components/InstallButton'
import { useT } from '@/shared/hooks/useT'
import { cn } from '@/shared/lib/cn'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { Star } from 'lucide-react'

export function TopBar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const t = useT()
  const pinned = useLocationStore((s) => s.pinned)
  const currentLoc = useLocationStore((s) => s.current)
  const setCurrent = useLocationStore((s) => s.setCurrent)

  const navItems = [
    { href: '/weather',     label: t.nav.weather     },
    { href: '/radar',       label: t.nav.radar       },
    { href: '/aqi',         label: t.nav.aqi         },
    { href: '/alerts',      label: t.nav.alerts      },
    { href: '/health',      label: t.nav.health      },
    { href: '/news',        label: t.nav.news        },
    { href: '/earthquakes', label: t.nav.earthquakes },
    { href: '/calendar',    label: t.nav.calendar    },
    { href: '/wind',        label: t.nav.wind        },
    { href: '/widget',      label: t.nav.widget      },
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
            {navItems.map(({ href, label }) => {
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
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <rect y="3" width="20" height="2" rx="1" fill="currentColor" />
                <rect y="9" width="20" height="2" rx="1" fill="currentColor" />
                <rect y="15" width="20" height="2" rx="1" fill="currentColor" />
              </svg>
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
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
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
          {navItems.map(({ href, label }) => {
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
