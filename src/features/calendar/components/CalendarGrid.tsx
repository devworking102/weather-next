'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toLunarDate } from '@/features/calendar/utils/lunar'
import { cn } from '@/shared/lib/cn'

// Ngày lễ dương lịch (key = "month-day", tháng 1-based)
const SOLAR_HOLIDAYS: Record<string, string> = {
  '1-1': 'Tết Dương Lịch',
  '4-30': 'Giải phóng miền Nam',
  '5-1': 'Quốc tế Lao động',
  '9-2': 'Quốc khánh',
}

// Ngày lễ âm lịch (key = "lunarMonth-lunarDay")
const LUNAR_HOLIDAYS: Record<string, string> = {
  '1-1': 'Tết Nguyên Đán',
  '1-2': 'Mùng 2 Tết',
  '1-3': 'Mùng 3 Tết',
  '1-4': 'Mùng 4 Tết',
  '1-5': 'Mùng 5 Tết',
  '3-10': 'Giỗ tổ Hùng Vương',
  '7-15': 'Lễ Vu Lan',
  '12-30': 'Giao thừa',
}

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

interface DayCell {
  date: Date
  isCurrentMonth: boolean
  isSunday: boolean
  isToday: boolean
  solarHoliday?: string
  lunarDay: number
  lunarMonth: number
  isFirstLunarDay: boolean
  lunarHoliday?: string
}

function buildCells(year: number, month: number): DayCell[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayMs = today.getTime()

  const firstOfMonth = new Date(year, month, 1)
  // getDay() returns 0=Sun..6=Sat. We want Mon=0..Sun=6.
  const startDow = (firstOfMonth.getDay() + 6) % 7

  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: DayCell[] = []

  // Cells từ tháng trước
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    cells.push(makeCell(d, false, todayMs))
  }

  // Cells tháng hiện tại
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(makeCell(new Date(year, month, d), true, todayMs))
  }

  // Cells tháng sau để lấp đầy lưới (luôn 6 hàng = 42 ô)
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push(makeCell(new Date(year, month + 1, d), false, todayMs))
  }

  return cells
}

function makeCell(date: Date, isCurrentMonth: boolean, todayMs: number): DayCell {
  const d = date.getDate()
  const m = date.getMonth() + 1
  const dow = date.getDay() // 0=Sun
  const isSunday = dow === 0
  const isToday = date.getTime() === todayMs

  const lunar = toLunarDate(date)
  const solarKey = `${m}-${d}`
  const lunarKey = `${lunar.month}-${lunar.day}`

  return {
    date,
    isCurrentMonth,
    isSunday,
    isToday,
    solarHoliday: SOLAR_HOLIDAYS[solarKey],
    lunarDay: lunar.day,
    lunarMonth: lunar.month,
    isFirstLunarDay: lunar.day === 1,
    lunarHoliday: LUNAR_HOLIDAYS[lunarKey],
  }
}

export function CalendarGrid() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const cells = useMemo(() => buildCells(year, month), [year, month])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  function goToday() {
    setYear(now.getFullYear())
    setMonth(now.getMonth())
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm dark:border-white/8 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/8 px-5 py-4 dark:border-white/8">
        <button
          onClick={prevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-white/8"
          type="button"
          aria-label="Tháng trước"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-base font-bold text-slate-800 dark:text-white">
          Tháng {month + 1} / {year}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={nextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-white/8"
            type="button"
            aria-label="Tháng sau"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={goToday}
            className="rounded-full bg-sky-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
            type="button"
          >
            Hôm nay
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-black/8 dark:border-white/8">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={cn(
              'py-2.5 text-center text-xs font-bold uppercase tracking-wide',
              i === 6
                ? 'text-rose-500'
                : 'text-slate-500 dark:text-slate-400',
            )}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => {
          const holiday = cell.solarHoliday ?? cell.lunarHoliday
          const isHoliday = !!holiday
          const lastCol = (idx % 7) === 6
          const lastRow = idx >= 35

          return (
            <div
              key={idx}
              className={cn(
                'relative min-h-[88px] border-b border-r border-black/5 p-2 dark:border-white/5',
                lastCol && 'border-r-0',
                lastRow && 'border-b-0',
                !cell.isCurrentMonth && 'bg-slate-50 dark:bg-slate-800/40',
              )}
            >
              {/* Solar day */}
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold leading-none',
                    cell.isToday
                      ? 'bg-sky-600 text-white'
                      : cell.isSunday || isHoliday
                        ? 'text-rose-500'
                        : cell.isCurrentMonth
                          ? 'text-slate-800 dark:text-slate-100'
                          : 'text-slate-400 dark:text-slate-600',
                  )}
                >
                  {cell.date.getDate()}
                </span>

                {/* Lunar day */}
                <span
                  className={cn(
                    'text-[10px] font-medium leading-none',
                    cell.isFirstLunarDay
                      ? 'font-bold text-sky-500'
                      : 'text-slate-400 dark:text-slate-500',
                  )}
                >
                  {cell.isFirstLunarDay
                    ? `${cell.lunarDay}/${cell.lunarMonth}`
                    : cell.lunarDay}
                </span>
              </div>

              {/* Holiday badge */}
              {holiday && (
                <div className="mt-1.5">
                  <span className="inline-block max-w-full truncate rounded border border-rose-300 bg-rose-50 px-1 py-0.5 text-[9px] font-semibold leading-tight text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                    {holiday}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
