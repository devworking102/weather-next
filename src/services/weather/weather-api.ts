/**
 * Lớp gọi API thời tiết/AQI từ client (Next route handlers).
 * Tách khỏi hook để tái sử dụng và test dễ hơn.
 */
import { apiFetch } from '@/shared/lib/fetcher'
import type { AirQualityBundle, TempUnit, WeatherBundle } from '@/features/weather/types'

export async function fetchWeatherBundle(
  lat: number,
  lon: number,
  unit: TempUnit = 'celsius',
): Promise<WeatherBundle> {
  return apiFetch<WeatherBundle>(`/api/weather?lat=${lat}&lon=${lon}&unit=${unit}`)
}

export async function fetchAirQualityBundle(lat: number, lon: number): Promise<AirQualityBundle> {
  return apiFetch<AirQualityBundle>(`/api/aqi?lat=${lat}&lon=${lon}`)
}
