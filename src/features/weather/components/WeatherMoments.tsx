'use client'

import { useMemo } from 'react'
import { Clock3, CloudRain, Flame, Moon, SunMedium } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import type { HourlyPoint, WeatherBundle } from '@/features/weather/types'
import { computeNextRainWindow } from '@/features/weather/utils/next-rain'
import { formatTime } from '@/features/weather/utils/format'
import { useUiStore } from '@/shared/store/ui-store'

interface Props {
  weather: WeatherBundle
  onViewHourly?: () => void
}

function localTime(iso: string, timeZone: string, locale: string) {
  const loc = locale === 'en' ? 'en-GB' : 'vi-VN'
  return new Date(iso).toLocaleTimeString(loc, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  })
}

function hourLabel(point: HourlyPoint, locale: string) {
  if (locale === 'en') return formatTime(point.time)
  return formatTime(point.time)
}

export function WeatherMoments({ weather, onViewHourly }: Props) {
  const locale = useUiStore((s) => s.locale)
  const copy = locale === 'en'
    ? {
        eyebrow: 'Next few hours',
        title: 'Meaningful moments',
        subtitle: 'Only the moments that may change your plan.',
        viewAll: 'Hourly details',
        now: 'Now',
        hottest: 'Hottest',
        rain: 'Rain window',
        noRain: 'Little rain',
        noRainValue: 'OK',
        sunset: 'Sunset',
        cooler: 'Cooler',
        rainHint: (p: number) => `Peak chance around ${p}%. Bring rain gear if you are out then.`,
        noRainHint: 'No clear rain window soon. Outdoor plans look simpler.',
        hotHint: 'Plan shade, water, and lighter clothing around this time.',
        coolHint: 'Usually the easiest time for a walk or outdoor cafe.',
        sunsetHint: 'Good timing for softer light and calmer outdoor plans.',
      }
    : {
        eyebrow: 'Vài giờ tới',
        title: 'Khoảnh khắc đáng chú ý',
        subtitle: 'Chỉ giữ những mốc có thể ảnh hưởng tới kế hoạch của bạn.',
        viewAll: 'Chi tiết theo giờ',
        now: 'Bây giờ',
        hottest: 'Nóng nhất',
        rain: 'Khung mưa',
        noRain: 'Ít mưa',
        noRainValue: 'Ổn',
        sunset: 'Hoàng hôn',
        cooler: 'Dễ chịu hơn',
        rainHint: (p: number) => `Cao nhất khoảng ${p}%. Nếu ra ngoài lúc này nên mang đồ chống mưa.`,
        noRainHint: 'Chưa thấy khung mưa rõ trong thời gian gần. Kế hoạch ngoài trời dễ thở hơn.',
        hotHint: 'Nên chọn bóng râm, mang nước và mặc đồ thoáng vào khung này.',
        coolHint: 'Thường là lúc dễ chịu hơn để đi dạo hoặc cafe ngoài trời.',
        sunsetHint: 'Hợp để ra ngoài nhẹ nhàng, ánh sáng dịu hơn.',
      }

  const moments = useMemo(() => {
    const now = new Date().toISOString().slice(0, 13) + ':00'
    const startIdx = Math.max(0, weather.hourly.findIndex((h) => h.time >= now))
    const rows = weather.hourly.slice(startIdx, startIdx + 18)
    const rain = computeNextRainWindow(weather.hourly, 36)
    const hottest = rows.reduce((max, h) => (h.temperature > max.temperature ? h : max), rows[0] ?? weather.hourly[0])
    const coolest = rows.reduce((min, h) => (h.temperature < min.temperature ? h : min), rows[0] ?? weather.hourly[0])
    const sunset = weather.daily[0]?.sunset

    return {
      rain,
      hottest,
      coolest,
      sunset,
    }
  }, [weather])

  const items = [
    {
      key: 'now',
      Icon: Clock3,
      label: copy.now,
      value: `${Math.round(weather.current.temperature)}°`,
      hint: weather.current.apparentTemperature >= weather.current.temperature + 3
        ? locale === 'en'
          ? 'Feels warmer than the number.'
          : 'Cảm giác nóng hơn con số hiển thị.'
        : locale === 'en'
          ? 'Current feel outside.'
          : 'Cảm giác hiện tại ngoài trời.',
      accent: 'text-slate-700 dark:text-slate-100',
    },
    moments.rain.kind === 'window'
      ? {
          key: 'rain',
          Icon: CloudRain,
          label: copy.rain,
          value: localTime(moments.rain.startTime, weather.timezone, locale),
          hint: copy.rainHint(Math.round(moments.rain.maxProbability)),
          accent: 'text-sky-600 dark:text-sky-300',
        }
      : {
          key: 'rain',
          Icon: CloudRain,
          label: copy.noRain,
          value: copy.noRainValue,
          hint: copy.noRainHint,
          accent: 'text-emerald-600 dark:text-emerald-300',
        },
    {
      key: 'hot',
      Icon: Flame,
      label: copy.hottest,
      value: moments.hottest ? `${hourLabel(moments.hottest, locale)} · ${Math.round(moments.hottest.temperature)}°` : '-',
      hint: copy.hotHint,
      accent: 'text-orange-600 dark:text-orange-300',
    },
    moments.sunset
      ? {
          key: 'sunset',
          Icon: SunMedium,
          label: copy.sunset,
          value: localTime(moments.sunset, weather.timezone, locale),
          hint: copy.sunsetHint,
          accent: 'text-amber-600 dark:text-amber-300',
        }
      : {
          key: 'cool',
          Icon: Moon,
          label: copy.cooler,
          value: moments.coolest ? `${hourLabel(moments.coolest, locale)} · ${Math.round(moments.coolest.temperature)}°` : '-',
          hint: copy.coolHint,
          accent: 'text-indigo-600 dark:text-indigo-300',
        },
  ]

  return (
    <Card className="p-0">
      <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {copy.eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {copy.title}
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {copy.subtitle}
          </p>
        </div>
        {onViewHourly ? (
          <button
            type="button"
            onClick={onViewHourly}
            className="hidden min-h-10 shrink-0 rounded-full px-3 text-sm font-semibold text-sky-600 transition hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-400/10 sm:inline-flex sm:items-center"
          >
            {copy.viewAll}
          </button>
        ) : null}
      </div>

      <div className="scrollbar-thin overflow-x-auto px-3 pb-4">
        <div className="grid min-w-[760px] grid-cols-4 gap-3 sm:min-w-0">
          {items.map(({ key, Icon, label, value, hint, accent }) => (
            <article
              key={key}
              className="rounded-3xl border border-black/5 bg-white/55 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                <Icon size={17} className={accent} aria-hidden />
                {label}
              </div>
              <p className={`mt-3 text-2xl font-semibold tracking-tight ${accent}`}>
                {value}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {hint}
              </p>
            </article>
          ))}
        </div>
      </div>

      {onViewHourly ? (
        <div className="border-t border-black/5 px-5 py-3 dark:border-white/10 sm:hidden">
          <button
            type="button"
            onClick={onViewHourly}
            className="min-h-11 w-full rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition active:scale-[0.98] dark:bg-white dark:text-slate-950"
          >
            {copy.viewAll}
          </button>
        </div>
      ) : null}
    </Card>
  )
}
