import { haversineKm } from '@/shared/lib/haversine'
import type { Typhoon } from '@/features/typhoons/types'

// RSMC Tokyo (JMA) typhoon list — may be unavailable outside JP infra
const JMA_URL = 'https://www.jma.go.jp/bosai/typhoon/data/typhoon_list.json'

// GDACS TC GeoJSON — global tropical cyclone events, used as fallback
const GDACS_TC_URL =
  'https://www.gdacs.org/gdacsapi/api/events/geteventlist/TC?alertlevel=Green,Orange,Red&limit=20'

interface JmaPoint {
  lat?: number
  lon?: number
  latitude?: number
  longitude?: number
  time?: string | number
  pressure?: number
  windMax?: number
  wind?: number
  category?: string
}

interface JmaTyphoon {
  id?: string
  number?: string
  name?: string
  nameEn?: string
  nameJa?: string
  category?: string
  points?: JmaPoint[]
  track?: JmaPoint[]
}

interface GdacsFeature {
  geometry?: { type?: string; coordinates?: [number, number] }
  properties?: {
    name?: string
    eventname?: string
    wind?: number
    windspeed?: number
    pressure?: number
    alertlevel?: string
    fromdate?: string
    todate?: string
    eventid?: number | string
    episodeid?: number | string
  }
}

interface GdacsCollection {
  type?: string
  features?: GdacsFeature[]
}

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (compatible; WeatherNext/1.0; +https://github.com/weather-next)',
  Accept: 'application/json, text/plain, */*',
}

async function fetchWithTimeout(url: string, ms = 8000): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, { signal: ctrl.signal, headers: FETCH_HEADERS, next: { revalidate: 1800 } })
  } finally {
    clearTimeout(timer)
  }
}

async function fetchJma(userLat: number, userLon: number): Promise<Typhoon[]> {
  const res = await fetchWithTimeout(JMA_URL)
  if (!res.ok) throw new Error(`JMA error: ${res.status}`)
  const data = (await res.json()) as JmaTyphoon[] | { typhoons: JmaTyphoon[] }
  const arr: JmaTyphoon[] = Array.isArray(data) ? data : (data.typhoons ?? [])
  const list: Typhoon[] = []
  for (const t of arr) {
    const points = t.points ?? t.track ?? []
    const latest = points[points.length - 1]
    if (!latest) continue
    const lat = Number(latest.lat ?? latest.latitude)
    const lon = Number(latest.lon ?? latest.longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue
    const windMs = Number(latest.windMax ?? latest.wind ?? 0)
    const windKmh = windMs > 0 ? Math.round(windMs * 3.6) : undefined
    list.push({
      id: String(t.id ?? t.number ?? `${t.name}_${latest.time ?? Date.now()}`),
      name: t.name ?? t.nameEn ?? 'Unknown',
      nameJa: t.nameJa,
      lat,
      lon,
      pressure: latest.pressure ? Number(latest.pressure) : undefined,
      windKmh,
      category: latest.category ?? t.category ?? 'TD',
      distanceKm: Math.round(haversineKm([userLat, userLon], [lat, lon])),
      time: latest.time ? new Date(String(latest.time)).getTime() : Date.now(),
    })
  }
  list.sort((a, b) => a.distanceKm - b.distanceKm)
  return list
}

async function fetchGdacs(userLat: number, userLon: number): Promise<Typhoon[]> {
  const res = await fetchWithTimeout(GDACS_TC_URL)
  if (!res.ok) throw new Error(`GDACS error: ${res.status}`)
  const data = (await res.json()) as GdacsCollection
  const features = data.features ?? []
  const list: Typhoon[] = []
  for (const f of features) {
    const coords = f.geometry?.coordinates
    if (!coords) continue
    const [lon, lat] = coords
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue
    const p = f.properties ?? {}
    const name = p.name ?? p.eventname ?? 'Unknown'
    const windKmh = p.wind ?? p.windspeed
    list.push({
      id: String(p.eventid ?? `${name}_${p.fromdate ?? Date.now()}`),
      name,
      lat,
      lon,
      pressure: p.pressure,
      windKmh: windKmh ? Math.round(windKmh) : undefined,
      category: alertToCategory(p.alertlevel),
      distanceKm: Math.round(haversineKm([userLat, userLon], [lat, lon])),
      time: p.todate ? new Date(p.todate).getTime() : Date.now(),
    })
  }
  list.sort((a, b) => a.distanceKm - b.distanceKm)
  return list
}

function alertToCategory(level?: string): string {
  switch ((level ?? '').toLowerCase()) {
    case 'red': return 'TY'
    case 'orange': return 'TS'
    default: return 'TD'
  }
}

export async function fetchTyphoons(userLat: number, userLon: number): Promise<Typhoon[]> {
  try {
    return await fetchJma(userLat, userLon)
  } catch {
    // JMA unavailable — try GDACS as fallback
  }
  try {
    return await fetchGdacs(userLat, userLon)
  } catch {
    // Both sources down — return empty list gracefully
    return []
  }
}
