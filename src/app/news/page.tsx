import type { Metadata } from 'next'
import { TopBar } from '@/shared/ui/TopBar'
import { NewsList } from '@/features/news/components/NewsList'

export const metadata: Metadata = { title: 'Tin tức thiên tai' }

export default function NewsPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto container space-y-6 p-4 md:p-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">Tin tức thiên tai toàn cầu</h1>
          <p className="text-sm text-slate-500">Cập nhật từ GDACS — cảnh báo thời gian thực.</p>
        </header>
        <NewsList />
      </main>
    </>
  )
}
