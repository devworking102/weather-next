import type { Metadata } from 'next'
import { TopBar } from '@/shared/ui/TopBar'
import { WidgetTab } from '@/features/weather/components/tabs/WidgetTab'

export const metadata: Metadata = { title: 'Nhúng widget thời tiết' }

export default function WidgetPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto container p-4 md:p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">🔗 Nhúng widget</h1>
          <p className="text-sm text-slate-500">
            Sao chép mã iframe để nhúng widget thời tiết vào trang web của bạn.
          </p>
        </header>
        <WidgetTab />
      </main>
    </>
  )
}
