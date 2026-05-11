import { NextRequest, NextResponse } from 'next/server'
import { aiGenerate } from '@/shared/lib/ai'
import { wmoInfo } from '@/features/weather/utils/wmo'

interface Payload {
  locationName: string
  country?: string
  temperature: number
  apparentTemperature: number
  weatherCode: number
  humidity: number
  windSpeed: number
  uvIndex?: number
  locale?: string
  /** Chuỗi gợi ý giờ có mưa / xác suất (từ client, đã rút gọn). */
  hourlyForecastDigest?: string
  /** Vài ngày tới: nhiệt độ + mưa + tình trạng. */
  dailyOutlookDigest?: string
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Payload
  const lang = body.locale === 'en' ? 'English' : 'tiếng Việt'
  const hourly = (body.hourlyForecastDigest ?? '').trim() || (lang === 'English' ? 'n/a' : 'không có')
  const daily = (body.dailyOutlookDigest ?? '').trim() || (lang === 'English' ? 'n/a' : 'không có')
  const uv =
    typeof body.uvIndex === 'number' && Number.isFinite(body.uvIndex)
      ? Math.round(body.uvIndex)
      : null

  const prompt = `You are a practical, warm local weather companion — not a meteorologist.
Write exactly 2–3 short sentences in ${lang}. Total length: under 60 words.

Tone rules:
- Sound like a thoughtful friend texting before someone leaves home, NOT a weather report.
- Lead with ONE specific, immediately actionable tip (what to bring, wear, avoid, or time).
- If rain is predicted, mention the approximate window and suggest gear or timing. Do NOT invent hours not in the digest.
- If UV ≥7 or humidity ≥75%, add a brief comfort/health nudge.
- If the weekly outlook has a notably nice or wet pattern, mention it in one short phrase.
- For Vietnam context: think motorbike commuters, outdoor vendors, schoolchildren walking — practical, grounded advice.

Bad (never write like this):
- "Độ ẩm hiện tại là 82%." (data-report style)
- "Chỉ số UV là 7." (jargon)
- "Có 60% khả năng mưa." (robotic probability)

Good (write like this):
- "Chiều nay nhiều khả năng mưa rào, nếu đi về sau 17h nên mang áo mưa."
- "Hôm nay nắng gắt và UV cao, nhớ che nắng kỹ nếu ra ngoài từ 10 giờ."
- "Trời oi bức, uống nhiều nước và hạn chế đứng ngoài nắng lâu."

Weather facts:
Location: ${body.locationName}${body.country ? ', ' + body.country : ''}
Now: ${Math.round(body.temperature)}°C, feels ${Math.round(body.apparentTemperature)}°C · ${wmoInfo(body.weatherCode).label}
Humidity: ${Math.round(body.humidity)}%  Wind: ${Math.round(body.windSpeed)} km/h${uv != null ? `  UV: ${uv}` : ''}

Hourly rain digest: ${hourly}
Multi-day outlook: ${daily}

Rules: plain text only, no markdown, no bullets. Stay under 60 words. Do not parrot back the numbers — convert them to human insight.`

  const result = await aiGenerate(prompt, { temperature: 0.55, maxOutputTokens: 380 })
  if (result) {
    return NextResponse.json({ summary: result.text, source: result.source })
  }
  return NextResponse.json({ summary: buildHeuristicSummary(body), source: 'heuristic' })
}

function buildHeuristicSummary(b: Payload): string {
  const info = wmoInfo(b.weatherCode)
  const t = Math.round(b.temperature)
  const feel = Math.round(b.apparentTemperature)
  const diff = feel - t
  const en = b.locale === 'en'
  const hum = Math.round(b.humidity)
  const uv = typeof b.uvIndex === 'number' && Number.isFinite(b.uvIndex) ? Math.round(b.uvIndex) : null
  const hourly = (b.hourlyForecastDigest ?? '').trim()
  const hasRain = hourly && !hourly.toLowerCase().includes('no notable rain') && !hourly.includes('không thấy mưa')

  if (en) {
    const attire = t >= 30 ? 'Wear light clothing and keep water handy.'
      : t >= 24 ? 'Comfortable weather — light layers work well.'
      : t <= 18 ? 'Bring a jacket if you\'re heading out.'
      : 'Mild conditions — dress comfortably.'
    const heatNote = diff >= 3 ? ` It feels about ${diff}° warmer than the reading.` : diff <= -3 ? ` Feels cooler by ~${Math.abs(diff)}° — light jacket helps.` : ''
    const rainNote = hasRain ? ' Rain is likely in the next few hours — carry a compact umbrella.' : ''
    const uvNote = uv != null && uv >= 7 ? ' UV is high; sunscreen and shade are your friends.' : ''
    const humNote = hum >= 78 ? ' Air is muggy — hydrate well and pace outdoor activities.' : ''
    return `${info.label} in ${b.locationName}. ${attire}${heatNote}${rainNote}${uvNote}${humNote}`.trim()
  }

  // Vietnamese lifestyle-first fallback
  const rain = hasRain
    ? ' Trong vài giờ tới có khả năng mưa — mang áo mưa nếu ra đường lâu.'
    : ''
  const heat = t >= 32
    ? ' Trời nắng nóng, uống nhiều nước và hạn chế đứng ngoài nắng.'
    : t >= 28
      ? diff >= 3 ? ' Trời oi, cảm giác nóng hơn thực tế — chọn đồ thoáng mát.' : ' Thời tiết ấm, mặc thoáng là ổn.'
      : t <= 20
        ? ' Khá mát, nên khoác thêm áo khi ra ngoài.'
        : ' Thời tiết dễ chịu, trang phục thoải mái là phù hợp.'
  const uvNote = uv != null && uv >= 8 ? ' UV rất cao — đội mũ và dùng kem chống nắng nếu ra ngoài.'
    : uv != null && uv >= 6 ? ' UV khá mạnh — nên che nắng kỹ từ 10–14 giờ.' : ''
  const humNote = hum >= 78 && !rain ? ' Độ ẩm cao, không khí oi bức — nhớ uống nước và nghỉ ngơi đủ.' : ''

  return `${info.label} tại ${b.locationName}.${heat}${rain}${uvNote}${humNote}`.trim()
}
