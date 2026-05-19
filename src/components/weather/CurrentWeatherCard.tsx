import type { CurrentWeather, DailyPoint } from '@/features/weather/types'
import { describeWeatherCode, formatTemperature } from './utils'

interface CurrentWeatherCardProps {
  cityName: string
  current: CurrentWeather
  today?: DailyPoint
}

export function CurrentWeatherCard({ cityName, current, today }: CurrentWeatherCardProps) {
  return (
    <section className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/60">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-sky-700 dark:text-sky-300">Thời tiết hiện tại</p>
          <h2 className="mt-2 text-5xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {formatTemperature(current.temperature)}
          </h2>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
            {cityName} {describeWeatherCode(current.weatherCode)}, cảm giác như{' '}
            {formatTemperature(current.apparentTemperature)}.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm sm:min-w-56">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
            <p className="text-slate-500 dark:text-slate-400">Cao nhất</p>
            <p className="mt-1 font-semibold text-slate-950 dark:text-white">
              {today ? formatTemperature(today.tempMax) : formatTemperature(current.temperature)}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
            <p className="text-slate-500 dark:text-slate-400">Thấp nhất</p>
            <p className="mt-1 font-semibold text-slate-950 dark:text-white">
              {today ? formatTemperature(today.tempMin) : formatTemperature(current.temperature)}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
