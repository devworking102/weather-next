import { NextRequest, NextResponse } from 'next/server'
import { geminiGenerate } from '@/shared/lib/gemini'

export interface AqiInsightPayload {
  locationName: string
  europeanAqi: number
  usAqi: number
  pm25: number
  pm10: number
  no2: number
  ozone: number
  co: number
}

export interface AqiInsightResponse {
  insight: string
  source: 'gemini' | 'fallback'
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as AqiInsightPayload

  const prompt = `Bạn là chuyên gia môi trường. Phân tích chất lượng không khí tại ${body.locationName || 'khu vực này'}.

Dữ liệu ô nhiễm không khí hiện tại:
- AQI (EU): ${Math.round(body.europeanAqi)}
- AQI (US): ${Math.round(body.usAqi)}
- PM2.5: ${body.pm25.toFixed(1)} μg/m³ (ngưỡng WHO an toàn: <15)
- PM10: ${body.pm10.toFixed(1)} μg/m³ (ngưỡng WHO an toàn: <45)
- NO₂: ${body.no2.toFixed(1)} μg/m³
- O₃: ${body.ozone.toFixed(1)} μg/m³
- CO: ${(body.co / 1000).toFixed(2)} mg/m³

Viết đúng 2 câu tiếng Việt:
1. Đánh giá mức độ ô nhiễm và chất ô nhiễm đáng lo ngại nhất (nếu có)
2. Khuyến nghị cụ thể: ai cần hạn chế tiếp xúc, có cần đeo khẩu trang không, và hoạt động phù hợp

Chỉ trả về 2 câu văn bản thuần, không markdown, không đánh số.`

  const text = await geminiGenerate(prompt, { temperature: 0.4, maxOutputTokens: 150 })
  if (text) {
    return NextResponse.json({ insight: text, source: 'gemini' } satisfies AqiInsightResponse)
  }
  return NextResponse.json({ insight: buildFallback(body), source: 'fallback' } satisfies AqiInsightResponse)
}

function buildFallback(b: AqiInsightPayload): string {
  const aqi = b.europeanAqi
  if (aqi <= 20) return 'Không khí trong lành, ít ô nhiễm. Mọi người có thể hoạt động ngoài trời bình thường.'
  if (aqi <= 40) return 'Chất lượng không khí khá tốt. Người nhạy cảm có thể hoạt động ngoài trời nhưng nên theo dõi nếu có triệu chứng.'
  if (aqi <= 60) {
    const main = b.pm25 > 15 ? 'PM2.5 cao hơn ngưỡng khuyến nghị' : 'mức ô nhiễm trung bình'
    return `Không khí ở mức trung bình với ${main}. Người hen suyễn và bệnh tim mạch nên hạn chế vận động ngoài trời cường độ cao.`
  }
  if (aqi <= 80) return 'Chất lượng không khí kém, có hại cho nhóm nhạy cảm. Người già, trẻ em và bệnh nhân hô hấp nên ở trong nhà, đóng cửa sổ.'
  return 'Không khí rất kém hoặc nguy hại. Tất cả mọi người nên hạn chế ra ngoài, đặc biệt tránh vận động mạnh. Đeo khẩu trang N95 nếu bắt buộc ra ngoài.'
}
