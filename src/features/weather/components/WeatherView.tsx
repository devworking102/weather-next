'use client'

import { useUiStore } from '@/shared/store/ui-store'
import { useT } from '@/shared/hooks/useT'
import { useWeather, useAirQuality } from '@/features/weather/hooks/useWeather'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { useAutoLocation } from '@/features/geocoding/hooks/useAutoLocation'
import { useEarthquakes } from '@/features/earthquakes/hooks/useEarthquakes'
import { cn } from '@/shared/lib/cn'
import { SmartWeatherHero } from './hero/SmartWeatherHero'
import { StatsGrid } from './StatsGrid'
import { HourlyStrip } from './HourlyStrip'
import { WeatherSkeleton } from './WeatherSkeleton'
import { WeatherError } from './WeatherError'
import { WeatherEmpty } from './WeatherEmpty'
import { FavoriteStar } from '@/features/favorites/components/FavoriteStar'
import { SearchBar } from '@/features/geocoding/components/SearchBar'
import { RecentLocationsRow } from '@/features/geocoding/components/RecentLocationsRow'
import { FavoritesBar } from '@/features/favorites/components/FavoritesBar'
import { AlertsBanner } from '@/features/alerts/components/AlertsBanner'
import { useNotificationScanner } from '@/features/notifications/hooks/useNotifications'
import { Card } from '@/shared/ui/Card'
import { dynamicChart } from './chart-loader'
import { DailyPreviewRow } from './DailyPreviewRow'
import { ExpandableSection } from './ExpandableSection'

import { HourlyTab } from './tabs/HourlyTab'
import { DailyTab } from './tabs/DailyTab'
import { AirQualityTab } from './tabs/AirQualityTab'
import { HealthTab } from './tabs/HealthTab'
import { AlertsTab } from './tabs/AlertsTab'
import { WindTab } from './tabs/WindTab'
import { WidgetTab } from './tabs/WidgetTab'

import { NextRainCard } from './today/NextRainCard'
import { TodaySummary } from './today/TodaySummary'
import { SunMoonCard } from './today/SunMoonCard'
import { LunarHoursCard } from './today/LunarHoursCard'
import { HistoricalCompareCard } from './today/HistoricalCompareCard'
import { RecommendationsCard } from '@/features/recommendations/components/RecommendationsCard'
import { NewsList } from '@/features/news/components/NewsList'

const TemperatureChart = dynamicChart('temperature')
const RainProbabilityChart = dynamicChart('rain')

export function WeatherView() {
  useAutoLocation()
  const location = useLocationStore((s) => s.current)
  const unit = useUiStore((s) => s.unit)
  const t = useT()
  const tempUnit = unit === 'f' ? 'fahrenheit' : 'celsius'
  const tab = useUiStore((s) => s.weatherTab)
  const setTab = useUiStore((s) => s.setWeatherTab)

  const { data, isLoading, isError, error, refetch } = useWeather(
    location?.latitude,
    location?.longitude,
    tempUnit,
  )
  const { data: aqi } = useAirQuality(location?.latitude, location?.longitude)
  const { data: quakes } = useEarthquakes(location?.latitude, location?.longitude)

  useNotificationScanner(data, aqi, quakes, location?.name)

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SearchBar />
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
        <>
          <div className="relative">
            <SmartWeatherHero location={location} weather={data} aqi={aqi} />
            <FavoriteStar location={location} className="absolute right-4 top-4 z-10" />
          </div>

          <div>
            {/*
              TODAY — flowing scroll layout.
              Kept mounted (hidden via CSS) so charts and queries survive tab switches.
              New content order follows the 3-second decision hierarchy:
                1. Hourly  — what happens in the next few hours?
                2. Rain    — will it rain?
                3. Weekly  — what does the rest of the week look like?
                4. Conditions — key stats (compact, expandable)
                5. Details — charts, sun/moon, historical (hidden by default)
                6. Recommendations
            */}
            <div
              className={cn('space-y-4', tab !== 'today' && 'hidden')}
              aria-hidden={tab !== 'today'}
            >
              {/* § 1 — Hourly strip: most time-sensitive info, first thing after hero */}
              <HourlyStrip hourly={data.hourly} />

              {/* § 2 — Rain prediction */}
              <NextRainCard weather={data} />

              {/* § 3 — 7-day preview: quick week overview */}
              <DailyPreviewRow
                weather={data}
                days={7}
                onViewAll={() => setTab('week')}
              />

              {/* § 4 — Key conditions: 4 actionable stats, expand for all 8 */}
              <StatsGrid weather={data} compact />

              {/* § 5 — Charts & details: collapsed by default to reduce visual noise */}
              <ExpandableSection>
                <TodaySummary daily={data.daily} />
                <div className="grid gap-4 lg:grid-cols-2">
                  <TemperatureChart hourly={data.hourly} />
                  <RainProbabilityChart hourly={data.hourly} />
                </div>
                {data.daily[0] && (
                  <SunMoonCard
                    sunrise={data.daily[0].sunrise}
                    sunset={data.daily[0].sunset}
                  />
                )}
                <LunarHoursCard />
                <HistoricalCompareCard
                  lat={location.latitude}
                  lon={location.longitude}
                  todayMax={data.daily[0]?.tempMax ?? data.current.temperature}
                />
              </ExpandableSection>

              {/* § 6 — Personalized recommendations */}
              <RecommendationsCard location={location} weather={data} />
            </div>

            {tab === 'hourly' && <HourlyTab weather={data} hours={48} />}
            {tab === 'week' && <DailyTab weather={data} days={7} />}
            {tab === 'daily' && <DailyTab weather={data} days={16} />}
            {tab === 'month' && <DailyTab weather={data} days={30} />}
            {tab === 'aqi' && <AirQualityTab />}
            {tab === 'health' && <HealthTab weather={data} />}
            {tab === 'wind' && <WindTab />}
            {tab === 'alerts' && <AlertsTab weather={data} />}
            {tab === 'news' && (
              <Card className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-lg">📰</span>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t.today.newsTitle}
                  </h3>
                </div>
                <NewsList />
              </Card>
            )}
            {tab === 'widget' && <WidgetTab />}
          </div>
        </>
      )}
    </div>
  )
}
