import type { Metadata } from 'next'
import { getPopularSeoCities } from '@/data/seo-cities'
import { PopularCitiesCompact } from '@/features/weather/components/PopularCitiesCompact'
import { WeatherView } from '@/features/weather/components/WeatherView'
import { TopBar } from '@/shared/ui/TopBar'

export const metadata: Metadata = {
  title: 'Trợ lý thời tiết hôm nay tại Việt Nam',
  description:
    'Trợ lý thời tiết giúp bạn biết hôm nay có mưa không, nên mặc gì, có nên ra ngoài không, AQI ra sao và cần chuẩn bị gì.',
  alternates: { canonical: '/thoi-tiet' },
}

export default function WeatherPage() {
  const popularCities = getPopularSeoCities()

  return (
    <>
      <TopBar />
      <main className="mx-auto container space-y-5 px-4 py-4 pb-28 md:space-y-8 md:p-6 md:pb-32">
        <WeatherView />
        <PopularCitiesCompact cities={popularCities} />
      </main>
    </>
  )
}
