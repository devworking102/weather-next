'use client'

import { useEffect, useRef, useState } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import XYZ from 'ol/source/XYZ'
import { fromLonLat } from 'ol/proj'
import { LocateFixed, Minus, Plus } from 'lucide-react'

interface Props {
  latitude: number
  longitude: number
}

export function OpenLayersRainMap({ latitude, longitude }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    setError(null)
    setLoading(true)

    if (mapRef.current) {
      mapRef.current.setTarget(undefined)
      mapRef.current = null
    }

    let cancelled = false
    void (async () => {
      try {
        const response = await fetch('/api/rainviewer-frame')
        if (!response.ok) throw new Error('radar_frame')
        const { tileUrl } = (await response.json()) as { tileUrl: string }
        if (cancelled || !hostRef.current) return

        const baseMap = new TileLayer({ source: new OSM() })
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
          controls: [],
          layers: [baseMap, radar],
          view: new View({
            center: fromLonLat([longitude, latitude]),
            zoom: 6,
            minZoom: 3,
            maxZoom: 14,
          }),
        })
        mapRef.current = map
        setLoading(false)
      } catch {
        if (!cancelled) {
          setError('Chưa tải được radar mưa. Vui lòng thử lại sau ít phút.')
          setLoading(false)
        }
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

  const zoomBy = (delta: number) => {
    const view = mapRef.current?.getView()
    const zoom = view?.getZoom()
    if (view && typeof zoom === 'number') view.animate({ zoom: zoom + delta, duration: 180 })
  }

  const locateMe = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((position) => {
      mapRef.current?.getView().animate({
        center: fromLonLat([position.coords.longitude, position.coords.latitude]),
        zoom: 9,
        duration: 300,
      })
    })
  }

  return (
    <div className="relative w-full">
      <div
        ref={hostRef}
        className="h-[min(70vh,640px)] w-full overflow-hidden bg-slate-100 dark:bg-slate-900"
        aria-label="Bản đồ radar mưa"
      />
      {loading ? (
        <div className="absolute inset-0 grid place-items-center bg-white/60 text-sm font-medium text-slate-600 backdrop-blur-sm dark:bg-slate-950/50 dark:text-slate-200">
          Đang tải radar mưa...
        </div>
      ) : null}
      <div className="absolute right-3 top-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => zoomBy(1)}
          aria-label="Phóng to bản đồ"
          className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-800 shadow-md transition hover:bg-slate-50 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
        >
          <Plus className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => zoomBy(-1)}
          aria-label="Thu nhỏ bản đồ"
          className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-800 shadow-md transition hover:bg-slate-50 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
        >
          <Minus className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={locateMe}
          aria-label="Định vị vị trí của tôi"
          className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-800 shadow-md transition hover:bg-slate-50 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
        >
          <LocateFixed className="h-5 w-5" aria-hidden />
        </button>
      </div>
      {error ? (
        <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow dark:bg-rose-400/10 dark:text-rose-100">
          {error}
        </div>
      ) : null}
    </div>
  )
}
