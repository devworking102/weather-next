'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/shared/lib/cn'
import { useT } from '@/shared/hooks/useT'
import type { WeatherTabId } from '@/shared/store/ui-store'

export type { WeatherTabId }

const TAB_IDS: WeatherTabId[] = ['today', 'hourly', 'week', 'daily', 'month']

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
    label: t.tabs[id as keyof typeof t.tabs],
  }))

  useEffect(() => {
    const btn = btnRefs.current.get(value)
    const nav = navRef.current
    if (!btn || !nav) return
    const { left: btnL, right: btnR } = btn.getBoundingClientRect()
    const { left: navL, right: navR } = nav.getBoundingClientRect()
    if (btnL < navL + 8) nav.scrollBy({ left: btnL - navL - 8, behavior: 'smooth' })
    else if (btnR > navR - 8) nav.scrollBy({ left: btnR - navR + 8, behavior: 'smooth' })
  }, [value])

  return (
    <div className="relative">
      {/* Fade-out hint at right edge */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[color:var(--background)] to-transparent"
        aria-hidden
      />
      <nav
        ref={navRef}
        className="scrollbar-thin -mx-4 overflow-x-auto px-4"
        aria-label="Forecast range"
      >
        <div className="flex gap-1 whitespace-nowrap pb-1">
          {tabs.map((tab) => {
            const active = value === tab.id
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  if (el) btnRefs.current.set(tab.id, el)
                  else btnRefs.current.delete(tab.id)
                }}
                onClick={() => onChange(tab.id)}
                type="button"
                aria-pressed={active}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/8 dark:hover:text-slate-200',
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
