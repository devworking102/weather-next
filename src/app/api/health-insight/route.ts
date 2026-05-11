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

  const prompt = `You are a helpful, friendly, and highly contextual weather and lifestyle assistant. Analyze the weather at ${body.locationName || 'this location'}.

Today's weather data:
- Temperature: ${Math.round(body.temperature)}°C (max ${Math.round(body.tempMax)}°C)
- Humidity: ${Math.round(body.humidity)}%
- Wind speed: ${Math.round(body.windSpeed)} km/h
- Rain probability: ${Math.round(body.precipProb)}%
- AQI (EU): ${Math.round(body.aqi)}
- UV index: ${Math.round(body.uvIndex)}

Write exactly 2 short, highly conversational sentences in ${lang}.
1. A natural comment on how the weather actually "feels" today (e.g., "Trời hôm nay khá oi bức..." or "Thời tiết mát mẻ dễ chịu...").
2. A practical, lifestyle-focused advice based on the data (e.g., "Nhớ mang theo ô nhé vì chiều dễ có mưa", or "Rất thích hợp để đi dạo, nhưng nhớ bôi kem chống nắng").

Do not use bullet points, numbering, or robotic phrasing. Speak like a caring friend.`

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
    if (b.aqi > 60) concerns.push('the air quality is poor, so consider limiting outdoor time')
    if (b.tempMax > 35) concerns.push('it is extremely hot, remember to stay hydrated')
    if (b.humidity > 85) concerns.push('it is quite humid today')
    if (b.uvIndex >= 8) concerns.push('the UV index is very high, so put on some sunscreen')
    if (b.precipProb > 60) concerns.push('it looks like rain is coming, grab an umbrella')

    if (concerns.length === 0) return "The weather is lovely today! It's a great time to head outside and enjoy the day."
    return `Just a heads-up today: ${concerns.slice(0, 2).join(' and ')}. Take care and plan accordingly!`
  }

  if (b.aqi > 60) concerns.push('không khí hơi bụi, nên mang khẩu trang khi ra ngoài')
  if (b.tempMax > 35) concerns.push('trời rất nóng, nhớ uống nhiều nước nhé')
  if (b.humidity > 85) concerns.push('độ ẩm khá cao gây cảm giác oi bức')
  if (b.uvIndex >= 8) concerns.push('nắng rất gắt (UV cao), nhớ bôi kem chống nắng')
  if (b.precipProb > 60) concerns.push('có khả năng mưa, đừng quên mang theo ô')

  if (concerns.length === 0) return 'Thời tiết hôm nay rất đẹp và dễ chịu! Rất thích hợp để bạn ra ngoài dạo chơi.'
  return `Lưu ý nhỏ cho hôm nay: ${concerns.slice(0, 2).join(', và ')}. Chúc bạn một ngày tốt lành!`
}
