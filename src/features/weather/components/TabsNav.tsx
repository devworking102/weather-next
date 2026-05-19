'use client'

import { useEffect, useRef } from 'react'
import { Bell, CalendarDays, Clock3, HeartPulse, Sparkles, Wind } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { useT } from '@/shared/hooks/useT'
import type { WeatherTabId } from '@/shared/store/ui-store'

export type { WeatherTabId }

const TAB_IDS = ['today', 'hourly', 'week', 'aqi', 'health', 'alerts'] as const satisfies WeatherTabId[]
const TAB_ICONS = {
  today: Sparkles,
  hourly: Clock3,
  week: CalendarDays,
  aqi: Wind,
  health: HeartPulse,
  alerts: Bell,
} satisfies Partial<Record<WeatherTabId, typeof Sparkles>>

interface Props {
  value: WeatherTabId
  onChange: (v: WeatherTabId) => void
  alertCount?: number
}

export function TabsNav({ value, onChange, alertCount = 0 }: Props) {
  const navRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<Map<WeatherTabId, HTMLButtonElement>>(new Map())
  const t = useT()

  const tabs = TAB_IDS.map((id) => ({
    id,
    label: t.tabs[id as keyof typeof t.tabs],
    Icon: TAB_ICONS[id],
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
        <div className="flex gap-1.5 whitespace-nowrap pb-1">
          {tabs.map((tab) => {
            const active = value === tab.id
            const Icon = tab.Icon
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
                  'relative inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-200',
                  active
                    ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950'
                    : 'bg-white/55 text-slate-500 hover:bg-white hover:text-slate-800 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200',
                )}
              >
                {Icon ? <Icon size={15} aria-hidden /> : null}
                {tab.label}
                {tab.id === 'alerts' && alertCount > 0 ? (
                  <span className="ml-0.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] leading-none text-white">
                    {alertCount}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
