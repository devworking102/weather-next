import type { GeoLocation } from '@/features/geocoding/types'

interface OpenMeteoGeoResult {
  id: number
  name: string
  latitude: number
  longitude: number
  country: string
  country_code?: string
  admin1?: string
}

export async function searchPlaces(query: string, count = 8): Promise<GeoLocation[]> {
  if (query.trim().length < 2) return []
  const params = new URLSearchParams({
    name: query,
    count: count.toString(),
    language: 'vi',
    format: 'json',
  })
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  const data = (await res.json()) as { results?: OpenMeteoGeoResult[] }
  return (data.results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country,
    admin1: r.admin1,
    countryCode: r.country_code,
  }))
}
