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

  const prompt = `You are a friendly, practical weather assistant for everyday people (not meteorologists).
Write 4–6 short sentences in ${lang}. Tone: clear, local, actionable — like a smart friend texting before someone leaves home.

Must cover when useful:
- Right now: conditions + how it feels + what to wear or bring (umbrella/sunscreen/layer).
- Next hours: if the digest lists rain windows, mention approximate local hours and suggest rain gear or timing errands. Do NOT invent exact hours that are not implied by the digest.
- Next days: if the multi-day digest suggests a nicer weekend or a wet spell, say it plainly (beach/outdoor vs stay in).
- If humidity is high (e.g. ≥70%), mention comfort (sticky air, headache risk for sensitive people, sleep/hydration tips) when appropriate.
- If UV is high (UV ≥7 when provided), remind sun protection briefly.

Facts (trust these):
Location: ${body.locationName}${body.country ? ', ' + body.country : ''}
Now: ${Math.round(body.temperature)}°C, feels ${Math.round(body.apparentTemperature)}°C
Condition: ${wmoInfo(body.weatherCode).label}
Humidity: ${Math.round(body.humidity)}%
Wind: ${Math.round(body.windSpeed)} km/h${uv != null ? `\nUV index now: ${uv}` : ''}

Hourly rain-related digest (model, local times in digest string):
${hourly}

Multi-day outlook digest:
${daily}

Rules: plain text only, no markdown or bullet symbols. No made-up warnings beyond the data. Stay concise.`

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
  const daily = (b.dailyOutlookDigest ?? '').trim()

  const humidityNote =
    hum >= 75
      ? en
        ? ' Humidity is high — air may feel muggy; hydrate and consider lighter layers.'
        : ' Độ ẩm cao, không khí dễ oi bức; uống nước đều và chọn đồ thoáng.'
      : hum >= 60
        ? en
          ? ' Moderate humidity — comfortable if you pace outdoor time.'
          : ' Độ ẩm trung bình — ổn nếu không đứng lâu ngoài nắng.'
        : ''
  const uvNote =
    uv != null && uv >= 8
      ? en
        ? ` UV is very high (${uv}) — hat, sunscreen, shade breaks.`
        : ` Tia UV rất cao (${uv}) — đội mũ, kem chống nắng, tránh nắng gắt.`
      : uv != null && uv >= 6
        ? en
          ? ` UV is elevated (${uv}) — sun protection helps.`
          : ` UV khá cao (${uv}) — nên che chắn khi ra ngoài.`
        : ''

  const rainHint =
    hourly &&
    !hourly.toLowerCase().includes('no notable rain') &&
    !hourly.includes('không thấy mưa')
      ? en
        ? ` Hourly model hints at rain risk soon — check the app chart and carry a compact umbrella if heading out.`
        : ` Mô hình giờ gợi ý có khả năng mưa trong vài giờ tới — xem biểu đồ trên app, mang áo mưa gấp nếu ra đường lâu.`
      : ''

  const weekendHint =
    daily && /Sat|Sun|T7|CN|Chủ nhật|chủ nhật|thứ 7|Th 7/i.test(daily)
      ? en
        ? ' Weekend outlook is in the digest — plan outdoor time on clearer slots if you see sunnier days there.'
        : ' Gợi ý cuối tuần nằm trong dòng “ngày tới” ở trên — chọn khung trời đẹp hơn để đi chơi nếu có.'
      : ''

  if (en) {
    const feelNote = Math.abs(diff) >= 3 ? ` Feels ${diff > 0 ? 'warmer' : 'cooler'} by ~${Math.abs(diff)}°.` : ''
    const windNote = Math.round(b.windSpeed) >= 30 ? ' Strong wind — limit outdoor activities.' : ''
    const attire = t >= 28 ? ' Wear light breathable clothing and stay hydrated.'
      : t <= 18 ? ' Dress warmly and bring a jacket.'
      : ' Pleasant weather — comfortable clothing is fine.'
    return `${info.label} in ${b.locationName}, ${t}°C.${feelNote}${windNote}${attire}${humidityNote}${uvNote}${rainHint}${weekendHint}`
  }

  const feelNote = Math.abs(diff) >= 3 ? ` Cảm nhận ${diff > 0 ? 'oi hơn' : 'lạnh hơn'} khoảng ${Math.abs(diff)}°.` : ''
  const windNote = Math.round(b.windSpeed) >= 30 ? ' Gió khá mạnh, hạn chế hoạt động ngoài trời.' : ''
  const attire = t >= 28 ? ' Chọn trang phục mỏng, thoáng mát và bổ sung nước đầy đủ.'
    : t <= 18 ? ' Nên mặc ấm, chuẩn bị áo khoác khi ra ngoài.'
    : ' Thời tiết dễ chịu, trang phục thoải mái là phù hợp.'
  return `${info.label} tại ${b.locationName}, ${t}°C.${feelNote}${windNote}${attire}${humidityNote}${uvNote}${rainHint}${weekendHint}`
}
