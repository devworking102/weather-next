'use client'

import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/shared/ui/Card'
import type { HourlyPoint } from '@/features/weather/types'

interface Props {
  hourly: HourlyPoint[]
  hours?: number
}

export function TemperatureChart({ hourly, hours = 24 }: Props) {
  const data = useMemo(() => {
    const now = new Date().toISOString().slice(0, 13) + ':00'
    const idx = Math.max(0, hourly.findIndex((h) => h.time >= now))
    return hourly.slice(idx, idx + hours).map((h) => ({
      label: h.time.slice(11, 16),
      temp: Math.round(h.temperature),
      feels: Math.round(h.apparentTemperature),
    }))
  }, [hourly, hours])

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Nhiệt độ · {hours} giờ
      </h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="temp-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" strokeOpacity={0.5} />
            <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" strokeOpacity={0.5} width={30} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.08)',
                fontSize: 12,
              }}
              formatter={((value: number, name: string) => [
                `${value}°`,
                name === 'temp' ? 'Nhiệt độ' : 'Cảm nhận',
              ]) as never}
            />
            <Area
              type="monotone"
              dataKey="temp"
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#temp-fill)"
            />
            <Area
              type="monotone"
              dataKey="feels"
              stroke="#f97316"
              strokeOpacity={0.4}
              strokeDasharray="3 3"
              strokeWidth={1.5}
              fill="transparent"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
