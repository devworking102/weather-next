'use client'

import type { WeatherBundle } from '@/features/weather/types'
import { formatTime } from '@/features/weather/utils/format'
import { wmoInfo } from '@/features/weather/utils/wmo'

interface Props {
  weather: WeatherBundle
}

export function MobileHourlyForecast({ weather }: Props) {
  const now = new Date().toISOString().slice(0, 13) + ':00'
  const start = Math.max(0, weather.hourly.findIndex((h) => h.time >= now))
  const rows = weather.hourly.slice(start, start + 12)

  return (
    <section className="rounded-[24px] border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/70 md:hidden">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase text-slate-400">Theo giờ</p>
          <h2 className="text-xl font-semibold tracking-normal text-slate-950 dark:text-white">Vài giờ tới</h2>
        </div>
      </div>
      <div className="-mx-4 overflow-x-auto px-4 pb-1">
        <div className="flex gap-3">
          {rows.map((hour) => {
            const info = wmoInfo(hour.weatherCode)
            return (
              <article
                key={hour.time}
                className="w-[76px] shrink-0 rounded-[20px] bg-slate-50 p-3 text-center dark:bg-white/8"
              >
                <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                  {formatTime(hour.time)}
                </p>
                <p className="mt-2 text-2xl leading-none" aria-hidden>
                  {info.icon}
                </p>
                <p className="mt-2 text-base font-semibold text-slate-950 dark:text-white">
                  {Math.round(hour.temperature)}°
                </p>
                <p className="mt-1 text-[12px] font-medium text-sky-600 dark:text-sky-300">
                  {Math.round(hour.precipitationProbability)}%
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
