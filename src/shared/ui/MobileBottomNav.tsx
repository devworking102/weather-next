'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Cloud, CloudRain, MessageSquare, Wind } from 'lucide-react'
import { useT } from '@/shared/hooks/useT'
import { cn } from '@/shared/lib/cn'
import { useUiStore } from '@/shared/store/ui-store'

const ITEMS = [
  { href: '/thoi-tiet', key: 'weather', Icon: Cloud },
  { href: '/radar', key: 'radar', Icon: CloudRain },
  { href: '/aqi', key: 'aqi', Icon: Wind },
  { href: '/alerts', key: 'alerts', Icon: Bell },
] as const

export function MobileBottomNav() {
  const pathname = usePathname()
  const t = useT()
  const path = pathname?.replace(/\/+$/, '') ?? ''
  const chatOpen = useUiStore((s) => s.chatOpen)
  const toggleChat = useUiStore((s) => s.toggleChat)

  if (path === '/tien-ich/embed') return null

  const label: Record<string, string> = {
    weather: t.bottomNav.weather,
    radar: t.bottomNav.radar,
    aqi: t.bottomNav.aqi,
    alerts: 'Cảnh báo',
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:hidden pointer-events-none">
      <nav
        className="mx-auto flex max-w-md items-stretch justify-around gap-1 rounded-[2rem] border border-white/20 bg-white/60 p-2 shadow-2xl backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-[#1C1C1E]/70 pointer-events-auto"
        aria-label="Mobile navigation"
      >
        {ITEMS.map(({ href, key, Icon }) => {
          const active = pathname === href || !!pathname?.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group relative flex min-h-[56px] min-w-[48px] flex-1 flex-col items-center justify-center gap-1.5 rounded-3xl px-1 text-[10px] font-medium transition-all duration-300',
                active
                  ? 'text-sky-600 dark:text-sky-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
              )}
            >
              {active && (
                <span className="absolute inset-0 rounded-3xl bg-sky-100/50 dark:bg-sky-500/10 transition-opacity" aria-hidden="true" />
              )}
              <Icon
                size={24}
                strokeWidth={active ? 2.5 : 2}
                className={cn('relative z-10 transition-transform duration-300', active && 'scale-110')}
                aria-hidden
              />
              <span className="relative z-10 truncate tracking-wide">{label[key]}</span>
            </Link>
          )
        })}
        <button
          type="button"
          onClick={toggleChat}
          aria-pressed={chatOpen}
          aria-label="Mở chat thời tiết"
          className={cn(
            'group relative flex min-h-[56px] min-w-[48px] flex-1 flex-col items-center justify-center gap-1.5 rounded-3xl px-1 text-[10px] font-medium transition-all duration-300',
            chatOpen
              ? 'text-indigo-600 dark:text-indigo-300'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
          )}
        >
          {chatOpen ? (
            <span className="absolute inset-0 rounded-3xl bg-indigo-100/60 transition-opacity dark:bg-indigo-500/10" aria-hidden="true" />
          ) : null}
          <MessageSquare
            size={24}
            strokeWidth={chatOpen ? 2.5 : 2}
            className={cn('relative z-10 transition-transform duration-300', chatOpen && 'scale-110')}
            aria-hidden
          />
          <span className="relative z-10 truncate tracking-wide">Chat</span>
        </button>
      </nav>
    </div>
  )
}
