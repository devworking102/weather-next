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

function getRating(value: number, thresholds: [number, number, number, number]): HealthRating {
  const levels = ['Rất tốt', 'Tốt', 'Trung bình', 'Kém', 'Rất kém']
  const colors = ['#22c55e', '#84cc16', '#facc15', '#f97316', '#ef4444']
  const idx = value <= thresholds[0] ? 0 : value <= thresholds[1] ? 1 : value <= thresholds[2] ? 2 : value <= thresholds[3] ? 3 : 4
  return { value: 5 - idx, level: levels[idx]!, color: colors[idx]! }
}

export function computeHealthIndices(
  weather?: WeatherBundle,
  aqi?: AirQualityBundle,
): HealthIndex[] {
  if (!weather) return []
  const today = {
    tempMax: weather.daily[0]?.tempMax ?? weather.current.temperature,
    precipProb: weather.daily[0]?.precipitationProbability ?? 0,
    wind: weather.daily[0]?.windSpeedMax ?? weather.current.windSpeed,
    humidity: weather.current.humidity,
    cloudCover: weather.current.cloudCover,
    aqi: aqi?.current.europeanAqi ?? 0,
  }

  const levelsA = ['Rất kém', 'Kém', 'Trung bình', 'Tốt', 'Rất tốt']
  const colorsA = ['#ef4444', '#f97316', '#facc15', '#84cc16', '#22c55e']

  const runningScore = (() => {
    let score = 5
    if (today.precipProb > 30) score--
    if (today.precipProb > 60) score--
    if (today.tempMax > 33 || today.tempMax < 15) score--
    if (today.wind > 25) score--
    if (today.aqi > 60) score--
    if (today.aqi > 80) score--
    const final = Math.max(1, score)
    return { value: final, level: levelsA[final - 1]!, color: colorsA[final - 1]! }
  })()

  const pestRisk = (() => {
    let risk = 1
    if (today.tempMax > 22 && today.tempMax < 32) risk++
    if (today.humidity > 70) risk++
    if (today.precipProb < 30) risk++
    const final = Math.min(5, risk)
    const levelsR = ['Rất thấp', 'Thấp', 'Trung bình', 'Cao', 'Rất cao']
    const colorsR = ['#22c55e', '#84cc16', '#facc15', '#f97316', '#ef4444']
    return { value: final, level: levelsR[final - 1]!, color: colorsR[final - 1]! }
  })()

  return [
    {
      id: 'running',
      title: 'Chạy bộ',
      icon: '🏃',
      rating: runningScore,
      message: 'Nhiệt độ, gió và chất lượng không khí đều ảnh hưởng đến việc chạy bộ.',
    },
    {
      id: 'stargazing',
      title: 'Ngắm sao',
      icon: '🔭',
      rating: getRating(today.cloudCover, [15, 40, 70, 90]),
      message: 'Bầu trời quang đãng, ít mây là điều kiện tiên quyết để ngắm sao.',
    },
    {
      id: 'lawn',
      title: 'Làm vườn',
      icon: '🌱',
      rating: getRating(today.precipProb, [15, 30, 50, 75]),
      message: 'Trời khô ráo là tốt nhất để làm vườn và cắt cỏ.',
    },
    {
      id: 'sinus',
      title: 'Viêm xoang',
      icon: '🤧',
      rating: getRating(today.humidity, [60, 75, 85, 95]),
      message: 'Độ ẩm cao có thể làm trầm trọng triệu chứng viêm xoang.',
    },
    {
      id: 'asthma',
      title: 'Hen suyễn',
      icon: '😮‍💨',
      rating: getRating(today.aqi, [20, 40, 60, 80]),
      message: 'Chất lượng không khí ảnh hưởng trực tiếp người bị hen suyễn.',
    },
    {
      id: 'arthritis',
      title: 'Đau khớp',
      icon: '🦴',
      rating: getRating(today.humidity, [65, 80, 90, 95]),
      message: 'Độ ẩm cao và thay đổi áp suất có thể gây đau khớp.',
    },
    {
      id: 'pests',
      title: 'Côn trùng',
      icon: '🦟',
      rating: pestRisk,
      message: 'Côn trùng hoạt động mạnh khi trời ấm và ẩm.',
    },
  ]
}
