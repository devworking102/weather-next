'use client'

import { useState } from 'react'
import { Droplets, Wind, Gauge, Eye, Sun, Cloud, ThermometerSun, Compass } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import type { WeatherBundle } from '@/features/weather/types'
import { formatWind, uvCategory, windDirection } from '@/features/weather/utils/format'
import { useT } from '@/shared/hooks/useT'

interface Props {
  weather: WeatherBundle
  /** Show only the 4 most actionable stats, with a toggle for the rest */
  compact?: boolean
}

export function StatsGrid({ weather, compact = false }: Props) {
  const [expanded, setExpanded] = useState(false)
  const c = weather.current
  const t = useT()
  const uv = uvCategory(c.uvIndex)

  const items = [
    // Primary — most actionable for daily decisions
    { icon: Droplets,       label: t.stats.humidity,  value: `${Math.round(c.humidity)}%`,                  hint: t.stats.relative },
    { icon: Wind,           label: t.stats.wind,      value: formatWind(c.windSpeed),                       hint: windDirection(c.windDirection) },
    { icon: ThermometerSun, label: t.stats.feelsLike, value: `${Math.round(c.apparentTemperature)}°` },
    { icon: Sun,            label: t.stats.uv,        value: `${Math.round(c.uvIndex)}`,                   hint: uv.label, hintColor: uv.color },
    // Secondary — shown when expanded
    { icon: Gauge,   label: t.stats.pressure,   value: `${Math.round(c.pressure)} hPa` },
    { icon: Eye,     label: t.stats.visibility, value: `${(c.visibility / 1000).toFixed(1)} km` },
    { icon: Cloud,   label: t.stats.cloud,      value: `${Math.round(c.cloudCover)}%` },
    { icon: Compass, label: t.stats.dewPoint,   value: `${Math.round(c.dewPoint)}°` },
  ]

  const visibleItems = compact && !expanded ? items.slice(0, 4) : items

  return (
    <section className="space-y-2">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {visibleItems.map(({ icon: Icon, label, value, hint, hintColor }) => (
          <Card key={label} className="flex flex-col gap-1.5 p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Icon size={14} aria-hidden />
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
      </div>

      {compact && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        >
          {expanded ? (
            <>
              <span>▴</span>
              {t.statsGrid.showLess}
            </>
          ) : (
            <>
              <span>▾</span>
              {t.statsGrid.showMore}
            </>
          )}
        </button>
      )}
    </section>
  )
}
