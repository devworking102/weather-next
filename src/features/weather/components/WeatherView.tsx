'use client'

import dynamic from 'next/dynamic'
import { useCallback, useMemo, useRef } from 'react'
import { useUiStore } from '@/shared/store/ui-store'
import { useT } from '@/shared/hooks/useT'
import { useWeather, useAirQuality } from '@/features/weather/hooks/useWeather'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { useAutoLocation } from '@/features/geocoding/hooks/useAutoLocation'
import { useEarthquakes } from '@/features/earthquakes/hooks/useEarthquakes'
import { cn } from '@/shared/lib/cn'
import { SmartWeatherHero } from './hero/SmartWeatherHero'
import { WeatherSkeleton } from './WeatherSkeleton'
import { WeatherError } from './WeatherError'
import { WeatherEmpty } from './WeatherEmpty'
import { FavoriteStar } from '@/features/favorites/components/FavoriteStar'
import { SearchBar } from '@/features/geocoding/components/SearchBar'
import { RecentLocationsRow } from '@/features/geocoding/components/RecentLocationsRow'
import { FavoritesBar } from '@/features/favorites/components/FavoritesBar'
import { AlertsBanner } from '@/features/alerts/components/AlertsBanner'
import { computeAlerts } from '@/features/alerts/utils/compute'
import { PushAlertsCard } from '@/features/notifications/components/PushAlertsCard'
import { useNotificationScanner } from '@/features/notifications/hooks/useNotifications'
import { usePullToRefresh } from '@/shared/hooks/usePullToRefresh'
import { Card } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'
import { dynamicChart } from './chart-loader'
import { DailyPreviewRow } from './DailyPreviewRow'
import { ExpandableSection } from './ExpandableSection'
import { StatsGrid } from './StatsGrid'
import { createElement } from 'react'
import { buildWeatherCompanion } from '@/ai/weather-companion'
import { AssistantActionCards } from './AssistantActionCards'
import { HumanWeatherDetails } from './HumanWeatherDetails'
import { PersonalWeatherFeed } from './PersonalWeatherFeed'
import { WeatherMoments } from './WeatherMoments'
import { TabsNav } from './TabsNav'
import { WeatherHeroCard } from './WeatherHeroCard'
import { AiSummaryCard } from './AiSummaryCard'
import { MobileForecastTabs } from './MobileForecastTabs'
import { MobileHourlyForecast } from './MobileHourlyForecast'
import { MobileAqiHealthCard } from './MobileAqiHealthCard'

// Lazy-loaded tab content — only bundled when first activated
const tabFallback = () => createElement(Skeleton, { className: 'h-64 rounded-2xl' })

const HourlyTab   = dynamic(() => import('./tabs/HourlyTab').then(m => ({ default: m.HourlyTab })), { ssr: false, loading: tabFallback })
const DailyTab    = dynamic(() => import('./tabs/DailyTab').then(m => ({ default: m.DailyTab })), { ssr: false, loading: tabFallback })
const AirQualityTab = dynamic(() => import('./tabs/AirQualityTab').then(m => ({ default: m.AirQualityTab })), { ssr: false, loading: tabFallback })
const HealthTab   = dynamic(() => import('./tabs/HealthTab').then(m => ({ default: m.HealthTab })), { ssr: false, loading: tabFallback })
const AlertsTab   = dynamic(() => import('./tabs/AlertsTab').then(m => ({ default: m.AlertsTab })), { ssr: false, loading: tabFallback })
const WindTab     = dynamic(() => import('./tabs/WindTab').then(m => ({ default: m.WindTab })), { ssr: false, loading: tabFallback })
const WidgetTab   = dynamic(() => import('./tabs/WidgetTab').then(m => ({ default: m.WidgetTab })), { ssr: false, loading: tabFallback })
const NewsList    = dynamic(() => import('@/features/news/components/NewsList').then(m => ({ default: m.NewsList })), { ssr: false, loading: tabFallback })

// Lazy-loaded detail panels inside the expandable section
const SunMoonCard         = dynamic(() => import('./today/SunMoonCard').then(m => ({ default: m.SunMoonCard })), { ssr: false })
const LunarHoursCard      = dynamic(() => import('./today/LunarHoursCard').then(m => ({ default: m.LunarHoursCard })), { ssr: false })
const HistoricalCompareCard = dynamic(() => import('./today/HistoricalCompareCard').then(m => ({ default: m.HistoricalCompareCard })), { ssr: false })
const RadarPreviewCard    = dynamic(() => import('./today/RadarPreviewCard').then(m => ({ default: m.RadarPreviewCard })), { ssr: false, loading: tabFallback })

const TemperatureChart    = dynamicChart('temperature')
const RainProbabilityChart = dynamicChart('rain')

export function WeatherView() {
  useAutoLocation()
  const location = useLocationStore((s) => s.current)
  const unit = useUiStore((s) => s.unit)
  const locale = useUiStore((s) => s.locale)
  const t = useT()
  const tempUnit = unit === 'f' ? 'fahrenheit' : 'celsius'
  const tab = useUiStore((s) => s.weatherTab)
  const setTab = useUiStore((s) => s.setWeatherTab)
  const searchRef = useRef<HTMLDivElement>(null)

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
  const alertCount = useMemo(
    () => computeAlerts(data, aqi, quakes, locale).length,
    [data, aqi, quakes, locale],
  )
  return (
    <div className="relative space-y-5 sm:space-y-6">
      {(pullDistance > 0 || refreshing) && location && data ? (
        <>
          <div
            className="pointer-events-none fixed inset-x-0 top-0 z-[35] h-0.5 overflow-hidden bg-black/10 dark:bg-white/10"
            aria-hidden
          >
            <div
              className="h-full origin-left bg-sky-500 transition-[transform] duration-150 ease-out"
              style={{
                transform: `scaleX(${refreshing ? 1 : Math.min(1, pullDistance / 72)})`,
              }}
            />
          </div>
          {refreshing ? (
            <p className="pointer-events-none fixed left-0 right-0 top-2 z-[35] text-center text-xs font-medium text-sky-600 dark:text-sky-400">
              {t.today.pullRefreshing}
            </p>
          ) : null}
        </>
      ) : null}
      <section
        ref={searchRef}
        className="relative z-20 hidden space-y-3 rounded-[1.75rem] border border-black/5 bg-white/80 p-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 md:block"
        aria-label={t.search.placeholder}
      >
        <SearchBar />
        <RecentLocationsRow />
        <FavoritesBar />
      </section>

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
          <div className="relative z-0 md:hidden">
            <WeatherHeroCard location={location} weather={data} tempUnit={tempUnit} />
            <FavoriteStar location={location} className="absolute right-4 top-4 z-10" />
          </div>
          <div className="relative z-0 hidden md:block">
            <SmartWeatherHero location={location} weather={data} aqi={aqi} />
            <FavoriteStar location={location} className="absolute right-4 top-[4.75rem] z-10 sm:right-8 sm:top-[5.5rem]" />
          </div>
          {companion ? <AiSummaryCard insight={companion} /> : null}
          <MobileForecastTabs value={tab} onChange={setTab} />
          {tab === 'today' ? <MobileHourlyForecast weather={data} /> : null}

          <section className="hidden rounded-[1.5rem] border border-black/5 bg-white/70 p-2 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] md:block">
            <TabsNav value={tab} onChange={setTab} alertCount={alertCount} />
          </section>

          <div>
            {/*
              Today keeps one primary summary in the hero, then only distinct decision sections:
              recommendations, meaningful moments, weekly outlook, and collapsed details.
            */}
            <div
              className={cn('space-y-4 md:space-y-6', tab !== 'today' && 'hidden')}
              aria-hidden={tab !== 'today'}
            >
              <div className="hidden md:block">
                {companion ? <AssistantActionCards insight={companion} /> : null}
              </div>

              <div className="hidden md:block">
                <WeatherMoments weather={data} onViewHourly={() => setTab('hourly')} />
              </div>

              <div className="md:hidden">
                <AlertsTab weather={data} />
              </div>
              <DailyPreviewRow
                weather={data}
                days={7}
                onViewAll={() => setTab('week')}
              />

              {companion ? <MobileAqiHealthCard weather={data} aqi={aqi} insight={companion} /> : null}

              <ExpandableSection>
                <PushAlertsCard />
                <PersonalWeatherFeed location={location} />
                <RadarPreviewCard location={location} />
                {companion ? <HumanWeatherDetails weather={data} insight={companion} /> : null}
                <StatsGrid weather={data} compact />
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
            </div>

            {tab === 'hourly' && (
              <>
                <div className="md:hidden">
                  <MobileHourlyForecast weather={data} />
                </div>
                <div className="hidden md:block">
                  <HourlyTab weather={data} hours={48} />
                </div>
              </>
            )}
            {tab === 'week' && (
              <>
                <div className="md:hidden">
                  <DailyPreviewRow weather={data} days={7} />
                </div>
                <div className="hidden md:block">
                  <DailyTab weather={data} days={7} />
                </div>
              </>
            )}
            {tab === 'daily'  && <DailyTab weather={data} days={16} />}
            {tab === 'month'  && <DailyTab weather={data} days={30} />}
            {tab === 'aqi'    && <AirQualityTab />}
            {tab === 'health' && <HealthTab weather={data} />}
            {tab === 'wind'   && <WindTab />}
            {tab === 'alerts' && <AlertsTab weather={data} />}
            {tab === 'news'   && (
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
