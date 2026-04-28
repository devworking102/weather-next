'use client'

import { Card } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useHistorical } from '@/features/historical/hooks/useHistorical'
import { useUiStore } from '@/shared/store/ui-store'
import { cn } from '@/shared/lib/cn'

interface Props {
  lat: number
  lon: number
  todayMax: number
}

function arrow(d: number | null | undefined) {
  if (d == null) return ''
  if (d > 0.5) return '▲'
  if (d < -0.5) return '▼'
  return '≈'
}

function deltaColor(d: number | null | undefined) {
  if (d == null) return 'text-slate-400'
  if (d > 0.5) return 'text-rose-500'
  if (d < -0.5) return 'text-sky-500'
  return 'text-slate-500'
}

function label(d: number | null | undefined) {
  if (d == null) return 'Không có dữ liệu'
  const rounded = Math.round(d * 10) / 10
  if (Math.abs(rounded) < 0.5) return 'xấp xỉ'
  return `${rounded > 0 ? '+' : ''}${rounded}°`
}

export function HistoricalCompareCard({ lat, lon, todayMax }: Props) {
  const unit = useUiStore((s) => s.unit)
  const sym = unit === 'f' ? '°F' : '°C'
  const { data, isLoading } = useHistorical(lat, lon, todayMax)

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">📊</span>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          So sánh lịch sử
        </h3>
      </div>
      {isLoading && !data ? (
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      ) : data ? (
        <div className="grid grid-cols-2 gap-3">
          <Block
            title="So với hôm qua"
            delta={data.deltaMax}
            base={data.yesterdayMax}
            unit={sym}
          />
          <Block
            title="Cùng ngày năm trước"
            delta={data.deltaYearMax}
            base={data.lastYearMax}
            unit={sym}
          />
        </div>
      ) : (
        <p className="text-xs text-slate-400">Không tải được dữ liệu lịch sử.</p>
      )}
    </Card>
  )
}

function Block({
  title,
  delta,
  base,
  unit,
}: {
  title: string
  delta: number | null | undefined
  base: number | null | undefined
  unit: string
}) {
  return (
    <div className="rounded-xl border border-black/5 bg-slate-50 p-3 dark:border-white/5 dark:bg-slate-800/40">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {title}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={cn('text-2xl font-black', deltaColor(delta))}>
          {arrow(delta)} {label(delta)}
        </span>
      </div>
      <div className="mt-1 text-[11px] text-slate-400">
        {base != null ? `${Math.round(base)}${unit}` : '—'}
      </div>
    </div>
  )
}
