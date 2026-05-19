'use client'

import { Cloud, Droplets, Eye, Gauge, Sun, Wind } from 'lucide-react'
import type { WeatherBundle } from '@/features/weather/types'
import { formatWind, windDirection } from '@/features/weather/utils/format'
import type { CompanionInsight } from '@/ai/weather-companion'
import { useT } from '@/shared/hooks/useT'

interface Props {
  weather: WeatherBundle
  insight: CompanionInsight
}

export function HumanWeatherDetails({ weather, insight }: Props) {
  const t = useT()
  const c = weather.current
  const details = [
    {
      icon: Droplets,
      label: t.humanDetails.humidity,
      value: c.humidity >= 82 ? t.humanDetails.humidityWet : c.humidity >= 65 ? t.humanDetails.humiditySome : t.humanDetails.comfortable,
      hint: insight.comfort,
    },
    {
      icon: Sun,
      label: t.humanDetails.sun,
      value: c.uvIndex >= 8 ? t.humanDetails.sunVeryStrong : c.uvIndex >= 6 ? t.humanDetails.sunHigh : t.humanDetails.okay,
      hint: insight.uv,
    },
    {
      icon: Wind,
      label: t.humanDetails.wind,
      value: c.windSpeed >= 28 ? t.humanDetails.windStrong : c.windSpeed >= 16 ? t.humanDetails.windSome : t.humanDetails.windLight,
      hint: t.humanDetails.windHint(formatWind(c.windSpeed), windDirection(c.windDirection).toLowerCase()),
    },
    {
      icon: Cloud,
      label: t.humanDetails.clouds,
      value: c.cloudCover >= 75 ? t.humanDetails.cloudy : c.cloudCover >= 35 ? t.humanDetails.partlyCloudy : t.humanDetails.clearSky,
      hint: c.cloudCover >= 75 ? t.humanDetails.cloudHintHeavy : t.humanDetails.cloudHintLight,
    },
    {
      icon: Eye,
      label: t.humanDetails.visibility,
      value: c.visibility < 5000 ? t.humanDetails.limited : t.humanDetails.good,
      hint: c.visibility < 5000 ? t.humanDetails.visibilityLimitedHint : t.humanDetails.visibilityGoodHint,
    },
    {
      icon: Gauge,
      label: t.humanDetails.pressure,
      value: t.humanDetails.stable,
      hint: t.humanDetails.pressureHint(Math.round(c.pressure)),
    },
  ]

  return (
    <section className="space-y-3" aria-label="Chi tiết thời tiết dễ hiểu">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
          {t.humanDetails.title}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t.humanDetails.subtitle}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {details.map(({ icon: Icon, label, value, hint }) => (
          <article
            key={label}
            className="rounded-3xl border border-black/5 bg-white/75 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <Icon size={16} aria-hidden />
              {label}
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {value}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{hint}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
