'use client'

import { Droplets, Wind, Gauge, Eye, Sun, Cloud, ThermometerSun, Compass } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import type { WeatherBundle } from '@/features/weather/types'
import { formatWind, uvCategory, windDirection } from '@/features/weather/utils/format'

interface Props {
  weather: WeatherBundle
}

interface StatItem {
  icon: typeof Droplets
  label: string
  value: string
  hint?: string
  hintColor?: string
}

export function StatsGrid({ weather }: Props) {
  const c = weather.current
  const uv = uvCategory(c.uvIndex)
  const items: StatItem[] = [
    { icon: Droplets, label: 'Độ ẩm', value: `${Math.round(c.humidity)}%`, hint: 'Tương đối' },
    { icon: Wind, label: 'Gió', value: formatWind(c.windSpeed), hint: windDirection(c.windDirection) },
    { icon: ThermometerSun, label: 'Cảm nhận', value: `${Math.round(c.apparentTemperature)}°` },
    { icon: Gauge, label: 'Áp suất', value: `${Math.round(c.pressure)} hPa` },
    { icon: Sun, label: 'UV', value: `${Math.round(c.uvIndex)}`, hint: uv.label, hintColor: uv.color },
    { icon: Eye, label: 'Tầm nhìn', value: `${(c.visibility / 1000).toFixed(1)} km` },
    { icon: Cloud, label: 'Mây', value: `${Math.round(c.cloudCover)}%` },
    { icon: Compass, label: 'Điểm sương', value: `${Math.round(c.dewPoint)}°` },
  ]

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ icon: Icon, label, value, hint, hintColor }) => (
        <Card key={label} className="flex flex-col gap-1.5 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <Icon size={14} />
            {label}
          </div>
          <div className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {value}
          </div>
          {hint ? (
            <div className="text-xs font-medium" style={{ color: hintColor ?? 'rgb(100 116 139)' }}>
              {hint}
            </div>
          ) : null}
        </Card>
      ))}
    </section>
  )
}
