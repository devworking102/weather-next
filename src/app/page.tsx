import type { Metadata } from 'next'
import { getPopularSeoCities } from '@/data/seo-cities'
import { PopularCitiesCompact } from '@/features/weather/components/PopularCitiesCompact'
import { WeatherView } from '@/features/weather/components/WeatherView'
import { TopBar } from '@/shared/ui/TopBar'

export const metadata: Metadata = {
  title: {
    absolute: 'Thời tiết hôm nay - Dự báo thời tiết Việt Nam | Trời Hôm Nay',
  },
  description:
    'Xem thời tiết hôm nay tại Việt Nam: nhiệt độ, khả năng mưa, AQI, radar mưa, cảnh báo và gợi ý nên mặc gì, có nên ra ngoài không.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Thời tiết hôm nay - Dự báo thời tiết Việt Nam | Trời Hôm Nay',
    description:
      'Dự báo thời tiết hôm nay, AQI, radar mưa và cảnh báo theo vị trí.',
  },
  twitter: {
    title: 'Thời tiết hôm nay - Dự báo thời tiết Việt Nam | Trời Hôm Nay',
    description:
      'Dự báo thời tiết hôm nay, AQI, radar mưa và cảnh báo theo vị trí.',
  },
}

export default function HomePage() {
  const popularCities = getPopularSeoCities()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Hôm nay có cần mang ô không?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Trời Hôm Nay phân tích khả năng mưa theo giờ và đưa ra gợi ý dễ hiểu như nên mang ô, áo mưa nhỏ hay có thể ra ngoài thoải mái.',
        },
      },
      {
        '@type': 'Question',
        name: 'Ứng dụng có giải thích AQI bằng tiếng Việt không?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Có. Ứng dụng chuyển chỉ số AQI, UV và độ ẩm thành lời khuyên sức khỏe, trang phục và hoạt động phù hợp cho người dùng Việt Nam.',
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TopBar />
      <main className="mx-auto container space-y-5 px-4 py-4 pb-28 md:space-y-8 md:p-6 md:pb-32">
        <WeatherView />
        <PopularCitiesCompact cities={popularCities} />
      </main>
    </>
  )
}
