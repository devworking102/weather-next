'use client'

import dynamic from 'next/dynamic'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { Skeleton } from '@/shared/ui/Skeleton'

const OpenLayersRainMap = dynamic(
  () => import('./OpenLayersRainMap').then((m) => ({ default: m.OpenLayersRainMap })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[420px] w-full max-w-full rounded-2xl" />,
  },
)

const RadarEmbed = dynamic(
  () => import('./RadarEmbed').then((m) => ({ default: m.RadarEmbed })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[480px] w-full max-w-full rounded-2xl" />,
  },
)

const DEFAULT = { lat: 21.0285, lon: 105.8542 }

export function RadarPageContent() {
  const current = useLocationStore((s) => s.current)
  const lat = current?.latitude ?? DEFAULT.lat
  const lon = current?.longitude ?? DEFAULT.lon

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">OpenLayers + RainViewer</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Lớp radar từ API công khai RainViewer (XYZ) + nền OpenStreetMap.
        </p>
        <OpenLayersRainMap latitude={lat} longitude={lon} />
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Windy (embed)</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Bản đầy đủ trong iframe — tốn băng thông hơn.</p>
        <RadarEmbed />
      </section>
    </div>
  )
}
