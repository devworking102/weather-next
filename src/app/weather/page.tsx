import type { Metadata } from 'next'
import { TopBar } from '@/shared/ui/TopBar'
import { WeatherView } from '@/features/weather/components/WeatherView'
import { WeatherTabsBar } from '@/features/weather/components/WeatherTabsBar'

export const metadata: Metadata = { title: 'Dự báo hôm nay' }

export default function WeatherPage() {
  return (
    <>
      <TopBar />
      <WeatherTabsBar />
      <main className="mx-auto container p-4 md:p-6">
        <WeatherView />
      </main>
    </>
  )
}
