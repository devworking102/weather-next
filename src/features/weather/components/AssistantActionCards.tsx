'use client'

import { Activity, CloudRain, HeartPulse } from 'lucide-react'
import type { CompanionInsight } from '@/ai/weather-companion'
import { cn } from '@/shared/lib/cn'

interface Props {
  insight: CompanionInsight
}

const cards = [
  {
    key: 'rain',
    title: 'Hôm nay có mưa không?',
    Icon: CloudRain,
    className: 'from-sky-50 to-cyan-50 text-sky-700 dark:from-sky-500/15 dark:to-cyan-500/10 dark:text-sky-200',
  },
  {
    key: 'aqi',
    title: 'Nhiệt độ/AQI có ảnh hưởng sức khỏe không?',
    Icon: HeartPulse,
    className: 'from-rose-50 to-fuchsia-50 text-rose-700 dark:from-rose-500/15 dark:to-fuchsia-500/10 dark:text-rose-200',
  },
  {
    key: 'recommendation',
    title: 'Tôi nên làm gì khi ra ngoài?',
    Icon: Activity,
    className: 'from-emerald-50 to-teal-50 text-emerald-700 dark:from-emerald-500/15 dark:to-teal-500/10 dark:text-emerald-200',
  },
] as const

export function AssistantActionCards({ insight }: Props) {
  return (
    <section aria-label="Tóm tắt thời tiết hôm nay" className="space-y-3">
      <div className="px-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Tóm tắt dễ hiểu
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
          3 câu cần biết trước khi ra ngoài
        </h2>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {cards.map(({ key, title, Icon, className }) => (
          <article
            key={key}
            className={cn(
              'min-h-[140px] rounded-[1.5rem] border border-white/70 bg-gradient-to-br p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5 dark:border-white/10 dark:shadow-none',
              className,
            )}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 shadow-sm dark:bg-white/10">
                <Icon size={20} aria-hidden />
              </div>
            </div>
            <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
              {insight[key]}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
