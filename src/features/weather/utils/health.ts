import { translations, type Locale } from '@/shared/i18n/translations'
import type { AirQualityBundle, WeatherBundle } from '@/features/weather/types'

export interface HealthRating {
  value: number
  level: string
  color: string
}

export interface HealthIndex {
  id: string
  title: string
  icon: string
  rating: HealthRating
  message: string
}

function getRating(
  value: number,
  thresholds: [number, number, number, number],
  levels: readonly [string, string, string, string, string],
): HealthRating {
  const colors = ['#22c55e', '#84cc16', '#facc15', '#f97316', '#ef4444'] as const
  const idx = value <= thresholds[0] ? 0 : value <= thresholds[1] ? 1 : value <= thresholds[2] ? 2 : value <= thresholds[3] ? 3 : 4
  return { value: 5 - idx, level: levels[idx]!, color: colors[idx]! }
}

export function computeHealthIndices(
  weather?: WeatherBundle,
  aqi?: AirQualityBundle,
  locale: Locale = 'vi',
): HealthIndex[] {
  if (!weather) return []
  const t = translations[locale]
  const lv = t.healthLevels
  const hi = t.healthIndices

  const today = {
    tempMax:    weather.daily[0]?.tempMax ?? weather.current.temperature,
    precipProb: weather.daily[0]?.precipitationProbability ?? 0,
    wind:       weather.daily[0]?.windSpeedMax ?? weather.current.windSpeed,
    humidity:   weather.current.humidity,
    cloudCover: weather.current.cloudCover,
    aqi:        aqi?.current.europeanAqi ?? 0,
  }

  const goodBad5 = [lv.veryGood, lv.good, lv.moderate, lv.poor, lv.veryPoor] as const
  const badGood5 = [lv.veryPoor, lv.poor, lv.moderate, lv.good, lv.veryGood] as const

  const runningScore = (() => {
    let score = 5
    if (today.precipProb > 30) score--
    if (today.precipProb > 60) score--
    if (today.tempMax > 33 || today.tempMax < 15) score--
    if (today.wind > 25) score--
    if (today.aqi > 60) score--
    if (today.aqi > 80) score--
    const final = Math.max(1, score)
    return { value: final, level: badGood5[5 - final]!, color: ['#ef4444','#f97316','#facc15','#84cc16','#22c55e'][final - 1]! }
  })()

  const pestRisk = (() => {
    let risk = 1
    if (today.tempMax > 22 && today.tempMax < 32) risk++
    if (today.humidity > 70) risk++
    if (today.precipProb < 30) risk++
    const final = Math.min(5, risk)
    const pestLevels = [lv.veryLow, lv.low, lv.moderate, lv.high, lv.veryHigh] as const
    const colors = ['#22c55e', '#84cc16', '#facc15', '#f97316', '#ef4444'] as const
    return { value: final, level: pestLevels[final - 1]!, color: colors[final - 1]! }
  })()

  return [
    { id: 'running',    icon: '🏃', rating: runningScore,                                         title: hi.running.title,    message: hi.running.message },
    { id: 'stargazing', icon: '🔭', rating: getRating(today.cloudCover,  [15, 40, 70, 90],  goodBad5), title: hi.stargazing.title, message: hi.stargazing.message },
    { id: 'lawn',       icon: '🌱', rating: getRating(today.precipProb,  [15, 30, 50, 75],  goodBad5), title: hi.lawn.title,       message: hi.lawn.message },
    { id: 'sinus',      icon: '🤧', rating: getRating(today.humidity,    [60, 75, 85, 95],  goodBad5), title: hi.sinus.title,      message: hi.sinus.message },
    { id: 'asthma',     icon: '😮‍💨', rating: getRating(today.aqi,        [20, 40, 60, 80],  goodBad5), title: hi.asthma.title,     message: hi.asthma.message },
    { id: 'arthritis',  icon: '🦴', rating: getRating(today.humidity,    [65, 80, 90, 95],  goodBad5), title: hi.arthritis.title,  message: hi.arthritis.message },
    { id: 'pests',      icon: '🦟', rating: pestRisk,                                              title: hi.pests.title,      message: hi.pests.message },
  ]
}
