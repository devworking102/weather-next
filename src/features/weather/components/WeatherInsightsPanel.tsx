'use client'

import { Skeleton } from '@/shared/ui/Skeleton'
import { AiWeatherSummary } from '@/shared/ui/AiWeatherSummary'
import { useWeatherInsights } from '@/features/weather/hooks/useWeatherInsights'
import { useUiStore } from '@/shared/store/ui-store'
import type { GeoLocation } from '@/features/geocoding/types'
import type { AirQualityBundle, WeatherBundle } from '@/features/weather/types'

interface Props {
  location: GeoLocation
  weather: WeatherBundle
  aqi: AirQualityBundle | undefined
}

export function WeatherInsightsPanel({ location, weather, aqi }: Props) {
  const locale = useUiStore((s) => s.locale)
  const { data, isLoading, isError } = useWeatherInsights(location, weather, aqi, locale)

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-40 rounded-2xl md:col-span-2" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl md:col-span-2 lg:col-span-4" />
        </div>
      </div>
    )
  }

  if (isError) {
    return null
  }

  return (
    <AiWeatherSummary
      city={location.name}
      insights={{
        summary: data.summary,
        outfit: data.outfit,
        health: data.health,
        travel: data.travel,
        mood: data.mood,
        severe: data.severe,
      }}
    />
  )
}
