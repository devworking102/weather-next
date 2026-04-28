import type { AirQualityBundle, WeatherBundle } from '@/features/weather/types'
import type { Earthquake } from '@/features/earthquakes/types'
import type { WeatherAlert } from '@/features/alerts/types'

// Tính toán cảnh báo dựa trên ngưỡng khoa học + dân sự cơ bản.
export function computeAlerts(
  weather: WeatherBundle | undefined,
  aqi: AirQualityBundle | undefined,
  quakes: Earthquake[] | undefined,
): WeatherAlert[] {
  const alerts: WeatherAlert[] = []
  if (weather) {
    const c = weather.current
    if (c.temperature >= 38) {
      alerts.push({
        id: 'heat-extreme',
        level: 'danger',
        icon: '🔥',
        title: 'Cảnh báo nắng nóng gay gắt',
        message: `Nhiệt độ hiện tại ${Math.round(c.temperature)}°C. Hạn chế ra ngoài trời từ 11–15h, bổ sung nước và điện giải.`,
      })
    } else if (c.temperature >= 35) {
      alerts.push({
        id: 'heat-warning',
        level: 'warning',
        icon: '☀️',
        title: 'Nắng nóng',
        message: `Nhiệt độ ${Math.round(c.temperature)}°C. Tránh hoạt động cường độ cao ngoài trời.`,
      })
    }
    if (c.temperature <= 10) {
      alerts.push({
        id: 'cold',
        level: 'warning',
        icon: '🥶',
        title: 'Rét đậm',
        message: `Nhiệt độ ${Math.round(c.temperature)}°C, cần giữ ấm, đặc biệt với người già và trẻ nhỏ.`,
      })
    }
    if (c.uvIndex >= 8) {
      alerts.push({
        id: 'uv',
        level: 'warning',
        icon: '🧴',
        title: 'Chỉ số UV cao',
        message: `UV ${Math.round(c.uvIndex)}. Bôi kem chống nắng SPF 30+, đội mũ rộng vành khi ra ngoài.`,
      })
    }
    if (c.windSpeed >= 50 || c.windGusts >= 70) {
      alerts.push({
        id: 'wind',
        level: c.windGusts >= 90 ? 'danger' : 'warning',
        icon: '💨',
        title: 'Gió mạnh',
        message: `Gió ${Math.round(c.windSpeed)} km/h, giật ${Math.round(c.windGusts)} km/h. Cẩn thận với cây lớn và vật dễ đổ.`,
      })
    }
    const rainyHours = weather.hourly
      .slice(0, 12)
      .filter((h) => h.precipitationProbability >= 70).length
    if (rainyHours >= 4) {
      alerts.push({
        id: 'rain',
        level: 'info',
        icon: '🌧️',
        title: 'Mưa kéo dài trong 12 giờ tới',
        message: `${rainyHours}/12 giờ có khả năng mưa ≥70%. Chuẩn bị áo mưa, hạn chế đi vùng ngập.`,
      })
    }
  }

  if (aqi?.current.europeanAqi != null) {
    const v = aqi.current.europeanAqi
    if (v > 100) {
      alerts.push({
        id: 'aqi-hazard',
        level: 'danger',
        icon: '☠️',
        title: 'Chất lượng không khí nguy hại',
        message: `AQI châu Âu ${Math.round(v)}. Tránh ra ngoài, đeo khẩu trang N95 nếu bắt buộc.`,
      })
    } else if (v > 80) {
      alerts.push({
        id: 'aqi-bad',
        level: 'warning',
        icon: '😷',
        title: 'Không khí rất kém',
        message: `AQI ${Math.round(v)}. Hạn chế hoạt động ngoài trời, đóng cửa sổ.`,
      })
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
        title: `Động đất M${big.magnitude.toFixed(1)} gần đây`,
        message: `${big.place}. Cách vị trí hiện tại ~${big.distanceKm.toFixed(0)} km.`,
      })
    }
  }

  return alerts
}
