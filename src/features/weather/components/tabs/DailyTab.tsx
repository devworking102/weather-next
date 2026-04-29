'use client'

import { useMemo } from 'react'
import { Card } from '@/shared/ui/Card'
import type { WeatherBundle } from '@/features/weather/types'
import { wmoInfo } from '@/features/weather/utils/wmo'
import { dayLabel, formatDate, formatTime, uvCategory } from '@/features/weather/utils/format'
import { useUiStore, windLabel, convertWind } from '@/shared/store/ui-store'
import { useT } from '@/shared/hooks/useT'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface Props {
  weather: WeatherBundle
  days: number
}

export function DailyTab({ weather, days }: Props) {
  const unit = useUiStore((s) => s.unit)
  const wUnit = useUiStore((s) => s.windUnit)
  const t = useT()
  const sym = unit === 'f' ? '°F' : '°C'

  const sliced = useMemo(() => weather.daily.slice(0, days), [weather.daily, days])
  const bounds = useMemo(() => {
    if (!sliced.length) return { min: 0, max: 0 }
    return {
      min: Math.min(...sliced.map((d) => d.tempMin)),
      max: Math.max(...sliced.map((d) => d.tempMax)),
    }
  }, [sliced])

  const chartData = sliced.map((d, i) => ({
    label: `${dayLabel(d.date, i)} ${formatDate(d.date)}`,
    max: Math.round(d.tempMax),
    min: Math.round(d.tempMin),
  }))

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t.chart.tempChartTitle(days)}
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={10}
                stroke="currentColor"
                strokeOpacity={0.5}
                angle={-25}
                textAnchor="end"
                interval={0}
                height={50}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={11}
                stroke="currentColor"
                strokeOpacity={0.5}
                width={30}
                tickFormatter={(v) => `${v}°`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid rgba(0,0,0,0.08)',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="max" fill="#f97316" radius={[6, 6, 0, 0]} name={t.chart.highestLabel(sym)} />
              <Bar dataKey="min" fill="#38bdf8" radius={[6, 6, 0, 0]} name={t.chart.lowestLabel(sym)} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-0">
        <div className="flex items-center gap-2 border-b border-black/5 px-5 py-3 dark:border-white/5">
          <span className="text-lg">📅</span>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t.chart.dailyDetailTitle(days)}
          </h3>
        </div>
        <div className="scrollbar-thin overflow-x-auto">
          <div className="min-w-[820px] divide-y divide-black/5 dark:divide-white/5">
            {sliced.map((d, i) => {
              const info = wmoInfo(d.weatherCode)
              const uv = uvCategory(d.uvIndexMax)
              const range = Math.max(1, bounds.max - bounds.min)
              const left = ((d.tempMin - bounds.min) / range) * 100
              const width = ((d.tempMax - d.tempMin) / range) * 100
              return (
                <div
                  key={d.date}
                  className={`grid items-center gap-4 px-5 py-4 ${i === 0 ? 'bg-sky-50/40 dark:bg-sky-500/5' : ''}`}
                  style={{ gridTemplateColumns: '110px 110px 1fr 200px 120px' }}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {dayLabel(d.date, i)}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(d.date)}</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-3xl drop-shadow-sm" aria-hidden>
                      {info.icon}
                    </span>
                    <span className="mt-0.5 w-full truncate text-[10px] font-semibold text-slate-500">
                      {info.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 px-4">
                    <span className="min-w-[44px] text-right text-sm font-bold text-orange-500">
                      {Math.round(d.tempMax)}
                      {sym}
                    </span>
                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-500"
                        style={{ left: `${left}%`, width: `${Math.max(8, width)}%` }}
                      />
                    </div>
                    <span className="min-w-[44px] text-sm font-bold text-sky-500">
                      {Math.round(d.tempMin)}
                      {sym}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>🌧 {d.precipitationSum}mm</span>
                      <span>💧 {Math.round(d.precipitationProbability)}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>
                        💨 {Math.round(convertWind(d.windSpeedMax, wUnit))}
                        <small className="text-[10px] text-slate-400">{windLabel(wUnit)}</small>
                      </span>
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                        style={{ color: uv.color, backgroundColor: uv.color + '20' }}
                      >
                        UV {d.uvIndexMax}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 border-l border-black/5 pl-4 text-xs text-slate-500 dark:border-white/5">
                    <span>🌅 {formatTime(d.sunrise)}</span>
                    <span>🌇 {formatTime(d.sunset)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    </div>
  )
}
