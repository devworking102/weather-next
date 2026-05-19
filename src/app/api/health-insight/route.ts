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

  const prompt = `You are a caring, highly empathetic, and friendly weather assistant. Your tone should be extremely natural, warm, and conversational, exactly like a close friend texting advice. Analyze the weather at ${body.locationName || 'this location'}.

Today's weather data:
- Temperature: ${Math.round(body.temperature)}°C (max ${Math.round(body.tempMax)}°C)
- Humidity: ${Math.round(body.humidity)}%
- Wind speed: ${Math.round(body.windSpeed)} km/h
- Rain probability: ${Math.round(body.precipProb)}%
- AQI (EU): ${Math.round(body.aqi)}
- UV index: ${Math.round(body.uvIndex)}

Write a friendly message (3-4 compact sentences) in ${lang}.
- Start with a warm and natural observation about how it feels outside.
- Give caring, practical advice based on heat/cold, humidity, wind, rain, AQI, and UV.
- Include advice for sensitive groups when relevant: children, elderly people, asthma/allergy/cardiovascular groups, outdoor workers, motorbike commuters.
- Include at least one concrete action such as drink water, wear sunscreen, carry rain gear, choose shade, avoid intense noon exercise, mask up, or move plans indoors.
- Use a soft, affectionate tone (e.g., in Vietnamese use words like "nha", "nhé", "nè").
- Absolutely NO bullet points, NO robotic phrasing, NO formal reports. Make it sound human and caring.`

  const result = await aiGenerate(prompt, { temperature: 0.5, maxOutputTokens: 280 })
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

  if (b.aqi > 60) concerns.push('không khí hôm nay hơi bụi một chút, ra đường nhớ mang khẩu trang nhé')
  if (b.tempMax > 35) concerns.push('trời khá là nóng, bạn nhớ uống thật nhiều nước nha')
  if (b.humidity > 85) concerns.push('độ ẩm cao nên cảm giác sẽ hơi oi bức một chút')
  if (b.uvIndex >= 8) concerns.push('nắng hôm nay gắt lắm, đừng quên bôi kem chống nắng nhé')
  if (b.precipProb > 60) concerns.push('hình như sắp có mưa, đi đâu bạn nhớ mang theo ô hoặc áo mưa kẻo ướt nhé')

  if (concerns.length === 0) return 'Thời tiết hôm nay rất đẹp và dễ chịu! Rất tuyệt vời để dạo phố hay đi cà phê đấy.'
  return `Thời tiết hôm nay có chút lưu ý nhỏ nè: ${concerns.slice(0, 2).join(', và ')}. Bạn đi đường cẩn thận và giữ gìn sức khỏe nha!`
}
