'use client'

import { useRef, useState } from 'react'
import { Loader2, MapPin, Navigation, Search } from 'lucide-react'
import { usePlaceAutocomplete } from '@/features/geocoding/hooks/useGeocoding'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { useT } from '@/shared/hooks/useT'
import type { GeoLocation } from '@/features/geocoding/types'
import { Input } from '@/shared/ui/Input'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const setCurrent = useLocationStore((s) => s.setCurrent)
  const setPinned = useLocationStore((s) => s.setPinned)
  const addRecentLocation = useLocationStore((s) => s.addRecentLocation)
  const t = useT()

  const { data, isFetching } = usePlaceAutocomplete(query)
  const quickCities = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Đà Lạt']

  function onPick(loc: GeoLocation) {
    setCurrent(loc)
    setPinned(true)
    addRecentLocation(loc)
    setQuery('')
    setOpen(false)
  }

  function onLocate() {
    setLocationError('')
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError('Trình duyệt chưa hỗ trợ lấy vị trí. Bạn hãy nhập tên thành phố.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          id: Date.now(),
          name: t.search.currentLocation,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          country: '',
        }
        setCurrent(loc)
        addRecentLocation(loc)
        setPinned(false)
        setLocating(false)
      },
      () => {
        setLocating(false)
        setLocationError('Chưa lấy được vị trí. Bạn có thể nhập thành phố hoặc thử bật quyền vị trí.')
      },
      { timeout: 8000 },
    )
  }

  return (
    <div ref={rootRef} className="relative space-y-2">
      <div className="flex items-center gap-2 rounded-[1.5rem] border border-black/5 bg-white/90 px-3 py-2 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
        <Search className="shrink-0 text-slate-400" size={18} />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
          placeholder={t.search.placeholder}
          className="h-9 border-none bg-transparent px-0 focus:ring-0 dark:bg-transparent"
        />
        {isFetching && query.length >= 2 ? (
          <Loader2 className="shrink-0 animate-spin text-sky-500" size={18} />
        ) : null}
        <button
          onClick={onLocate}
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-sky-600 dark:hover:bg-white/5"
          title={t.search.useCurrentLocation}
          type="button"
          disabled={locating}
        >
          {locating ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} />}
        </button>
      </div>

      {locationError ? (
        <p className="px-2 text-xs leading-5 text-amber-700 dark:text-amber-300">
          {locationError}
        </p>
      ) : null}

      {query.length === 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={onLocate}
            disabled={locating}
            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-slate-950 px-3 text-xs font-semibold text-white shadow-sm transition active:scale-95 dark:bg-white dark:text-slate-950"
          >
            {locating ? <Loader2 className="animate-spin" size={14} aria-hidden /> : <MapPin size={14} aria-hidden />}
            {locating ? 'Đang lấy vị trí' : 'Vị trí của tôi'}
          </button>
          {quickCities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                setQuery(city)
                setOpen(true)
              }}
              className="min-h-10 shrink-0 rounded-full border border-black/5 bg-white/75 px-3 text-xs font-semibold text-slate-600 shadow-sm transition hover:text-sky-700 active:scale-95 dark:border-white/10 dark:bg-white/8 dark:text-slate-300"
            >
              {city}
            </button>
          ))}
        </div>
      ) : null}

      {open && query.length >= 2 && data && data.length > 0 ? (
        <ul className="absolute z-50 mt-2 max-h-[min(22rem,60vh)] w-full overflow-y-auto rounded-2xl border border-black/5 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900">
          {data.map((loc) => (
            <li key={loc.id}>
              <button
                onMouseDown={(e) => {
                  e.preventDefault()
                  onPick(loc)
                }}
                className="flex w-full items-center justify-between gap-3 border-b border-black/5 px-4 py-3 text-left last:border-0 hover:bg-sky-50 dark:border-white/5 dark:hover:bg-white/5"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {loc.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {loc.admin1 ? `${loc.admin1} · ` : ''}
                    {loc.country}
                  </div>
                </div>
                <MapPin size={14} className="text-slate-400" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {open && query.length >= 2 && data && data.length === 0 && !isFetching ? (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-black/5 bg-white p-4 text-sm text-slate-600 shadow-xl dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
          Chưa tìm thấy nơi này. Bạn thử nhập tên tỉnh/thành gần nhất nhé.
        </div>
      ) : null}
    </div>
  )
}
