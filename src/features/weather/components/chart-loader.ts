import dynamic from 'next/dynamic'
import { Skeleton } from '@/shared/ui/Skeleton'
import type { HourlyPoint } from '@/features/weather/types'
import { createElement } from 'react'

const loading = () => createElement(Skeleton, { className: 'h-80 rounded-2xl' })

const charts = {
  temperature: dynamic<{ hourly: HourlyPoint[]; hours?: number }>(
    () => import('./TemperatureChart').then((m) => m.TemperatureChart),
    { ssr: false, loading },
  ),
  rain: dynamic<{ hourly: HourlyPoint[]; hours?: number }>(
    () => import('./RainProbabilityChart').then((m) => m.RainProbabilityChart),
    { ssr: false, loading },
  ),
}

export function dynamicChart(key: keyof typeof charts) {
  return charts[key]
}
