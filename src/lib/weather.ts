import type {
  AirQualityBundle,
  AirQualityHourlyPoint,
  CurrentWeather,
  DailyPoint,
  HourlyPoint,
  TempUnit,
  WeatherBundle,
} from '@/features/weather/types'

const WEATHER_REVALIDATE_SECONDS = 1800

interface OpenMeteoWeatherResponse {
  latitude: number
  longitude: number
  timezone: string
  current: Record<string, number | string>
  hourly: Record<string, (number | string)[]>
  daily: Record<string, (number | string)[]>
}

interface OpenMeteoAqiResponse {
  current: Record<string, number | string>
  hourly: Record<string, (number | string)[]>
}

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'WeatherServiceError'
  }
}

export async function getCurrentWeatherByCoords(
  lat: number,
  lon: number,
  tempUnit: TempUnit = 'celsius',
): Promise<CurrentWeather> {
  const weather = await getWeatherBundleByCoords(lat, lon, tempUnit)
  return weather.current
}

export const getCurrentWeather = getCurrentWeatherByCoords

export async function getForecastByCoords(
  lat: number,
  lon: number,
  tempUnit: TempUnit = 'celsius',
): Promise<Pick<WeatherBundle, 'hourly' | 'daily' | 'timezone' | 'latitude' | 'longitude'>> {
  const weather = await getWeatherBundleByCoords(lat, lon, tempUnit)
  return {
    hourly: weather.hourly,
    daily: weather.daily,
    timezone: weather.timezone,
    latitude: weather.latitude,
    longitude: weather.longitude,
  }
}

export async function getHourlyForecast(lat: number, lon: number, tempUnit: TempUnit = 'celsius'): Promise<HourlyPoint[]> {
  const forecast = await getForecastByCoords(lat, lon, tempUnit)
  return forecast.hourly
}

export async function getDailyForecast(lat: number, lon: number, tempUnit: TempUnit = 'celsius'): Promise<DailyPoint[]> {
  const forecast = await getForecastByCoords(lat, lon, tempUnit)
  return forecast.daily
}

export async function getWeatherBundleByCoords(
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
      'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,precipitation_probability,weather_code,wind_speed_10m,wind_gusts_10m,uv_index,visibility',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant',
    timezone: 'auto',
    forecast_days: '7',
    temperature_unit: tempUnit,
  })
  appendOptionalApiKey(params)

  const raw = await fetchOpenMeteo<OpenMeteoWeatherResponse>(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    'Không tải được dữ liệu thời tiết',
  )

  return normalizeWeather(raw)
}

export async function getAirQualityByCoords(lat: number, lon: number): Promise<AirQualityBundle | null> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone',
    hourly: 'european_aqi,pm2_5,pm10',
    timezone: 'auto',
  })
  appendOptionalApiKey(params)

  try {
    const raw = await fetchOpenMeteo<OpenMeteoAqiResponse>(
      `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`,
      'Không tải được dữ liệu chất lượng không khí',
    )
    return normalizeAirQuality(raw)
  } catch {
    return null
  }
}

export const getAirQuality = getAirQualityByCoords

export interface WeatherAlert {
  id: string
  title: string
  severity: 'info' | 'watch' | 'warning'
  description: string
}

export async function getWeatherAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
  const weather = await getWeatherBundleByCoords(lat, lon)
  const today = weather.daily[0]
  if (!today) return []

  const alerts: WeatherAlert[] = []
  if (today.precipitationProbability >= 70 || today.precipitationSum >= 20) {
    alerts.push({
      id: 'heavy-rain',
      title: 'Khả năng mưa lớn',
      severity: 'warning',
      description: 'Nên theo dõi radar mưa và hạn chế di chuyển ngoài trời trong thời điểm mưa mạnh.',
    })
  }
  if (today.uvIndexMax >= 8) {
    alerts.push({
      id: 'high-uv',
      title: 'UV cao',
      severity: 'watch',
      description: 'Nên che chắn, dùng kem chống nắng và tránh nắng gắt giữa trưa.',
    })
  }
  if (today.windGustsMax >= 50) {
    alerts.push({
      id: 'strong-wind',
      title: 'Gió giật mạnh',
      severity: 'watch',
      description: 'Cẩn thận khi đi xe máy, qua cầu hoặc khu vực nhiều cây và biển quảng cáo.',
    })
  }

  return alerts
}

async function fetchOpenMeteo<T>(url: string, errorMessage: string): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: WEATHER_REVALIDATE_SECONDS },
  })

  if (!response.ok) {
    throw new WeatherServiceError(`${errorMessage} (${response.status})`, response.status)
  }

  return (await response.json()) as T
}

function appendOptionalApiKey(params: URLSearchParams) {
  if (process.env.WEATHER_API_KEY) {
    params.set('apikey', process.env.WEATHER_API_KEY)
  }
}

function normalizeWeather(raw: OpenMeteoWeatherResponse): WeatherBundle {
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
  const hourly: HourlyPoint[] = (h.time as string[]).map((time, index) => ({
    time,
    temperature: Number(h.temperature_2m[index]),
    apparentTemperature: Number(h.apparent_temperature[index]),
    humidity: Number(h.relative_humidity_2m[index]),
    precipitation: Number(h.precipitation[index]),
    precipitationProbability: Number(h.precipitation_probability[index] ?? 0),
    windSpeed: Number(h.wind_speed_10m[index]),
    windGusts: Number(h.wind_gusts_10m[index] ?? 0),
    uvIndex: Number(h.uv_index[index] ?? 0),
    weatherCode: Number(h.weather_code[index]),
  }))

  const d = raw.daily
  const daily: DailyPoint[] = (d.time as string[]).map((date, index) => ({
    date,
    tempMax: Number(d.temperature_2m_max[index]),
    tempMin: Number(d.temperature_2m_min[index]),
    weatherCode: Number(d.weather_code[index]),
    precipitationSum: Number(d.precipitation_sum[index]),
    precipitationProbability: Number(d.precipitation_probability_max[index] ?? 0),
    windSpeedMax: Number(d.wind_speed_10m_max[index]),
    windGustsMax: Number(d.wind_gusts_10m_max[index] ?? 0),
    windDirectionDominant: Number(d.wind_direction_10m_dominant[index]),
    uvIndexMax: Number(d.uv_index_max[index]),
    sunrise: String(d.sunrise[index]),
    sunset: String(d.sunset[index]),
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

function normalizeAirQuality(raw: OpenMeteoAqiResponse): AirQualityBundle {
  const c = raw.current
  const h = raw.hourly
  const hourly: AirQualityHourlyPoint[] = Array.isArray(h?.time)
    ? (h.time as string[]).map((time, index) => ({
        time,
        europeanAqi: Number(h.european_aqi?.[index] ?? 0),
        pm25: Number(h.pm2_5?.[index] ?? 0),
        pm10: Number(h.pm10?.[index] ?? 0),
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
