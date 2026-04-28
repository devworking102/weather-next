import type { Metadata } from 'next'
import { TopBar } from '@/shared/ui/TopBar'
import { HealthPageContent } from '@/features/weather/components/HealthPageContent'

export const metadata: Metadata = { title: 'Chỉ số sức khỏe' }

export default function HealthPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto container p-4 md:p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">❤️ Chỉ số sức khỏe</h1>
          <p className="text-sm text-slate-500">
            Đánh giá tác động thời tiết đến sức khỏe và hoạt động ngoài trời.
          </p>
        </header>
        <HealthPageContent />
      </main>
    </>
  )
}
