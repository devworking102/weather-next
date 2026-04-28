'use client'

import { useMemo } from 'react'
import { Card } from '@/shared/ui/Card'
import {
  canChiYear,
  moonPhase,
  toLunarDate,
  zodiacHours,
} from '@/features/calendar/utils/lunar'

interface Props {
  date?: Date
}

const DAYS_OF_WEEK = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

export function LunarCard({ date = new Date() }: Props) {
  const info = useMemo(() => {
    const lunar = toLunarDate(date)
    const phase = moonPhase(date)
    const hours = zodiacHours(lunar.month)
    return { lunar, phase, hours, canChi: canChiYear(lunar.year) }
  }, [date])

  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-1 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {DAYS_OF_WEEK[date.getDay()]}
        </p>
        <p className="mt-2 text-5xl font-black text-slate-900 dark:text-white">
          {date.getDate()}
        </p>
        <p className="text-sm text-slate-500">
          Tháng {date.getMonth() + 1}/{date.getFullYear()}
        </p>
        <div className="mt-5 border-t border-black/5 pt-4 dark:border-white/5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Âm lịch</p>
          <p className="mt-1 text-3xl font-bold text-amber-700 dark:text-amber-400">
            {info.lunar.day}/{info.lunar.month}
            {info.lunar.leap ? ' (nhuận)' : ''}
          </p>
          <p className="text-sm text-slate-500">Năm {info.canChi}</p>
        </div>
      </Card>

      <Card className="md:col-span-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Giờ Hoàng Đạo hôm nay
          </h3>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium dark:bg-white/5">
            <span>{info.phase.icon}</span>
            <span>{info.phase.name}</span>
            <span className="text-slate-400">· {info.phase.illumination}%</span>
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {info.hours.map((h) => (
            <div
              key={h.index}
              className={`rounded-xl border p-2.5 text-center text-xs ${
                h.good
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
                  : 'border-black/5 bg-white text-slate-600 dark:border-white/5 dark:bg-slate-900/40 dark:text-slate-400'
              }`}
            >
              <div className="font-semibold">{h.name}</div>
              <div className="mt-1 text-[10px] opacity-75">
                {pad(h.start)}–{pad(h.end)}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Ô xanh là giờ Hoàng Đạo (hợp việc trọng đại). Mang tính tham khảo theo phong tục dân gian.
        </p>
      </Card>
    </div>
  )
}
