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
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Payload

  const prompt = `Bạn là trợ lý thời tiết. Hãy viết một đoạn 2-3 câu tiếng Việt mô tả thời tiết hiện tại, gợi ý trang phục/hoạt động phù hợp.
Địa điểm: ${body.locationName}${body.country ? ', ' + body.country : ''}
Nhiệt độ: ${Math.round(body.temperature)}°C (cảm nhận ${Math.round(body.apparentTemperature)}°C)
Mô tả: ${wmoInfo(body.weatherCode).label}
Độ ẩm: ${Math.round(body.humidity)}%
Gió: ${Math.round(body.windSpeed)} km/h
Chỉ trả về văn bản thuần, không markdown.`

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
  const feelNote = Math.abs(diff) >= 3 ? ` Cảm nhận ${diff > 0 ? 'oi hơn' : 'lạnh hơn'} khoảng ${Math.abs(diff)}°.` : ''
  const windNote = Math.round(b.windSpeed) >= 30 ? ' Gió khá mạnh, hạn chế hoạt động ngoài trời.' : ''
  const attire =
    t >= 28 ? ' Chọn trang phục mỏng, thoáng mát và bổ sung nước đầy đủ.'
    : t <= 18 ? ' Nên mặc ấm, chuẩn bị áo khoác khi ra ngoài.'
    : ' Thời tiết dễ chịu, trang phục thoải mái là phù hợp.'
  return `${info.label} tại ${b.locationName}, ${t}°C.${feelNote}${windNote}${attire}`
}
