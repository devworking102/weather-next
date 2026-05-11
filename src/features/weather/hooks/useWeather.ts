'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchAirQualityBundle, fetchWeatherBundle } from '@/services/weather/weather-api'
import type { AirQualityBundle, TempUnit, WeatherBundle } from '@/features/weather/types'

export function weatherQueryKey(lat?: number, lon?: number, unit: TempUnit = 'celsius') {
  return ['weather', lat, lon, unit] as const
}

export function useWeather(lat?: number, lon?: number, unit: TempUnit = 'celsius') {
  return useQuery<WeatherBundle>({
    queryKey: weatherQueryKey(lat, lon, unit),
    queryFn: () => fetchWeatherBundle(lat!, lon!, unit),
    enabled: Number.isFinite(lat) && Number.isFinite(lon),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAirQuality(lat?: number, lon?: number) {
  return useQuery<AirQualityBundle>({
    queryKey: ['aqi', lat, lon],
    queryFn: () => fetchAirQualityBundle(lat!, lon!),
    enabled: Number.isFinite(lat) && Number.isFinite(lon),
    staleTime: 10 * 60 * 1000,
  })
}
