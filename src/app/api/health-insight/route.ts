import { NextRequest, NextResponse } from 'next/server'
import { aiGenerate } from '@/shared/lib/ai'
import type { AiSource } from '@/shared/lib/ai'

export interface HealthInsightPayload {
  locationName: string
  temperature: number
  tempMax: number
  humidity: number
  windSpeed: number
  cloudCover: number
  precipProb: number
  aqi: number
  uvIndex: number
}

export interface HealthInsightResponse {
  insight: string
  source: AiSource | 'fallback'
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as HealthInsightPayload

  const prompt = `Bạn là chuyên gia y tế và sức khỏe. Phân tích thời tiết tại ${body.locationName || 'khu vực này'} và đưa ra lời khuyên sức khỏe thực tế.

Dữ liệu thời tiết hôm nay:
- Nhiệt độ: ${Math.round(body.temperature)}°C (cao nhất ${Math.round(body.tempMax)}°C)
- Độ ẩm: ${Math.round(body.humidity)}%
- Tốc độ gió: ${Math.round(body.windSpeed)} km/h
- Độ che phủ mây: ${Math.round(body.cloudCover)}%
- Xác suất mưa: ${Math.round(body.precipProb)}%
- Chỉ số AQI (EU): ${Math.round(body.aqi)}
- Chỉ số UV: ${Math.round(body.uvIndex)}

Viết đúng 2 câu tiếng Việt ngắn gọn, tự nhiên:
1. Nhận xét điều kiện sức khỏe tổng thể hôm nay (dựa trên các chỉ số trên)
2. Gợi ý cụ thể: ai nên cẩn thận (người già, trẻ em, bệnh mãn tính) và hoạt động phù hợp/không phù hợp

Chỉ trả về 2 câu văn bản thuần, không dùng markdown, không đánh số.`

  const result = await aiGenerate(prompt, { temperature: 0.5, maxOutputTokens: 150 })
  if (result) {
    return NextResponse.json({ insight: result.text, source: result.source } satisfies HealthInsightResponse)
  }
  return NextResponse.json({ insight: buildFallback(body), source: 'fallback' } satisfies HealthInsightResponse)
}

function buildFallback(b: HealthInsightPayload): string {
  const concerns: string[] = []
  if (b.aqi > 60) concerns.push('chất lượng không khí kém — người hen suyễn nên hạn chế ra ngoài')
  if (b.tempMax > 35) concerns.push('nắng nóng gay gắt — bổ sung nước thường xuyên')
  if (b.humidity > 85) concerns.push('độ ẩm cao — người viêm xoang, đau khớp cần chú ý')
  if (b.uvIndex >= 8) concerns.push('chỉ số UV rất cao — cần che chắn kỹ khi ra ngoài')
  if (b.precipProb > 60) concerns.push('trời mưa — ưu tiên hoạt động trong nhà')

  if (concerns.length === 0) {
    return 'Điều kiện thời tiết hôm nay khá thuận lợi cho sức khỏe. Có thể vận động ngoài trời bình thường, nhớ uống đủ nước và bảo vệ da.'
  }
  return `Lưu ý hôm nay: ${concerns.slice(0, 2).join(', ')}. Người cao tuổi và trẻ nhỏ nên theo dõi sức khỏe sát hơn.`
}
