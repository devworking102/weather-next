import { translations, type Locale } from '@/shared/i18n/translations'
import type { AirQualityBundle, WeatherBundle } from '@/features/weather/types'
import type { Earthquake } from '@/features/earthquakes/types'
import type { WeatherAlert } from '@/features/alerts/types'

export function computeAlerts(
  weather: WeatherBundle | undefined,
  aqi: AirQualityBundle | undefined,
  quakes: Earthquake[] | undefined,
  locale: Locale = 'vi',
): WeatherAlert[] {
  const alerts: WeatherAlert[] = []
  const a = translations[locale].alertsData

  if (weather) {
    const c = weather.current
    if (c.temperature >= 38) {
      alerts.push({ id: 'heat-extreme', level: 'danger', icon: '🔥', title: a.heatExtreme.title, message: a.heatExtreme.message(Math.round(c.temperature)) })
    } else if (c.temperature >= 35) {
      alerts.push({ id: 'heat-warning', level: 'warning', icon: '☀️', title: a.heatWarning.title, message: a.heatWarning.message(Math.round(c.temperature)) })
    }
    if (c.temperature <= 10) {
      alerts.push({ id: 'cold', level: 'warning', icon: '🥶', title: a.cold.title, message: a.cold.message(Math.round(c.temperature)) })
    }
    if (c.uvIndex >= 8) {
      alerts.push({ id: 'uv', level: 'warning', icon: '🧴', title: a.uv.title, message: a.uv.message(Math.round(c.uvIndex)) })
    }
    if (c.windSpeed >= 50 || c.windGusts >= 70) {
      alerts.push({ id: 'wind', level: c.windGusts >= 90 ? 'danger' : 'warning', icon: '💨', title: a.wind.title, message: a.wind.message(Math.round(c.windSpeed), Math.round(c.windGusts)) })
    }
    const rainyHours = weather.hourly.slice(0, 12).filter((h) => h.precipitationProbability >= 70).length
    if (rainyHours >= 4) {
      alerts.push({ id: 'rain', level: 'info', icon: '🌧️', title: a.rain.title, message: a.rain.message(rainyHours) })
    }
  }

  if (aqi?.current.europeanAqi != null) {
    const v = aqi.current.europeanAqi
    if (v > 100) {
      alerts.push({ id: 'aqi-hazard', level: 'danger', icon: '☠️', title: a.aqiHazard.title, message: a.aqiHazard.message(Math.round(v)) })
    } else if (v > 80) {
      alerts.push({ id: 'aqi-bad', level: 'warning', icon: '😷', title: a.aqiBad.title, message: a.aqiBad.message(Math.round(v)) })
    }
  }

  if (quakes?.length) {
    const recent = quakes.filter((q) => Date.now() - q.time < 24 * 3600 * 1000)
    const big = recent.find((q) => q.magnitude >= 5.5)
    if (big) {
      alerts.push({
        id: `quake-${big.id}`,
        level: big.magnitude >= 6.5 ? 'danger' : 'warning',
        icon: big.tsunami ? '🌊' : '⚠️',
        title: a.quake.title(big.magnitude.toFixed(1)),
        message: a.quake.message(big.place, big.distanceKm.toFixed(0)),
      })
    }
  }

  return alerts
}
