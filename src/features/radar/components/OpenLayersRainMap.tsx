'use client'

import { useEffect, useRef, useState } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import XYZ from 'ol/source/XYZ'
import { fromLonLat } from 'ol/proj'

interface Props {
  latitude: number
  longitude: number
}

export function OpenLayersRainMap({ latitude, longitude }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    setError(null)

    if (mapRef.current) {
      mapRef.current.setTarget(undefined)
      mapRef.current = null
    }

    let cancelled = false
    void (async () => {
      try {
        const r = await fetch('/api/rainviewer-frame')
        if (!r.ok) throw new Error('frame')
        const { tileUrl } = (await r.json()) as { tileUrl: string }
        if (cancelled || !hostRef.current) return

        const osm = new TileLayer({ source: new OSM() })
        const radar = new TileLayer({
          source: new XYZ({
            url: tileUrl,
            crossOrigin: 'anonymous',
            maxZoom: 12,
          }),
          opacity: 0.78,
        })

        const map = new Map({
          target: host,
          layers: [osm, radar],
          view: new View({
            center: fromLonLat([longitude, latitude]),
            zoom: 6,
            minZoom: 3,
            maxZoom: 14,
          }),
        })
        mapRef.current = map
      } catch {
        if (!cancelled) setError('Không tải được lớp radar RainViewer.')
      }
    })()

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.setTarget(undefined)
        mapRef.current = null
      }
    }
  }, [latitude, longitude])

  return (
    <div className="w-full">
      <div ref={hostRef} className="h-[min(55vh,420px)] w-full overflow-hidden rounded-2xl border border-black/10 bg-slate-100 dark:border-white/10 dark:bg-slate-900" />
      {error ? <p className="mt-2 text-center text-xs text-rose-500">{error}</p> : null}
    </div>
  )
}
