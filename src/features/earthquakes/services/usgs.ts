import type { Earthquake } from '@/features/earthquakes/types'
import { haversineKm } from '@/shared/lib/haversine'

interface UsgsFeature {
  id: string
  properties: {
    mag: number
    place: string
    time: number
    tsunami: number
    url: string
  }
  geometry: { coordinates: [number, number, number] }
}

export async function fetchEarthquakes(
  lat: number,
  lon: number,
  radiusKm = 1500,
  minMag = 4,
): Promise<Earthquake[]> {
  const params = new URLSearchParams({
    format: 'geojson',
    latitude: lat.toString(),
    longitude: lon.toString(),
    maxradiuskm: radiusKm.toString(),
    minmagnitude: minMag.toString(),
    orderby: 'time',
    limit: '25',
  })
  const res = await fetch(
    `https://earthquake.usgs.gov/fdsnws/event/1/query?${params.toString()}`,
    { next: { revalidate: 600 } },
  )
  if (!res.ok) throw new Error(`USGS error: ${res.status}`)
  const data = (await res.json()) as { features: UsgsFeature[] }
  return data.features.map((f) => {
    const [elon, elat, depth] = f.geometry.coordinates
    return {
      id: f.id,
      magnitude: f.properties.mag,
      place: f.properties.place,
      time: f.properties.time,
      tsunami: f.properties.tsunami,
      url: f.properties.url,
      depth,
      distanceKm: haversineKm([lat, lon], [elat, elon]),
    }
  })
}
