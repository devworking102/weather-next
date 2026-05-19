import type { CurrentWeather, DailyPoint, HourlyPoint } from '@/features/weather/types'

export function describeWeatherCode(code: number): string {
  if (code === 0) return 'trời quang'
  if ([1, 2].includes(code)) return 'ít mây'
  if (code === 3) return 'nhiều mây'
  if ([45, 48].includes(code)) return 'có sương mù'
  if ([51, 53, 55].includes(code)) return 'có mưa phùn'
  if ([61, 63, 65, 80, 81, 82].includes(code)) return 'có mưa'
  if ([95, 96, 99].includes(code)) return 'có dông'
  if ([71, 73, 75].includes(code)) return 'có tuyết'
  return 'thời tiết thay đổi'
}

export function formatTemperature(value: number): string {
  return `${Math.round(value)}°C`
}

export function formatHour(time: string): string {
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(time))
}

export function formatWeekday(time: string): string {
  return new Intl.DateTimeFormat('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(
    new Date(time),
  )
}

export function shouldCarryUmbrella(current: CurrentWeather, daily?: DailyPoint, nextHours: HourlyPoint[] = []): boolean {
  const hourlyRain = nextHours.some((hour) => hour.precipitationProbability >= 45 || hour.precipitation >= 0.5)
  return current.precipitation > 0 || (daily?.precipitationProbability ?? 0) >= 45 || hourlyRain
}

export function buildWeatherSummary(cityName: string, current: CurrentWeather, today?: DailyPoint): string {
  const condition = describeWeatherCode(current.weatherCode)
  const temp = formatTemperature(current.temperature)
  const feelsLike = formatTemperature(current.apparentTemperature)
  const rain = today?.precipitationProbability ?? 0
  const wind = Math.round(current.windSpeed)

  return `${cityName} hôm nay ${condition}, nhiệt độ khoảng ${temp}, cảm giác như ${feelsLike}. Khả năng mưa trong ngày khoảng ${Math.round(
    rain,
  )}%, gió ${wind} km/h.`
}
