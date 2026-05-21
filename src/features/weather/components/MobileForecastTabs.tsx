'use client'

import { Bell, CalendarDays, Clock3, HeartPulse, Sparkles, Wind } from 'lucide-react'
import { useT } from '@/shared/hooks/useT'
import { cn } from '@/shared/lib/cn'
import type { WeatherTabId } from '@/shared/store/ui-store'

interface Props {
  value: WeatherTabId
  onChange: (value: WeatherTabId) => void
  alertCount?: number
}

const tabs = [
  { id: 'today', Icon: Sparkles },
  { id: 'hourly', Icon: Clock3 },
  { id: 'week', Icon: CalendarDays },
  { id: 'aqi', Icon: Wind },
  { id: 'health', Icon: HeartPulse },
  { id: 'alerts', Icon: Bell },
] as const satisfies { id: WeatherTabId; Icon: typeof Sparkles }[]

export function MobileForecastTabs({ value, onChange, alertCount = 0 }: Props) {
  const t = useT()

  return (
    <div className="md:hidden">
      <div className="-mx-4 overflow-x-auto px-4 scrollbar-none" aria-label="Forecast range">
        <div className="flex min-w-max gap-1 rounded-[20px] bg-slate-100 p-1 dark:bg-white/10">
          {tabs.map((tab) => {
            const active = value === tab.id
            const Icon = tab.Icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                aria-pressed={active}
                className={cn(
                  'inline-flex min-h-10 items-center gap-1.5 rounded-[16px] px-3 text-sm font-semibold transition',
                  active
                    ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white'
                    : 'text-slate-500 dark:text-slate-300',
                )}
              >
                <Icon size={15} aria-hidden />
                {t.tabs[tab.id as keyof typeof t.tabs]}
                {tab.id === 'alerts' && alertCount > 0 ? (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] leading-none text-white">
                    {alertCount}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
