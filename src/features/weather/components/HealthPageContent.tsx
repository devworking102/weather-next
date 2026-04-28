'use client'

import { useUiStore } from '@/shared/store/ui-store'
import { useWeather } from '@/features/weather/hooks/useWeather'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { useAutoLocation } from '@/features/geocoding/hooks/useAutoLocation'
import { SearchBar } from '@/features/geocoding/components/SearchBar'
import { FavoritesBar } from '@/features/favorites/components/FavoritesBar'
import { WeatherSkeleton } from './WeatherSkeleton'
import { WeatherError } from './WeatherError'
import { WeatherEmpty } from './WeatherEmpty'
import { HealthTab } from './tabs/HealthTab'

export function HealthPageContent() {
  useAutoLocation()
  const location = useLocationStore((s) => s.current)
  const unit = useUiStore((s) => s.unit)
  const tempUnit = unit === 'f' ? 'fahrenheit' : 'celsius'

  const { data, isLoading, isError, error, refetch } = useWeather(
    location?.latitude,
    location?.longitude,
    tempUnit,
  )

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SearchBar />
        <FavoritesBar />
      </div>
      {!location ? (
        <WeatherSkeleton />
      ) : isLoading && !data ? (
        <WeatherSkeleton />
      ) : isError ? (
        <WeatherError message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : !data ? (
        <WeatherEmpty />
      ) : (
        <HealthTab weather={data} />
      )}
    </div>
  )
}
