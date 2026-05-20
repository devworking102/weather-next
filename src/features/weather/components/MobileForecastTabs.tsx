'use client'

import { cn } from '@/shared/lib/cn'
import type { WeatherTabId } from '@/shared/store/ui-store'

interface Props {
  value: WeatherTabId
  onChange: (value: WeatherTabId) => void
}

const tabs = [
  { id: 'today', label: 'Hôm nay' },
  { id: 'hourly', label: 'Theo giờ' },
  { id: 'week', label: '7 ngày' },
] as const satisfies { id: WeatherTabId; label: string }[]

export function MobileForecastTabs({ value, onChange }: Props) {
  return (
    <div className="md:hidden">
      <div className="grid grid-cols-3 rounded-[20px] bg-slate-100 p-1 dark:bg-white/10">
        {tabs.map((tab) => {
          const active = value === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                'min-h-10 rounded-[16px] px-2 text-sm font-semibold transition',
                active
                  ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white'
                  : 'text-slate-500 dark:text-slate-300',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
