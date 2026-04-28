'use client'

import { MapPin } from 'lucide-react'
import type { WeatherBundle } from '@/features/weather/types'
import type { GeoLocation } from '@/features/geocoding/types'
import { wmoInfo } from '@/features/weather/utils/wmo'
import { formatTemp } from '@/features/weather/utils/format'
import { useUiStore } from '@/shared/store/ui-store'
import { DynamicBackground } from './DynamicBackground'

interface Props {
  location: GeoLocation
  weather: WeatherBundle
}

export function HeroCard({ location, weather }: Props) {
  const unit = useUiStore((s) => s.unit)
  const { current } = weather
  const info = wmoInfo(current.weatherCode)
  const tempUnit = unit === 'f' ? 'fahrenheit' : 'celsius'
  const today = weather.daily[0]

  return (
    <section className="relative isolate overflow-hidden rounded-3xl p-6 text-white shadow-xl sm:p-8">
      <DynamicBackground weatherCode={current.weatherCode} isDay={current.isDay} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/10 via-transparent to-black/20" aria-hidden />

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
            <MapPin size={12} />
            <span className="truncate">
              {location.name}
              {location.admin1 ? `, ${location.admin1}` : ''}
              {location.country ? ` · ${location.country}` : ''}
            </span>
          </div>
          <p className="mt-4 text-sm/5 text-white/80">{info.label}</p>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-7xl font-extralight leading-none tracking-tighter sm:text-8xl">
              {formatTemp(current.temperature, tempUnit)}
            </span>
          </div>
          <p className="mt-2 text-sm text-white/80">
            Cảm nhận {formatTemp(current.apparentTemperature, tempUnit)}
            {today ? (
              <>
                {' · '}
                Cao {formatTemp(today.tempMax, tempUnit)} / Thấp {formatTemp(today.tempMin, tempUnit)}
              </>
            ) : null}
          </p>
        </div>
        <div className="text-6xl sm:text-7xl" aria-hidden>
          {info.icon}
        </div>
      </div>
    </section>
  )
}
