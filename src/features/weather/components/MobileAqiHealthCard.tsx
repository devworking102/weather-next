'use client'

import { HeartPulse, Wind } from 'lucide-react'
import type { AirQualityBundle, WeatherBundle } from '@/features/weather/types'
import type { CompanionInsight } from '@/ai/weather-companion'

interface Props {
  weather: WeatherBundle
  aqi?: AirQualityBundle
  insight: CompanionInsight
}

function aqiLabel(value?: number) {
  if (value == null || !Number.isFinite(value)) return 'Chưa có AQI'
  if (value <= 40) return 'Không khí ổn'
  if (value <= 60) return 'Nên chú ý'
  if (value <= 80) return 'Hạn chế vận động mạnh'
  return 'Nên ở trong nhà'
}

export function MobileAqiHealthCard({ weather, aqi, insight }: Props) {
  const value = aqi?.current?.europeanAqi

  return (
    <section className="rounded-[24px] border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/70 md:hidden">
      <div className="flex items-center gap-2 text-[12px] font-semibold uppercase text-rose-600 dark:text-rose-300">
        <HeartPulse size={15} aria-hidden />
        AQI & sức khỏe
      </div>
      <div className="mt-3 grid grid-cols-[auto_1fr] gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-rose-50 text-xl font-bold text-rose-700 dark:bg-rose-400/10 dark:text-rose-200">
          {typeof value === 'number' ? Math.round(value) : '--'}
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-normal text-slate-950 dark:text-white">
            {aqiLabel(value)}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {insight.aqi}
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-[20px] bg-slate-50 p-3 dark:bg-white/8">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-700 dark:text-slate-200">
          <Wind size={15} aria-hidden />
          Gợi ý khi ra ngoài
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {insight.activity} UV hiện khoảng {Math.round(weather.current.uvIndex)}.
        </p>
      </div>
    </section>
  )
}
