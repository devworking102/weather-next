'use client'

import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import type { WeatherBundle } from '@/features/weather/types'
import { wmoInfo } from '@/features/weather/utils/wmo'
import { dayLabel } from '@/features/weather/utils/format'
import { useUiStore } from '@/shared/store/ui-store'
import { useT } from '@/shared/hooks/useT'

interface Props {
  weather: WeatherBundle
  days?: number
  onViewAll?: () => void
}

export function DailyPreviewRow({ weather, days = 7, onViewAll }: Props) {
  const unit = useUiStore((s) => s.unit)
  const t = useT()
  const sym = unit === 'f' ? '°' : '°'

  const sliced = useMemo(() => weather.daily.slice(0, days), [weather.daily, days])

  const bounds = useMemo(() => {
    if (!sliced.length) return { min: 0, max: 40 }
    return {
      min: Math.min(...sliced.map((d) => d.tempMin)),
      max: Math.max(...sliced.map((d) => d.tempMax)),
    }
  }, [sliced])

  const range = Math.max(1, bounds.max - bounds.min)

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 dark:border-white/5">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {t.dailyPreview.title(days)}
        </h3>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="flex items-center gap-0.5 text-xs font-medium text-sky-600 transition-colors hover:text-sky-800 hover:underline dark:text-sky-400 dark:hover:text-sky-200"
          >
            {t.dailyPreview.viewAll}
            <ChevronRight size={13} aria-hidden />
          </button>
        )}
      </div>

      <div className="divide-y divide-black/5 dark:divide-white/5">
        {sliced.map((d, i) => {
          const info = wmoInfo(d.weatherCode)
          const left = Math.max(0, ((d.tempMin - bounds.min) / range) * 100)
          const width = Math.max(10, ((d.tempMax - d.tempMin) / range) * 100)

          return (
            <div
              key={d.date}
              className={`flex items-center gap-2 px-4 py-2.5 ${
                i === 0 ? 'bg-sky-50/50 dark:bg-sky-500/5' : ''
              }`}
            >
              {/* Day name */}
              <span className="w-12 shrink-0 truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                {dayLabel(d.date, i)}
              </span>

              {/* Weather icon */}
              <span className="w-6 shrink-0 text-center text-lg leading-none" aria-hidden>
                {info.icon}
              </span>

              {/* Rain probability — fixed width keeps bar alignment consistent */}
              {d.precipitationProbability >= 20 ? (
                <span className="w-8 shrink-0 text-right text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                  {Math.round(d.precipitationProbability)}%
                </span>
              ) : (
                <span className="w-8 shrink-0" aria-hidden />
              )}

              {/* Temperature range bar */}
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                <span className="w-7 shrink-0 text-right text-xs font-semibold text-sky-500">
                  {Math.round(d.tempMin)}{sym}
                </span>
                <div className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 to-orange-400"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                </div>
                <span className="w-7 shrink-0 text-xs font-semibold text-orange-500">
                  {Math.round(d.tempMax)}{sym}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
