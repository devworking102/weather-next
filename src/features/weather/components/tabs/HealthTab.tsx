'use client'

import { useMemo } from 'react'
import { Card } from '@/shared/ui/Card'
import { useAirQuality } from '@/features/weather/hooks/useWeather'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { computeHealthIndices } from '@/features/weather/utils/health'
import type { WeatherBundle } from '@/features/weather/types'

interface Props {
  weather: WeatherBundle
}

export function HealthTab({ weather }: Props) {
  const location = useLocationStore((s) => s.current)
  const { data: aqi } = useAirQuality(location?.latitude, location?.longitude)

  const indices = useMemo(() => computeHealthIndices(weather, aqi ?? undefined), [weather, aqi])

  return (
    <div className="space-y-4">
      <Card className="p-0">
        <div className="flex items-center gap-2 border-b border-black/5 px-5 py-3 dark:border-white/5">
          <span className="text-lg">❤️</span>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Chỉ số sức khỏe hôm nay
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-0 divide-y divide-black/5 dark:divide-white/5 sm:grid-cols-2 sm:divide-y-0">
          {indices.map((idx, i) => (
            <HealthRow key={idx.id} index={idx} border={i % 2 === 0 && i < indices.length - 1} />
          ))}
        </div>
      </Card>
    </div>
  )
}

function HealthRow({
  index,
  border,
}: {
  index: ReturnType<typeof computeHealthIndices>[number]
  border: boolean
}) {
  const dots = Array.from({ length: 5 }, (_, i) => i < index.rating.value)

  return (
    <div
      className={`flex items-start gap-4 px-5 py-4 ${border ? 'sm:border-r sm:border-black/5 sm:dark:border-white/5' : ''}`}
    >
      <span className="text-3xl drop-shadow-sm" aria-hidden>
        {index.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{index.title}</span>
          <span
            className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
            style={{ color: index.rating.color, background: index.rating.color + '20' }}
          >
            {index.rating.level}
          </span>
        </div>
        <div className="mb-1.5 flex gap-1">
          {dots.map((filled, i) => (
            <span
              key={i}
              className="h-2 w-6 rounded-full"
              style={{ background: filled ? index.rating.color : 'rgba(0,0,0,0.08)' }}
            />
          ))}
        </div>
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {index.message}
        </p>
      </div>
    </div>
  )
}
