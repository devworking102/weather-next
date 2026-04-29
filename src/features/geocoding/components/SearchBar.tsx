'use client'

import { useRef, useState } from 'react'
import { Loader2, MapPin, Search } from 'lucide-react'
import { usePlaceAutocomplete } from '@/features/geocoding/hooks/useGeocoding'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { useT } from '@/shared/hooks/useT'
import type { GeoLocation } from '@/features/geocoding/types'
import { Input } from '@/shared/ui/Input'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const setCurrent = useLocationStore((s) => s.setCurrent)
  const setPinned = useLocationStore((s) => s.setPinned)
  const t = useT()

  const { data, isFetching } = usePlaceAutocomplete(query)

  function onPick(loc: GeoLocation) {
    setCurrent(loc)
    setPinned(true)
    setQuery('')
    setOpen(false)
  }

  function onLocate() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrent({
          id: Date.now(),
          name: t.search.currentLocation,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          country: '',
        })
        setPinned(false)
      },
      () => {},
      { timeout: 8000 },
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center gap-2 rounded-2xl border border-black/5 bg-white px-3 py-2 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
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
        >
          <MapPin size={18} />
        </button>
      </div>

      {open && query.length >= 2 && data && data.length > 0 ? (
        <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900">
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
    </div>
  )
}
