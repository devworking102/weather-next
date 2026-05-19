import { NextRequest, NextResponse } from 'next/server'
import { aiGenerate } from '@/shared/lib/ai'
import type { AiSource } from '@/shared/lib/ai'

export interface AqiInsightPayload {
  locationName: string
  europeanAqi: number
  usAqi: number
  pm25: number
  pm10: number
  no2: number
  ozone: number
  co: number
  locale?: string
}

export interface AqiInsightResponse {
  insight: string
  source: AiSource | 'fallback'
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as AqiInsightPayload
  const lang = body.locale === 'en' ? 'English' : 'Vietnamese'

  const prompt = `You are a calm air-quality health assistant for everyday users. Analyze the air quality at ${body.locationName || 'this location'}.

Current air pollution data:
- AQI (EU): ${Math.round(body.europeanAqi)}
- AQI (US): ${Math.round(body.usAqi)}
- PM2.5: ${body.pm25.toFixed(1)} μg/m³ (WHO safe limit: <15)
- PM10: ${body.pm10.toFixed(1)} μg/m³ (WHO safe limit: <45)
- NO₂: ${body.no2.toFixed(1)} μg/m³
- O₃: ${body.ozone.toFixed(1)} μg/m³
- CO: ${(body.co / 1000).toFixed(2)} mg/m³

Write 3 compact sentences in ${lang}:
1. Assess the pollution level and name the main pollutant or pattern that matters most.
2. Explain what it means for daily life: outdoor exercise, children, elderly people, asthma/allergy/cardiovascular groups, and indoor ventilation.
3. Give specific actions: mask type if needed, best time/place for activity, whether to close windows or use an air purifier, and what outdoor plans are still reasonable.

Rules:
- Never call yourself AI, a model, a bot, or a system. If identity is needed, use only "trợ lý" in Vietnamese or "assistant" in English.
- Never mention API, tool, model, provider, raw data, dataset, or confidence score.
- Avoid sounding like a lab report. Convert numbers into daily-life advice.

Return plain text only, no markdown, no numbering.`

  const result = await aiGenerate(prompt, { temperature: 0.4, maxOutputTokens: 260 })
  if (result) {
    return NextResponse.json({ insight: result.text, source: result.source } satisfies AqiInsightResponse)
  }
  return NextResponse.json({ insight: buildFallback(body), source: 'fallback' } satisfies AqiInsightResponse)
}

function buildFallback(b: AqiInsightPayload): string {
  const aqi = b.europeanAqi
  const en = b.locale === 'en'
  if (en) {
    if (aqi <= 20) return 'Air quality is excellent with minimal pollution. Everyone can enjoy outdoor activities normally.'
    if (aqi <= 40) return 'Air quality is good. Sensitive individuals may exercise outdoors but should monitor for symptoms.'
    if (aqi <= 60) {
      const main = b.pm25 > 15 ? 'PM2.5 above WHO guidelines' : 'moderate pollution levels'
      return `Air quality is moderate with ${main}. Asthma and cardiovascular patients should avoid intense outdoor exercise.`
    }
    if (aqi <= 80) return 'Poor air quality, harmful to sensitive groups. Elderly, children and respiratory patients should stay indoors and keep windows closed.'
    return 'Very poor or hazardous air quality. Everyone should minimize outdoor exposure, especially vigorous activity. Wear an N95 mask if you must go outside.'
  }
  if (aqi <= 20) return 'Không khí trong lành, ít ô nhiễm. Mọi người có thể hoạt động ngoài trời bình thường.'
  if (aqi <= 40) return 'Chất lượng không khí khá tốt. Người nhạy cảm có thể hoạt động ngoài trời nhưng nên theo dõi nếu có triệu chứng.'
  if (aqi <= 60) {
    const main = b.pm25 > 15 ? 'PM2.5 cao hơn ngưỡng khuyến nghị' : 'mức ô nhiễm trung bình'
    return `Không khí ở mức trung bình với ${main}. Người hen suyễn và bệnh tim mạch nên hạn chế vận động ngoài trời cường độ cao.`
  }
  if (aqi <= 80) return 'Chất lượng không khí kém, có hại cho nhóm nhạy cảm. Người già, trẻ em và bệnh nhân hô hấp nên ở trong nhà, đóng cửa sổ.'
  return 'Không khí rất kém hoặc nguy hại. Tất cả mọi người nên hạn chế ra ngoài, đặc biệt tránh vận động mạnh. Đeo khẩu trang N95 nếu bắt buộc ra ngoài.'
}
