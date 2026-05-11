'use client'

import { useQuery } from '@tanstack/react-query'
import type { WeatherInsightsResponse } from '@/app/api/weather-insights/route'
import type { GeoLocation } from '@/features/geocoding/types'
import type { AirQualityBundle, WeatherBundle } from '@/features/weather/types'

export function useWeatherInsights(
  location: GeoLocation | null | undefined,
  weather: WeatherBundle | undefined,
  aqi: AirQualityBundle | undefined,
  locale: 'vi' | 'en',
) {
  const eu = aqi != null ? Math.round(aqi.current.europeanAqi) : null
  const pm = aqi != null ? Math.round(aqi.current.pm25) : null

  const key =
    location && weather
      ? [
          'weather-insights',
          location.id,
          weather.current.time,
          weather.current.weatherCode,
          Math.round(weather.current.temperature),
          eu ?? 'na',
          pm ?? 'na',
          locale,
        ]
      : ['weather-insights', 'off']

  return useQuery<WeatherInsightsResponse, Error>({
    queryKey: key,
    enabled: Boolean(location && weather),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    queryFn: async () => {
      const res = await fetch('/api/weather-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: location!.name,
          country: location!.country,
          admin1: location!.admin1,
          temperature: weather!.current.temperature,
          apparentTemperature: weather!.current.apparentTemperature,
          weatherCode: weather!.current.weatherCode,
          humidity: weather!.current.humidity,
          windSpeed: weather!.current.windSpeed,
          uvIndex: weather!.current.uvIndex,
          europeanAqi: eu ?? undefined,
          pm25: pm ?? undefined,
          locale,
        }),
      })
      if (!res.ok) throw new Error(`insights_${res.status}`)
      return (await res.json()) as WeatherInsightsResponse
    },
  })
}
