'use client'

import { useMemo } from 'react'
import { useUiStore } from '@/shared/store/ui-store'
import { useWeather, useAirQuality } from '@/features/weather/hooks/useWeather'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { useEarthquakes } from '@/features/earthquakes/hooks/useEarthquakes'
import { computeAlerts } from '@/features/alerts/utils/compute'
import { TabsNav } from './TabsNav'

export function WeatherTabsBar() {
  const setTab = useUiStore((s) => s.setWeatherTab)
  const tab = useUiStore((s) => s.weatherTab)
  const unit = useUiStore((s) => s.unit)
  const locale = useUiStore((s) => s.locale)
  const tempUnit = unit === 'f' ? 'fahrenheit' : 'celsius'

  const location = useLocationStore((s) => s.current)
  const { data } = useWeather(location?.latitude, location?.longitude, tempUnit)
  const { data: aqi } = useAirQuality(location?.latitude, location?.longitude)
  const { data: quakes } = useEarthquakes(location?.latitude, location?.longitude)

  const alertCount = useMemo(
    () => computeAlerts(data, aqi, quakes, locale).length,
    [data, aqi, quakes, locale],
  )

  return (
    <div className="sticky top-[57px] z-30 border-b border-black/5 bg-[color:var(--background)]/80 shadow-sm backdrop-blur-2xl dark:border-white/5">
      <div className="mx-auto container px-3 py-2 md:px-6">
        <TabsNav value={tab} onChange={setTab} alertCount={alertCount} />
      </div>
    </div>
  )
}
