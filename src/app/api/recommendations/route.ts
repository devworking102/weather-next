import { NextRequest, NextResponse } from 'next/server'

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
  const key = process.env.GEMINI_API_KEY

  const fallback = buildFallback(body)
  if (!key) return NextResponse.json(fallback)

  try {
    const locLabel = `${body.locationName}${body.admin1 ? ', ' + body.admin1 : ''}${body.country ? ', ' + body.country : ''}`
    const prompt = `Tôi đang ở ${locLabel}. Nhiệt độ hiện tại là ${Math.round(body.temperature)}°C. Hãy đóng vai trợ lý địa phương, gợi ý chính xác 4 món ăn đặc sản/phổ biến tại khu vực hợp thời tiết (kèm emoji), 4 hoạt động hợp lý (kèm emoji), và 4 trang phục nên mặc (kèm emoji). Trả về DUY NHẤT một JSON đúng cấu trúc:
{"title":"1 câu nhận xét thời tiết ngắn","food":["..."],"activity":["..."],"clothes":["..."]}`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            response_mime_type: 'application/json',
            maxOutputTokens: 400,
          },
        }),
      },
    )
    if (!res.ok) throw new Error('gemini_failed')
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('empty')
    const parsed = JSON.parse(text) as Omit<Recommendations, 'source'>
    if (!Array.isArray(parsed.food) || !Array.isArray(parsed.activity) || !Array.isArray(parsed.clothes)) {
      throw new Error('invalid')
    }
    return NextResponse.json({ ...parsed, source: 'gemini' } satisfies Recommendations)
  } catch {
    return NextResponse.json(fallback)
  }
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
  const key: 'hot' | 'cold' | 'rain' | 'nice' = isRain
    ? 'rain'
    : isCold
      ? 'cold'
      : isHot
        ? 'hot'
        : 'nice'
  const bank = FALLBACK[key]
  return {
    title: bank.title,
    food: pickRandom(bank.food, 4),
    activity: pickRandom(bank.activity, 4),
    clothes: pickRandom(bank.clothes, 4),
    source: 'fallback',
  }
}

const FALLBACK: Record<
  'hot' | 'cold' | 'rain' | 'nice',
  { title: string; food: string[]; activity: string[]; clothes: string[] }
> = {
  hot: {
    title: 'Nóng ẩm đặc trưng ☀️',
    food: [
      'Nước dừa/Nước mía mát lạnh 🥥',
      'Chè thái/Chè bưởi 🍧',
      'Bún thịt nướng/Gỏi cuốn 🥗',
      'Hải sản tươi sống 🦐',
      'Trái cây nhiệt đới 🥭',
      'Kem xôi dừa 🥥',
      'Trà chanh/Trà đào 🍹',
      'Bún riêu cua đồng 🍜',
    ],
    activity: [
      'Đi bơi hoặc đi biển 🏊',
      'Trú ẩn trong TTTM ☕',
      'Cà phê máy lạnh ☕',
      'Dạo phố khi tắt nắng 🌃',
      'Đi công viên nước 💦',
      'Thăm thủy cung 🐠',
      'Uống bia hơi vỉa hè 🍻',
    ],
    clothes: [
      'Quần áo cotton/lanh 👕',
      'Dép lê/sandal xỏ ngón 🩴',
      'Mũ rộng vành, kính râm 🕶️',
      'Áo chống nắng mỏng 🧥',
      'Quần short/cộc tay 🩳',
      'Váy đầm mỏng nhẹ 👗',
      'Đừng quên kem chống nắng 🧴',
    ],
  },
  cold: {
    title: 'Se lạnh dễ chịu ❄️',
    food: [
      'Lẩu Thái/Lẩu nấm 🍲',
      'Thịt nướng xiên que 🍢',
      'Ngô/khoai lang nướng 🍠',
      'Sữa đậu nành nóng 🥛',
      'Phở/Bún bò nóng 🍜',
      'Cháo sườn nóng 🥣',
      'Bánh chưng rán 🥟',
    ],
    activity: [
      'Trekking/hiking 🏞️',
      'Đốt lửa trại 🏕️',
      'Cà phê view núi ☕',
      'Săn mây sáng sớm ☁️',
      'Tắm suối khoáng nóng ♨️',
      'Dạo phố đón gió mùa 🧣',
    ],
    clothes: [
      'Áo khoác gió/len 🧥',
      'Quần dài, quần kaki 👖',
      'Giày thể thao/boots 👟',
      'Khăn choàng cổ 🧣',
      'Áo giữ nhiệt bên trong 👕',
      'Mũ len/găng tay 🧤',
    ],
  },
  rain: {
    title: 'Mưa rào thất thường 🌧️',
    food: [
      'Lẩu Thái chua cay 🍲',
      'Bánh xèo/bánh khọt 🌮',
      'Cháo trắng hột vịt muối 🥣',
      'Mì tôm trứng xúc xích 🍜',
      'Cơm tấm sườn bì chả 🍛',
      'Ốc luộc/xào 🐌',
      'Bánh mì chảo nóng hổi 🍳',
    ],
    activity: [
      'Cày phim Netflix 🎬',
      'Massage/spa thư giãn 💆',
      'Cafe boardgame 🎲',
      'Lớp nấu ăn 🧑‍🍳',
      'Đọc sách/Podcast 🎧',
      'Dọn dẹp phòng 🧹',
      'Lượn lờ TTTM 🛍️',
    ],
    clothes: [
      'Áo mưa/ô (dù) ☔',
      'Dép nhựa/giày chống nước 🩴',
      'Quần short/lửng 🩳',
      'Túi/balo chống nước 🎒',
      'Quần áo mau khô 👖',
      'Áo khoác mỏng 🧥',
    ],
  },
  nice: {
    title: 'Thời tiết thật tuyệt vời 🌤️',
    food: [
      'BBQ/Picnic 🍖',
      'Cơm nhà làm 🍚',
      'Bún chả/Phở 🍜',
      'Bánh mì Việt Nam 🥖',
      'Salad tươi mát 🥗',
      'Pizza/Gà nướng 🍕',
      'Sushi/Sashimi 🍣',
    ],
    activity: [
      'Dã ngoại (picnic) 🧺',
      'Đạp xe dạo phố 🚴',
      'Chụp ảnh ngoài trời 📸',
      'Cà phê vỉa hè ☕',
      'Cắm trại cuối tuần 🏕️',
      'Tản bộ bờ hồ 🚶',
      'Dạo phố bằng xe máy 🛵',
    ],
    clothes: [
      'Trang phục thoải mái 👟',
      'Giày thể thao 👟',
      'Áo phông + jeans 👖',
      'Váy hoa/Sơ mi 👗',
      'Áo khoác mỏng tối 🧥',
      'Kính râm/mũ lưỡi trai 🧢',
      'Quần short ống rộng 🩳',
    ],
  },
}
