import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { TopBar } from '@/shared/ui/TopBar'
import { Skeleton } from '@/shared/ui/Skeleton'

const WindTab = dynamic(
  () => import('@/features/weather/components/tabs/WindTab').then((m) => ({ default: m.WindTab })),
  { loading: () => <Skeleton className="h-[min(70vh,640px)] rounded-3xl" /> },
)

export const metadata: Metadata = { title: 'Bản đồ gió' }

export default function WindPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto container p-4 md:p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">🗺️ Bản đồ gió</h1>
          <p className="text-sm text-slate-500">
            Bản đồ gió toàn cầu theo thời gian thực từ Windy.
          </p>
        </header>
        <WindTab />
      </main>
    </>
  )
}
