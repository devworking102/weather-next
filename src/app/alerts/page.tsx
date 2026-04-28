import type { Metadata } from 'next'
import { TopBar } from '@/shared/ui/TopBar'
import { AlertsPageContent } from '@/features/weather/components/AlertsPageContent'

export const metadata: Metadata = { title: 'Cảnh báo thời tiết' }

export default function AlertsPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto container p-4 md:p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">⚠️ Cảnh báo thời tiết</h1>
          <p className="text-sm text-slate-500">
            Cảnh báo nắng nóng, mưa bão, gió mạnh, không khí kém và động đất.
          </p>
        </header>
        <AlertsPageContent />
      </main>
    </>
  )
}
