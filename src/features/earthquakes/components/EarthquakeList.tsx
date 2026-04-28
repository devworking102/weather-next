'use client'

import { AlertTriangle, ExternalLink, Waves } from 'lucide-react'
import { useEarthquakes } from '@/features/earthquakes/hooks/useEarthquakes'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { Card } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'
import { formatRelativeTime } from '@/features/weather/utils/format'

function magColor(m: number) {
  if (m >= 7) return 'text-rose-600 bg-rose-50 dark:bg-rose-500/10'
  if (m >= 6) return 'text-orange-600 bg-orange-50 dark:bg-orange-500/10'
  if (m >= 5) return 'text-amber-600 bg-amber-50 dark:bg-amber-500/10'
  return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10'
}

export function EarthquakeList() {
  const location = useLocationStore((s) => s.current)
  const { data, isLoading, isError } = useEarthquakes(location?.latitude, location?.longitude)

  if (!location) {
    return <p className="text-sm text-slate-500">Chọn vị trí để xem hoạt động địa chấn gần đây.</p>
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="flex items-center gap-2 text-rose-600">
        <AlertTriangle size={16} />
        Không tải được dữ liệu địa chấn.
      </Card>
    )
  }

  if (!data?.length) {
    return (
      <Card className="text-center text-sm text-slate-500">
        Không có trận động đất đáng kể trong khu vực 1500 km gần đây.
      </Card>
    )
  }

  return (
    <ul className="space-y-2">
      {data.map((q) => (
        <li key={q.id}>
          <a
            href={q.url}
            target="_blank"
            rel="noopener"
            className="group flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50/50 dark:border-white/5 dark:bg-slate-900/60 dark:hover:border-sky-500/30 dark:hover:bg-sky-500/10"
          >
            <div
              className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-lg font-bold ${magColor(
                q.magnitude,
              )}`}
            >
              {q.magnitude.toFixed(1)}
              <span className="text-[9px] font-medium uppercase tracking-wider">Magnitude</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="truncate font-semibold">{q.place}</h4>
                {q.tsunami ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                    <Waves size={10} /> Sóng thần
                  </span>
                ) : null}
              </div>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                <span>{formatRelativeTime(q.time)}</span>
                <span>Sâu {q.depth.toFixed(0)} km</span>
                <span>Cách {q.distanceKm.toFixed(0)} km</span>
              </div>
            </div>
            <ExternalLink size={14} className="text-slate-300 transition-colors group-hover:text-sky-500" />
          </a>
        </li>
      ))}
    </ul>
  )
}
