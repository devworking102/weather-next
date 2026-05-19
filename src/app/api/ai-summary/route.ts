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

  const prompt = `You are a practical, warm local weather assistant for everyday users, not a formal meteorologist and not a technical product.
Write 3-4 compact sentences in ${lang}. Total length: 75-105 words.

Tone rules:
- Act like a caring local friend texting before someone leaves home. No formal weather reporting.
- Never call yourself AI, a model, a bot, or a system. If identity is needed, use only "trợ lý" in Vietnamese or "assistant" in English.
- Never mention API, tool, model, provider, raw data, dataset, or confidence score in the final text.
- Cover more than one angle when relevant: clothing/gear, commute timing, rain window, heat/UV/humidity comfort, and a small activity suggestion.
- Lead with the most important actionable point for the next few hours.
- If rain is predicted, mention the approximate window and suggest gear or timing. Do not invent hours not in the digest.
- If UV >= 7 or humidity >= 75%, add a brief comfort/health nudge.
- If wind is strong, mention caution for motorbikes, umbrellas, or outdoor signs.
- If the multi-day outlook has a notably nice, hot, or wet pattern, mention it in one short phrase.
- For Vietnam context: think motorbike commuters, outdoor vendors, schoolchildren walking, office workers at lunch, cafe plans, and nearby errands.
- Use a soft, affectionate tone (e.g., in Vietnamese use words like "nha", "nhé", "nè", "nhen").

Bad (never write like this):
- "Độ ẩm hiện tại là 82%." (data-report style)
- "Chỉ số UV là 7." (jargon)
- "Có 60% khả năng mưa." (robotic probability)

Good (write like this):
- "Chiều nay có khả năng mưa rào đấy, nếu bạn đi làm về sau 17h nhớ mang theo áo mưa nhé."
- "Nắng hôm nay khá gắt, bạn nhớ bôi kem chống nắng và che chắn kỹ nếu phải ra ngoài tầm trưa nha."
- "Trời hôm nay hơi oi bức một chút, nhớ uống nhiều nước kẻo mệt nhé."

Weather facts:
Location: ${body.locationName}${body.country ? ', ' + body.country : ''}
Now: ${Math.round(body.temperature)}°C, feels ${Math.round(body.apparentTemperature)}°C · ${wmoInfo(body.weatherCode).label}
Humidity: ${Math.round(body.humidity)}%  Wind: ${Math.round(body.windSpeed)} km/h${uv != null ? `  UV: ${uv}` : ''}

Hourly rain digest: ${hourly}
Multi-day outlook: ${daily}

Rules: plain text only, no markdown, no bullets. Do not parrot back the numbers — convert them to human insight and everyday decisions.`

  const result = await aiGenerate(prompt, { temperature: 0.55, maxOutputTokens: 520 })
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
    ? ' Hình như sắp có mưa đấy, bạn nhớ mang theo áo mưa nếu đi đâu lâu nhé.'
    : ''
  const heat = t >= 32
    ? ' Trời khá là nóng bức, bạn nhớ uống thật nhiều nước và hạn chế ở ngoài nắng quá lâu nha.'
    : t >= 28
      ? diff >= 3 ? ' Trời hơi oi bức một chút, bạn nên chọn đồ thoáng mát để thoải mái hơn.' : ' Thời tiết khá ấm áp, mặc đồ thoáng mát là đẹp.'
      : t <= 20
        ? ' Trời hơi se lạnh, ra ngoài bạn nhớ khoác thêm một chiếc áo mỏng nhé.'
        : ' Thời tiết hôm nay cực kỳ dễ chịu, mặc gì cũng đẹp hết.'
  const uvNote = uv != null && uv >= 8 ? ' Nắng hôm nay khá gắt, đừng quên bôi kem chống nắng và đội mũ nha.'
    : uv != null && uv >= 6 ? ' Tia UV đang ở mức khá, ra đường tầm trưa nhớ che chắn cẩn thận nhé.' : ''
  const humNote = hum >= 78 && !rain ? ' Không khí hơi ẩm nên có thể thấy oi ả, nhớ nghỉ ngơi và uống nước đều đặn nha.' : ''

  return `${info.label} tại ${b.locationName} nè.${heat}${rain}${uvNote}${humNote}`.trim()
}
