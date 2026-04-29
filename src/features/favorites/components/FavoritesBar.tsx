'use client'

import { useUiStore } from '@/shared/store/ui-store'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { useT } from '@/shared/hooks/useT'
import { X } from 'lucide-react'

export function FavoritesBar() {
  const favorites = useUiStore((s) => s.favorites)
  const remove = useUiStore((s) => s.removeFavorite)
  const setCurrent = useLocationStore((s) => s.setCurrent)
  const setPinned = useLocationStore((s) => s.setPinned)
  const t = useT()

  if (favorites.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {t.favorites.title}
      </span>
      {favorites.map((f) => (
        <div
          key={f.id}
          className="group inline-flex items-center overflow-hidden rounded-full border border-amber-200/60 bg-amber-50/80 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"
        >
          <button
            onClick={() => {
              setCurrent({ ...f })
              setPinned(true)
            }}
            className="px-3 py-1.5 font-medium hover:bg-amber-100 dark:hover:bg-amber-500/15"
            type="button"
          >
            {f.name}
          </button>
          <button
            onClick={() => remove(f.id)}
            className="px-2 py-1.5 text-amber-500 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
            aria-label={t.favorites.removeLabel}
            type="button"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
