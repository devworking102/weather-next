'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { useT } from '@/shared/hooks/useT'

const DEFAULT = { lat: 21.0285, lon: 105.8542, label: 'Hà Nội' }

function windyEmbedUrl(lat: number, lon: number, zoom = 6): string {
  const p = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    detailLat: String(lat),
    detailLon: String(lon),
    width: '650',
    height: '450',
    zoom: String(zoom),
    level: 'surface',
    overlay: 'radar',
    product: 'ecmwf',
    menu: '',
    message: '',
    marker: 'true',
    calendar: 'now',
    pressure: '',
    type: 'map',
    location: 'coordinates',
    detail: '',
    metricWind: 'km/h',
    metricTemp: '°C',
    radarRange: '-1',
  })
  return `https://embed.windy.com/embed2.html?${p.toString()}`
}

function RadarFrame({ lat, lon }: { lat: number; lon: number }) {
  const src = useMemo(() => windyEmbedUrl(lat, lon), [lat, lon])
  return (
    <iframe
      title="Windy radar"
      src={src}
      className="h-[min(70vh,520px)] w-full max-w-5xl rounded-2xl border border-black/10 bg-black shadow-xl dark:border-white/10"
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  )
}

const LazyRadar = dynamic(() => Promise.resolve({ default: RadarFrame }), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(70vh,520px)] w-full max-w-5xl items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
      <p className="text-sm text-slate-500">…</p>
    </div>
  ),
})

export function RadarEmbed() {
  const t = useT()
  const current = useLocationStore((s) => s.current)
  const lat = current?.latitude ?? DEFAULT.lat
  const lon = current?.longitude ?? DEFAULT.lon
  const label = current?.name ?? DEFAULT.label
  const [fs, setFs] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onFs = () => setFs(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  async function toggleFs() {
    const el = wrapRef.current
    if (!el) return
    try {
      if (!document.fullscreenElement) await el.requestFullscreen()
      else await document.exitFullscreen()
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {t.radar.usingLocation}{' '}
          <span className="font-semibold text-slate-900 dark:text-white">{label}</span>
        </p>
        <button
          type="button"
          onClick={() => void toggleFs()}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
        >
          {fs ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          {fs ? t.radar.exitFs : t.radar.fullscreen}
        </button>
      </div>
      <div id="radar-wrap" ref={wrapRef} className="flex justify-center">
        <LazyRadar lat={lat} lon={lon} />
      </div>
      <p className="text-center text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
        {t.radar.attribution}
      </p>
    </div>
  )
}
