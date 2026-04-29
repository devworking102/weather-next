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

const STATIC_SYSTEM = `Bạn là trợ lý thời tiết. Trả lời NGẮN GỌN: tối đa 2 câu. Không markdown, không gạch đầu dòng.

Quy tắc:
- Dùng tool get_weather khi user hỏi về bất kỳ địa điểm nào (kể cả địa điểm trong context).
- Sau khi có dữ liệu, trả lời trực tiếp, cụ thể vào câu hỏi.
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

async function runWeatherTool(locationName: string): Promise<string> {
  try {
    const places = await searchPlaces(locationName, 1)
    if (!places.length) return `Không tìm thấy địa điểm "${locationName}".`

    const place = places[0]
    const weather = await fetchWeather(place.latitude, place.longitude)
    const info = wmoInfo(weather.current.weatherCode)
    const label = [place.name, place.admin1, place.country].filter(Boolean).join(', ')

    const hourlyRain = weather.hourly.slice(0, 12).filter((h) => h.precipitationProbability >= 60).length
    const rainNote = hourlyRain >= 3 ? `Khả năng mưa cao trong ${hourlyRain}h tới.` : 'Không mưa đáng kể.'

    return `Thời tiết tại ${label}: ${Math.round(weather.current.temperature)}°C, ${info.label}. Cao ${Math.round(weather.daily[0]?.tempMax ?? weather.current.temperature)}°C / thấp ${Math.round(weather.daily[0]?.tempMin ?? weather.current.temperature)}°C. Độ ẩm ${Math.round(weather.current.humidity)}%, gió ${Math.round(weather.current.windSpeed)} km/h. ${rainNote}`
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
            max_tokens: 1024,
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
                max_tokens: 1024,
                thinking: { type: 'adaptive' },
                system: systemBlocks,
                messages: phase2Messages,
              })

              for await (const event of streamResponse) {
                if (
                  event.type === 'content_block_delta' &&
                  event.delta.type === 'text_delta'
                ) {
                  controller.enqueue(enc.encode(event.delta.text))
                }
              }
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

  const fallbackPrompt = `${STATIC_SYSTEM}\n\n${currentCtx}${extraCtx}\n\nNgười dùng hỏi: ${lastUser.content}\nTrả lời tối đa 2 câu ngắn, không markdown:`
  const result = await aiGenerate(fallbackPrompt, { maxOutputTokens: 200 })
  const text = result?.text ?? 'Xin lỗi, dịch vụ AI tạm thời không khả dụng.'

  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
