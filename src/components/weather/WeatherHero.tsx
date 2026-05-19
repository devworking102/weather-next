import Link from 'next/link'
import type { CurrentWeather, DailyPoint } from '@/features/weather/types'
import { buildWeatherSummary, describeWeatherCode, formatTemperature } from './utils'

interface WeatherHeroProps {
  cityName: string
  region: string
  current?: CurrentWeather
  today?: DailyPoint
}

function weatherIcon(code: number): string {
  if (code === 0) return '☀️'
  if ([1, 2].includes(code)) return '🌤️'
  if (code === 3) return '☁️'
  if ([45, 48].includes(code)) return '🌫️'
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return '🌧️'
  if ([95, 96, 99].includes(code)) return '⛈️'
  return '🌡️'
}

export function WeatherHero({ cityName, region, current, today }: WeatherHeroProps) {
  const summary = current
    ? buildWeatherSummary(cityName, current, today)
    : `Theo dõi thời tiết ${cityName} hôm nay, dự báo theo giờ, 7 ngày, AQI và các chỉ số sinh hoạt quan trọng.`

  return (
    <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-500 p-5 text-white shadow-lg sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-wide text-white/80">{region}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Thời tiết {cityName} hôm nay</h1>
          <p className="mt-4 text-base leading-7 text-white/90 sm:text-lg">{summary}</p>
        </div>
        {current ? (
          <div className="rounded-2xl bg-white/15 p-4 text-left backdrop-blur-md sm:min-w-48">
            <p className="text-4xl" aria-hidden>
              {weatherIcon(current.weatherCode)}
            </p>
            <p className="mt-2 text-5xl font-semibold tracking-tight">{formatTemperature(current.temperature)}</p>
            <p className="mt-1 text-sm text-white/85">{describeWeatherCode(current.weatherCode)}</p>
          </div>
        ) : null}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/thoi-tiet"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-sky-800 shadow-sm transition hover:bg-sky-50"
        >
          Tìm thành phố khác
        </Link>
        <Link
          href="/radar-mua"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Xem radar mưa
        </Link>
      </div>
    </header>
  )
}
