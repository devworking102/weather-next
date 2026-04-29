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
  locale?: string
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Payload
  const lang = body.locale === 'en' ? 'English' : 'tiếng Việt'

  const prompt = `You are a weather assistant. Write 3-4 sentences in ${lang} describing the current weather and suggesting appropriate clothing or activities.
Location: ${body.locationName}${body.country ? ', ' + body.country : ''}
Temperature: ${Math.round(body.temperature)}°C (feels like ${Math.round(body.apparentTemperature)}°C)
Condition: ${wmoInfo(body.weatherCode).label}
Humidity: ${Math.round(body.humidity)}%
Wind: ${Math.round(body.windSpeed)} km/h
Return plain text only, no markdown.`

  const result = await aiGenerate(prompt, { temperature: 0.6, maxOutputTokens: 220 })
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

  if (en) {
    const feelNote = Math.abs(diff) >= 3 ? ` Feels ${diff > 0 ? 'warmer' : 'cooler'} by about ${Math.abs(diff)}°.` : ''
    const windNote = Math.round(b.windSpeed) >= 30 ? ' Strong wind — limit outdoor activities.' : ''
    const attire = t >= 28 ? ' Wear light breathable clothing and stay hydrated.'
      : t <= 18 ? ' Dress warmly and bring a jacket.'
      : ' Pleasant weather — comfortable clothing is fine.'
    return `${info.label} in ${b.locationName}, ${t}°C.${feelNote}${windNote}${attire}`
  }

  const feelNote = Math.abs(diff) >= 3 ? ` Cảm nhận ${diff > 0 ? 'oi hơn' : 'lạnh hơn'} khoảng ${Math.abs(diff)}°.` : ''
  const windNote = Math.round(b.windSpeed) >= 30 ? ' Gió khá mạnh, hạn chế hoạt động ngoài trời.' : ''
  const attire = t >= 28 ? ' Chọn trang phục mỏng, thoáng mát và bổ sung nước đầy đủ.'
    : t <= 18 ? ' Nên mặc ấm, chuẩn bị áo khoác khi ra ngoài.'
    : ' Thời tiết dễ chịu, trang phục thoải mái là phù hợp.'
  return `${info.label} tại ${b.locationName}, ${t}°C.${feelNote}${windNote}${attire}`
}
