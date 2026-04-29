'use client'

import { Card } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { useTyphoons } from '@/features/typhoons/hooks/useTyphoons'
import { useT } from '@/shared/hooks/useT'
import type { Typhoon } from '@/features/typhoons/types'

function sevClass(cat: string) {
  const c = (cat || '').toUpperCase()
  if (c.includes('STS') || c.includes('TY') || c.includes('STY'))
    return 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200'
  if (c.includes('TS'))
    return 'border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200'
  return 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
}

function fDateTime(ms: number) {
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function TyphoonCard() {
  const location = useLocationStore((s) => s.current)
  const t = useT()
  const { data, isLoading, isError } = useTyphoons(location?.latitude, location?.longitude)

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl">🌀</span>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t.typhoons.title}
        </h3>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : isError ? (
        <p className="text-sm text-rose-500">{t.typhoons.loadFailed}</p>
      ) : !data?.length ? (
        <p className="text-sm text-slate-500">🌤️ {t.typhoons.noTyphoons}</p>
      ) : (
        <ul className="space-y-3">
          {data.map((t: Typhoon) => (
            <li
              key={t.id}
              className={`flex items-center gap-3 rounded-xl border p-3 ${sevClass(t.category)}`}
            >
              <div className="text-3xl">🌀</div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-bold">{t.name}</span>
                  {t.nameJa ? <span className="text-xs opacity-70">({t.nameJa})</span> : null}
                  <span className="rounded bg-white/60 px-1.5 py-0.5 text-[10px] font-bold uppercase dark:bg-white/10">
                    {t.category}
                  </span>
                </div>
                <div className="space-y-0.5 text-xs opacity-90">
                  <div>
                    📍 {t.distanceKm.toLocaleString()} km — {t.lat.toFixed(1)}°, {t.lon.toFixed(1)}°
                  </div>
                  {t.windKmh || t.pressure ? (
                    <div className="flex gap-3">
                      {t.windKmh ? <span>💨 {t.windKmh} km/h</span> : null}
                      {t.pressure ? <span>⏱ {t.pressure} hPa</span> : null}
                    </div>
                  ) : null}
                  <div className="opacity-60">🕐 {fDateTime(t.time)}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
