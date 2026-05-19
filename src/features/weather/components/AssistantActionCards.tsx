'use client'

import { Activity, HeartPulse, Shirt } from 'lucide-react'
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
    key: 'aqi',
    titleKey: 'health',
    Icon: HeartPulse,
    className: 'from-rose-50 to-fuchsia-50 text-rose-700 dark:from-rose-500/15 dark:to-fuchsia-500/10 dark:text-rose-200',
  },
] as const

export function AssistantActionCards({ insight }: Props) {
  const t = useT()

  return (
    <section aria-label={t.assistant.aiSuggestion} className="space-y-3">
      <div className="px-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {t.assistant.aiSuggestion}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
          {t.assistant.recommendations}
        </h2>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
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
          </div>
          <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{t.assistant[titleKey]}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
            {insight[key]}
          </p>
        </article>
      ))}
      </div>
    </section>
  )
}
