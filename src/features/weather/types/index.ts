// Normalized weather shape — app chỉ làm việc với type này, không đụng raw Open-Meteo.
export interface CurrentWeather {
  time: string
  temperature: number
  apparentTemperature: number
  humidity: number
  precipitation: number
  windSpeed: number
  windGusts: number
  windDirection: number
  pressure: number
  cloudCover: number
  dewPoint: number
  visibility: number
  uvIndex: number
  weatherCode: number
  isDay: boolean
}

export interface HourlyPoint {
  time: string
  temperature: number
  apparentTemperature: number
  humidity: number
  precipitation: number
  precipitationProbability: number
  windSpeed: number
  windGusts: number
  uvIndex: number
  weatherCode: number
}

export interface DailyPoint {
  date: string
  tempMax: number
  tempMin: number
  weatherCode: number
  precipitationSum: number
  precipitationProbability: number
  windSpeedMax: number
  windGustsMax: number
  windDirectionDominant: number
  uvIndexMax: number
  sunrise: string
  sunset: string
}

export interface WeatherBundle {
  current: CurrentWeather
  hourly: HourlyPoint[]
  daily: DailyPoint[]
  timezone: string
  latitude: number
  longitude: number
}

export type ApiResponse<T> =
  | {
      ok: true
      data: T
    }
  | {
      ok: false
      error: {
        code: string
        message: string
      }
    }

export interface AirQualityCurrent {
  europeanAqi: number
  usAqi: number
  pm10: number
  pm25: number
  co: number
  no2: number
  ozone: number
}

export interface AirQualityHourlyPoint {
  time: string
  europeanAqi: number
  pm25: number
  pm10: number
}

export interface AirQualityBundle {
  current: AirQualityCurrent
  hourly: AirQualityHourlyPoint[]
}

export type TempUnit = 'celsius' | 'fahrenheit'
