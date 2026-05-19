import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getClaudeClient, CLAUDE_MODEL } from '@/shared/lib/claude'
import { aiGenerate } from '@/shared/lib/ai'
import { searchPlaces } from '@/features/geocoding/services/geocoding'
import { fetchWeather } from '@/features/weather/services/weather'
import { wmoInfo } from '@/features/weather/utils/wmo'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatContext {
  locationName: string
  temperature: number
  weatherCondition: string
  humidity: number
  windSpeed: number
  aqi?: number
  tempMax: number
  tempMin: number
}

interface ChatPayload {
  messages: ChatMessage[]
  context: ChatContext
  locale?: string
}

const STATIC_SYSTEM = `Bạn là trợ lý thời tiết. Trả lời ngắn, súc tích, đi thẳng vào vấn đề.

Quy tắc cứng:
- Luôn dùng get_weather trước khi trả lời.
- TUYỆT ĐỐI không được nhắc đến tên tool, tên hàm (get_weather, v.v.) hay bất kỳ tên kỹ thuật nào trong câu trả lời.
- KHÔNG mở đầu bằng "Tôi vừa kiểm tra", "Sau khi xem", "Dựa trên dữ liệu" hay bất kỳ cụm filler nào — bắt đầu thẳng bằng thông tin.
- KHÔNG tự gọi mình là AI, mô hình, bot hay hệ thống. Nếu cần xưng vai trò thì chỉ dùng "trợ lý".
- KHÔNG nhắc đến "tool", "API", "model", "provider", "dữ liệu", "nguồn", "độ tin cậy", "kiểm tra lại".
- Độ dài: câu hỏi yes/no → 1-2 câu; câu hỏi đơn giản → 3-5 câu; câu hỏi tuần/nhiều ngày → tối đa 7 câu.
- Khi hữu ích, thêm gợi ý thực tế về đồ mang theo, khung giờ nên đi, rủi ro mưa/nắng/gió/AQI/UV, và phương án thay thế trong nhà.
- Chỉ nêu thông tin liên quan trực tiếp đến câu hỏi, nhưng nếu có rủi ro đáng chú ý thì nhắc ngắn gọn kèm hành động cụ thể.
- Ngôn ngữ: tiếng Việt (hoặc tiếng Anh nếu user dùng tiếng Anh).`

const WEATHER_TOOL: Anthropic.Tool = {
  name: 'get_weather',
  description: 'Lấy dữ liệu thời tiết thực tế cho bất kỳ địa điểm nào theo tên.',
  input_schema: {
    type: 'object' as const,
    properties: {
      location_name: {
        type: 'string',
        description: 'Tên thành phố hoặc địa điểm, ví dụ: "Hà Nội", "Đà Nẵng", "Tokyo"',
      },
    },
    required: ['location_name'],
  },
}

function stripToolPrefix(text: string): string {
  return text.replace(/^\s*\w+\s*[:：]\s*/, '')
}

async function runWeatherTool(locationName: string): Promise<string> {
  try {
    const places = await searchPlaces(locationName, 1)
    if (!places.length) return `Không tìm thấy địa điểm "${locationName}".`

    const place = places[0]
    const weather = await fetchWeather(place.latitude, place.longitude)
    const label = [place.name, place.admin1, place.country].filter(Boolean).join(', ')

    // Current conditions
    const cur = weather.current
    const curInfo = wmoInfo(cur.weatherCode)
    const current = [
      `Địa điểm: ${label}`,
      `Nhiệt độ: ${Math.round(cur.temperature)}°C (cảm giác ${Math.round(cur.apparentTemperature)}°C)`,
      `Tình trạng: ${curInfo.label}`,
      `Độ ẩm: ${Math.round(cur.humidity)}%`,
      `Gió: ${Math.round(cur.windSpeed)} km/h (giật ${Math.round(cur.windGusts)} km/h)`,
      `UV: ${Math.round(cur.uvIndex)}`,
      `Tầm nhìn: ${Math.round(cur.visibility / 1000)} km`,
      `Lượng mưa hiện tại: ${cur.precipitation} mm`,
    ].join('\n')

    // Hourly forecast next 12h
    const hourlyLines = weather.hourly.slice(0, 12).map((h, i) => {
      const hInfo = wmoInfo(h.weatherCode)
      return `+${i + 1}h: ${Math.round(h.temperature)}°C, ${hInfo.label}, mưa ${h.precipitationProbability}%`
    }).join('\n')

    // Daily forecast next 5 days
    const dailyLines = weather.daily.slice(0, 5).map((d) => {
      const dInfo = wmoInfo(d.weatherCode)
      return `${d.date}: cao ${Math.round(d.tempMax)}°C / thấp ${Math.round(d.tempMin)}°C, ${dInfo.label}, mưa ${d.precipitationProbability}%, gió tối đa ${Math.round(d.windSpeedMax)} km/h`
    }).join('\n')

    return `=== THỜI TIẾT ${label.toUpperCase()} ===\n\n[Hiện tại]\n${current}\n\n[Dự báo theo giờ (12h tới)]\n${hourlyLines}\n\n[Dự báo 5 ngày]\n${dailyLines}`
  } catch {
    return `Không lấy được dữ liệu thời tiết cho "${locationName}".`
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ChatPayload
  const { messages, context, locale } = body

  const lang = locale === 'en' ? 'English' : 'tiếng Việt'
  const aqiNote = context.aqi != null ? ` AQI: ${Math.round(context.aqi)}.` : ''
  const currentCtx = `Vị trí hiện tại người dùng đang xem: ${context.locationName}, ${Math.round(context.temperature)}°C, ${context.weatherCondition}.${aqiNote} Ngôn ngữ: ${lang}`

  const systemBlocks: Anthropic.TextBlockParam[] = [
    { type: 'text', text: STATIC_SYSTEM, cache_control: { type: 'ephemeral' } },
    { type: 'text', text: currentCtx, cache_control: { type: 'ephemeral' } },
  ]

  const anthropicMessages: Anthropic.MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  const client = getClaudeClient()

  if (client) {
    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder()
        try {
          // Phase 1: non-streaming call with tool so Claude can fetch weather
          const phase1 = await client.messages.create({
            model: CLAUDE_MODEL,
            max_tokens: 2048,
            thinking: { type: 'adaptive' },
            tools: [WEATHER_TOOL],
            system: systemBlocks,
            messages: anthropicMessages,
          })

          // If Claude called get_weather, execute it and make a follow-up streaming call
          if (phase1.stop_reason === 'tool_use') {
            const toolUseBlock = phase1.content.find(
              (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
            )

            if (toolUseBlock) {
              const input = toolUseBlock.input as { location_name: string }
              const toolResult = await runWeatherTool(input.location_name)

              const phase2Messages: Anthropic.MessageParam[] = [
                ...anthropicMessages,
                { role: 'assistant', content: phase1.content },
                {
                  role: 'user',
                  content: [
                    {
                      type: 'tool_result' as const,
                      tool_use_id: toolUseBlock.id,
                      content: toolResult,
                    },
                  ],
                },
              ]

              const streamResponse = client.messages.stream({
                model: CLAUDE_MODEL,
                max_tokens: 2048,
                thinking: { type: 'adaptive' },
                system: systemBlocks,
                messages: phase2Messages,
              })

              let head = ''
              let headDone = false
              for await (const event of streamResponse) {
                if (
                  event.type === 'content_block_delta' &&
                  event.delta.type === 'text_delta'
                ) {
                  if (!headDone) {
                    head += event.delta.text
                    if (head.length >= 80) {
                      headDone = true
                      controller.enqueue(enc.encode(stripToolPrefix(head)))
                    }
                  } else {
                    controller.enqueue(enc.encode(event.delta.text))
                  }
                }
              }
              if (!headDone) controller.enqueue(enc.encode(stripToolPrefix(head)))
            }
          } else {
            // Claude answered directly — emit the text blocks
            for (const block of phase1.content) {
              if (block.type === 'text') {
                controller.enqueue(enc.encode(block.text))
              }
            }
          }
        } catch {
          controller.enqueue(enc.encode('Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.'))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }

  // Fallback: Gemini / Groq — fetch weather for the asked location manually
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  if (!lastUser) return new Response('', { status: 400 })

  // Try to fetch weather for any location mentioned in the question
  let extraCtx = ''
  const places = await searchPlaces(lastUser.content, 1).catch(() => [])
  if (places.length) {
    extraCtx = '\n\n' + (await runWeatherTool(places[0].name).catch(() => ''))
  }

  const fallbackPrompt = `${STATIC_SYSTEM}\n\n${currentCtx}${extraCtx}\n\nNgười dùng hỏi: ${lastUser.content}\nTrả lời đầy đủ, giàu gợi ý thực tế, không markdown:`
  const result = await aiGenerate(fallbackPrompt, { maxOutputTokens: 650 })
  const text = result?.text ?? 'Xin lỗi, dịch vụ trợ lý tạm thời không khả dụng.'

  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
