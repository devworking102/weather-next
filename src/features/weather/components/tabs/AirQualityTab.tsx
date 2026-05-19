'use client'

import { useMemo } from 'react'
import { Card } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useAirQuality } from '@/features/weather/hooks/useWeather'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { useUiStore } from '@/shared/store/ui-store'
import { aqiCategory } from '@/features/weather/utils/format'
import { useAiInsight } from '@/shared/hooks/useAiInsight'
import { useT } from '@/shared/hooks/useT'
import type { AqiInsightPayload, AqiInsightResponse } from '@/app/api/aqi-insight/route'
import {
  Area,
  CartesianGrid,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const SCALE_COLORS = ['#4ade80', '#a3e635', '#facc15', '#f97316', '#ef4444', '#a855f7']

export function AirQualityTab() {
  const location = useLocationStore((s) => s.current)
  const locale = useUiStore((s) => s.locale)
  const t = useT()
  const { data, isLoading, isError } = useAirQuality(location?.latitude, location?.longitude)

  const insightPayload = useMemo<AqiInsightPayload | null>(
    () =>
      data && location
        ? {
            locationName: location.name,
            europeanAqi: data.current.europeanAqi,
            usAqi: data.current.usAqi,
            pm25: data.current.pm25,
            pm10: data.current.pm10,
            no2: data.current.no2,
            ozone: data.current.ozone,
            co: data.current.co,
            locale,
          }
        : null,
    [data, location, locale],
  )

  const { data: insight, isLoading: insightLoading } = useAiInsight<AqiInsightPayload, AqiInsightResponse>(
    '/api/aqi-insight',
    insightPayload,
    [location?.latitude, location?.longitude, locale],
  )

  const chart = useMemo(() => {
    if (!data) return []
    const pfx = new Date().toISOString().slice(0, 13)
    const start = Math.max(0, data.hourly.findIndex((p) => p.time.startsWith(pfx)))
    return data.hourly.slice(start, start + 24).map((p) => ({
      label: p.time.slice(11, 16),
      aqi: Math.round(p.europeanAqi),
      pm25: Math.round(p.pm25 * 10) / 10,
    }))
  }, [data])

  if (isLoading) return <Skeleton className="h-64 rounded-2xl" />
  if (isError || !data) {
    return (
      <Card className="text-center text-sm text-slate-500">
        ⚠️ {t.aqi.unavailable}
      </Card>
    )
  }

  const c = data.current
  const cat = aqiCategory(c.europeanAqi)
  const outdoor =
    c.europeanAqi <= 40
      ? t.aqi.outdoorGood
      : c.europeanAqi <= 60
        ? t.aqi.outdoorOkay
        : c.europeanAqi <= 80
          ? t.aqi.outdoorLimit
          : t.aqi.outdoorStayIn
  const arc = Math.min(c.europeanAqi, 150)
  const theta = (arc / 150) * Math.PI
  const ex = 80 - 70 * Math.cos(theta)
  const ey = 80 - 70 * Math.sin(theta)
  const large = theta > Math.PI / 2 ? 1 : 0
  const arcPath = `M 10 80 A 70 70 0 ${large} 1 ${ex.toFixed(1)} ${ey.toFixed(1)}`

  return (
    <div className="space-y-4">
      <Card
        className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6"
        style={{ background: `${cat.color}15`, borderColor: `${cat.color}44` }}
      >
        <svg width="160" height="92" viewBox="0 0 160 92" className="shrink-0">
          <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="14" strokeLinecap="round" />
          <path d={arcPath} fill="none" stroke={cat.color} strokeWidth="14" strokeLinecap="round" />
          <text x="80" y="72" textAnchor="middle" fill="currentColor" fontSize="28" fontWeight="800">
            {Math.round(c.europeanAqi)}
          </text>
        </svg>
        <div className="flex-1">
          <div className="text-2xl font-black" style={{ color: cat.color }}>{cat.label}</div>
          <div className="mt-0.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            {t.aqi.usAqiLabel} <strong>{Math.round(c.usAqi)}</strong>
          </div>
          {insightLoading ? (
            <div className="mt-2 space-y-1.5">
              <Skeleton className="h-3.5 w-full rounded" />
              <Skeleton className="h-3.5 w-3/4 rounded" />
            </div>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {insight?.insight ?? cat.advice}
            </p>
          )}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="bg-emerald-50/80 p-4 text-emerald-950 dark:bg-emerald-400/10 dark:text-emerald-100">
          <p className="text-xs font-bold uppercase tracking-wider opacity-70">{t.aqi.outdoors}</p>
          <p className="mt-2 text-sm font-semibold leading-6">{outdoor}</p>
        </Card>
        <Card className="bg-sky-50/80 p-4 text-sky-950 dark:bg-sky-400/10 dark:text-sky-100">
          <p className="text-xs font-bold uppercase tracking-wider opacity-70">{t.aqi.activity}</p>
          <p className="mt-2 text-sm font-semibold leading-6">
            {c.europeanAqi > 60 ? t.aqi.activityIndoor : t.aqi.activityOutdoor}
          </p>
        </Card>
        <Card className="bg-amber-50/80 p-4 text-amber-950 dark:bg-amber-400/10 dark:text-amber-100">
          <p className="text-xs font-bold uppercase tracking-wider opacity-70">{t.aqi.sensitive}</p>
          <p className="mt-2 text-sm font-semibold leading-6">
            {c.europeanAqi > 40 ? t.aqi.sensitiveMask : t.aqi.sensitiveGood}
          </p>
        </Card>
      </div>

      <Card className="p-0">
        <div className="flex items-center gap-2 border-b border-black/5 px-5 py-3 dark:border-white/5">
          <span className="text-lg">🔬</span>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t.aqi.currentPollutants}
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-5">
          <Pollutant label="PM2.5" value={c.pm25.toFixed(1)} unit="μg/m³" pct={c.pm25 / 75} scale="rg" />
          <Pollutant label="PM10" value={c.pm10.toFixed(1)} unit="μg/m³" pct={c.pm10 / 150} scale="rg" />
          <Pollutant label="NO₂" value={c.no2.toFixed(1)} unit="μg/m³" pct={c.no2 / 200} color="#a78bfa" />
          <Pollutant label="O₃" value={c.ozone.toFixed(1)} unit="μg/m³" pct={c.ozone / 240} color="#60a5fa" />
          <Pollutant label="CO" value={(c.co / 1000).toFixed(2)} unit="mg/m³" pct={c.co / 10000} color="#fb923c" />
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t.aqi.forecast}
        </h3>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <ComposedChart data={chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" strokeOpacity={0.5} />
              <YAxis yAxisId="left" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" strokeOpacity={0.5} width={30} />
              <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} fontSize={11} stroke="#a855f7" strokeOpacity={0.7} width={30} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', fontSize: 12 }} />
              <defs>
                <linearGradient id="aqi-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area yAxisId="left" type="monotone" dataKey="aqi" stroke="#f97316" fill="url(#aqi-fill)" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="pm25" stroke="#a855f7" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t.aqi.scale}
        </h3>
        <div className="flex flex-wrap gap-3 text-xs">
          {t.aqi.scaleItems.map((s, i) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full" style={{ background: SCALE_COLORS[i] }} />
              <span className="font-bold text-slate-400">{s.label}</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{s.name}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function Pollutant({ label, value, unit, pct, color, scale }: {
  label: string; value: string; unit: string; pct: number; color?: string; scale?: 'rg'
}) {
  const fill = color ?? (scale === 'rg' ? (pct < 0.3 ? '#4ade80' : pct < 0.7 ? '#facc15' : '#ef4444') : '#0ea5e9')
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-black/5 bg-slate-50 p-3 dark:border-white/5 dark:bg-slate-800/40">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <span className="text-2xl font-black leading-none text-slate-900 dark:text-white">{value}</span>
      <span className="text-[10px] text-slate-400">{unit}</span>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, pct * 100))}%`, background: fill }}
        />
      </div>
    </div>
  )
}
