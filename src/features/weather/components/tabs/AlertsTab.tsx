'use client'

import { useMemo } from 'react'
import { AlertTriangle, Info, CheckCircle, Bot } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { useAirQuality } from '@/features/weather/hooks/useWeather'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { useEarthquakes } from '@/features/earthquakes/hooks/useEarthquakes'
import { computeAlerts } from '@/features/alerts/utils/compute'
import { TyphoonCard } from '@/features/typhoons/components/TyphoonCard'
import type { WeatherBundle } from '@/features/weather/types'
import { cn } from '@/shared/lib/cn'
import { useT } from '@/shared/hooks/useT'
import { useUiStore } from '@/shared/store/ui-store'
import { useAiInsight } from '@/shared/hooks/useAiInsight'
import type { AlertSummaryResponse } from '@/app/api/alert-summary/route'

const levelStyles = {
  info: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100',
  danger: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100',
}

interface Props {
  weather: WeatherBundle
}

export function AlertsTab({ weather }: Props) {
  const t = useT()
  const locale = useUiStore((s) => s.locale)
  const location = useLocationStore((s) => s.current)
  const { data: aqi } = useAirQuality(location?.latitude, location?.longitude)
  const { data: quakes } = useEarthquakes(location?.latitude, location?.longitude)

  const alerts = useMemo(
    () => computeAlerts(weather, aqi ?? undefined, quakes ?? undefined, locale),
    [weather, aqi, quakes, locale],
  )

  const alertIds = alerts.map((a) => a.id).join(',')
  const { data: aiSummary } = useAiInsight<
    { alerts: { level: string; title: string; message: string }[]; locale: string },
    AlertSummaryResponse
  >(
    '/api/alert-summary',
    alerts.length > 0 ? { alerts: alerts.map((a) => ({ level: a.level, title: a.title, message: a.message })), locale } : null,
    [alertIds, locale],
  )

  return (
    <div className="space-y-4">
      {aiSummary?.summary && (
        <Card className="flex items-start gap-3 p-4">
          <Bot size={18} className="mt-0.5 shrink-0 text-indigo-500" />
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{aiSummary.summary}</p>
        </Card>
      )}
      {alerts.length === 0 ? (
        <Card className="flex items-center gap-3 p-5">
          <CheckCircle size={20} className="shrink-0 text-emerald-500" />
          <div>
            <div className="font-semibold text-emerald-800 dark:text-emerald-200">
              {t.alerts.noAlerts}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{t.alerts.safeConditions}</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={cn(
                'flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm',
                levelStyles[a.level],
              )}
              role="alert"
            >
              <span className="text-2xl leading-none" aria-hidden>
                {a.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 font-semibold">
                  {a.level === 'info' ? <Info size={14} /> : <AlertTriangle size={14} />}
                  {a.title}
                </div>
                <p className="mt-1 text-xs leading-relaxed opacity-90">{a.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <TyphoonCard />
    </div>
  )
}
