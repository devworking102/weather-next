'use client'

import { useMemo } from 'react'
import { Card } from '@/shared/ui/Card'
import type { HourlyPoint } from '@/features/weather/types'
import { wmoInfo } from '@/features/weather/utils/wmo'
import { formatTime } from '@/features/weather/utils/format'
import { useT } from '@/shared/hooks/useT'

interface Props {
  hourly: HourlyPoint[]
  hoursAhead?: number
}

/** Returns a Tailwind bg class for the precipitation bar based on probability */
function precipBarColor(pct: number): string {
  if (pct >= 70) return 'bg-blue-600 dark:bg-blue-400'
  if (pct >= 45) return 'bg-sky-500 dark:bg-sky-400'
  return 'bg-sky-400/80 dark:bg-sky-500/80'
}

/** Subtle temperature-hint color for the temp text */
function tempColor(temp: number): string {
  if (temp >= 35) return 'text-orange-500 dark:text-orange-400'
  if (temp >= 30) return 'text-amber-500 dark:text-amber-400'
  if (temp <= 16) return 'text-sky-500 dark:text-sky-400'
  return ''
}

export function HourlyStrip({ hourly, hoursAhead = 24 }: Props) {
  const t = useT()
  const rows = useMemo(() => {
    const now = new Date().toISOString().slice(0, 13) + ':00'
    const startIdx = Math.max(0, hourly.findIndex((h) => h.time >= now))
    return hourly.slice(startIdx, startIdx + hoursAhead)
  }, [hourly, hoursAhead])

  const maxPrecip = useMemo(
    () => Math.max(1, ...rows.map((h) => h.precipitationProbability)),
    [rows],
  )

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {t.hourlyStrip.title}
        </h3>
        <span className="text-xs text-slate-400">{rows.length}h</span>
      </div>

      <div className="scrollbar-thin overflow-x-auto">
        <div className="flex gap-2 px-3 py-3">
          {rows.map((h, i) => {
            const info = wmoInfo(h.weatherCode)
            const isNow = i === 0
            const pct = Math.round(h.precipitationProbability)
            const hasRain = pct >= 20
            const barWidth = hasRain ? Math.round((pct / maxPrecip) * 100) : 0

            return (
              <div
                key={h.time}
                className={[
                  'relative flex min-w-[68px] flex-col items-center gap-1.5 rounded-2xl px-1.5 py-3 text-center transition-colors',
                  isNow
                    ? 'bg-sky-50 ring-1 ring-sky-200/60 dark:bg-sky-400/10 dark:ring-sky-400/20'
                    : 'hover:bg-slate-50 dark:hover:bg-white/5',
                ].join(' ')}
              >
                {/* Time label */}
                <span className={[
                  'text-[11px] font-semibold leading-none',
                  isNow ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400',
                ].join(' ')}>
                  {isNow ? t.hourlyStrip.now : formatTime(h.time)}
                </span>

                {/* Weather icon */}
                <span className="text-[22px] leading-none" aria-hidden>
                  {info.icon}
                </span>

                {/* Temperature */}
                <span className={[
                  'text-sm font-bold leading-none',
                  tempColor(h.temperature) || (isNow ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'),
                ].join(' ')}>
                  {Math.round(h.temperature)}°
                </span>

                {/* Precipitation probability bar + label */}
                <div className="flex w-full flex-col items-center gap-1" style={{ minHeight: 24 }}>
                  {hasRain ? (
                    <>
                      <span className={[
                        'text-[10px] font-semibold leading-none',
                        pct >= 60 ? 'text-blue-600 dark:text-blue-400' : 'text-sky-600 dark:text-sky-400',
                      ].join(' ')}>
                        {pct}%
                      </span>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/60">
                        <div
                          className={`h-full rounded-full transition-all ${precipBarColor(pct)}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <span className="text-[10px] text-transparent select-none" aria-hidden>—</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
