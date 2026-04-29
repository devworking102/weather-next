'use client'

import { useMemo } from 'react'
import { Card } from '@/shared/ui/Card'
import type { WeatherBundle } from '@/features/weather/types'
import { wmoInfo } from '@/features/weather/utils/wmo'
import { formatTime, uvCategory } from '@/features/weather/utils/format'
import { useUiStore, windLabel, convertWind } from '@/shared/store/ui-store'
import { useT } from '@/shared/hooks/useT'
import { dynamicChart } from '../chart-loader'

const TemperatureChart = dynamicChart('temperature')

interface Props {
  weather: WeatherBundle
  hours?: number
}

export function HourlyTab({ weather, hours = 48 }: Props) {
  const wUnit = useUiStore((s) => s.windUnit)
  const unit = useUiStore((s) => s.unit)
  const t = useT()
  const sym = unit === 'f' ? '°F' : '°C'

  const rows = useMemo(() => {
    const now = new Date().toISOString().slice(0, 13) + ':00'
    const start = Math.max(0, weather.hourly.findIndex((h) => h.time >= now))
    return weather.hourly.slice(start, start + hours)
  }, [weather.hourly, hours])

  return (
    <div className="space-y-4">
      <TemperatureChart hourly={weather.hourly} hours={hours} />
      <Card className="p-0">
        <div className="flex items-center gap-2 border-b border-black/5 px-5 py-3 dark:border-white/5">
          <span className="text-lg">🕐</span>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t.hourlyTab.title}
          </h3>
        </div>
        <div className="scrollbar-thin overflow-x-auto">
          <div className="min-w-[720px] px-4 py-2">
            <div
              className="grid gap-4 border-b border-black/5 px-2 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-white/5"
              style={{ gridTemplateColumns: '1fr 1fr 1.2fr 1.8fr 1.2fr 2fr 1.2fr 1.2fr' }}
            >
              <span>{t.hourlyTab.colTime}</span>
              <span>{t.hourlyTab.colWeather}</span>
              <span>{t.hourlyTab.colTemp}</span>
              <span>{t.hourlyTab.colFeels}</span>
              <span>{t.hourlyTab.colRain}</span>
              <span>{t.hourlyTab.colWind}</span>
              <span>{t.hourlyTab.colHumidity}</span>
              <span>{t.hourlyTab.colUv}</span>
            </div>
            {rows.map((h) => {
              const info = wmoInfo(h.weatherCode)
              const uv = uvCategory(h.uvIndex)
              const highRain = h.precipitationProbability >= 50
              return (
                <div
                  key={h.time}
                  className={`grid items-center gap-4 border-b border-black/5 px-2 py-2.5 text-sm last:border-0 dark:border-white/5 ${
                    highRain ? 'bg-sky-50/60 dark:bg-sky-500/5' : ''
                  }`}
                  style={{ gridTemplateColumns: '1fr 1fr 1.2fr 1.8fr 1.2fr 2fr 1.2fr 1.2fr' }}
                >
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatTime(h.time)}
                  </span>
                  <span className="text-2xl drop-shadow-sm" aria-hidden>
                    {info.icon}
                  </span>
                  <span className="font-bold text-orange-500">
                    {Math.round(h.temperature)}
                    {sym}
                  </span>
                  <span className="text-slate-500">
                    {Math.round(h.apparentTemperature)}
                    {sym}
                  </span>
                  <span
                    className={
                      highRain
                        ? 'font-bold text-sky-600 dark:text-sky-400'
                        : 'text-slate-400'
                    }
                  >
                    {Math.round(h.precipitationProbability)}%
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {Math.round(convertWind(h.windSpeed, wUnit))}
                    <small className="ml-1 text-[10px] text-slate-400">{windLabel(wUnit)}</small>
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {Math.round(h.humidity)}
                    <small className="ml-1 text-[10px] text-slate-400">%</small>
                  </span>
                  <span className="font-bold" style={{ color: uv.color }}>
                    {Math.round(h.uvIndex)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    </div>
  )
}
