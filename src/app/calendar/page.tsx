import type { Metadata } from 'next'
import { TopBar } from '@/shared/ui/TopBar'
import { LunarCard } from '@/features/calendar/components/LunarCard'
import { CalendarGrid } from '@/features/calendar/components/CalendarGrid'

export const metadata: Metadata = { title: 'Lịch âm & Giờ hoàng đạo' }

export default function CalendarPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto container space-y-6 p-4 md:p-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">Lịch âm & Giờ hoàng đạo</h1>
          <p className="text-sm text-slate-500">
            Âm lịch Việt Nam (thuật toán Hồ Ngọc Đức, UTC+7) và giờ hoàng đạo theo tháng âm.
          </p>
        </header>
        <CalendarGrid />
        <LunarCard />
      </main>
    </>
  )
}
