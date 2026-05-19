import type { AirQualityBundle, TempUnit, WeatherBundle } from '@/features/weather/types'
import { computeNextRainWindow } from '@/features/weather/utils/next-rain'

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

function tempLabel(temp: number) {
  if (temp >= 35) return 'rất nóng'
  if (temp >= 31) return 'khá nóng'
  if (temp >= 27) return 'ấm và dễ chịu'
  if (temp >= 22) return 'mát'
  if (temp >= 17) return 'se lạnh'
  return 'lạnh'
}

function hourLabel(iso: string) {
  const hour = new Date(iso).getHours()
  if (hour === 0) return 'nửa đêm'
  if (hour < 12) return `${hour}AM`
  if (hour === 12) return '12PM'
  return `${hour - 12}PM`
}

function rainText(weather: WeatherBundle) {
  const rain = computeNextRainWindow(weather.hourly, 24)
  const todayRain = Math.round(weather.daily[0]?.precipitationProbability ?? 0)

  if (rain.kind === 'window') {
    return {
      text: `Có khả năng mưa khoảng ${hourLabel(rain.startTime)}. Mang ô hoặc áo mưa nhỏ nếu ra ngoài sau thời điểm này.`,
      level: rain.maxProbability >= 70 ? ('warning' as const) : ('notice' as const),
    }
  }

  if (todayRain >= 45) {
    return {
      text: 'Hôm nay vẫn có khả năng mưa rải rác. Nên chuẩn bị áo mưa gọn nhẹ.',
      level: 'notice' as const,
    }
  }

  return {
    text: 'Khả năng mưa thấp trong vài giờ tới. Có thể ra ngoài thoải mái hơn.',
    level: 'calm' as const,
  }
}

function aqiText(aqi?: AirQualityBundle) {
  const value = aqi?.current?.europeanAqi
  if (value == null || !Number.isFinite(value)) {
    return 'Chưa có dữ liệu không khí, nên quan sát thực tế nếu trời mù hoặc có mùi khói.'
  }

  if (value <= 40) return 'Không khí ổn cho sinh hoạt thường ngày.'
  if (value <= 60) return 'Không khí trung bình. Người nhạy cảm nên giảm vận động mạnh ngoài trời.'
  if (value <= 80) return 'Không khí kém. Nên đeo khẩu trang nếu đi lâu ngoài đường.'
  return 'Không khí xấu. Hạn chế ra ngoài lâu và ưu tiên không gian trong nhà.'
}

function uvText(uv: number) {
  if (uv >= 8) return 'UV rất cao, tránh nắng trưa và dùng kem chống nắng.'
  if (uv >= 6) return 'UV cao, nên đội nón và hạn chế ở ngoài trời buổi trưa.'
  if (uv >= 3) return 'UV vừa phải, vẫn nên che nắng nếu đi lâu.'
  return 'UV thấp, dễ chịu hơn cho hoạt động ngoài trời.'
}

function outfitText(temp: number, rainLine: string, windSpeed: number) {
  if (temp >= 34) return 'Áo thun thoáng, quần nhẹ và nước uống là ưu tiên.'
  if (temp <= 20) return 'Áo khoác mỏng sẽ hợp lý, nhất là sáng sớm hoặc tối.'
  if (rainLine.includes('mưa')) return 'Áo thun hoặc sơ mi nhẹ, kèm ô nhỏ hoặc áo mưa gấp gọn.'
  if (windSpeed >= 24) return 'Trang phục gọn, thêm áo khoác mỏng nếu đi xe máy.'
  return 'Áo thun hoặc sơ mi nhẹ là đủ thoải mái hôm nay.'
}

function activityText(temp: number, rainLine: string, aqiLine: string) {
  if (aqiLine.includes('xấu') || aqiLine.includes('kém')) {
    return 'Hợp với cafe trong nhà, làm việc nhẹ hoặc đi siêu thị ngắn.'
  }
  if (rainLine.includes('mưa')) {
    return 'Nên chọn cafe trong nhà, lịch hẹn gần nhà hoặc mang đồ chống mưa.'
  }
  if (temp >= 34) return 'Nên ra ngoài sáng sớm hoặc sau hoàng hôn, tránh đi bộ giữa trưa.'
  return 'Thời tiết hợp để đi dạo, cafe ngoài trời hoặc chạy việc ngắn.'
}

export function buildWeatherCompanion(
  city: string,
  weather: WeatherBundle,
  aqi?: AirQualityBundle,
  unit: TempUnit = 'celsius',
): CompanionInsight {
  const current = weather.current
  const feels = Math.round(current.apparentTemperature)
  const temp = Math.round(current.temperature)
  const today = weather.daily[0]
  const tempWord = tempLabel(current.apparentTemperature)
  const rain = rainText(weather)
  const aqiLine = aqiText(aqi)
  const uvLine = uvText(current.uvIndex)
  const outfit = outfitText(current.apparentTemperature, rain.text, current.windSpeed)
  const activity = activityText(current.apparentTemperature, rain.text, aqiLine)
  const unitLabel = unit === 'fahrenheit' ? 'F' : 'C'

  const highLow = today
    ? `Nhiệt độ dao động khoảng ${Math.round(today.tempMin)}-${Math.round(today.tempMax)}°${unitLabel}.`
    : `Cảm giác ngoài trời khoảng ${feels}°${unitLabel}.`

  const alertLevel =
    rain.level === 'warning' || current.uvIndex >= 8 || (aqi?.current?.europeanAqi ?? 0) > 80
      ? 'warning'
      : rain.level

  return {
    tone: `${city} hôm nay ${tempWord}.`,
    summary: `${highLow} ${rain.text}`,
    recommendation: activity,
    outfit,
    activity,
    rain: rain.text,
    aqi: aqiLine,
    uv: uvLine,
    comfort:
      current.humidity >= 82
        ? 'Không khí khá ẩm, dễ thấy oi hoặc bí nếu di chuyển lâu.'
        : current.windSpeed >= 24
          ? 'Có gió rõ, cảm giác ngoài trời sẽ mát hơn nhiệt độ hiển thị.'
          : `Cảm giác thực tế khoảng ${feels}°${unitLabel}, khá gần với nhiệt độ ${temp}°${unitLabel}.`,
    alertLevel,
  }
}
