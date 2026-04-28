'use client'

import { cn } from '@/shared/lib/cn'
import type { WeatherTabId } from '@/shared/store/ui-store'

export type { WeatherTabId }

export const WEATHER_TABS: Array<{ id: WeatherTabId; label: string }> = [
  { id: 'today', label: '🌡 Hôm nay' },
  { id: 'hourly', label: '⏱ Theo giờ' },
  { id: 'week', label: '📅 7 Ngày' },
  { id: 'daily', label: '📅 16 Ngày' },
  { id: 'month', label: '🗓️ 30 Ngày' },
]

interface Props {
  value: WeatherTabId
  onChange: (v: WeatherTabId) => void
  alertCount?: number
}

export function TabsNav({ value, onChange, alertCount }: Props) {
  return (
    <nav className="scrollbar-thin -mx-4 overflow-x-auto px-4">
      <div className="flex gap-1.5 whitespace-nowrap pb-1">
        {WEATHER_TABS.map((t) => {
          const active = value === t.id
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={cn(
                'relative rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                  : 'border-black/10 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-white/5',
              )}
              type="button"
            >
              {t.label}
              {t.id === 'alerts' && alertCount ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {alertCount}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
