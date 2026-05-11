'use client'

import { useMemo } from 'react'
import { CloudRain } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { useT } from '@/shared/hooks/useT'
import { useUiStore } from '@/shared/store/ui-store'
import type { WeatherBundle } from '@/features/weather/types'
import { computeNextRainWindow } from '@/features/weather/utils/next-rain'

interface Props {
  weather: WeatherBundle
}

function formatLocalRange(
  startIso: string,
  endIso: string,
  timeZone: string,
  locale: string,
): string {
  const loc = locale === 'en' ? 'en-GB' : 'vi-VN'
  const timeOpts: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  }
  const dayOpts: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    timeZone,
  }
  const s = new Date(startIso)
  const e = new Date(endIso)
  const d0 = s.toLocaleDateString(loc, dayOpts)
  const d1 = e.toLocaleDateString(loc, dayOpts)
  const t0 = s.toLocaleTimeString(loc, timeOpts)
  const t1 = e.toLocaleTimeString(loc, timeOpts)
  if (d0 === d1) return `${d0} ${t0}–${t1}`
  return `${d0} ${t0} → ${d1} ${t1}`
}

export function NextRainCard({ weather }: Props) {
  const t = useT()
  const locale = useUiStore((s) => s.locale)
  const r = useMemo(() => computeNextRainWindow(weather.hourly, 48), [weather.hourly])

  const range =
    r.kind === 'window'
      ? formatLocalRange(r.startTime, r.endTime, weather.timezone, locale)
      : null

  const headline =
    r.kind === 'window'
      ? r.minutesUntilStart <= 75
        ? t.nextRain.imminent
        : t.nextRain.inAboutHours(Math.max(1, Math.ceil(r.minutesUntilStart / 60)))
      : null

  return (
    <Card className="border-sky-100/80 bg-gradient-to-br from-sky-50/90 to-white p-5 dark:border-sky-500/15 dark:from-slate-900/80 dark:to-slate-900/40">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:bg-sky-400/10 dark:text-sky-300">
          <CloudRain size={20} aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-sky-800 dark:text-sky-200">
              {t.nextRain.title}
            </h3>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
              {t.nextRain.badge}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.nextRain.sourceNote}</p>

          {r.kind === 'clear' ? (
            <>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{t.nextRain.noneTitle}</p>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.nextRain.noneHint}</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{headline}</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                <span className="font-medium text-slate-900 dark:text-slate-100">{t.nextRain.windowLabel}</span>{' '}
                {range}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {t.nextRain.maxChance(r.maxProbability)}
                {r.maxHourlyPrecipMm >= 0.05
                  ? ` · ${t.nextRain.peakHourlyMm(Number(r.maxHourlyPrecipMm.toFixed(1)))}`
                  : null}
              </p>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {r.maxProbability >= 75 || r.maxHourlyPrecipMm >= 2.5
                  ? t.nextRain.tipHeavy
                  : r.maxProbability >= 55
                    ? t.nextRain.tipUmbrella
                    : t.nextRain.tipLight}
              </p>
            </>
          )}

          <p className="border-t border-black/5 pt-2 text-[11px] leading-snug text-slate-400 dark:border-white/10 dark:text-slate-500">
            {t.nextRain.disclaimer}
          </p>
        </div>
      </div>
    </Card>
  )
}
