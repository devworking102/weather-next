import type { AirQualityBundle, TempUnit, WeatherBundle } from '@/features/weather/types'
import { computeNextRainWindow } from '@/features/weather/utils/next-rain'
import { translations } from '@/shared/i18n/translations'
import type { Locale } from '@/shared/store/ui-store'

export interface CompanionInsight {
  tone: string
  summary: string
  recommendation: string
  outfit: string
  activity: string
  rain: string
  aqi: string
  uv: string
  comfort: string
  alertLevel: 'calm' | 'notice' | 'warning'
}

type CompanionCopy = (typeof translations)[Locale]['companion']

function tempLabel(temp: number, t: CompanionCopy) {
  if (temp >= 35) return t.veryHot
  if (temp >= 31) return t.hot
  if (temp >= 27) return t.warm
  if (temp >= 22) return t.cool
  if (temp >= 17) return t.chilly
  return t.cold
}

function hourLabel(iso: string, t: CompanionCopy) {
  const hour = new Date(iso).getHours()
  if (hour === 0) return t.midnight
  if (hour < 12) return `${hour}AM`
  if (hour === 12) return '12PM'
  return `${hour - 12}PM`
}

function rainText(weather: WeatherBundle, t: CompanionCopy) {
  const rain = computeNextRainWindow(weather.hourly, 24)
  const todayRain = Math.round(weather.daily[0]?.precipitationProbability ?? 0)

  if (rain.kind === 'window') {
    return {
      text: t.rainWindow(hourLabel(rain.startTime, t)),
      level: rain.maxProbability >= 70 ? ('warning' as const) : ('notice' as const),
    }
  }

  if (todayRain >= 45) {
    return {
      text: t.scatteredRain,
      level: 'notice' as const,
    }
  }

  return {
    text: t.lowRain,
    level: 'calm' as const,
  }
}

function aqiText(aqi: AirQualityBundle | undefined, t: CompanionCopy) {
  const value = aqi?.current?.europeanAqi
  if (value == null || !Number.isFinite(value)) {
    return t.aqiUnknown
  }

  if (value <= 40) return t.aqiGood
  if (value <= 60) return t.aqiMedium
  if (value <= 80) return t.aqiPoor
  return t.aqiBad
}

function uvText(uv: number, t: CompanionCopy) {
  if (uv >= 8) return t.uvVeryHigh
  if (uv >= 6) return t.uvHigh
  if (uv >= 3) return t.uvModerate
  return t.uvLow
}

function outfitText(temp: number, rainLine: string, windSpeed: number, t: CompanionCopy) {
  if (temp >= 34) return t.outfitHot
  if (temp <= 20) return t.outfitCold
  if (rainLine === t.rainWindow('') || rainLine === t.scatteredRain || rainLine.toLowerCase().includes('rain') || rainLine.includes('mưa')) return t.outfitRain
  if (windSpeed >= 24) return t.outfitWind
  return t.outfitNormal
}

function activityText(temp: number, hasRain: boolean, aqiBad: boolean, t: CompanionCopy) {
  if (aqiBad) {
    return t.activityIndoor
  }
  if (hasRain) {
    return t.activityRain
  }
  if (temp >= 34) return t.activityHot
  return t.activityNice
}

export function buildWeatherCompanion(
  city: string,
  weather: WeatherBundle,
  aqi?: AirQualityBundle,
  unit: TempUnit = 'celsius',
  locale: Locale = 'vi',
): CompanionInsight {
  const t = translations[locale].companion
  const current = weather.current
  const feels = Math.round(current.apparentTemperature)
  const temp = Math.round(current.temperature)
  const today = weather.daily[0]
  const tempWord = tempLabel(current.apparentTemperature, t)
  const rain = rainText(weather, t)
  const aqiLine = aqiText(aqi, t)
  const uvLine = uvText(current.uvIndex, t)
  const hasRain = rain.level !== 'calm'
  const hasBadAqi = (aqi?.current?.europeanAqi ?? 0) > 60
  const outfit = outfitText(current.apparentTemperature, rain.text, current.windSpeed, t)
  const activity = activityText(current.apparentTemperature, hasRain, hasBadAqi, t)
  const unitLabel = unit === 'fahrenheit' ? 'F' : 'C'

  const highLow = today
    ? t.tempRange(Math.round(today.tempMin), Math.round(today.tempMax), unitLabel)
    : t.feelsLike(feels, unitLabel)

  const alertLevel =
    rain.level === 'warning' || current.uvIndex >= 8 || (aqi?.current?.europeanAqi ?? 0) > 80
      ? 'warning'
      : rain.level

  return {
    tone: t.tone(city, tempWord),
    summary: `${highLow} ${rain.text}`,
    recommendation: activity,
    outfit,
    activity,
    rain: rain.text,
    aqi: aqiLine,
    uv: uvLine,
    comfort:
      current.humidity >= 82
        ? t.humidComfort
        : current.windSpeed >= 24
          ? t.windyComfort
          : t.normalComfort(feels, unitLabel, temp),
    alertLevel,
  }
}
