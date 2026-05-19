import { NextRequest, NextResponse } from 'next/server'
import { claudeGenerate } from '@/shared/lib/claude'
import type { WeatherAlert } from '@/features/alerts/types'

interface AlertSummaryPayload {
  alerts: Pick<WeatherAlert, 'level' | 'title' | 'message'>[]
  locale?: string
}

export interface AlertSummaryResponse {
  summary: string
  source: 'claude' | 'fallback'
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as AlertSummaryPayload
  const { alerts, locale } = body

  if (!alerts.length) {
    return NextResponse.json({ summary: '', source: 'fallback' } satisfies AlertSummaryResponse)
  }

  const lang = locale === 'en' ? 'English' : 'tiếng Việt'
  const alertList = alerts
    .map((a) => `[${a.level.toUpperCase()}] ${a.title}: ${a.message}`)
    .join('\n')

  const prompt = `Bạn là trợ lý thời tiết. Tóm tắt các cảnh báo sau thành 2-3 câu tự nhiên bằng ${lang}, ưu tiên cảnh báo nguy hiểm nhất trước. Nêu rõ ai/cái gì bị ảnh hưởng, thời điểm cần chú ý nếu có trong nội dung, và một hành động an toàn cụ thể. Không liệt kê, viết như đoạn văn ngắn.\n\nCảnh báo:\n${alertList}`

  const text = await claudeGenerate(prompt, { maxOutputTokens: 200 })
  if (text) {
    return NextResponse.json({ summary: text.trim(), source: 'claude' } satisfies AlertSummaryResponse)
  }

  // Fallback: use the most severe alert's message
  const order = { danger: 0, warning: 1, info: 2 }
  const top = [...alerts].sort((a, b) => order[a.level] - order[b.level])[0]
  return NextResponse.json({
    summary: `${top.title}: ${top.message}`,
    source: 'fallback',
  } satisfies AlertSummaryResponse)
}
