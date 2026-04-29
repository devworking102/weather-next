'use client'

import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/shared/ui/Card'
import type { HourlyPoint } from '@/features/weather/types'
import { useT } from '@/shared/hooks/useT'

interface Props {
  hourly: HourlyPoint[]
  hours?: number
}

export function RainProbabilityChart({ hourly, hours = 24 }: Props) {
  const t = useT()
  const data = useMemo(() => {
    const now = new Date().toISOString().slice(0, 13) + ':00'
    const idx = Math.max(0, hourly.findIndex((h) => h.time >= now))
    return hourly.slice(idx, idx + hours).map((h) => ({
      label: h.time.slice(11, 16),
      prob: Math.round(h.precipitationProbability),
    }))
  }, [hourly, hours])

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {t.chart.rainTitle(hours)}
      </h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" strokeOpacity={0.5} />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              stroke="currentColor"
              strokeOpacity={0.5}
              width={30}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', fontSize: 12 }}
              formatter={((value: number) => [`${value}%`, t.chart.rainTooltip]) as never}
            />
            <Bar dataKey="prob" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
