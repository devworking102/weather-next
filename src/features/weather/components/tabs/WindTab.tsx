'use client'

import { Card } from '@/shared/ui/Card'
import { useLocationStore } from '@/features/geocoding/store/location-store'

export function WindTab() {
  const location = useLocationStore((s) => s.current)

  const lat = location?.latitude?.toFixed(2) ?? '16'
  const lon = location?.longitude?.toFixed(2) ?? '108'

  const src = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&width=650&height=450&zoom=5&level=surface&overlay=wind&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-black/5 px-5 py-3 dark:border-white/5">
          <span className="text-lg">🗺️</span>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Bản đồ gió toàn cầu (Windy)
          </h3>
        </div>
        <div className="aspect-[4/3] w-full sm:aspect-video">
          <iframe
            src={src}
            width="100%"
            height="100%"
            className="border-0"
            title="Bản đồ gió Windy"
            allowFullScreen
          />
        </div>
      </Card>
    </div>
  )
}
