import type { Metadata } from 'next'
import Link from 'next/link'
import { CitySearchLinks } from '@/components/weather/CitySearchLinks'
import { getPopularSeoCities, SEO_CITIES } from '@/data/seo-cities'
import { WeatherView } from '@/features/weather/components/WeatherView'
import { WeatherTabsBar } from '@/features/weather/components/WeatherTabsBar'
import { TopBar } from '@/shared/ui/TopBar'

export const metadata: Metadata = {
  title: 'Trời Hôm Nay - Trợ lý thời tiết cho người Việt',
  description:
    'Trợ lý thời tiết giúp bạn biết hôm nay có mưa không, nên mặc gì, có nên ra ngoài không, AQI thế nào và cần chuẩn bị gì.',
  alternates: { canonical: '/' },
}

export default function HomePage() {
  const popularCities = getPopularSeoCities()
  const trendingCities = SEO_CITIES.slice(0, 24)

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
      <WeatherTabsBar />
      <main className="mx-auto container space-y-8 p-3 pb-32 md:p-6">
        <WeatherView />

        <section className="rounded-[2rem] border border-black/5 bg-white/65 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Thành phố được xem nhiều
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Các trang địa phương phục vụ SEO, chia sẻ nhanh và theo dõi thời tiết tại từng tỉnh/thành.
              </p>
            </div>
            <Link
              href="/thoi-tiet"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {popularCities.map((city) => (
              <Link
                key={city.slug}
                href={`/thoi-tiet/${city.slug}`}
                className="rounded-2xl bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50 dark:bg-white/8 dark:hover:bg-sky-400/10"
              >
                <p className="font-semibold text-slate-950 dark:text-white">{city.name}</p>
                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{city.region}</p>
              </Link>
            ))}
          </div>
        </section>

        <CitySearchLinks cities={trendingCities} />
      </main>
    </>
  )
}
