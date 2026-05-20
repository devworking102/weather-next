'use client'

import { useLocationStore } from '@/features/geocoding/store/location-store'
import { useT } from '@/shared/hooks/useT'
import { cn } from '@/shared/lib/cn'

export function RecentLocationsRow() {
  const t = useT()
  const recent = useLocationStore((s) => s.recentLocations)
  const setCurrent = useLocationStore((s) => s.setCurrent)
  const setPinned = useLocationStore((s) => s.setPinned)

  if (!recent.length) return null

  return (
    <div className="flex min-w-0 items-center gap-2 overflow-hidden">
      <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">{t.recent.title}</span>
      <div className="scrollbar-thin flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
        {recent.map((loc) => (
          <button
            key={`${loc.latitude}-${loc.longitude}-${loc.id}`}
            type="button"
            onClick={() => {
              setCurrent(loc)
              setPinned(true)
            }}
            className={cn(
              'max-w-[10rem] shrink-0 truncate rounded-full border border-black/5 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition',
              'hover:border-sky-200 hover:bg-sky-50 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-white/10',
            )}
          >
            {loc.name}
          </button>
        ))}
      </div>
    </div>
  )
}
