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
  locale?: string
}

export interface HealthInsightResponse {
  insight: string
  source: AiSource | 'fallback'
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as HealthInsightPayload
  const lang = body.locale === 'en' ? 'English' : 'Vietnamese'

  const prompt = `You are a health and wellness expert. Analyze the weather at ${body.locationName || 'this location'} and provide practical health advice.

Today's weather data:
- Temperature: ${Math.round(body.temperature)}°C (max ${Math.round(body.tempMax)}°C)
- Humidity: ${Math.round(body.humidity)}%
- Wind speed: ${Math.round(body.windSpeed)} km/h
- Cloud cover: ${Math.round(body.cloudCover)}%
- Rain probability: ${Math.round(body.precipProb)}%
- AQI (EU): ${Math.round(body.aqi)}
- UV index: ${Math.round(body.uvIndex)}

Write exactly 2 short, natural sentences in ${lang}:
1. Overall health assessment for today (based on the above data)
2. Specific advice: who should be careful (elderly, children, chronic conditions) and suitable/unsuitable activities

Return plain text only, no markdown, no numbering.`

  const result = await aiGenerate(prompt, { temperature: 0.5, maxOutputTokens: 150 })
  if (result) {
    return NextResponse.json({ insight: result.text, source: result.source } satisfies HealthInsightResponse)
  }
  return NextResponse.json({ insight: buildFallback(body), source: 'fallback' } satisfies HealthInsightResponse)
}

function buildFallback(b: HealthInsightPayload): string {
  const en = b.locale === 'en'
  const concerns: string[] = []
  if (en) {
    if (b.aqi > 60) concerns.push('poor air quality — asthma sufferers should limit outdoor exposure')
    if (b.tempMax > 35) concerns.push('extreme heat — drink water frequently')
    if (b.humidity > 85) concerns.push('high humidity — sinusitis and joint pain patients take care')
    if (b.uvIndex >= 8) concerns.push('very high UV — cover up thoroughly outdoors')
    if (b.precipProb > 60) concerns.push('rain expected — prefer indoor activities')
    if (concerns.length === 0) return 'Weather conditions today are quite favorable for health. Normal outdoor exercise is fine — stay hydrated and protect your skin.'
    return `Watch out today: ${concerns.slice(0, 2).join(', ')}. Elderly and young children should monitor their health more closely.`
  }
  if (b.aqi > 60) concerns.push('chất lượng không khí kém — người hen suyễn nên hạn chế ra ngoài')
  if (b.tempMax > 35) concerns.push('nắng nóng gay gắt — bổ sung nước thường xuyên')
  if (b.humidity > 85) concerns.push('độ ẩm cao — người viêm xoang, đau khớp cần chú ý')
  if (b.uvIndex >= 8) concerns.push('chỉ số UV rất cao — cần che chắn kỹ khi ra ngoài')
  if (b.precipProb > 60) concerns.push('trời mưa — ưu tiên hoạt động trong nhà')
  if (concerns.length === 0) return 'Điều kiện thời tiết hôm nay khá thuận lợi cho sức khỏe. Có thể vận động ngoài trời bình thường, nhớ uống đủ nước và bảo vệ da.'
  return `Lưu ý hôm nay: ${concerns.slice(0, 2).join(', ')}. Người cao tuổi và trẻ nhỏ nên theo dõi sức khỏe sát hơn.`
}
