import { NextRequest, NextResponse } from 'next/server'
import { aiGenerate, parseGeminiJson } from '@/shared/lib/ai'
import type { AiSource } from '@/shared/lib/ai'
import { hasOnlySupportedLanguageText } from '@/shared/lib/language-guard'

interface Payload {
  locationName: string
  country?: string
  admin1?: string
  temperature: number
  weatherCode: number
  locale?: string
}

export interface Recommendations {
  title: string
  food: string[]
  activity: string[]
  clothes: string[]
  places: string[]
  source: AiSource | 'fallback'
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Payload
  const fallback = buildFallback(body)

  const locLabel = [body.locationName, body.admin1, body.country].filter(Boolean).join(', ')
  const lang = body.locale === 'en' ? 'English' : 'Vietnamese'
  const localeRule =
    body.locale === 'en'
      ? 'Write only in English. Do not include Chinese, Japanese, Korean, or any other language.'
      : 'Write only in Vietnamese. Do not include Chinese, Japanese, Korean, English phrases, or any other language.'
  const prompt = `I am at ${locLabel}. Current temperature is ${Math.round(body.temperature)}°C, WMO weather code ${body.weatherCode}.
Act as a practical local assistant for everyday users. Suggest exactly 4 local specialty/popular foods suitable for this weather, 4 reasonable activities, 4 clothing/gear items, and 4 nearby travel/tourist destinations or resorts worth visiting near ${locLabel}. All text must be in ${lang}.
${localeRule}
Make every item more useful than a label: include an emoji plus a short reason, timing tip, or weather-specific note in 4-10 words.
Prefer concrete local places and foods when you know them; if unsure, use realistic categories without inventing exact businesses.
For rain, heat, cold, strong sun, or poor visibility, adapt suggestions toward indoor options, hydration, shade, rain gear, safe transport, and realistic trip distance.
Never call yourself AI, a model, a bot, or a system. Never mention API, tool, model, provider, raw data, dataset, or confidence score.
Use natural Vietnamese when ${lang} is Vietnamese: prefer "mua vài món cần thiết gần nhà", "ghé quán gần nhà", "việc gần nhà", and avoid stiff shopping/errand wording.
Return ONLY a JSON with this exact structure:
{"title":"1 short weather comment","food":["...","...","...","..."],"activity":["...","...","...","..."],"clothes":["...","...","...","..."],"places":["...","...","...","..."]}`

  const result = await aiGenerate(prompt, {
    temperature: 0.7,
    maxOutputTokens: 700,
    json: true,
  })

  if (result) {
    const parsed = parseGeminiJson<Omit<Recommendations, 'source'>>(result.text)
    if (
      parsed &&
      Array.isArray(parsed.food) && parsed.food.length >= 4 &&
      Array.isArray(parsed.activity) && parsed.activity.length >= 4 &&
      Array.isArray(parsed.clothes) && parsed.clothes.length >= 4 &&
      Array.isArray(parsed.places) && parsed.places.length >= 4 &&
      hasOnlySupportedLanguageText(
        parsed.title,
        ...parsed.food,
        ...parsed.activity,
        ...parsed.clothes,
        ...parsed.places,
      )
    ) {
      return NextResponse.json({ ...parsed, source: result.source } satisfies Recommendations)
    }
  }

  return NextResponse.json(fallback)
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n)
}

function buildFallback(b: Payload): Recommendations {
  const temp = b.temperature
  const code = b.weatherCode
  const isRain = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95
  const isHot = temp >= 28
  const isCold = temp <= 18
  const key: 'hot' | 'cold' | 'rain' | 'nice' = isRain ? 'rain' : isCold ? 'cold' : isHot ? 'hot' : 'nice'
  const bank = FALLBACK[key]
  return {
    title: bank.title,
    food: pickRandom(bank.food, 4),
    activity: pickRandom(bank.activity, 4),
    clothes: pickRandom(bank.clothes, 4),
    places: pickRandom(bank.places, 4),
    source: 'fallback',
  }
}

const FALLBACK: Record<'hot' | 'cold' | 'rain' | 'nice', { title: string; food: string[]; activity: string[]; clothes: string[]; places: string[] }> = {
  hot: {
    title: 'Nóng ẩm đặc trưng ☀️',
    food: ['Nước dừa/Nước mía mát lạnh 🥥', 'Chè thái/Chè bưởi 🍧', 'Bún thịt nướng/Gỏi cuốn 🥗', 'Hải sản tươi sống 🦐', 'Trái cây nhiệt đới 🥭', 'Trà chanh/Trà đào 🍹'],
    activity: ['Đi bơi hoặc đi biển 🏊', 'Trú ẩn trong TTTM ☕', 'Cà phê máy lạnh ☕', 'Dạo phố khi tắt nắng 🌃', 'Đi công viên nước 💦'],
    clothes: ['Quần áo cotton/lanh 👕', 'Dép lê/sandal xỏ ngón 🩴', 'Mũ rộng vành, kính râm 🕶️', 'Áo chống nắng mỏng 🧥', 'Quần short/cộc tay 🩳'],
    places: ['Bãi biển gần nhất 🏖️', 'Công viên nước địa phương 💦', 'Trung tâm thương mại 🛍️', 'Khu resort ven biển 🌴'],
  },
  cold: {
    title: 'Se lạnh dễ chịu ❄️',
    food: ['Lẩu Thái/Lẩu nấm 🍲', 'Thịt nướng xiên que 🍢', 'Ngô/khoai lang nướng 🍠', 'Sữa đậu nành nóng 🥛', 'Phở/Bún bò nóng 🍜', 'Cháo sườn nóng 🥣'],
    activity: ['Trekking/hiking 🏞️', 'Đốt lửa trại 🏕️', 'Cà phê view núi ☕', 'Săn mây sáng sớm ☁️', 'Tắm suối khoáng nóng ♨️'],
    clothes: ['Áo khoác gió/len 🧥', 'Quần dài, quần kaki 👖', 'Giày thể thao/boots 👟', 'Khăn choàng cổ 🧣', 'Áo giữ nhiệt bên trong 👕'],
    places: ['Khu suối khoáng nóng ♨️', 'Làng văn hóa dân tộc 🏘️', 'Đỉnh núi ngắm mây ⛰️', 'Khu du lịch sinh thái 🌿'],
  },
  rain: {
    title: 'Mưa rào thất thường 🌧️',
    food: ['Lẩu Thái chua cay 🍲', 'Bánh xèo/bánh khọt 🌮', 'Cháo trắng hột vịt muối 🥣', 'Mì tôm trứng xúc xích 🍜', 'Bánh mì chảo nóng hổi 🍳', 'Ốc luộc/xào 🐌'],
    activity: ['Cày phim Netflix 🎬', 'Massage/spa thư giãn 💆', 'Cafe boardgame 🎲', 'Đọc sách/Podcast 🎧', 'Lượn lờ TTTM 🛍️'],
    clothes: ['Áo mưa/ô (dù) ☔', 'Dép nhựa/giày chống nước 🩴', 'Túi/balo chống nước 🎒', 'Quần áo mau khô 👖', 'Áo khoác mỏng 🧥'],
    places: ['Spa/Wellness center 💆', 'Bảo tàng địa phương 🏛️', 'Trung tâm thương mại 🛍️', 'Cà phê phong cách 🎨'],
  },
  nice: {
    title: 'Thời tiết thật tuyệt vời 🌤️',
    food: ['BBQ/Picnic 🍖', 'Bún chả/Phở 🍜', 'Bánh mì Việt Nam 🥖', 'Salad tươi mát 🥗', 'Sushi/Sashimi 🍣', 'Cơm nhà làm 🍚'],
    activity: ['Dã ngoại (picnic) 🧺', 'Đạp xe dạo phố 🚴', 'Chụp ảnh ngoài trời 📸', 'Cà phê vỉa hè ☕', 'Cắm trại cuối tuần 🏕️'],
    clothes: ['Trang phục thoải mái 👟', 'Áo phông + jeans 👖', 'Váy hoa/Sơ mi 👗', 'Kính râm/mũ lưỡi trai 🧢', 'Quần short ống rộng 🩳'],
    places: ['Công viên/vườn hoa 🌸', 'Phố đi bộ/khu phố cổ 🏛️', 'Điểm check-in nổi tiếng 📸', 'Khu nghỉ dưỡng ngoại ô 🏡'],
  },
}
