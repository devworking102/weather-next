'use client'

import { useMemo } from 'react'
import { CalendarDays, ChevronRight } from 'lucide-react'
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

function dayAdvice(max: number, rain: number, uv: number, t: ReturnType<typeof useT>['dailyPlanning']) {
  if (rain >= 60) return t.umbrella
  if (max >= 35) return t.avoidNoon
  if (uv >= 8) return t.sunCare
  if (max <= 22) return t.lightJacket
  return t.goodOutside
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
      <div className="flex items-center justify-between px-5 pb-2 pt-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <CalendarDays size={16} aria-hidden />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              {t.dailyPreview.title(days)}
            </h3>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {t.dailyPlanning.subtitle}
          </p>
        </div>
        {onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="flex min-h-10 items-center gap-0.5 rounded-full px-2 text-xs font-semibold text-sky-600 transition-colors hover:bg-sky-50 hover:text-sky-800 dark:text-sky-400 dark:hover:bg-sky-400/10"
          >
            {t.dailyPreview.viewAll}
            <ChevronRight size={13} aria-hidden />
          </button>
        ) : null}
      </div>

      <div className="divide-y divide-black/5 dark:divide-white/5">
        {sliced.map((d, i) => {
          const info = wmoInfo(d.weatherCode)
          const left = Math.max(0, ((d.tempMin - bounds.min) / range) * 100)
          const width = Math.max(10, ((d.tempMax - d.tempMin) / range) * 100)
          const advice = dayAdvice(d.tempMax, d.precipitationProbability, d.uvIndexMax, t.dailyPlanning)

          return (
            <div
              key={d.date}
              className={`grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 px-5 py-3.5 transition-colors sm:grid-cols-[5rem_auto_7rem_1fr] ${
                i === 0 ? 'bg-sky-50/40 dark:bg-sky-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-white/[0.02]'
              }`}
            >
              <span className="text-2xl leading-none sm:order-2" aria-hidden>
                {info.icon}
              </span>

              <div className="min-w-0 sm:order-1">
                <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {dayLabel(d.date, i)}
                </span>
                <span className="mt-0.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  {advice}
                </span>
              </div>

              {d.precipitationProbability >= 20 ? (
                <span className="col-span-2 w-fit rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-400/10 dark:text-sky-300 sm:order-3 sm:col-span-1">
                  {t.dailyPlanning.rainChance(Math.round(d.precipitationProbability))}
                </span>
              ) : (
                <span className="col-span-2 w-fit rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300 sm:order-3 sm:col-span-1">
                  {t.dailyPlanning.littleRain}
                </span>
              )}

              <div className="col-span-2 flex min-w-0 items-center gap-1.5 sm:order-4 sm:col-span-1">
                <span className="w-7 shrink-0 text-right text-xs font-semibold text-sky-500">
                  {Math.round(d.tempMin)}
                  {sym}
                </span>
                <div className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 to-orange-400"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                </div>
                <span className="w-7 shrink-0 text-xs font-semibold text-orange-500">
                  {Math.round(d.tempMax)}
                  {sym}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
