'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MapPin, Share2, Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import type { AirQualityBundle, WeatherBundle } from '@/features/weather/types'
import type { GeoLocation } from '@/features/geocoding/types'
import { wmoInfo } from '@/features/weather/utils/wmo'
import { formatTemp } from '@/features/weather/utils/format'
import { useUiStore } from '@/shared/store/ui-store'
import { useT } from '@/shared/hooks/useT'
import { DynamicBackground } from '@/features/weather/components/DynamicBackground'
import { AiBadge } from '@/shared/ui/AiBadge'
import { useWeatherAiSummary } from '@/features/ai-summary/hooks/useWeatherAiSummary'

interface Props {
  location: GeoLocation
  weather: WeatherBundle
  aqi?: AirQualityBundle
}

function aqiLabelFromEu(
  t: ReturnType<typeof useT>,
  eu: number | undefined,
): string | null {
  if (eu == null || !Number.isFinite(eu)) return null
  const v = Math.round(eu)
  const items = t.aqi.scaleItems
  if (v <= 20) return items[0].name
  if (v <= 40) return items[1].name
  if (v <= 60) return items[2].name
  if (v <= 80) return items[3].name
  if (v <= 100) return items[4].name
  return items[5].name
}

function uvCategory(
  t: ReturnType<typeof useT>,
  uv: number | undefined,
): string | null {
  if (uv == null || !Number.isFinite(uv)) return null
  const u = Math.round(uv)
  if (u < 3) return t.smartHero.uvLow
  if (u < 6) return t.smartHero.uvModerate
  if (u < 8) return t.smartHero.uvHigh
  return t.smartHero.uvVeryHigh
}

export function SmartWeatherHero({ location, weather, aqi }: Props) {
  const t = useT()
  const unit = useUiStore((s) => s.unit)
  const locale = useUiStore((s) => s.locale)
  const setTab = useUiStore((s) => s.setWeatherTab)
  const reduceMotion = useReducedMotion()
  const [shareHint, setShareHint] = useState<string | null>(null)

  const tempUnit = unit === 'f' ? 'fahrenheit' : 'celsius'
  const { current } = weather
  const info = wmoInfo(current.weatherCode)
  const today = weather.daily[0]
  const rainPct =
    today && Number.isFinite(today.precipitationProbability)
      ? Math.round(today.precipitationProbability)
      : null
  const eu = aqi?.current?.europeanAqi
  const aqiName = aqiLabelFromEu(t, eu)
  const uvWord = uvCategory(t, current.uvIndex)

  const ai = useWeatherAiSummary(location, weather, locale)

  async function shareWeather() {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const url = `${origin}/weather`
    const line = `${location.name}: ${formatTemp(current.temperature, tempUnit)} · ${info.label}`
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'Weather', text: line, url })
      } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${line} ${url}`)
        setShareHint(t.smartHeroShare.copied)
        setTimeout(() => setShareHint(null), 2200)
      } else {
        setShareHint(t.smartHeroShare.fail)
        setTimeout(() => setShareHint(null), 2200)
      }
    } catch {
      setShareHint(t.smartHeroShare.fail)
      setTimeout(() => setShareHint(null), 2200)
    }
  }

  return (
    <motion.section
      className="relative isolate overflow-hidden rounded-3xl p-5 text-white shadow-xl sm:p-8"
      {...(!reduceMotion
        ? {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
          }
        : {})}
    >
      <DynamicBackground weatherCode={current.weatherCode} isDay={current.isDay} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/15 via-transparent to-black/30" aria-hidden />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">
              {location.name}
              {location.admin1 ? `, ${location.admin1}` : ''}
              {location.country ? ` · ${location.country}` : ''}
            </span>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-white/85">{info.label}</p>
              <div className="mt-0.5 text-6xl font-extralight leading-none tracking-tighter sm:text-7xl md:text-8xl">
                {formatTemp(current.temperature, tempUnit)}
              </div>
              <p className="mt-2 text-sm text-white/85">
                {t.hero.feelsLike} <span className="font-medium text-white">{formatTemp(current.apparentTemperature, tempUnit)}</span>
                {today ? (
                  <>
                    {' · '}
                    {t.hero.high} {formatTemp(today.tempMax, tempUnit)} / {t.hero.low}{' '}
                    {formatTemp(today.tempMin, tempUnit)}
                  </>
                ) : null}
              </p>
            </div>
            <div className="text-5xl sm:text-6xl md:text-7xl" aria-hidden>
              {info.icon}
            </div>
          </div>

          <div className="rounded-xl bg-white/10 px-3 py-3 backdrop-blur-sm sm:rounded-2xl sm:px-4 sm:py-3.5">
            {ai.isPending && !ai.data ? (
              <div className="flex items-start gap-2" aria-busy aria-label={t.smartHero.aiLoading}>
                <Sparkles size={13} className="mt-0.5 shrink-0 text-amber-300/60" aria-hidden />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-full animate-pulse rounded-full bg-white/20" />
                  <div className="h-3 w-4/5 animate-pulse rounded-full bg-white/15" />
                  <div className="h-3 w-3/5 animate-pulse rounded-full bg-white/10" />
                </div>
              </div>
            ) : ai.data ? (
              <div className="flex items-start gap-2">
                <Sparkles size={13} className="mt-0.5 shrink-0 text-amber-300/80" aria-hidden />
                <p className="min-w-0 flex-1 text-sm leading-relaxed text-white/90 sm:text-[15px]">
                  {ai.data.summary}
                </p>
                {ai.data.source !== 'heuristic' && (
                  <AiBadge source={ai.data.source} />
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles size={13} className="shrink-0 text-amber-300/40" aria-hidden />
                <p className="text-sm text-white/60">{t.smartHero.aiFailed}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-medium sm:text-sm">
            {rainPct != null ? (
              <span className="rounded-full bg-white/15 px-3 py-2 backdrop-blur">☔ {t.smartHero.rainChance(rainPct)}</span>
            ) : null}
            <span className="rounded-full bg-white/15 px-3 py-2 backdrop-blur">
              🌬 {aqiName ? t.smartHero.aqiLine(aqiName) : t.smartHero.aqiMissing}
            </span>
            {uvWord ? (
              <span className="rounded-full bg-white/15 px-3 py-2 backdrop-blur">☀ {t.smartHero.uvLine(uvWord)}</span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Link
              href="/radar"
              className="inline-flex min-h-11 min-w-[44px] items-center justify-center rounded-full bg-white/95 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-white active:scale-[0.98] dark:bg-white dark:text-slate-900"
            >
              {t.smartHero.radarCta}
            </Link>
            <button
              type="button"
              onClick={() => setTab('hourly')}
              className="inline-flex min-h-11 min-w-[44px] items-center justify-center rounded-full border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-[0.98]"
            >
              {t.smartHero.hourlyCta}
            </button>
            <button
              type="button"
              onClick={() => void shareWeather()}
              className="inline-flex min-h-11 min-w-[44px] items-center justify-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-[0.98]"
            >
              <Share2 size={16} aria-hidden />
              {t.smartHeroShare.label}
            </button>
            {shareHint ? <span className="w-full text-xs text-white/80 sm:w-auto">{shareHint}</span> : null}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
