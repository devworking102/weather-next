import type { AirQualityBundle, WeatherBundle } from '@/features/weather/types'

interface WeatherStatsProps {
  weather: WeatherBundle
  airQuality?: AirQualityBundle | null
}

export function WeatherStats({ weather, airQuality }: WeatherStatsProps) {
  const stats = [
    { label: 'Độ ẩm', value: `${Math.round(weather.current.humidity)}%` },
    { label: 'Gió', value: `${Math.round(weather.current.windSpeed)} km/h` },
    { label: 'Gió giật', value: `${Math.round(weather.current.windGusts)} km/h` },
    { label: 'UV', value: Math.round(weather.current.uvIndex).toString() },
    { label: 'Tầm nhìn', value: `${Math.round(weather.current.visibility / 1000)} km` },
    { label: 'Áp suất', value: `${Math.round(weather.current.pressure)} hPa` },
    ...(airQuality ? [{ label: 'AQI', value: Math.round(airQuality.current.europeanAqi).toString() }] : []),
  ]

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/60">
      <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Chỉ số thời tiết</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
