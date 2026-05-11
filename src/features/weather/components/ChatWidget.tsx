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
  /** Gộp chunk stream theo frame để giảm re-render khi model trả nhiều token nhỏ. */
  const streamBufferRef = useRef('')
  const streamRafRef = useRef<number | null>(null)

  const location = useLocationStore((s) => s.current)
  const unit = useUiStore((s) => s.unit)
  const locale = useUiStore((s) => s.locale)
  const tempUnit = unit === 'f' ? 'fahrenheit' : 'celsius'
  const { data: weather } = useWeather(location?.latitude, location?.longitude, tempUnit)
  const { data: aqi } = useAirQuality(location?.latitude, location?.longitude)
  const aqiCurrent = aqi?.current

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    return () => {
      if (streamRafRef.current != null) cancelAnimationFrame(streamRafRef.current)
    }
  }, [])

  /** Một frame tối đa một lần setState; mọi chunk trong buffer được gộp. */
  const flushPendingStream = useCallback(() => {
    streamRafRef.current = null
    const delta = streamBufferRef.current
    streamBufferRef.current = ''
    if (!delta) return
    setMessages((prev) => {
      const next = [...prev]
      const i = next.length - 1
      if (i < 0 || next[i]?.role !== 'assistant') return prev
      next[i] = { role: 'assistant', content: next[i]!.content + delta }
      return next
    })
  }, [])

  const scheduleStreamFlush = useCallback(() => {
    if (streamRafRef.current != null) return
    streamRafRef.current = requestAnimationFrame(flushPendingStream)
  }, [flushPendingStream])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || streaming || !weather || !location) return

    const userMsg: Message = { role: 'user', content: text }
    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput('')
    setStreaming(true)
    streamBufferRef.current = ''

    const context = {
      locationName: location.name,
      temperature: weather.current.temperature,
      weatherCondition: wmoInfo(weather.current.weatherCode).label,
      humidity: weather.current.humidity,
      windSpeed: weather.current.windSpeed,
      aqi: aqiCurrent?.europeanAqi,
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
        if (streamRafRef.current != null) {
          cancelAnimationFrame(streamRafRef.current)
          streamRafRef.current = null
        }
        streamBufferRef.current = ''
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
        if (!chunk) continue
        streamBufferRef.current += chunk
        scheduleStreamFlush()
      }

      if (streamRafRef.current != null) {
        cancelAnimationFrame(streamRafRef.current)
        streamRafRef.current = null
      }
      const tail = streamBufferRef.current
      streamBufferRef.current = ''
      if (tail) {
        setMessages((prev) => {
          const next = [...prev]
          const i = next.length - 1
          if (i < 0 || next[i]?.role !== 'assistant') return prev
          next[i] = { role: 'assistant', content: next[i]!.content + tail }
          return next
        })
      }
    } catch {
      if (streamRafRef.current != null) {
        cancelAnimationFrame(streamRafRef.current)
        streamRafRef.current = null
      }
      streamBufferRef.current = ''
      setMessages((prev) => {
        const next = [...prev]
        next[next.length - 1] = { role: 'assistant', content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.' }
        return next
      })
    } finally {
      setStreaming(false)
    }
  }, [input, streaming, weather, location, aqiCurrent, messages, locale, scheduleStreamFlush])

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
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-700 active:scale-95 md:bottom-5"
        aria-label="Mở chat thời tiết"
      >
        {open ? <X size={20} /> : <MessageSquare size={20} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-[calc(8.5rem+env(safe-area-inset-bottom,0px))] right-5 z-50 flex h-[min(480px,70vh)] w-[min(340px,92vw)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 md:bottom-20">
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
