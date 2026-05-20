'use client'

import { Sparkles } from 'lucide-react'
import type { CompanionInsight } from '@/ai/weather-companion'

interface Props {
  insight: CompanionInsight
}

export function AiSummaryCard({ insight }: Props) {
  return (
    <section className="rounded-[24px] border border-sky-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/70 md:hidden">
      <div className="flex items-center gap-2 text-[12px] font-semibold uppercase text-sky-600 dark:text-sky-300">
        <Sparkles size={15} aria-hidden />
        Tóm tắt hôm nay
      </div>
      <h2 className="mt-2 text-xl font-semibold leading-tight tracking-normal text-slate-950 dark:text-white">
        {insight.tone}
      </h2>
      <p className="mt-3 text-[15px] leading-6 text-slate-700 dark:text-slate-200">
        {insight.summary}
      </p>
      <p className="mt-3 rounded-[20px] bg-sky-50 p-3 text-sm leading-6 text-sky-950 dark:bg-sky-400/10 dark:text-sky-100">
        {insight.recommendation}
      </p>
    </section>
  )
}
