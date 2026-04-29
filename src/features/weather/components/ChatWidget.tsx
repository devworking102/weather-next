'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Bot, X, Send, MessageSquare } from 'lucide-react'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { useWeather, useAirQuality } from '@/features/weather/hooks/useWeather'
import { useUiStore } from '@/shared/store/ui-store'
import { wmoInfo } from '@/features/weather/utils/wmo'
import { cn } from '@/shared/lib/cn'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const location = useLocationStore((s) => s.current)
  const unit = useUiStore((s) => s.unit)
  const locale = useUiStore((s) => s.locale)
  const tempUnit = unit === 'f' ? 'fahrenheit' : 'celsius'
  const { data: weather } = useWeather(location?.latitude, location?.longitude, tempUnit)
  const { data: aqi } = useAirQuality(location?.latitude, location?.longitude)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || streaming || !weather || !location) return

    const userMsg: Message = { role: 'user', content: text }
    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput('')
    setStreaming(true)

    const context = {
      locationName: location.name,
      temperature: weather.current.temperature,
      weatherCondition: wmoInfo(weather.current.weatherCode).label,
      humidity: weather.current.humidity,
      windSpeed: weather.current.windSpeed,
      aqi: aqi?.current.europeanAqi,
      tempMax: weather.daily[0]?.tempMax ?? weather.current.temperature,
      tempMin: weather.daily[0]?.tempMin ?? weather.current.temperature,
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          context,
          locale,
        }),
      })

      if (!res.ok || !res.body) {
        setMessages((prev) => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.' }
          return next
        })
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const next = [...prev]
          next[next.length - 1] = {
            role: 'assistant',
            content: next[next.length - 1].content + chunk,
          }
          return next
        })
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev]
        next[next.length - 1] = { role: 'assistant', content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.' }
        return next
      })
    } finally {
      setStreaming(false)
    }
  }, [input, streaming, weather, location, aqi, messages, locale])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  if (!location || !weather) return null

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-700 active:scale-95"
        aria-label="Mở chat thời tiết"
      >
        {open ? <X size={20} /> : <MessageSquare size={20} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-5 z-50 flex h-[480px] w-[340px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          {/* Header */}
          <div className="flex items-center gap-2.5 bg-indigo-600 px-4 py-3 text-white">
            <Bot size={18} className="shrink-0" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{location.name}</div>
              <div className="text-xs opacity-75">
                {Math.round(weather.current.temperature)}°C · {wmoInfo(weather.current.weatherCode).label}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {messages.length === 0 && (
              <div className="mt-4 text-center text-xs text-slate-400">
                Hỏi tôi về thời tiết, trang phục, hay hoạt động phù hợp hôm nay!
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'ml-auto bg-indigo-600 text-white'
                    : 'mr-auto bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
                )}
              >
                {msg.content || (
                  <span className="inline-flex gap-1 opacity-60">
                    <span className="animate-bounce">·</span>
                    <span className="animate-bounce [animation-delay:0.15s]">·</span>
                    <span className="animate-bounce [animation-delay:0.3s]">·</span>
                  </span>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 p-2.5 dark:border-slate-700">
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Nhập câu hỏi..."
                disabled={streaming}
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none dark:text-slate-100"
              />
              <button
                onClick={send}
                disabled={!input.trim() || streaming}
                className="shrink-0 rounded-lg p-1.5 text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-40 dark:hover:bg-slate-700"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
