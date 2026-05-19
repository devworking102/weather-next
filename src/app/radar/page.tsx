import type { Metadata } from 'next'
import { TopBar } from '@/shared/ui/TopBar'
import { RadarPageContent } from '@/features/radar/components/RadarPageContent'

export const metadata: Metadata = {
  title: 'Radar mưa Việt Nam',
  description: 'Bản đồ radar mưa trực quan, hỗ trợ định vị, phóng to và theo dõi vùng mưa gần nhất.',
  alternates: { canonical: '/radar-mua' },
}

export default function RadarPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto container space-y-5 p-4 pb-28 md:p-6">
        <header className="rounded-3xl border border-sky-100 bg-gradient-to-br from-white to-sky-50 p-5 shadow-sm dark:border-white/10 dark:from-white/10 dark:to-sky-400/10">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">Radar mưa</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Theo dõi mưa gần bạn
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Xem nhanh vùng mưa, cường độ mưa và diễn biến gần nhất trên bản đồ. Dữ liệu chỉ mang tính tham khảo khi
            thời tiết xấu.
          </p>
        </header>
        <RadarPageContent />
      </main>
    </>
  )
}
