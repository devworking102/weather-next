import type { DailyPoint, HourlyPoint } from '@/features/weather/types'
import { wmoInfo } from '@/features/weather/utils/wmo'

/** Gợi ý khung giờ mưa / mưa nhẹ trong ~24–36h tới (chuỗi ngắn cho prompt AI). */
export function buildHourlyRainDigest(
  hourly: HourlyPoint[],
  timeZone: string,
  locale: string,
): string {
  const now = Date.now()
  const start = Math.max(0, hourly.findIndex((h) => new Date(h.time).getTime() >= now))
  const end = Math.min(hourly.length, start + 36)
  const parts: string[] = []
  for (let i = start; i < end; i++) {
    const h = hourly[i]!
    if (h.precipitationProbability < 30 && h.precipitation < 0.2) continue
    const label = new Date(h.time).toLocaleTimeString(locale === 'en' ? 'en-GB' : 'vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone,
    })
    const mm = h.precipitation >= 0.05 ? `~${h.precipitation.toFixed(1)}mm` : ''
    parts.push(`${label} ${Math.round(h.precipitationProbability)}%${mm ? ` ${mm}` : ''}`)
    if (parts.length >= 14) break
  }
  if (parts.length === 0) {
    return locale === 'en'
      ? 'Next ~36h: no notable rain in the hourly model.'
      : '~36h tới: mô hình giờ không thấy mưa đáng kể.'
  }
  return parts.join('; ')
}

/** Vài ngày tới: nhiệt độ + khả năng mưa + nhãn WMO (ngắn). */
export function buildDailyOutlookDigest(
  daily: DailyPoint[],
  timeZone: string,
  locale: string,
  maxDays = 5,
): string {
  const slice = daily.slice(0, maxDays)
  if (slice.length === 0) return ''
  return slice
    .map((d) => {
      const dayLabel = new Date(d.date).toLocaleDateString(locale === 'en' ? 'en-GB' : 'vi-VN', {
        weekday: 'short',
        day: 'numeric',
        month: 'numeric',
        timeZone,
      })
      const label = wmoInfo(d.weatherCode).label
      return `${dayLabel}: ${Math.round(d.tempMax)}°/${Math.round(d.tempMin)}°, mưa ~${Math.round(d.precipitationProbability)}%, ${label}`
    })
    .join(' | ')
}

export function digestFingerprint(hourly: string, daily: string): string {
  const s = `${hourly}|${daily}`
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(36)
}
