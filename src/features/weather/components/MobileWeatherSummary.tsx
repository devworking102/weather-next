'use client'

import { Search, Sparkles } from 'lucide-react'
import type { CompanionInsight } from '@/ai/weather-companion'
import { cn } from '@/shared/lib/cn'

interface Props {
  city: string
  temperature: string
  insight: CompanionInsight
  onSearchClick: () => void
}

export function MobileWeatherSummary({ city, temperature, insight, onSearchClick }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-[6.75rem] z-40 px-4 md:hidden pointer-events-none">
      <div
        className={cn(
          'mx-auto flex max-w-md items-center gap-3 rounded-[1.75rem] border border-white/50 bg-white/75 p-3 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70',
          insight.alertLevel === 'warning' && 'ring-2 ring-amber-300/70',
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="shrink-0 text-sky-500" aria-hidden />
            <p className="truncate text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              {city}
            </p>
          </div>
          <p className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-slate-900 dark:text-white">
            {temperature} · {insight.recommendation}
          </p>
        </div>
        <button
          type="button"
          onClick={onSearchClick}
          aria-label="Tìm địa điểm"
          className="pointer-events-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg transition active:scale-95 dark:bg-white dark:text-slate-950"
        >
          <Search size={20} aria-hidden />
        </button>
      </div>
    </div>
  )
}
