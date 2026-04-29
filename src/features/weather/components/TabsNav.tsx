'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/shared/lib/cn'
import { useT } from '@/shared/hooks/useT'
import type { WeatherTabId } from '@/shared/store/ui-store'

export type { WeatherTabId }

const TAB_IDS: WeatherTabId[] = ['today', 'hourly', 'week', 'daily', 'month']
const TAB_ICONS: Record<string, string> = {
  today: '🌡', hourly: '⏱', week: '📅', daily: '📅', month: '🗓️',
}

interface Props {
  value: WeatherTabId
  onChange: (v: WeatherTabId) => void
  alertCount?: number
}

export function TabsNav({ value, onChange }: Props) {
  const navRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<Map<WeatherTabId, HTMLButtonElement>>(new Map())
  const t = useT()

  const tabs = TAB_IDS.map((id) => ({
    id,
    icon: TAB_ICONS[id],
    label: t.tabs[id as keyof typeof t.tabs],
  }))

  useEffect(() => {
    const btn = btnRefs.current.get(value)
    const nav = navRef.current
    if (!btn || !nav) return
    const { left: btnL, right: btnR } = btn.getBoundingClientRect()
    const { left: navL, right: navR } = nav.getBoundingClientRect()
    if (btnL < navL + 8) {
      nav.scrollBy({ left: btnL - navL - 8, behavior: 'smooth' })
    } else if (btnR > navR - 8) {
      nav.scrollBy({ left: btnR - navR + 8, behavior: 'smooth' })
    }
  }, [value])

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[color:var(--background)] to-transparent z-10"
        aria-hidden
      />
      <nav
        ref={navRef}
        className="scrollbar-thin -mx-4 overflow-x-auto px-4"
        aria-label="Tab navigation"
      >
        <div className="flex gap-1.5 whitespace-nowrap pb-1">
          {tabs.map((tab) => {
            const active = value === tab.id
            return (
              <button
                key={tab.id}
                ref={(el) => { if (el) btnRefs.current.set(tab.id, el); else btnRefs.current.delete(tab.id) }}
                onClick={() => onChange(tab.id)}
                className={cn(
                  'relative flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200',
                  active
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                    : 'border-black/10 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-white/5',
                )}
                type="button"
                aria-pressed={active}
              >
                <span>{tab.icon}</span>
                <span className={cn('md:inline', active ? 'inline' : 'hidden')}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
