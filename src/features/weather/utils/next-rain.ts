import type { HourlyPoint } from '@/features/weather/types'

/** Ngưỡng “giờ có mưa đáng kể” — chỉ dựa trên dữ liệu hourly đã có. */
function isRainyHour(h: HourlyPoint): boolean {
  return h.precipitationProbability >= 42 || h.precipitation >= 0.25
}

export type NextRainResult =
  | { kind: 'clear'; hoursScanned: number }
  | {
      kind: 'window'
      startTime: string
      endTime: string
      maxProbability: number
      maxHourlyPrecipMm: number
      /** Phút từ hiện tại đến bắt đầu khung mưa (làm tròn). */
      minutesUntilStart: number
    }

/**
 * Tìm khung mưa liên tiếp đầu tiên trong N giờ tới (theo chuỗi hourly).
 * Miễn phí, không gọi API ngoài; độ tin cậy = độ tin của mô hình dự báo nguồn.
 */
export function computeNextRainWindow(
  hourly: HourlyPoint[],
  scanHours = 48,
): NextRainResult {
  const now = Date.now()
  let i = hourly.findIndex((h) => new Date(h.time).getTime() >= now - 2 * 60 * 1000)
  if (i < 0) i = 0
  const last = Math.min(hourly.length - 1, i + scanHours - 1)

  let first = -1
  for (let j = i; j <= last; j++) {
    if (isRainyHour(hourly[j]!)) {
      first = j
      break
    }
  }
  if (first < 0) {
    return { kind: 'clear', hoursScanned: last - i + 1 }
  }

  let end = first
  for (let j = first + 1; j <= last; j++) {
    if (isRainyHour(hourly[j]!)) end = j
    else break
  }

  let maxProbability = 0
  let maxHourlyPrecipMm = 0
  for (let j = first; j <= end; j++) {
    const h = hourly[j]!
    maxProbability = Math.max(maxProbability, h.precipitationProbability)
    maxHourlyPrecipMm = Math.max(maxHourlyPrecipMm, h.precipitation)
  }

  const startMs = new Date(hourly[first]!.time).getTime()
  const minutesUntilStart = Math.max(0, Math.round((startMs - now) / 60_000))

  return {
    kind: 'window',
    startTime: hourly[first]!.time,
    endTime: hourly[end]!.time,
    maxProbability: Math.round(maxProbability),
    maxHourlyPrecipMm,
    minutesUntilStart,
  }
}
