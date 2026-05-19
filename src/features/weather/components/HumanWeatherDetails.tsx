'use client'

import { Cloud, Droplets, Eye, Gauge, Sun, Wind } from 'lucide-react'
import type { WeatherBundle } from '@/features/weather/types'
import { formatWind, windDirection } from '@/features/weather/utils/format'
import type { CompanionInsight } from '@/ai/weather-companion'

interface Props {
  weather: WeatherBundle
  insight: CompanionInsight
}

export function HumanWeatherDetails({ weather, insight }: Props) {
  const c = weather.current
  const details = [
    {
      icon: Droplets,
      label: 'Độ ẩm',
      value: c.humidity >= 82 ? 'Khá ẩm' : c.humidity >= 65 ? 'Hơi ẩm' : 'Dễ chịu',
      hint: insight.comfort,
    },
    {
      icon: Sun,
      label: 'Nắng',
      value: c.uvIndex >= 8 ? 'Rất gắt' : c.uvIndex >= 6 ? 'Cao' : 'Ổn',
      hint: insight.uv,
    },
    {
      icon: Wind,
      label: 'Gió',
      value: c.windSpeed >= 28 ? 'Gió mạnh' : c.windSpeed >= 16 ? 'Có gió' : 'Gió nhẹ',
      hint: `${formatWind(c.windSpeed)} từ hướng ${windDirection(c.windDirection).toLowerCase()}.`,
    },
    {
      icon: Cloud,
      label: 'Mây',
      value: c.cloudCover >= 75 ? 'Nhiều mây' : c.cloudCover >= 35 ? 'Có mây' : 'Trời thoáng',
      hint: c.cloudCover >= 75 ? 'Ánh nắng có thể dịu hơn, nhưng trời vẫn có thể oi.' : 'Bầu trời dễ quan sát hơn.',
    },
    {
      icon: Eye,
      label: 'Tầm nhìn',
      value: c.visibility < 5000 ? 'Hạn chế' : 'Tốt',
      hint: c.visibility < 5000 ? 'Đi xe nên chậm hơn và bật đèn khi cần.' : 'Di chuyển ngoài trời không bị ảnh hưởng nhiều.',
    },
    {
      icon: Gauge,
      label: 'Áp suất',
      value: 'Ổn định',
      hint: `Thông số kỹ thuật: ${Math.round(c.pressure)} hPa.`,
    },
  ]

  return (
    <section className="space-y-3" aria-label="Chi tiết thời tiết dễ hiểu">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
          Chi tiết dễ hiểu
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Các chỉ số kỹ thuật được chuyển thành lời khuyên thực tế.
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
