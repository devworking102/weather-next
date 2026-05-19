'use client'

import dynamic from 'next/dynamic'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { Skeleton } from '@/shared/ui/Skeleton'

const OpenLayersRainMap = dynamic(
  () => import('./OpenLayersRainMap').then((m) => ({ default: m.OpenLayersRainMap })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[min(70vh,640px)] w-full max-w-full rounded-3xl" />,
  },
)

const DEFAULT = { lat: 21.0285, lon: 105.8542 }

export function RadarPageContent() {
  const current = useLocationStore((s) => s.current)
  const lat = current?.latitude ?? DEFAULT.lat
  const lon = current?.longitude ?? DEFAULT.lon

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-950/60">
      <OpenLayersRainMap latitude={lat} longitude={lon} />
      <div className="grid gap-4 border-t border-slate-100 p-4 text-sm dark:border-white/10 md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="font-semibold text-slate-950 dark:text-white">Cường độ mưa</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              ['Mưa nhẹ', 'bg-sky-300'],
              ['Mưa vừa', 'bg-blue-500'],
              ['Mưa to', 'bg-violet-600'],
              ['Rất mạnh', 'bg-rose-600'],
            ].map(([label, color]) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 dark:bg-white/5">
                <span className={`h-2.5 w-2.5 rounded-full ${color}`} aria-hidden />
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/5">
          <p className="font-semibold text-slate-950 dark:text-white">Timeline</p>
          <p className="mt-1 text-slate-600 dark:text-slate-300">Khung radar mới nhất, phù hợp để kiểm tra nhanh trước khi ra ngoài.</p>
        </div>
      </div>
    </section>
  )
}
