import type { Metadata } from 'next'
import { getPopularSeoCities } from '@/data/seo-cities'
import { PopularCitiesCompact } from '@/features/weather/components/PopularCitiesCompact'
import { WeatherView } from '@/features/weather/components/WeatherView'
import { TopBar } from '@/shared/ui/TopBar'

export const metadata: Metadata = {
  title: {
    absolute: 'Dự báo thời tiết hôm nay tại Việt Nam | Trời Hôm Nay',
  },
  description:
    'Dự báo thời tiết hôm nay theo vị trí: nhiệt độ, mưa theo giờ, AQI, UV, radar mưa, cảnh báo và gợi ý sinh hoạt dễ hiểu.',
  alternates: { canonical: '/thoi-tiet' },
  openGraph: {
    title: 'Dự báo thời tiết hôm nay tại Việt Nam | Trời Hôm Nay',
    description:
      'Theo dõi thời tiết hôm nay, AQI, radar mưa và cảnh báo theo vị trí.',
  },
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
