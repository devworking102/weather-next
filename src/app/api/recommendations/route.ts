import { NextRequest, NextResponse } from 'next/server'
import { geminiGenerate, parseGeminiJson } from '@/shared/lib/gemini'

interface Payload {
  locationName: string
  country?: string
  admin1?: string
  temperature: number
  weatherCode: number
}

export interface Recommendations {
  title: string
  food: string[]
  activity: string[]
  clothes: string[]
  source: 'gemini' | 'fallback'
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Payload
  const fallback = buildFallback(body)

  const locLabel = [body.locationName, body.admin1, body.country].filter(Boolean).join(', ')
  const prompt = `Tôi đang ở ${locLabel}. Nhiệt độ hiện tại là ${Math.round(body.temperature)}°C, mã thời tiết WMO ${body.weatherCode}.
Hãy đóng vai trợ lý địa phương, gợi ý chính xác 4 món ăn đặc sản/phổ biến tại khu vực hợp thời tiết (kèm emoji), 4 hoạt động hợp lý (kèm emoji), và 4 trang phục nên mặc (kèm emoji).
Trả về DUY NHẤT một JSON đúng cấu trúc:
{"title":"1 câu nhận xét thời tiết ngắn","food":["...","...","...","..."],"activity":["...","...","...","..."],"clothes":["...","...","...","..."]}`

  const text = await geminiGenerate(prompt, {
    temperature: 0.7,
    maxOutputTokens: 450,
    json: true,
  })

  if (text) {
    const parsed = parseGeminiJson<Omit<Recommendations, 'source'>>(text)
    if (
      parsed &&
      Array.isArray(parsed.food) && parsed.food.length >= 4 &&
      Array.isArray(parsed.activity) && parsed.activity.length >= 4 &&
      Array.isArray(parsed.clothes) && parsed.clothes.length >= 4
    ) {
      return NextResponse.json({ ...parsed, source: 'gemini' } satisfies Recommendations)
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
    source: 'fallback',
  }
}

const FALLBACK: Record<'hot' | 'cold' | 'rain' | 'nice', { title: string; food: string[]; activity: string[]; clothes: string[] }> = {
  hot: {
    title: 'Nóng ẩm đặc trưng ☀️',
    food: ['Nước dừa/Nước mía mát lạnh 🥥', 'Chè thái/Chè bưởi 🍧', 'Bún thịt nướng/Gỏi cuốn 🥗', 'Hải sản tươi sống 🦐', 'Trái cây nhiệt đới 🥭', 'Trà chanh/Trà đào 🍹'],
    activity: ['Đi bơi hoặc đi biển 🏊', 'Trú ẩn trong TTTM ☕', 'Cà phê máy lạnh ☕', 'Dạo phố khi tắt nắng 🌃', 'Đi công viên nước 💦'],
    clothes: ['Quần áo cotton/lanh 👕', 'Dép lê/sandal xỏ ngón 🩴', 'Mũ rộng vành, kính râm 🕶️', 'Áo chống nắng mỏng 🧥', 'Quần short/cộc tay 🩳'],
  },
  cold: {
    title: 'Se lạnh dễ chịu ❄️',
    food: ['Lẩu Thái/Lẩu nấm 🍲', 'Thịt nướng xiên que 🍢', 'Ngô/khoai lang nướng 🍠', 'Sữa đậu nành nóng 🥛', 'Phở/Bún bò nóng 🍜', 'Cháo sườn nóng 🥣'],
    activity: ['Trekking/hiking 🏞️', 'Đốt lửa trại 🏕️', 'Cà phê view núi ☕', 'Săn mây sáng sớm ☁️', 'Tắm suối khoáng nóng ♨️'],
    clothes: ['Áo khoác gió/len 🧥', 'Quần dài, quần kaki 👖', 'Giày thể thao/boots 👟', 'Khăn choàng cổ 🧣', 'Áo giữ nhiệt bên trong 👕'],
  },
  rain: {
    title: 'Mưa rào thất thường 🌧️',
    food: ['Lẩu Thái chua cay 🍲', 'Bánh xèo/bánh khọt 🌮', 'Cháo trắng hột vịt muối 🥣', 'Mì tôm trứng xúc xích 🍜', 'Bánh mì chảo nóng hổi 🍳', 'Ốc luộc/xào 🐌'],
    activity: ['Cày phim Netflix 🎬', 'Massage/spa thư giãn 💆', 'Cafe boardgame 🎲', 'Đọc sách/Podcast 🎧', 'Lượn lờ TTTM 🛍️'],
    clothes: ['Áo mưa/ô (dù) ☔', 'Dép nhựa/giày chống nước 🩴', 'Túi/balo chống nước 🎒', 'Quần áo mau khô 👖', 'Áo khoác mỏng 🧥'],
  },
  nice: {
    title: 'Thời tiết thật tuyệt vời 🌤️',
    food: ['BBQ/Picnic 🍖', 'Bún chả/Phở 🍜', 'Bánh mì Việt Nam 🥖', 'Salad tươi mát 🥗', 'Sushi/Sashimi 🍣', 'Cơm nhà làm 🍚'],
    activity: ['Dã ngoại (picnic) 🧺', 'Đạp xe dạo phố 🚴', 'Chụp ảnh ngoài trời 📸', 'Cà phê vỉa hè ☕', 'Cắm trại cuối tuần 🏕️'],
    clothes: ['Trang phục thoải mái 👟', 'Áo phông + jeans 👖', 'Váy hoa/Sơ mi 👗', 'Kính râm/mũ lưỡi trai 🧢', 'Quần short ống rộng 🩳'],
  },
}
