'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { GeoLocation } from '@/features/geocoding/types'
import type { WeatherBundle } from '@/features/weather/types'
import type { AiSource } from '@/shared/lib/ai'
import {
  buildDailyOutlookDigest,
  buildHourlyRainDigest,
  digestFingerprint,
} from '@/features/weather/utils/ai-summary-digest'

export type WeatherAiSummaryPayload = { summary: string; source: AiSource | 'heuristic' }

export function weatherAiSummaryQueryKey(
  locationId: number,
  weatherTime: string,
  locale: string,
  digestKey: string,
) {
  return ['ai-summary', locationId, weatherTime, locale, digestKey] as const
}

export function useWeatherAiSummary(
  location: GeoLocation | null | undefined,
  weather: WeatherBundle | undefined,
  locale: 'vi' | 'en',
) {
  const digests = useMemo(() => {
    if (!location || !weather) return null
    const hourlyDigest = buildHourlyRainDigest(weather.hourly, weather.timezone, locale)
    const dailyDigest = buildDailyOutlookDigest(weather.daily, weather.timezone, locale)
    return {
      hourlyDigest,
      dailyDigest,
      digestKey: digestFingerprint(hourlyDigest, dailyDigest),
    }
  }, [location, weather, locale])

  return useQuery<WeatherAiSummaryPayload, Error>({
    queryKey:
      location && weather && digests
        ? weatherAiSummaryQueryKey(location.id, weather.current.time, locale, digests.digestKey)
        : ['ai-summary', 'disabled'],
    queryFn: async () => {
      if (!location || !weather || !digests) throw new Error('ai_summary_disabled')
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: location.name,
          country: location.country,
          temperature: weather.current.temperature,
          apparentTemperature: weather.current.apparentTemperature,
          weatherCode: weather.current.weatherCode,
          humidity: weather.current.humidity,
          windSpeed: weather.current.windSpeed,
          uvIndex: weather.current.uvIndex,
          locale,
          hourlyForecastDigest: digests.hourlyDigest,
          dailyOutlookDigest: digests.dailyDigest,
        }),
      })
      if (!res.ok) throw new Error('ai_failed')
      return res.json() as Promise<WeatherAiSummaryPayload>
    },
    enabled: Boolean(location && weather && digests),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
}
