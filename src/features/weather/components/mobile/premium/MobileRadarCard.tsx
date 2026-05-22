'use client'

import { useMemo } from 'react'
import { Maximize2, Radar, X } from 'lucide-react'
import type { GeoLocation } from '@/features/geocoding/types'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/Dialog'

interface Props {
  location: GeoLocation
}

function windyUrl(lat: number, lon: number, zoom = 7) {
  const params = new URLSearchParams({
    type: 'map',
    location: 'coordinates',
    metricRain: 'mm',
    metricTemp: '°C',
    metricWind: 'km/h',
    zoom: String(zoom),
    overlay: 'radar',
    product: 'radar',
    level: 'surface',
    lat: String(lat),
    lon: String(lon),
    detailLat: String(lat),
    detailLon: String(lon),
    marker: 'true',
    calendar: 'now',
  })
  return `https://embed.windy.com/embed2.html?${params.toString()}`
}

function RadarFrame({ location, fullscreen = false }: { location: GeoLocation; fullscreen?: boolean }) {
  const src = useMemo(() => windyUrl(location.latitude, location.longitude, fullscreen ? 8 : 6), [fullscreen, location.latitude, location.longitude])

  return (
    <iframe
      title={`Radar mưa ${location.name}`}
      src={src}
      className="absolute inset-0 h-full w-full border-0"
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  )
}

export function MobileRadarCard({ location }: Props) {
  return (
    <section id="radar" className="overflow-hidden rounded-[28px] border border-black/5 bg-slate-950 text-white shadow-[0_20px_70px_rgba(15,23,42,0.22)] dark:border-white/10">
      <div className="flex items-center justify-between gap-4 p-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-white/58">
            <Radar size={15} aria-hidden />
            Radar mưa
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">Mây mưa quanh bạn</h2>
        </div>

        <Dialog>
          <DialogTrigger className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/14 text-white ring-1 ring-white/15 transition hover:bg-white/22">
            <Maximize2 size={18} aria-hidden />
            <span className="sr-only">Mở radar toàn màn hình</span>
          </DialogTrigger>
          <DialogContent hideClose className="h-[100dvh] w-screen max-w-none translate-x-[-50%] translate-y-[-50%] rounded-none border-0 bg-slate-950 p-0 text-white">
            <DialogTitle className="sr-only">Radar mưa toàn màn hình</DialogTitle>
            <DialogDescription className="sr-only">Bản đồ radar thời tiết theo vị trí hiện tại.</DialogDescription>
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/65 to-transparent p-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
              <div>
                <p className="text-xs font-semibold uppercase text-white/60">Radar mưa</p>
                <p className="text-lg font-semibold">{location.name}</p>
              </div>
              <DialogClose className="grid h-11 w-11 place-items-center rounded-full bg-white/14 text-white ring-1 ring-white/15 backdrop-blur-xl">
                <X size={19} aria-hidden />
                <span className="sr-only">Đóng radar</span>
              </DialogClose>
            </div>
            <div className="relative h-full w-full">
              <RadarFrame location={location} fullscreen />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog>
        <DialogTrigger className="group relative block h-[300px] w-full overflow-hidden bg-slate-900 text-left md:h-[420px]">
          <RadarFrame location={location} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-[22px] bg-black/45 p-3 backdrop-blur-xl ring-1 ring-white/12">
            <span className="text-sm font-medium text-white/86">Chạm để xem toàn màn hình</span>
            <Maximize2 size={17} aria-hidden />
          </div>
        </DialogTrigger>
        <DialogContent hideClose className="h-[100dvh] w-screen max-w-none translate-x-[-50%] translate-y-[-50%] rounded-none border-0 bg-slate-950 p-0 text-white">
          <DialogTitle className="sr-only">Radar mưa toàn màn hình</DialogTitle>
          <DialogDescription className="sr-only">Bản đồ radar thời tiết theo vị trí hiện tại.</DialogDescription>
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/65 to-transparent p-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
            <div>
              <p className="text-xs font-semibold uppercase text-white/60">Radar mưa</p>
              <p className="text-lg font-semibold">{location.name}</p>
            </div>
            <DialogClose className="grid h-11 w-11 place-items-center rounded-full bg-white/14 text-white ring-1 ring-white/15 backdrop-blur-xl">
              <X size={19} aria-hidden />
              <span className="sr-only">Đóng radar</span>
            </DialogClose>
          </div>
          <div className="relative h-full w-full">
            <RadarFrame location={location} fullscreen />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
