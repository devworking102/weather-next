import type { Metadata } from 'next'
import { TopBar } from '@/shared/ui/TopBar'
import { AirQualityTab } from '@/features/weather/components/tabs/AirQualityTab'

export const metadata: Metadata = { title: 'Chất lượng không khí' }

export default function AqiPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto container p-4 md:p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">💨 Chất lượng không khí</h1>
          <p className="text-sm text-slate-500">
            Chỉ số AQI theo tiêu chuẩn châu Âu, PM2.5, PM10 và các chất ô nhiễm khác.
          </p>
        </header>
        <AirQualityTab />
      </main>
    </>
  )
}
