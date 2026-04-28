'use client'

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/shared/lib/fetcher'
import type { AirQualityBundle, TempUnit, WeatherBundle } from '@/features/weather/types'

export function weatherQueryKey(lat?: number, lon?: number, unit: TempUnit = 'celsius') {
  return ['weather', lat, lon, unit] as const
}

export function useWeather(lat?: number, lon?: number, unit: TempUnit = 'celsius') {
  return useQuery<WeatherBundle>({
    queryKey: weatherQueryKey(lat, lon, unit),
    queryFn: () =>
      apiFetch<WeatherBundle>(`/api/weather?lat=${lat}&lon=${lon}&unit=${unit}`),
    enabled: Number.isFinite(lat) && Number.isFinite(lon),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAirQuality(lat?: number, lon?: number) {
  return useQuery<AirQualityBundle>({
    queryKey: ['aqi', lat, lon],
    queryFn: () => apiFetch<AirQualityBundle>(`/api/aqi?lat=${lat}&lon=${lon}`),
    enabled: Number.isFinite(lat) && Number.isFinite(lon),
    staleTime: 10 * 60 * 1000,
  })
}
