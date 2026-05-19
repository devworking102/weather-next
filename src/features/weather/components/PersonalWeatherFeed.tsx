'use client'

import { BellRing, Download, Star } from 'lucide-react'
import { FavoriteStar } from '@/features/favorites/components/FavoriteStar'
import { InstallButton } from '@/features/pwa/components/InstallButton'
import { useUiStore } from '@/shared/store/ui-store'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import type { GeoLocation } from '@/features/geocoding/types'
import { useT } from '@/shared/hooks/useT'

interface Props {
  location: GeoLocation
}

export function PersonalWeatherFeed({ location }: Props) {
  const favorites = useUiStore((s) => s.favorites)
  const setCurrent = useLocationStore((s) => s.setCurrent)
  const setPinned = useLocationStore((s) => s.setPinned)
  const t = useT()

  return (
    <section
      aria-label={t.personalFeed.title}
      className="rounded-[1.75rem] border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.personalFeed.eyebrow}
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
            {t.personalFeed.title}
          </h2>
        </div>
        <FavoriteStar location={location} className="border-black/5 bg-slate-950 text-white dark:border-white/10 dark:bg-white dark:text-slate-950" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-sky-50 p-4 text-sky-900 dark:bg-sky-400/10 dark:text-sky-100">
          <BellRing size={18} aria-hidden />
          <p className="mt-3 text-sm font-semibold">{t.personalFeed.rainReminderTitle}</p>
          <p className="mt-1 text-xs leading-5 text-sky-800/75 dark:text-sky-100/75">
            {t.personalFeed.rainReminderDesc}
          </p>
        </div>

        <div className="rounded-2xl bg-amber-50 p-4 text-amber-900 dark:bg-amber-400/10 dark:text-amber-100">
          <Star size={18} aria-hidden />
          <p className="mt-3 text-sm font-semibold">{t.personalFeed.savedTitle}</p>
          <p className="mt-1 text-xs leading-5 text-amber-800/75 dark:text-amber-100/75">
            {favorites.length > 0
              ? t.personalFeed.savedCount(favorites.length)
              : t.personalFeed.savedEmpty}
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-100">
          <Download size={18} aria-hidden />
          <p className="mt-3 text-sm font-semibold">{t.personalFeed.installTitle}</p>
          <p className="mt-1 text-xs leading-5 text-emerald-800/75 dark:text-emerald-100/75">
            {t.personalFeed.installDesc}
          </p>
          <div className="mt-3">
            <InstallButton />
          </div>
        </div>
      </div>

      {favorites.length > 0 ? (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {favorites.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => {
                setCurrent(city)
                setPinned(true)
              }}
              className="min-h-10 shrink-0 rounded-full bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-sky-50 hover:text-sky-700 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-sky-400/10"
            >
              {city.name}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
