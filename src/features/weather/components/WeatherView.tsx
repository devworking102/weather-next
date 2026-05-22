'use client'

import { useCallback, useMemo } from 'react'
import { buildWeatherCompanion } from '@/ai/weather-companion'
import { useEarthquakes } from '@/features/earthquakes/hooks/useEarthquakes'
import { FavoritesBar } from '@/features/favorites/components/FavoritesBar'
import { SearchBar } from '@/features/geocoding/components/SearchBar'
import { RecentLocationsRow } from '@/features/geocoding/components/RecentLocationsRow'
import { useAutoLocation } from '@/features/geocoding/hooks/useAutoLocation'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { AlertsBanner } from '@/features/alerts/components/AlertsBanner'
import { useNotificationScanner } from '@/features/notifications/hooks/useNotifications'
import { PremiumWeatherHome } from '@/features/weather/components/mobile/PremiumWeatherHome'
import { useAirQuality, useWeather } from '@/features/weather/hooks/useWeather'
import { usePullToRefresh } from '@/shared/hooks/usePullToRefresh'
import { useT } from '@/shared/hooks/useT'
import { useUiStore } from '@/shared/store/ui-store'
import { WeatherEmpty } from './WeatherEmpty'
import { WeatherError } from './WeatherError'
import { WeatherSkeleton } from './WeatherSkeleton'

export function WeatherView() {
  useAutoLocation()

  const location = useLocationStore((s) => s.current)
  const unit = useUiStore((s) => s.unit)
  const locale = useUiStore((s) => s.locale)
  const t = useT()
  const tempUnit = unit === 'f' ? 'fahrenheit' : 'celsius'

  const { data, isLoading, isError, error, refetch } = useWeather(
    location?.latitude,
    location?.longitude,
    tempUnit,
  )
  const { data: aqi } = useAirQuality(location?.latitude, location?.longitude)
  const { data: quakes } = useEarthquakes(location?.latitude, location?.longitude)

  useNotificationScanner(data, aqi, quakes, location?.name)

  const onPullRefresh = useCallback(async () => {
    await refetch()
  }, [refetch])
  const { pullDistance, refreshing } = usePullToRefresh(onPullRefresh, 72)

  const companion = useMemo(
    () => (location && data ? buildWeatherCompanion(location.name, data, aqi, tempUnit, locale) : null),
    [location, data, aqi, tempUnit, locale],
  )

  return (
    <div className="relative space-y-4 md:space-y-6">
      {(pullDistance > 0 || refreshing) && location && data ? (
        <>
          <div
            className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5 overflow-hidden bg-black/10 dark:bg-white/10"
            aria-hidden
          >
            <div
              className="h-full origin-left bg-sky-500 transition-[transform] duration-150 ease-out"
              style={{ transform: `scaleX(${refreshing ? 1 : Math.min(1, pullDistance / 72)})` }}
            />
          </div>
          {refreshing ? (
            <p className="pointer-events-none fixed left-0 right-0 top-2 z-[70] text-center text-xs font-medium text-sky-600 dark:text-sky-400">
              {t.today.pullRefreshing}
            </p>
          ) : null}
        </>
      ) : null}

      <section
        className="sticky top-2 z-30 space-y-2 rounded-[26px] border border-black/5 bg-white/86 p-2.5 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/82 md:static md:p-3"
        aria-label={t.search.placeholder}
      >
        <SearchBar />
        <div className="hidden md:block">
          <RecentLocationsRow />
          <FavoritesBar />
        </div>
      </section>

      <div className="md:hidden">
        <RecentLocationsRow />
        <FavoritesBar />
      </div>

      <AlertsBanner />

      {!location ? (
        <WeatherSkeleton />
      ) : isLoading && !data ? (
        <WeatherSkeleton />
      ) : isError ? (
        <WeatherError message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : !data ? (
        <WeatherEmpty />
      ) : (
        <PremiumWeatherHome
          location={location}
          weather={data}
          aqi={aqi}
          insight={companion}
          tempUnit={tempUnit}
        />
      )}
    </div>
  )
}
