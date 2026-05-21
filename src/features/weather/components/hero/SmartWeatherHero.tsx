'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MapPin, Share2, Sparkles, Umbrella } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import type { AirQualityBundle, WeatherBundle } from '@/features/weather/types'
import type { GeoLocation } from '@/features/geocoding/types'
import { wmoInfo } from '@/features/weather/utils/wmo'
import { formatTemp } from '@/features/weather/utils/format'
import { useUiStore } from '@/shared/store/ui-store'
import { useT } from '@/shared/hooks/useT'
import { DynamicBackground } from '@/features/weather/components/DynamicBackground'
import { useWeatherAiSummary } from '@/features/ai-summary/hooks/useWeatherAiSummary'
import { buildWeatherCompanion } from '@/ai/weather-companion'

interface Props {
  location: GeoLocation
  weather: WeatherBundle
  aqi?: AirQualityBundle
}

function aqiLabelFromEu(t: ReturnType<typeof useT>, eu: number | undefined): string | null {
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

function uvCategory(t: ReturnType<typeof useT>, uv: number | undefined): string | null {
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
  const companion = buildWeatherCompanion(location.name, weather, aqi, tempUnit, locale)

  async function shareWeather() {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const url = `${origin}/thoi-tiet`
    const line = `${location.name}: ${formatTemp(current.temperature, tempUnit)} · ${info.label}`
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'Trời Hôm Nay', text: line, url })
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
      className="relative isolate min-h-[540px] overflow-hidden rounded-[2.25rem] p-5 text-white shadow-[0_30px_90px_rgba(15,23,42,0.24)] ring-1 ring-white/20 sm:min-h-[560px] sm:p-8 lg:p-10"
      {...(!reduceMotion
        ? {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
          }
        : {})}
    >
      <DynamicBackground weatherCode={current.weatherCode} isDay={current.isDay} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/10 via-black/5 to-black/45" aria-hidden />

      <div className="flex min-h-[500px] flex-col justify-between gap-8">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/18 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-xl">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">
              {location.name}
              {location.admin1 ? `, ${location.admin1}` : ''}
              {location.country ? ` · ${location.country}` : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void shareWeather()}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/30 bg-white/12 text-white shadow-sm backdrop-blur-xl transition hover:bg-white/20 active:scale-[0.98]"
            aria-label={t.smartHeroShare.label}
          >
            <Share2 size={17} aria-hidden />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-base font-medium text-white/90">{info.label}</p>
            <div className="mt-2 flex flex-wrap items-end gap-4">
              <div className="text-[4.5rem] font-extralight leading-[0.86] tracking-tight drop-shadow-[0_2px_30px_rgba(0,0,0,0.4)] sm:text-[5.5rem] md:text-[7rem]">
                {formatTemp(current.temperature, tempUnit)}
              </div>
              <div className="pb-2 text-6xl leading-none sm:text-7xl" aria-hidden>
                {info.icon}
              </div>
            </div>
            <p className="mt-3 text-sm font-medium text-white/85 sm:text-base">
              {t.hero.feelsLike}{' '}
              <span className="text-white">{formatTemp(current.apparentTemperature, tempUnit)}</span>
              {today ? (
                <>
                  {' · '}
                  {t.hero.high} {formatTemp(today.tempMax, tempUnit)} / {t.hero.low}{' '}
                  {formatTemp(today.tempMin, tempUnit)}
                </>
              ) : null}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/18 bg-white/14 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl sm:p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-200">
              <Sparkles size={16} aria-hidden />
              {t.assistant.weatherAssistant}
            </div>
            <h1 className=" text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
              {companion.tone}
            </h1>
            <p className="mt-3 text-base leading-7 text-white/90 sm:text-lg">
              {ai.data?.summary ?? companion.summary}
            </p>
            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-white/12 p-3 text-sm leading-6 text-white/90 ring-1 ring-white/15">
              <Umbrella size={18} className="mt-0.5 shrink-0 text-amber-200" aria-hidden />
              <p>{companion.recommendation}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-medium sm:text-sm">
            {rainPct != null ? (
              <span className="rounded-full bg-white/15 px-3 py-2 backdrop-blur">
                {t.smartHero.rainChance(rainPct)}
              </span>
            ) : null}
            <span
              className={
                eu != null && eu > 100
                  ? 'rounded-full bg-amber-400/25 px-3 py-2 font-semibold text-white shadow-md ring-2 ring-amber-200/70 backdrop-blur'
                  : 'rounded-full bg-white/15 px-3 py-2 backdrop-blur'
              }
            >
              {aqiName ? t.smartHero.aqiLine(aqiName) : t.smartHero.aqiMissing}
            </span>
            {uvWord ? (
              <span className="rounded-full bg-white/15 px-3 py-2 backdrop-blur">
                {t.smartHero.uvLine(uvWord)}
              </span>
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
              onClick={() => setTab('health')}
              className="inline-flex min-h-11 min-w-[44px] items-center justify-center rounded-full border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-[0.98]"
            >
              {t.assistant.aqiUv}
            </button>
            {shareHint ? <span className="w-full text-xs text-white/80 sm:w-auto">{shareHint}</span> : null}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
