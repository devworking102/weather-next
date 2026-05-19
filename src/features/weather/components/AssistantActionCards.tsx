'use client'

import { Activity, HeartPulse, Shirt, Umbrella } from 'lucide-react'
import type { CompanionInsight } from '@/ai/weather-companion'
import { cn } from '@/shared/lib/cn'
import { useT } from '@/shared/hooks/useT'

interface Props {
  insight: CompanionInsight
}

const cards = [
  {
    key: 'outfit',
    titleKey: 'outfit',
    Icon: Shirt,
    className: 'from-orange-50 to-amber-50 text-orange-700 dark:from-orange-500/15 dark:to-amber-500/10 dark:text-orange-200',
  },
  {
    key: 'activity',
    titleKey: 'activity',
    Icon: Activity,
    className: 'from-emerald-50 to-teal-50 text-emerald-700 dark:from-emerald-500/15 dark:to-teal-500/10 dark:text-emerald-200',
  },
  {
    key: 'rain',
    titleKey: 'rain',
    Icon: Umbrella,
    className: 'from-sky-50 to-blue-50 text-sky-700 dark:from-sky-500/15 dark:to-blue-500/10 dark:text-sky-200',
  },
  {
    key: 'aqi',
    titleKey: 'health',
    Icon: HeartPulse,
    className: 'from-rose-50 to-fuchsia-50 text-rose-700 dark:from-rose-500/15 dark:to-fuchsia-500/10 dark:text-rose-200',
  },
] as const

export function AssistantActionCards({ insight }: Props) {
  const t = useT()

  return (
    <section aria-label={t.assistant.aiSuggestion} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ key, titleKey, Icon, className }) => (
        <article
          key={key}
          className={cn(
            'min-h-[140px] rounded-[1.75rem] border border-white/70 bg-gradient-to-br p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5 dark:border-white/10 dark:shadow-none',
            className,
          )}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 shadow-sm dark:bg-white/10">
              <Icon size={20} aria-hidden />
            </div>
            <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              {t.assistant.aiSuggestion}
            </span>
          </div>
          <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{t.assistant[titleKey]}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
            {insight[key]}
          </p>
        </article>
      ))}
    </section>
  )
}
