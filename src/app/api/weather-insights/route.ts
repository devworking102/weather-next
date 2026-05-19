import { NextRequest, NextResponse } from 'next/server'
import { aiGenerate, parseGeminiJson } from '@/shared/lib/ai'
import type { AiSource } from '@/shared/lib/ai'
import { wmoInfo } from '@/features/weather/utils/wmo'

export interface WeatherInsightsRequest {
  locationName: string
  country?: string
  admin1?: string
  temperature: number
  apparentTemperature?: number
  weatherCode: number
  humidity: number
  windSpeed: number
  uvIndex: number
  europeanAqi?: number
  pm25?: number
  locale?: 'vi' | 'en'
}

export interface WeatherInsightsResponse {
  summary: string
  outfit: string
  health: string
  travel: string
  mood: string
  /** Ngắn gọn khi có dông, bão, mưa lớn — chuỗi rỗng nếu trời ổn định */
  severe: string
  source: AiSource | 'fallback'
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as WeatherInsightsRequest
  const fallback = buildFallback(body)

  const lang = body.locale === 'en' ? 'English' : 'Vietnamese'
  const loc = [body.locationName, body.admin1, body.country].filter(Boolean).join(', ')
  const wmo = wmoInfo(body.weatherCode)
  const aqi = body.europeanAqi != null ? Math.round(body.europeanAqi) : null
  const pm = body.pm25 != null ? Math.round(body.pm25) : null

  const prompt = `You are a concise weather coach for people in ${loc}.
Current: ${Math.round(body.temperature)}°C (feels ${body.apparentTemperature != null ? Math.round(body.apparentTemperature) : 'n/a'}°C), WMO code ${body.weatherCode} (${wmo.label}), humidity ${Math.round(body.humidity)}%, wind ${Math.round(body.windSpeed)} km/h, UV ${Number(body.uvIndex).toFixed(1)}.
${aqi != null ? `EU AQI ~${aqi}` : 'AQI unknown'}. ${pm != null ? `PM2.5 ~${pm} µg/m³.` : ''}

Return ONLY JSON (no markdown) with keys: summary, outfit, health, travel, mood, severe.
Rules:
- All human text must be in ${lang}, concise but information-rich for mobile.
- Each field should give 2 useful details when natural; do not just restate the same number in different words.
- summary: 2 sentences. Lead with the most important condition for the next hours, then add the second-priority factor (rain/heat/cold/AQI/wind/UV).
- outfit: 1-2 sentences with clothing, footwear, and one carry item such as umbrella, raincoat, sunscreen, mask, water bottle, or light jacket.
- health: 2 sentences combining AQI, UV, humidity, heat/cold, and who should be more careful (children, elderly, asthma, outdoor workers) when relevant.
- travel: 2 sentences with commute timing, motorbike/walking/public transport advice, and whether outdoor plans should move earlier/later/indoors.
- mood: one memorable emotional line about the day/sky. If Vietnamese: friendly, lightly witty, grounded in daily life, not cheesy, toxic, political, or religious.
- severe: if thunderstorms (code>=95), heavy rain (>=82), snow storms, extreme heat/cold, very high UV, or poor AQI, write 1-2 practical warning sentences and say to follow official alerts when severe; else "" (empty string).
`

  const result = await aiGenerate(prompt, {
    temperature: 0.55,
    maxOutputTokens: 760,
    json: true,
  })

  if (result) {
    const parsed = parseGeminiJson<Omit<WeatherInsightsResponse, 'source'>>(result.text)
    if (
      parsed &&
      typeof parsed.summary === 'string' &&
      typeof parsed.outfit === 'string' &&
      typeof parsed.health === 'string' &&
      typeof parsed.travel === 'string' &&
      typeof parsed.mood === 'string' &&
      typeof parsed.severe === 'string'
    ) {
      return NextResponse.json({
        ...parsed,
        source: result.source,
      } satisfies WeatherInsightsResponse)
    }
  }

  return NextResponse.json(fallback)
}

function buildFallback(b: WeatherInsightsRequest): WeatherInsightsResponse {
  const wmo = wmoInfo(b.weatherCode)
  const t = Math.round(b.temperature)
  const aqi = b.europeanAqi != null ? Math.round(b.europeanAqi) : null
  const uv = Number(b.uvIndex)
  const code = b.weatherCode
  const storm = code >= 95 || code === 96 || code === 99
  const heavyRain = code >= 82 && code <= 86
  const severe =
    storm || heavyRain
      ? 'Có thể có sấm sét hoặc mưa lớn. Tránh cây cao, mái tôn lỏng; làm theo cảnh báo chính thức của địa phương.'
      : t >= 36
        ? 'Nắng nóng gay gắt: uống nước thường xuyên, hạn chế ra ngoài giữa trưa.'
        : t <= 12
          ? 'Trời khá lạnh: giữ ấm cổ tay và cổ; cẩn thận khi lái xe sương mù.'
          : ''

  let health = `Độ ẩm ${Math.round(b.humidity)}%, UV khoảng ${uv.toFixed(1)}.`
  if (aqi != null) {
    if (aqi > 100) health = `AQI EU ~${aqi} khá cao — hạn chế gắng sức ngoài trời; đeo khẩu trang khi cần. UV ${uv.toFixed(1)}.`
    else if (aqi > 50) health = `AQI EU ~${aqi} trung bình — nhóm nhạy cảm nên thận trọng. UV ${uv.toFixed(1)}.`
    else health = `AQI EU ~${aqi} tốt. UV ${uv.toFixed(1)} — ${uv >= 7 ? 'dùng kem chống nắng.' : 'có thể tắm nắng ngắn.'}`
  }

  const outfit =
    (code >= 51 && code <= 67) || (code >= 80 && code <= 82)
      ? 'Áo mưa gọn, dép chống trơn, túi chống nước cho điện thoại.'
      : t >= 30
        ? 'Vải thoáng (cotton/linen), mũ rộng vành, kính râm.'
        : t <= 20
          ? 'Áo khoác gió, khăn mỏng; lớp giữ nhiệt nếu ra đêm.'
          : 'Trang phục layer mỏng để dễ điều chỉnh theo nắng/gió.'

  const travel =
    (code >= 51 && code <= 67) || (code >= 80 && code <= 82)
      ? 'Ưu tiên phương tiện công cộng hoặc lái chậm khi mưa; tránh ngập nếu có cảnh báo.'
      : t >= 32
        ? 'Nên dời chạy bộ sang sớm/tối; đi bộ trong bóng râm khi có thể.'
        : 'Thời tiết thuận cho đi làm và dạo phố; kiểm tra radar nếu đi xa.'

  const mood =
    t >= 34
      ? 'Trời oi bức — nhớ uống nước và tìm bóng râm khi ra đường.'
      : t <= 16
        ? 'Không khí se se — hợp một ly nóng và nhịp chậm.'
        : wmo.label.includes('Mưa') || wmo.label.includes('mưa')
          ? 'Mưa rào ngoài kia — cứ để nhịp thành phố chậm lại một chút.'
          : wmo.label.includes('Nắng') || code <= 1
            ? 'Nắng dịu — kiểu ngày dễ chịu để thở sâu.'
            : 'Mây lửng lờ — tâm trạng cũng theo mà thảnh thơi.'

  const summaryLead =
    aqi != null && aqi > 100
      ? `Chất lượng không khí đang kém tại ${b.locationName}; ưu tiên sức khỏe khi ra ngoài.`
      : storm || heavyRain
        ? `${b.locationName}: thời tiết có thể “ồn ào” vài tiếng tới — theo dõi cảnh báo địa phương.`
        : `Hôm nay tại ${b.locationName}: ${t}°C, ${wmo.label}. Gió ${Math.round(b.windSpeed)} km/h.`

  return {
    summary: summaryLead,
    outfit,
    health,
    travel,
    mood,
    severe,
    source: 'fallback',
  }
}
