'use client'

import { useMemo } from 'react'
import { Card } from '@/shared/ui/Card'
import { toLunarDate, zodiacHours } from '@/features/calendar/utils/lunar'
import { useT } from '@/shared/hooks/useT'
import { cn } from '@/shared/lib/cn'

export function LunarHoursCard() {
  const t = useT()
  const { lunar, hours, currentIdx } = useMemo(() => {
    const now = new Date()
    const l = toLunarDate(now)
    const h = zodiacHours(l.month)
    const idx = Math.floor(((now.getHours() + 1) % 24) / 2)
    return { lunar: l, hours: h, currentIdx: idx }
  }, [])

  return (
    <Card className="p-0">
      <div className="flex items-center gap-2 border-b border-black/5 px-5 py-3 dark:border-white/5">
        <span className="text-lg">🏮</span>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t.lunar.cardTitle}
        </h3>
      </div>
      <div className="p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="min-w-[70px] rounded-xl border border-sky-200 bg-sky-50 p-2.5 text-center text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200">
            <div className="text-[10px] font-semibold uppercase tracking-wider">
              {t.lunar.month(lunar.month)}
            </div>
            <div className="text-2xl font-black leading-none">{lunar.day}</div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-100">
              {t.lunar.year(String(lunar.year))}
              {lunar.leap ? (
                <span className="rounded border border-amber-200 bg-amber-100 px-1 py-0.5 text-[9px] font-bold uppercase text-amber-700">
                  {t.lunar.leap}
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {t.lunar.hint}
            </p>
          </div>
        </div>
        <div className="scrollbar-thin -mx-4 overflow-x-auto px-4">
          <div className="flex gap-2 pb-1">
            {hours.map((h) => {
              const active = currentIdx === h.index
              return (
                <div
                  key={h.index}
                  className={cn(
                    'min-w-[100px] rounded-xl border p-2.5 text-center transition-all',
                    active
                      ? 'border-sky-500 bg-sky-500 text-white shadow-md'
                      : h.good
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
                        : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-400',
                  )}
                >
                  <div className="text-sm font-bold tracking-wide">{h.name}</div>
                  <div
                    className={cn(
                      'my-1 font-mono text-[11px]',
                      active ? 'text-white/80' : 'opacity-70',
                    )}
                  >
                    {String(h.start).padStart(2, '0')}:00 – {String(h.end).padStart(2, '0')}:00
                  </div>
                  <div
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                      active
                        ? 'bg-sky-700 text-white'
                        : h.good
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
                          : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300',
                    )}
                  >
                    {h.good ? t.lunar.good : t.lunar.bad}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}
