'use client'

import { AlertTriangle, Info } from 'lucide-react'
import { useMemo } from 'react'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { useWeather, useAirQuality } from '@/features/weather/hooks/useWeather'
import { useEarthquakes } from '@/features/earthquakes/hooks/useEarthquakes'
import { computeAlerts } from '@/features/alerts/utils/compute'
import { useUiStore } from '@/shared/store/ui-store'
import { cn } from '@/shared/lib/cn'

const levelStyles = {
  info:    'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100',
  danger:  'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100',
}

export function AlertsBanner() {
  const location = useLocationStore((s) => s.current)
  const unit = useUiStore((s) => s.unit)
  const tempUnit = unit === 'f' ? 'fahrenheit' : 'celsius'
  const weather = useWeather(location?.latitude, location?.longitude, tempUnit)
  const aqi = useAirQuality(location?.latitude, location?.longitude)
  const quakes = useEarthquakes(location?.latitude, location?.longitude)

  const alerts = useMemo(
    () => computeAlerts(weather.data, aqi.data, quakes.data),
    [weather.data, aqi.data, quakes.data],
  )

  if (alerts.length === 0) return null

  return (
    <section className="space-y-2">
      {alerts.map((a) => (
        <div
          key={a.id}
          className={cn(
            'flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm',
            levelStyles[a.level],
          )}
          role="alert"
        >
          <span className="text-xl leading-none" aria-hidden>
            {a.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 font-semibold">
              {a.level === 'info' ? <Info size={14} /> : <AlertTriangle size={14} />}
              {a.title}
            </div>
            <p className="mt-0.5 text-xs opacity-90">{a.message}</p>
          </div>
        </div>
      ))}
    </section>
  )
}
