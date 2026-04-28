'use client'

import { useMemo } from 'react'
import { AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { useAirQuality } from '@/features/weather/hooks/useWeather'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { useEarthquakes } from '@/features/earthquakes/hooks/useEarthquakes'
import { computeAlerts } from '@/features/alerts/utils/compute'
import { TyphoonCard } from '@/features/typhoons/components/TyphoonCard'
import type { WeatherBundle } from '@/features/weather/types'
import { cn } from '@/shared/lib/cn'

const levelStyles = {
  info: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100',
  danger: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100',
}

interface Props {
  weather: WeatherBundle
}

export function AlertsTab({ weather }: Props) {
  const location = useLocationStore((s) => s.current)
  const { data: aqi } = useAirQuality(location?.latitude, location?.longitude)
  const { data: quakes } = useEarthquakes(location?.latitude, location?.longitude)

  const alerts = useMemo(
    () => computeAlerts(weather, aqi ?? undefined, quakes ?? undefined),
    [weather, aqi, quakes],
  )

  return (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <Card className="flex items-center gap-3 p-5">
          <CheckCircle size={20} className="shrink-0 text-emerald-500" />
          <div>
            <div className="font-semibold text-emerald-800 dark:text-emerald-200">
              Không có cảnh báo
            </div>
            <p className="mt-0.5 text-xs text-slate-500">Điều kiện thời tiết hiện tại an toàn.</p>
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
