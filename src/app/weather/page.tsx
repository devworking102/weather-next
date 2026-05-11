import type { Metadata } from 'next'
import { TopBar } from '@/shared/ui/TopBar'
import { WeatherView } from '@/features/weather/components/WeatherView'
import { WeatherTabsBar } from '@/features/weather/components/WeatherTabsBar'

export const metadata: Metadata = {
  title: 'Dự báo hôm nay',
  description: 'Xem nhiệt độ, mưa nắng, AQI và gợi ý AI theo vị trí của bạn.',
  openGraph: {
    title: 'Dự báo hôm nay · Trời Hôm Nay',
    description: 'Thời tiết theo giờ, radar mưa, chất lượng không khí và trợ lý AI.',
    images: [
      {
        url: '/api/og?type=weather&title=Dự+báo+hôm+nay&line2=Trời+Hôm+Nay&line3=Theo+vị+trí+của+bạn',
        width: 1200,
        height: 630,
      },
    ],
  },
}

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
