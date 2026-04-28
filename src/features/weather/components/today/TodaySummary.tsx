'use client'

import { Card } from '@/shared/ui/Card'
import type { DailyPoint } from '@/features/weather/types'
import { uvCategory } from '@/features/weather/utils/format'
import { useUiStore, windLabel, convertWind } from '@/shared/store/ui-store'

interface Props {
  daily: DailyPoint[]
}

export function TodaySummary({ daily }: Props) {
  const unit = useUiStore((s) => s.unit)
  const wUnit = useUiStore((s) => s.windUnit)
  const sym = unit === 'f' ? '°F' : '°C'
  const d = daily[0]
  if (!d) return null
  const uv = uvCategory(d.uvIndexMax)

  return (
    <Card className="p-0">
      <div className="flex items-center gap-2 border-b border-black/5 px-5 py-3 dark:border-white/5">
        <span className="text-lg">🌡</span>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Cao / Thấp hôm nay
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3 p-5 md:grid-cols-3 lg:grid-cols-6">
        <Item label="Cao nhất" value={`▲ ${Math.round(d.tempMax)}${sym}`} color="text-orange-500" />
        <Item label="Thấp nhất" value={`▼ ${Math.round(d.tempMin)}${sym}`} color="text-sky-500" />
        <Item label="Lượng mưa" value={`🌧 ${d.precipitationSum}mm`} />
        <Item label="Khả năng mưa" value={`💧 ${Math.round(d.precipitationProbability)}%`} />
        <Item
          label="Gió lớn nhất"
          value={`💨 ${Math.round(convertWind(d.windSpeedMax, wUnit))}${windLabel(wUnit)}`}
        />
        <Item label="Tia UV" value={`☀️ UV ${d.uvIndexMax}`} color="" style={{ color: uv.color }} />
      </div>
    </Card>
  )
}

function Item({
  label,
  value,
  color,
  style,
}: {
  label: string
  value: string
  color?: string
  style?: React.CSSProperties
}) {
  return (
    <div className="flex flex-col">
      <span className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className={`text-lg font-bold ${color ?? 'text-slate-900 dark:text-white'}`} style={style}>
        {value}
      </span>
    </div>
  )
}
