'use client'

import { useMemo } from 'react'
import { Card } from '@/shared/ui/Card'
import type { HourlyPoint } from '@/features/weather/types'
import { wmoInfo } from '@/features/weather/utils/wmo'
import { formatTime } from '@/features/weather/utils/format'

interface Props {
  hourly: HourlyPoint[]
  hoursAhead?: number
}

export function HourlyStrip({ hourly, hoursAhead = 24 }: Props) {
  const rows = useMemo(() => {
    const now = new Date().toISOString().slice(0, 13) + ':00'
    const startIdx = Math.max(0, hourly.findIndex((h) => h.time >= now))
    return hourly.slice(startIdx, startIdx + hoursAhead)
  }, [hourly, hoursAhead])

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between border-b border-black/5 px-5 py-3 dark:border-white/5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Dự báo theo giờ
        </h3>
        <span className="text-xs text-slate-400">{rows.length} giờ</span>
      </div>
      <div className="scrollbar-thin overflow-x-auto">
        <div className="flex gap-1 px-3 py-4">
          {rows.map((h, i) => {
            const info = wmoInfo(h.weatherCode)
            const isNow = i === 0
            return (
              <div
                key={h.time}
                className={`flex min-w-[72px] flex-col items-center gap-2 rounded-xl px-2 py-3 text-center transition-colors ${
                  isNow
                    ? 'bg-sky-50 text-slate-900 dark:bg-sky-500/10 dark:text-white'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="text-xs font-medium">{isNow ? 'Giờ' : formatTime(h.time)}</span>
                <span className="text-2xl leading-none" aria-hidden>
                  {info.icon}
                </span>
                <span className="text-sm font-semibold">{Math.round(h.temperature)}°</span>
                {h.precipitationProbability >= 20 ? (
                  <span className="text-[11px] font-medium text-sky-600 dark:text-sky-400">
                    {Math.round(h.precipitationProbability)}%
                  </span>
                ) : (
                  <span className="text-[11px] text-transparent">—</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
