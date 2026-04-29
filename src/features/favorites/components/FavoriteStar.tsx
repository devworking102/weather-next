'use client'

import { Star } from 'lucide-react'
import { useUiStore } from '@/shared/store/ui-store'
import { useT } from '@/shared/hooks/useT'
import type { GeoLocation } from '@/features/geocoding/types'
import { cn } from '@/shared/lib/cn'

interface Props {
  location: GeoLocation
  className?: string
}

export function FavoriteStar({ location, className }: Props) {
  const favorites = useUiStore((s) => s.favorites)
  const add = useUiStore((s) => s.addFavorite)
  const remove = useUiStore((s) => s.removeFavorite)
  const t = useT()
  const active = favorites.some((f) => f.id === location.id)

  return (
    <button
      onClick={() =>
        active
          ? remove(location.id)
          : add({
              id: location.id,
              name: location.name,
              latitude: location.latitude,
              longitude: location.longitude,
              country: location.country,
              admin1: location.admin1,
            })
      }
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20',
        className,
      )}
      title={active ? t.favorites.unsave : t.favorites.save}
      type="button"
    >
      <Star size={18} className={active ? 'fill-amber-300 text-amber-300' : ''} />
    </button>
  )
}
