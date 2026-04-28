'use client'

import { Card } from '@/shared/ui/Card'
import type { DailyPoint } from '@/features/weather/types'
import { wmoInfo } from '@/features/weather/utils/wmo'
import { dayLabel, formatDate } from '@/features/weather/utils/format'

interface Props {
  daily: DailyPoint[]
  days?: number
}

export function DailyList({ daily, days = 7 }: Props) {
  const rows = daily.slice(0, days)
  const allMin = Math.min(...rows.map((d) => d.tempMin))
  const allMax = Math.max(...rows.map((d) => d.tempMax))
  const range = Math.max(1, allMax - allMin)

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between border-b border-black/5 px-5 py-3 dark:border-white/5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Dự báo {days} ngày
        </h3>
      </div>
      <ul className="divide-y divide-black/5 dark:divide-white/5">
        {rows.map((d, i) => {
          const info = wmoInfo(d.weatherCode)
          const leftPct = ((d.tempMin - allMin) / range) * 100
          const widthPct = ((d.tempMax - d.tempMin) / range) * 100
          return (
            <li key={d.date} className="flex items-center gap-4 px-5 py-3">
              <div className="w-20 text-sm font-medium text-slate-900 dark:text-white">
                {dayLabel(d.date, i)}
                <div className="text-xs text-slate-400">{formatDate(d.date)}</div>
              </div>
              <div className="flex w-10 items-center justify-center text-2xl" aria-hidden>
                {info.icon}
              </div>
              {d.precipitationProbability >= 20 ? (
                <span className="min-w-[40px] text-xs font-medium text-sky-600 dark:text-sky-400">
                  {Math.round(d.precipitationProbability)}%
                </span>
              ) : (
                <span className="min-w-[40px]" />
              )}
              <div className="flex flex-1 items-center gap-3">
                <span className="w-10 text-right text-sm text-slate-500 dark:text-slate-400">
                  {Math.round(d.tempMin)}°
                </span>
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-500"
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  />
                </div>
                <span className="w-10 text-sm font-semibold text-slate-900 dark:text-white">
                  {Math.round(d.tempMax)}°
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
