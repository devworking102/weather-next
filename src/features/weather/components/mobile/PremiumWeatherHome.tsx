'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import {
  Bot,
  CloudRain,
  Droplets,
  Gauge,
  Map,
  MapPin,
  Navigation,
  Sparkles,
  SunMedium,
  ThermometerSun,
  Wind,
} from 'lucide-react'
import type { CompanionInsight } from '@/ai/weather-companion'
import type { GeoLocation } from '@/features/geocoding/types'
import type { AirQualityBundle, TempUnit, WeatherBundle } from '@/features/weather/types'
import { wmoInfo } from '@/features/weather/utils/wmo'
import { Card } from '@/shared/ui/Card'
import { FavoriteStar } from '@/features/favorites/components/FavoriteStar'
import { MobileRadarCard } from './premium/MobileRadarCard'
import { PremiumDailyForecast } from './premium/PremiumDailyForecast'
import { PremiumHourlyForecast } from './premium/PremiumHourlyForecast'

const NewsList = dynamic(() => import('@/features/news/components/NewsList').then((m) => ({ default: m.NewsList })), {
  ssr: false,
  loading: () => <div className="h-40 rounded-[24px] bg-white/50 shimmer dark:bg-white/5" />,
})

interface Props {
  location: GeoLocation
  weather: WeatherBundle
  aqi?: AirQualityBundle
  insight: CompanionInsight | null
  tempUnit: TempUnit
}

function temp(value: number, unit: TempUnit) {
  return `${Math.round(value)}°${unit === 'fahrenheit' ? 'F' : 'C'}`
}

function aqiTone(value?: number) {
  if (value == null || !Number.isFinite(value)) return { label: 'Chưa có', tone: 'Đang cập nhật', className: 'text-slate-500' }
  if (value <= 40) return { label: String(Math.round(value)), tone: 'Tốt', className: 'text-emerald-600 dark:text-emerald-300' }
  if (value <= 60) return { label: String(Math.round(value)), tone: 'Vừa phải', className: 'text-amber-600 dark:text-amber-300' }
  if (value <= 80) return { label: String(Math.round(value)), tone: 'Kém', className: 'text-orange-600 dark:text-orange-300' }
  return { label: String(Math.round(value)), tone: 'Xấu', className: 'text-rose-600 dark:text-rose-300' }
}

function comfortLabel(weather: WeatherBundle, insight: CompanionInsight | null) {
  if (insight?.comfort) return insight.comfort
  const feels = weather.current.apparentTemperature
  if (feels >= 34) return 'Nóng oi bức'
  if (feels >= 29) return 'Khá nóng'
  if (feels >= 23) return 'Không khí dễ chịu'
  return 'Trời mát'
}

function HeroAtmosphere({ code, isDay }: { code: number; isDay: boolean }) {
  const rainy = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)
  const cloudy = [2, 3, 45, 48].includes(code)

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -right-24 -top-20 h-64 w-64 rounded-full bg-white/25 blur-3xl atmo-sunny-pulse" />
      <div className="absolute bottom-0 left-0 h-44 w-full bg-gradient-to-t from-black/25 to-transparent" />
      {rainy ? (
        <div className="absolute inset-0 opacity-35 atmo-rain-fall [background-image:linear-gradient(115deg,rgba(255,255,255,.38)_1px,transparent_1px)] [background-size:28px_54px]" />
      ) : null}
      {cloudy ? (
        <div className="absolute left-[-10%] top-24 h-28 w-[120%] rounded-full bg-white/16 blur-2xl atmo-cloud-drift" />
      ) : null}
      {!isDay ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.22)_1px,transparent_2px)] [background-size:54px_54px] atmo-night-shimmer" />
      ) : null}
    </div>
  )
}

function HeroWeatherSection({ location, weather, aqi, insight, tempUnit }: Props) {
  const info = wmoInfo(weather.current.weatherCode)
  const gradient = weather.current.isDay ? info.gradientDay : info.gradientNight
  const today = weather.daily[0]
  const rainChance = Math.round(today?.precipitationProbability ?? weather.current.precipitation ?? 0)
  const aqiInfo = aqiTone(aqi?.current.europeanAqi)

  return (
    <motion.section
      id="ai-insight"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative min-h-[calc(100svh-9rem)] overflow-hidden rounded-b-[36px] rounded-t-[28px] px-5 pb-6 pt-5 text-white shadow-[0_28px_80px_rgba(15,23,42,0.28)] md:min-h-[620px] md:rounded-[40px] md:px-8 md:pb-8 md:pt-7"
      style={{ background: `linear-gradient(155deg, ${gradient[0]}, ${gradient[1]})` }}
    >
      <HeroAtmosphere code={weather.current.weatherCode} isDay={weather.current.isDay} />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium text-white/82">
            <MapPin size={16} className="shrink-0" aria-hidden />
            <span className="truncate">
              {location.name}
              {location.admin1 ? `, ${location.admin1}` : ''}
            </span>
          </div>
          <p className="mt-2 text-sm text-white/64">Trời Hôm Nay</p>
        </div>
        <FavoriteStar location={location} className="shrink-0 bg-white/18 text-white ring-1 ring-white/20 backdrop-blur-xl" />
      </div>

      <div className="relative z-10 mt-12 md:mt-16">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[6rem] font-light leading-[0.85] tracking-normal md:text-[8.5rem]">
              {Math.round(weather.current.temperature)}°
            </h1>
            <p className="mt-4 text-2xl font-semibold leading-tight md:text-4xl">{comfortLabel(weather, insight)}</p>
            <p className="mt-2 text-base text-white/76 md:text-lg">
              {info.label} · cảm giác {temp(weather.current.apparentTemperature, tempUnit)}
            </p>
          </div>
          <span className="mt-1 shrink-0 text-7xl leading-none drop-shadow md:text-8xl" aria-hidden>
            {info.icon}
          </span>
        </div>
      </div>

      <div className="relative z-10 mt-10 grid grid-cols-3 gap-2.5 md:mt-14 md:max-w-2xl md:gap-3">
        <div className="rounded-[22px] bg-white/16 p-3 ring-1 ring-white/18 backdrop-blur-xl">
          <CloudRain size={18} aria-hidden />
          <p className="mt-3 text-[11px] font-medium uppercase text-white/62">Mưa</p>
          <p className="mt-1 text-lg font-semibold">{rainChance}%</p>
        </div>
        <div className="rounded-[22px] bg-white/16 p-3 ring-1 ring-white/18 backdrop-blur-xl">
          <Gauge size={18} aria-hidden />
          <p className="mt-3 text-[11px] font-medium uppercase text-white/62">AQI</p>
          <p className="mt-1 text-lg font-semibold">{aqiInfo.tone}</p>
        </div>
        <div className="rounded-[22px] bg-white/16 p-3 ring-1 ring-white/18 backdrop-blur-xl">
          <ThermometerSun size={18} aria-hidden />
          <p className="mt-3 text-[11px] font-medium uppercase text-white/62">Cảm giác</p>
          <p className="mt-1 text-lg font-semibold">{Math.round(weather.current.apparentTemperature)}°</p>
        </div>
      </div>
    </motion.section>
  )
}

function QuickInfoStrip({ weather, aqi }: { weather: WeatherBundle; aqi?: AirQualityBundle }) {
  const aqiInfo = aqiTone(aqi?.current.europeanAqi)
  const items = [
    { label: 'AQI', value: aqiInfo.label, hint: aqiInfo.tone, Icon: Gauge, className: aqiInfo.className },
    { label: 'UV', value: Math.round(weather.current.uvIndex).toString(), hint: weather.current.uvIndex >= 6 ? 'Cần chống nắng' : 'Ổn', Icon: SunMedium, className: 'text-amber-600 dark:text-amber-300' },
    { label: 'Gió', value: `${Math.round(weather.current.windSpeed)}`, hint: 'km/h', Icon: Wind, className: 'text-sky-600 dark:text-sky-300' },
    { label: 'Độ ẩm', value: `${Math.round(weather.current.humidity)}%`, hint: weather.current.humidity >= 80 ? 'Ẩm' : 'Dễ chịu', Icon: Droplets, className: 'text-cyan-600 dark:text-cyan-300' },
  ]

  return (
    <section className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Thông tin nhanh">
      <div className="flex gap-3">
        {items.map(({ label, value, hint, Icon, className }) => (
          <article
            key={label}
            className="min-w-[132px] rounded-[24px] border border-black/5 bg-white/78 p-4 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07]"
          >
            <Icon size={19} className={className} aria-hidden />
            <p className="mt-4 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">{value}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{hint}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function AiInsightCard({ insight }: { insight: CompanionInsight | null }) {
  if (!insight) return null

  const toneClass =
    insight.alertLevel === 'warning'
      ? 'from-rose-500/14 to-orange-400/10 text-rose-700 dark:text-rose-100'
      : insight.alertLevel === 'notice'
        ? 'from-amber-500/14 to-sky-400/10 text-amber-800 dark:text-amber-100'
        : 'from-emerald-500/14 to-sky-400/10 text-emerald-800 dark:text-emerald-100'

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.35 }}
      className={`rounded-[28px] border border-white/70 bg-gradient-to-br ${toneClass} p-5 shadow-sm backdrop-blur-2xl dark:border-white/10`}
      aria-label="Trợ lý AI thời tiết"
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/70 text-slate-950 shadow-sm dark:bg-white/12 dark:text-white">
          <Bot size={17} aria-hidden />
        </span>
        AI thời tiết
        <Sparkles size={15} aria-hidden />
      </div>
      <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-normal text-slate-950 dark:text-white">
        {insight.recommendation}
      </h2>
      <p className="mt-3 text-[15px] leading-6 text-slate-700 dark:text-slate-200">{insight.summary}</p>
      <div className="mt-4 grid grid-cols-2 gap-2.5 text-sm">
        <p className="rounded-[18px] bg-white/65 p-3 text-slate-700 dark:bg-white/10 dark:text-slate-200">{insight.rain}</p>
        <p className="rounded-[18px] bg-white/65 p-3 text-slate-700 dark:bg-white/10 dark:text-slate-200">{insight.aqi}</p>
      </div>
    </motion.section>
  )
}

export function PremiumWeatherHome(props: Props) {
  return (
    <div className="space-y-5 md:space-y-7">
      <HeroWeatherSection {...props} />
      <QuickInfoStrip weather={props.weather} aqi={props.aqi} />
      <AiInsightCard insight={props.insight} />
      <PremiumHourlyForecast weather={props.weather} tempUnit={props.tempUnit} />
      <MobileRadarCard location={props.location} />
      <PremiumDailyForecast weather={props.weather} tempUnit={props.tempUnit} />

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-xl items-center gap-2 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:hidden">
        <a
          href="#ai-insight"
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-slate-950/92 px-4 text-sm font-semibold text-white shadow-2xl backdrop-blur-xl dark:bg-white/90 dark:text-slate-950"
        >
          <Bot size={17} aria-hidden />
          Hỏi AI
        </a>
        <a
          href="#radar"
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-white/90 px-4 text-sm font-semibold text-slate-950 shadow-2xl backdrop-blur-xl dark:bg-slate-900/90 dark:text-white"
        >
          <Map size={17} aria-hidden />
          Radar
        </a>
      </div>

      <Card className="p-5 md:hidden">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <Navigation size={16} aria-hidden />
          Gợi ý nhanh
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {props.insight?.outfit ?? 'Mở định vị để nhận gợi ý cá nhân theo nơi bạn đang ở.'}
        </p>
      </Card>

      <section className="pt-2">
        <div className="mb-3 px-1">
          <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">Tin thời tiết</p>
          <h2 className="mt-1 text-xl font-semibold tracking-normal text-slate-950 dark:text-white">Cập nhật sau cùng</h2>
        </div>
        <Card className="p-4">
          <NewsList />
        </Card>
      </section>
    </div>
  )
}
