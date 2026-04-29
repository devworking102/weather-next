'use client'

import { Skeleton } from '@/shared/ui/Skeleton'
import { useRecommendations } from '@/features/recommendations/hooks/useRecommendations'
import { useT } from '@/shared/hooks/useT'
import type { GeoLocation } from '@/features/geocoding/types'
import type { WeatherBundle } from '@/features/weather/types'

interface Props {
  location: GeoLocation
  weather: WeatherBundle
}

export function RecommendationsCard({ location, weather }: Props) {
  const { data, isLoading } = useRecommendations(location, weather)
  const t = useT()

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-56 rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid animate-fade-in gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Column
        icon="👕"
        title={t.recommendations.clothes}
        subtitle={data.title}
        items={data.clothes}
        tone="from-sky-50 to-indigo-50 border-sky-100 text-sky-900 dark:from-sky-500/10 dark:to-indigo-500/10 dark:border-sky-500/20 dark:text-sky-100"
        bullet="✓"
        bulletColor="text-sky-500"
      />
      <Column
        icon="🍲"
        title={t.recommendations.food}
        subtitle={data.title}
        items={data.food}
        tone="from-orange-50 to-amber-50 border-orange-100 text-orange-900 dark:from-orange-500/10 dark:to-amber-500/10 dark:border-orange-500/20 dark:text-orange-100"
        bullet="✓"
        bulletColor="text-orange-500"
      />
      <Column
        icon="🎒"
        title={t.recommendations.activity}
        subtitle={data.title}
        items={data.activity}
        tone="from-emerald-50 to-teal-50 border-emerald-100 text-emerald-900 dark:from-emerald-500/10 dark:to-teal-500/10 dark:border-emerald-500/20 dark:text-emerald-100"
        bullet="★"
        bulletColor="text-emerald-500"
      />
      <Column
        icon="📍"
        title={t.recommendations.places}
        subtitle={data.title}
        items={data.places}
        tone="from-violet-50 to-purple-50 border-violet-100 text-violet-900 dark:from-violet-500/10 dark:to-purple-500/10 dark:border-violet-500/20 dark:text-violet-100"
        bullet="★"
        bulletColor="text-violet-500"
      />
    </div>
  )
}

function Column({
  icon,
  title,
  subtitle,
  items,
  tone,
  bullet,
  bulletColor,
}: {
  icon: string
  title: string
  subtitle: string
  items: string[]
  tone: string
  bullet: string
  bulletColor: string
}) {
  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-5 shadow-sm transition-transform hover:-translate-y-1 ${tone}`}
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="text-3xl drop-shadow-sm" aria-hidden>
          {icon}
        </span>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide">{title}</h3>
          <p className="text-xs opacity-80">{subtitle}</p>
        </div>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-2 rounded-lg border border-white/40 bg-white/60 px-3 py-2 text-sm font-medium shadow-sm dark:border-white/10 dark:bg-white/5"
          >
            <span className={`font-bold ${bulletColor}`}>{bullet}</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
