'use client'

import { CloudRain, Droplets, MapPin, ThermometerSun, Wind } from 'lucide-react'
import type { GeoLocation } from '@/features/geocoding/types'
import type { WeatherBundle } from '@/features/weather/types'
import { formatTemp } from '@/features/weather/utils/format'
import { wmoInfo } from '@/features/weather/utils/wmo'
import type { TempUnit } from '@/features/weather/types'

interface Props {
  location: GeoLocation
  weather: WeatherBundle
  tempUnit: TempUnit
}

export function WeatherHeroCard({ location, weather, tempUnit }: Props) {
  const { current } = weather
  const today = weather.daily[0]
  const info = wmoInfo(current.weatherCode)
  const rain = Math.round(today?.precipitationProbability ?? current.precipitation ?? 0)

  const stats = [
    {
      label: 'Cảm giác như',
      value: formatTemp(current.apparentTemperature, tempUnit),
      Icon: ThermometerSun,
    },
    {
      label: 'Khả năng mưa',
      value: `${rain}%`,
      Icon: CloudRain,
    },
    {
      label: 'Gió',
      value: `${Math.round(current.windSpeed)} km/h`,
      Icon: Wind,
    },
    {
      label: 'Độ ẩm',
      value: `${Math.round(current.humidity)}%`,
      Icon: Droplets,
    },
  ]

  return (
    <section className="rounded-[24px] bg-slate-950 p-4 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)] md:hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-white/75">
            <MapPin size={14} className="shrink-0" aria-hidden />
            <span className="truncate">
              {location.name}
              {location.admin1 ? `, ${location.admin1}` : ''}
            </span>
          </div>
          <h1 className="mt-3 text-[4rem] font-light leading-none tracking-normal">
            {formatTemp(current.temperature, tempUnit)}
          </h1>
          <p className="mt-2 text-base font-semibold">{info.label}</p>
          {today ? (
            <p className="mt-1 text-[13px] text-white/70">
              Cao nhất {formatTemp(today.tempMax, tempUnit)} · Thấp nhất {formatTemp(today.tempMin, tempUnit)}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 text-6xl leading-none" aria-hidden>
          {info.icon}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className="rounded-[20px] bg-white/10 p-3 ring-1 ring-white/10">
            <div className="flex items-center gap-2 text-[12px] font-medium text-white/65">
              <Icon size={15} aria-hidden />
              {label}
            </div>
            <p className="mt-2 text-base font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
