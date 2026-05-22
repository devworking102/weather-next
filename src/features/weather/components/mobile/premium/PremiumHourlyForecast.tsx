'use client'

import { motion } from 'framer-motion'
import { Clock3 } from 'lucide-react'
import type { TempUnit, WeatherBundle } from '@/features/weather/types'
import { wmoInfo } from '@/features/weather/utils/wmo'

interface Props {
  weather: WeatherBundle
  tempUnit: TempUnit
}

function hourLabel(iso: string, index: number) {
  if (index === 0) return 'Bây giờ'
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

function temp(value: number, unit: TempUnit) {
  return `${Math.round(value)}°${unit === 'fahrenheit' ? 'F' : ''}`
}

export function PremiumHourlyForecast({ weather, tempUnit }: Props) {
  const now = new Date().toISOString().slice(0, 13) + ':00'
  const start = Math.max(0, weather.hourly.findIndex((h) => h.time >= now))
  const rows = weather.hourly.slice(start, start + 16)

  return (
    <section className="rounded-[28px] border border-black/5 bg-white/82 p-4 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07]">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
            <Clock3 size={15} aria-hidden />
            Theo giờ
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">Vài giờ tới</h2>
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-3">
          {rows.map((hour, index) => {
            const info = wmoInfo(hour.weatherCode)
            const current = index === 0
            return (
              <motion.article
                key={hour.time}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.025, 0.18) }}
                className={`w-[88px] shrink-0 rounded-[24px] p-3.5 text-center ${
                  current
                    ? 'bg-slate-950 text-white shadow-lg dark:bg-white dark:text-slate-950'
                    : 'bg-slate-50 text-slate-950 dark:bg-white/8 dark:text-white'
                }`}
              >
                <p className={`text-xs font-semibold ${current ? 'text-white/76 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
                  {hourLabel(hour.time, index)}
                </p>
                <p className="mt-3 text-3xl leading-none" aria-hidden>
                  {info.icon}
                </p>
                <p className="mt-3 text-xl font-semibold">{temp(hour.temperature, tempUnit)}</p>
                <p className={`mt-1 text-xs font-semibold ${current ? 'text-sky-200 dark:text-sky-700' : 'text-sky-600 dark:text-sky-300'}`}>
                  {Math.round(hour.precipitationProbability)}%
                </p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
