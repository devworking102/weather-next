import type {
  CurrentWeather,
  DailyPoint,
  HourlyPoint,
  TempUnit,
  WeatherBundle,
} from '@/features/weather/types'

interface OpenMeteoResponse {
  latitude: number
  longitude: number
  timezone: string
  current: Record<string, number | string>
  hourly: Record<string, (number | string)[]>
  daily: Record<string, (number | string)[]>
}

export async function fetchWeather(
  lat: number,
  lon: number,
  tempUnit: TempUnit = 'celsius',
): Promise<WeatherBundle> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,surface_pressure,cloud_cover,dew_point_2m,visibility,uv_index',
    hourly:
      'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,precipitation_probability,weather_code,wind_speed_10m,wind_gusts_10m,uv_index',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant',
    timezone: 'auto',
    forecast_days: '16',
    temperature_unit: tempUnit,
  })

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) {
    throw new Error(`Open-Meteo error: ${res.status}`)
  }
  const raw = (await res.json()) as OpenMeteoResponse
  return normalizeWeather(raw)
}

function normalizeWeather(raw: OpenMeteoResponse): WeatherBundle {
  const c = raw.current
  const current: CurrentWeather = {
    time: String(c.time),
    temperature: Number(c.temperature_2m),
    apparentTemperature: Number(c.apparent_temperature),
    humidity: Number(c.relative_humidity_2m),
    precipitation: Number(c.precipitation),
    windSpeed: Number(c.wind_speed_10m),
    windGusts: Number(c.wind_gusts_10m),
    windDirection: Number(c.wind_direction_10m),
    pressure: Number(c.surface_pressure),
    cloudCover: Number(c.cloud_cover),
    dewPoint: Number(c.dew_point_2m),
    visibility: Number(c.visibility),
    uvIndex: Number(c.uv_index),
    weatherCode: Number(c.weather_code),
    isDay: Number(c.is_day) === 1,
  }

  const h = raw.hourly
  const hourly: HourlyPoint[] = (h.time as string[]).map((time, i) => ({
    time,
    temperature: Number(h.temperature_2m[i]),
    apparentTemperature: Number(h.apparent_temperature[i]),
    humidity: Number(h.relative_humidity_2m[i]),
    precipitation: Number(h.precipitation[i]),
    precipitationProbability: Number(h.precipitation_probability[i] ?? 0),
    windSpeed: Number(h.wind_speed_10m[i]),
    windGusts: Number(h.wind_gusts_10m[i] ?? 0),
    uvIndex: Number(h.uv_index[i] ?? 0),
    weatherCode: Number(h.weather_code[i]),
  }))

  const d = raw.daily
  const daily: DailyPoint[] = (d.time as string[]).map((date, i) => ({
    date,
    tempMax: Number(d.temperature_2m_max[i]),
    tempMin: Number(d.temperature_2m_min[i]),
    weatherCode: Number(d.weather_code[i]),
    precipitationSum: Number(d.precipitation_sum[i]),
    precipitationProbability: Number(d.precipitation_probability_max[i] ?? 0),
    windSpeedMax: Number(d.wind_speed_10m_max[i]),
    windGustsMax: Number(d.wind_gusts_10m_max[i] ?? 0),
    windDirectionDominant: Number(d.wind_direction_10m_dominant[i]),
    uvIndexMax: Number(d.uv_index_max[i]),
    sunrise: String(d.sunrise[i]),
    sunset: String(d.sunset[i]),
  }))

  return {
    current,
    hourly,
    daily,
    timezone: raw.timezone,
    latitude: raw.latitude,
    longitude: raw.longitude,
  }
}
