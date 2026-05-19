import type { DailyPoint } from '@/features/weather/types'
import { describeWeatherCode, formatTemperature, formatWeekday } from './utils'

interface DailyForecastProps {
  daily: DailyPoint[]
}

export function DailyForecast({ daily }: DailyForecastProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/60">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Dự báo 7 ngày</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Cập nhật mỗi 30 phút</p>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/10">
        {daily.slice(0, 7).map((day) => (
          <div key={day.date} className="grid grid-cols-[1fr_auto] gap-3 py-3 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">{formatWeekday(day.date)}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{describeWeatherCode(day.weatherCode)}</p>
            </div>
            <p className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">
              Mưa {Math.round(day.precipitationProbability)}%, UV {Math.round(day.uvIndexMax)}
            </p>
            <p className="font-semibold text-slate-950 dark:text-white">
              {formatTemperature(day.tempMax)} / {formatTemperature(day.tempMin)}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
