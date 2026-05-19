'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { useT } from '@/shared/hooks/useT'
import type { GeoLocation } from '@/features/geocoding/types'

interface Props {
  location: GeoLocation
}

export function RadarPreviewCard({ location }: Props) {
  const t = useT()

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {t.smartHero.radarCta}
        </h3>
        <Link
          href={`/radar-mua?lat=${location.latitude}&lon=${location.longitude}`}
          className="flex items-center gap-0.5 text-xs font-medium text-sky-600 transition-colors hover:text-sky-800 hover:underline dark:text-sky-400 dark:hover:text-sky-200"
        >
          {t.radar.fullscreen}
          <ChevronRight size={13} aria-hidden />
        </Link>
      </div>
      <Link href={`/radar-mua?lat=${location.latitude}&lon=${location.longitude}`} className="group relative block h-56 w-full bg-slate-100 dark:bg-slate-800">
        <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]" />
        <iframe
          src={`https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h&zoom=5&overlay=rain&product=ecmwf&level=surface&lat=${location.latitude}&lon=${location.longitude}&detailLat=${location.latitude}&detailLon=${location.longitude}&marker=true`}
          frameBorder="0"
          title={t.radar.pageTitle}
          className="pointer-events-none absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          tabIndex={-1}
        />
      </Link>
    </Card>
  )
}
