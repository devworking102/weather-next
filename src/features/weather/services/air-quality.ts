import type { AirQualityBundle, AirQualityHourlyPoint } from '@/features/weather/types'

interface AqRaw {
  current: Record<string, number | string>
  hourly: Record<string, (number | string)[]>
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityBundle> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone',
    hourly: 'european_aqi,pm2_5,pm10',
    timezone: 'auto',
  })
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`
  let res: Response | undefined
  for (let attempt = 0; attempt < 8; attempt++) {
    if (attempt > 0) {
      const base = 2 ** (attempt - 1) * 1800
      const jitter = Math.floor(Math.random() * 400)
      await new Promise((r) => setTimeout(r, base + jitter))
    }
    res = await fetch(url, { next: { revalidate: 600 } })
    if (res.status !== 429) break
  }
  if (!res || !res.ok) {
    throw new Error(`Air quality error: ${res?.status ?? 'unknown'}`)
  }
  const raw = (await res.json()) as AqRaw
  const c = raw.current
  const h = raw.hourly
  const hourly: AirQualityHourlyPoint[] = Array.isArray(h?.time)
    ? (h.time as string[]).map((time, i) => ({
        time,
        europeanAqi: Number(h.european_aqi?.[i] ?? 0),
        pm25: Number(h.pm2_5?.[i] ?? 0),
        pm10: Number(h.pm10?.[i] ?? 0),
      }))
    : []
  return {
    current: {
      europeanAqi: Number(c.european_aqi),
      usAqi: Number(c.us_aqi),
      pm10: Number(c.pm10),
      pm25: Number(c.pm2_5),
      co: Number(c.carbon_monoxide),
      no2: Number(c.nitrogen_dioxide),
      ozone: Number(c.ozone),
    },
    hourly,
  }
}
