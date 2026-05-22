'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, ChevronDown, CloudRain } from 'lucide-react'
import type { DailyPoint, TempUnit, WeatherBundle } from '@/features/weather/types'
import { wmoInfo } from '@/features/weather/utils/wmo'

interface Props {
  weather: WeatherBundle
  tempUnit: TempUnit
}

function dayName(iso: string, index: number) {
  if (index === 0) return 'Hôm nay'
  if (index === 1) return 'Ngày mai'
  return new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(new Date(iso))
}

function dateLabel(iso: string) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(new Date(iso))
}

function temp(value: number, unit: TempUnit) {
  return `${Math.round(value)}°${unit === 'fahrenheit' ? 'F' : ''}`
}

function dayAdvice(day: DailyPoint) {
  if (day.precipitationProbability >= 65) return 'Nên mang áo mưa'
  if (day.uvIndexMax >= 8) return 'Nắng gắt, cần chống nắng'
  if (day.tempMax >= 35) return 'Hạn chế ra ngoài buổi trưa'
  if (day.tempMin <= 20) return 'Sáng tối hơi lạnh'
  return 'Dễ chịu cho sinh hoạt'
}

export function PremiumDailyForecast({ weather, tempUnit }: Props) {
  const [expanded, setExpanded] = useState<string | null>(weather.daily[0]?.date ?? null)
  const days = useMemo(() => weather.daily.slice(0, 7), [weather.daily])
  const min = Math.min(...days.map((day) => day.tempMin))
  const max = Math.max(...days.map((day) => day.tempMax))
  const range = Math.max(1, max - min)

  return (
    <section className="rounded-[28px] border border-black/5 bg-white/82 p-4 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07]">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
        <CalendarDays size={15} aria-hidden />
        7 ngày tới
      </div>
      <div className="space-y-2">
        {days.map((day, index) => {
          const info = wmoInfo(day.weatherCode)
          const open = expanded === day.date
          const left = ((day.tempMin - min) / range) * 100
          const width = Math.max(10, ((day.tempMax - day.tempMin) / range) * 100)

          return (
            <article key={day.date} className="overflow-hidden rounded-[24px] bg-slate-50 dark:bg-white/8">
              <button
                type="button"
                onClick={() => setExpanded(open ? null : day.date)}
                className="grid min-h-[76px] w-full grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 text-left"
                aria-expanded={open}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl leading-none" aria-hidden>
                      {info.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-slate-950 dark:text-white">{dayName(day.date, index)}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{dateLabel(day.date)} · {info.label}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="w-9 text-right text-xs font-semibold text-sky-600 dark:text-sky-300">{temp(day.tempMin, tempUnit)}</span>
                    <div className="relative h-1.5 min-w-0 flex-1 rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-300 to-amber-400"
                        style={{ left: `${left}%`, width: `${width}%` }}
                      />
                    </div>
                    <span className="w-9 text-xs font-semibold text-orange-500">{temp(day.tempMax, tempUnit)}</span>
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
              {open ? (
                <div className="grid grid-cols-2 gap-2 border-t border-black/5 px-4 py-3 text-sm dark:border-white/8">
                  <div className="rounded-[18px] bg-white/70 p-3 dark:bg-white/8">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <CloudRain size={15} aria-hidden />
                      Mưa
                    </div>
                    <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{Math.round(day.precipitationProbability)}%</p>
                  </div>
                  <div className="rounded-[18px] bg-white/70 p-3 dark:bg-white/8">
                    <p className="text-slate-500 dark:text-slate-400">Gợi ý</p>
                    <p className="mt-1 text-sm font-semibold leading-5 text-slate-950 dark:text-white">{dayAdvice(day)}</p>
                  </div>
                </div>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}
