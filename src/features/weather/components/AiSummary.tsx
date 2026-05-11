'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { AiBadge } from '@/shared/ui/AiBadge'
import { useT } from '@/shared/hooks/useT'
import { useUiStore } from '@/shared/store/ui-store'
import type { AiSource } from '@/shared/lib/ai'
import type { WeatherBundle } from '@/features/weather/types'
import type { GeoLocation } from '@/features/geocoding/types'
import {
  buildDailyOutlookDigest,
  buildHourlyRainDigest,
  digestFingerprint,
} from '@/features/weather/utils/ai-summary-digest'

type AiSummaryPayload = { summary: string; source: AiSource | 'heuristic' }

function aiSummaryQueryKey(
  locationId: number,
  weatherTime: string,
  locale: string,
  digestKey: string,
) {
  return ['ai-summary', locationId, weatherTime, locale, digestKey] as const
}

interface Props {
  location: GeoLocation
  weather: WeatherBundle
}

export function AiSummary({ location, weather }: Props) {
  const t = useT()
  const locale = useUiStore((s) => s.locale)
  const { hourlyDigest, dailyDigest, digestKey } = useMemo(() => {
    const hourlyDigest = buildHourlyRainDigest(weather.hourly, weather.timezone, locale)
    const dailyDigest = buildDailyOutlookDigest(weather.daily, weather.timezone, locale)
    return {
      hourlyDigest,
      dailyDigest,
      digestKey: digestFingerprint(hourlyDigest, dailyDigest),
    }
  }, [weather.hourly, weather.daily, weather.timezone, locale])

  const { data, isPending, isError } = useQuery<AiSummaryPayload, Error>({
    queryKey: aiSummaryQueryKey(location.id, weather.current.time, locale, digestKey),
    queryFn: async () => {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: location.name,
          country: location.country,
          temperature: weather.current.temperature,
          apparentTemperature: weather.current.apparentTemperature,
          weatherCode: weather.current.weatherCode,
          humidity: weather.current.humidity,
          windSpeed: weather.current.windSpeed,
          uvIndex: weather.current.uvIndex,
          locale,
          hourlyForecastDigest: hourlyDigest,
          dailyOutlookDigest: dailyDigest,
        }),
      })
      if (!res.ok) throw new Error('ai_failed')
      return res.json() as Promise<AiSummaryPayload>
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })

  return (
    <Card className="border-sky-100 bg-gradient-to-br from-sky-50 to-white dark:border-sky-500/20 dark:from-sky-500/10 dark:to-slate-900/60">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
        <Sparkles size={14} />
        {t.summary.title}
        {data?.source && data.source !== 'heuristic' && <AiBadge source={data.source} />}
      </div>
      {isPending && !data ? (
        <div className="mt-3 space-y-2">
          <div className="shimmer h-3.5 w-full rounded" />
          <div className="shimmer h-3.5 w-11/12 rounded" />
          <div className="shimmer h-3.5 w-9/12 rounded" />
        </div>
      ) : data ? (
        <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          {data.summary}
        </p>
      ) : isError ? (
        <p className="mt-2 text-sm text-slate-500">{t.summary.failed}</p>
      ) : null}
    </Card>
  )
}
