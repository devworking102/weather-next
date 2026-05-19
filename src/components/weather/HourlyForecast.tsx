import type { HourlyPoint } from '@/features/weather/types'
import { describeWeatherCode, formatHour, formatTemperature } from './utils'

interface HourlyForecastProps {
  hourly: HourlyPoint[]
}

export function HourlyForecast({ hourly }: HourlyForecastProps) {
  const nextHours = hourly.slice(0, 12)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/60">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Dự báo theo giờ</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">12 giờ tới</p>
      </div>
      <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
        {nextHours.map((hour) => (
          <div
            key={hour.time}
            className="w-28 shrink-0 rounded-xl bg-slate-50 p-3 text-center dark:bg-white/5"
          >
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{formatHour(hour.time)}</p>
            <p className="mt-3 text-xl font-semibold text-slate-950 dark:text-white">
              {formatTemperature(hour.temperature)}
            </p>
            <p className="mt-2 line-clamp-2 min-h-10 text-xs text-slate-500 dark:text-slate-400">
              {describeWeatherCode(hour.weatherCode)}
            </p>
            <p className="mt-2 text-xs font-medium text-sky-700 dark:text-sky-300">
              Mưa {Math.round(hour.precipitationProbability)}%
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
