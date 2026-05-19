import { CalendarDays } from 'lucide-react'
import type { DailyPoint } from '@/features/weather/types'
import { describeWeatherCode, formatTemperature, formatWeekday } from './utils'

interface DailyForecastProps {
  daily: DailyPoint[]
}

function dailyAdvice(day: DailyPoint): string {
  if (day.precipitationProbability >= 60) return 'Nên chuẩn bị ô hoặc áo mưa.'
  if (day.tempMax >= 35) return 'Nên hạn chế ra ngoài buổi trưa.'
  if (day.uvIndexMax >= 8) return 'Nắng gắt, cần che chắn kỹ.'
  if (day.tempMax <= 22) return 'Có thể cần áo khoác mỏng.'
  return 'Thời tiết phù hợp cho lịch sinh hoạt thường ngày.'
}

export function DailyForecast({ daily }: DailyForecastProps) {
  return (
    <section className="rounded-[1.75rem] border border-black/5 bg-white/75 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
          <CalendarDays size={20} aria-hidden />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
            Tuần này nên chuẩn bị gì?
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Dự báo 7 ngày được tóm tắt theo quyết định hằng ngày.
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-white/10">
        {daily.slice(0, 7).map((day) => (
          <div key={day.date} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{formatWeekday(day.date)}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {dailyAdvice(day)} Trời {describeWeatherCode(day.weatherCode)}.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                {formatTemperature(day.tempMax)} / {formatTemperature(day.tempMin)}
              </span>
              {day.precipitationProbability >= 20 ? (
                <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
                  Mưa {Math.round(day.precipitationProbability)}%
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
