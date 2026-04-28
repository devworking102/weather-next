'use client'

import { useQuery } from '@tanstack/react-query'
import type { Recommendations } from '@/app/api/recommendations/route'
import type { GeoLocation } from '@/features/geocoding/types'
import type { WeatherBundle } from '@/features/weather/types'

export function useRecommendations(location: GeoLocation | null, weather?: WeatherBundle) {
  const key = location && weather
    ? ['recs', location.id, weather.current.weatherCode, Math.round(weather.current.temperature)]
    : ['recs', null]
  return useQuery<Recommendations>({
    queryKey: key,
    enabled: !!location && !!weather,
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: location!.name,
          country: location!.country,
          admin1: location!.admin1,
          temperature: weather!.current.temperature,
          weatherCode: weather!.current.weatherCode,
        }),
      })
      if (!res.ok) throw new Error(`recs_${res.status}`)
      return (await res.json()) as Recommendations
    },
  })
}
