import { NextRequest, NextResponse } from 'next/server'
import { aiGenerate, parseGeminiJson } from '@/shared/lib/ai'
import type { AiSource } from '@/shared/lib/ai'
import { hasOnlySupportedLanguageText } from '@/shared/lib/language-guard'
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
  const localeRule =
    body.locale === 'en'
      ? 'Write only in English. Do not include Chinese, Japanese, Korean, or any other language.'
      : 'Write only in Vietnamese. Do not include Chinese, Japanese, Korean, English phrases, or any other language.'
  const loc = [body.locationName, body.admin1, body.country].filter(Boolean).join(', ')
  const wmo = wmoInfo(body.weatherCode)
  const aqi = body.europeanAqi != null ? Math.round(body.europeanAqi) : null
  const pm = body.pm25 != null ? Math.round(body.pm25) : null

  const prompt = `You are a concise local weather assistant for everyday people in ${loc}.
Current: ${Math.round(body.temperature)}°C (feels ${body.apparentTemperature != null ? Math.round(body.apparentTemperature) : 'n/a'}°C), WMO code ${body.weatherCode} (${wmo.label}), humidity ${Math.round(body.humidity)}%, wind ${Math.round(body.windSpeed)} km/h, UV ${Number(body.uvIndex).toFixed(1)}.
${aqi != null ? `EU AQI ~${aqi}` : 'AQI unknown'}. ${pm != null ? `PM2.5 ~${pm} µg/m³.` : ''}

Return ONLY JSON (no markdown) with keys: summary, outfit, health, travel, mood, severe.
Rules:
- All human text must be in ${lang}, concise but information-rich for mobile.
- ${localeRule}
- Never call yourself AI, a model, a bot, or a system. If identity is needed, use only "trợ lý" in Vietnamese or "assistant" in English.
- Never mention API, tool, model, provider, raw data, dataset, WMO code, or confidence score in the returned fields.
- Translate raw metrics into plain-life meaning. Users care about rain, heat, umbrella, clothing, AQI health, and whether plans should move indoors.
- Each field should give 2 useful details when natural; do not just restate the same number in different words.
- summary: 2 sentences. Lead with the most important condition for the next hours, then add the second-priority factor (rain/heat/cold/AQI/wind/UV).
- outfit: 1-2 sentences with clothing, footwear, and one carry item such as umbrella, raincoat, sunscreen, mask, water bottle, or light jacket.
- health: 2 sentences combining AQI, UV, humidity, heat/cold, and who should be more careful (children, elderly, asthma, outdoor workers) when relevant.
- travel: 2 sentences with commute timing, motorbike/walking/public transport advice, and whether outdoor plans should move earlier/later/indoors. Use natural phrases like "mua vài món cần thiết gần nhà", "ghé quán gần nhà", or "xử lý vài việc gần nhà"; avoid stiff shopping/errand wording.
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
      typeof parsed.severe === 'string' &&
      hasOnlySupportedLanguageText(parsed.summary, parsed.outfit, parsed.health, parsed.travel, parsed.mood, parsed.severe)
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

  let health = b.humidity >= 80
    ? 'Không khí khá ẩm nên dễ thấy oi và mệt nhanh hơn. Ra ngoài lâu thì nhớ uống nước, nghỉ trong bóng râm và mặc đồ thoáng.'
    : 'Thời tiết nhìn chung không quá nặng cho sức khỏe. Nếu ra ngoài lâu, vẫn nên uống nước và che nắng vừa đủ.'
  if (aqi != null) {
    if (aqi > 100) health = 'Không khí hôm nay khá kém, người nhạy cảm nên giảm thời gian ngoài trời. Nếu phải đi đường lâu, nên đeo khẩu trang tốt và tránh vận động mạnh.'
    else if (aqi > 50) health = 'Không khí ở mức cần để ý, nhất là với trẻ em, người lớn tuổi hoặc người dễ dị ứng. Hoạt động nhẹ vẫn ổn, nhưng nên tránh tập nặng ngoài trời.'
    else health = uv >= 7
      ? 'Không khí khá ổn, nhưng nắng dễ gắt vào buổi trưa. Nhớ bôi kem chống nắng, đội mũ và chọn bóng râm khi có thể.'
      : 'Không khí khá ổn cho sinh hoạt thường ngày. Bạn có thể ra ngoài thoải mái, chỉ cần giữ nước và che nắng cơ bản.'
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
        : t >= 32
          ? `${b.locationName} hôm nay khá nóng, nên ưu tiên việc ngoài trời vào sáng sớm hoặc chiều muộn.`
          : `${b.locationName} hôm nay ${wmo.label.toLowerCase()}, nhìn chung phù hợp cho đi làm, cafe hoặc vài việc gần nhà.`

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
