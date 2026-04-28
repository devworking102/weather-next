'use client'

import { useMutation } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { useEffect } from 'react'
import { Card } from '@/shared/ui/Card'
import type { WeatherBundle } from '@/features/weather/types'
import type { GeoLocation } from '@/features/geocoding/types'

interface Props {
  location: GeoLocation
  weather: WeatherBundle
}

export function AiSummary({ location, weather }: Props) {
  const mutation = useMutation<{ summary: string; source: 'gemini' | 'heuristic' }, Error>({
    mutationFn: async () => {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: location.name,
          country: location.country,
          temperature: weather.current.temperature,
          apparentTemperature: weather.current.apparentTemperature,
          weatherCode: weather.current.weatherCode,
          humidity: weather.current.humidity,
          windSpeed: weather.current.windSpeed,
        }),
      })
      if (!res.ok) throw new Error('ai_failed')
      return res.json()
    },
  })

  useEffect(() => {
    mutation.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.id, weather.current.time])

  return (
    <Card className="border-sky-100 bg-gradient-to-br from-sky-50 to-white dark:border-sky-500/20 dark:from-sky-500/10 dark:to-slate-900/60">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
        <Sparkles size={14} />
        Tóm tắt
      </div>
      {mutation.isPending && !mutation.data ? (
        <div className="mt-3 space-y-2">
          <div className="shimmer h-3.5 w-full rounded" />
          <div className="shimmer h-3.5 w-11/12 rounded" />
          <div className="shimmer h-3.5 w-9/12 rounded" />
        </div>
      ) : mutation.data ? (
        <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          {mutation.data.summary}
        </p>
      ) : mutation.isError ? (
        <p className="mt-2 text-sm text-slate-500">Chưa thể tạo tóm tắt.</p>
      ) : null}
    </Card>
  )
}
