import type { Metadata } from 'next'
import Link from 'next/link'
import { CitySearchLinks } from '@/components/weather/CitySearchLinks'
import { getPopularSeoCities, SEO_CITIES } from '@/data/seo-cities'
import { WeatherView } from '@/features/weather/components/WeatherView'
import { WeatherTabsBar } from '@/features/weather/components/WeatherTabsBar'
import { TopBar } from '@/shared/ui/TopBar'

export const metadata: Metadata = {
  title: 'Thời tiết hôm nay tại Việt Nam',
  description:
    'Tra cứu thời tiết hôm nay theo tỉnh/thành: nhiệt độ, khả năng mưa, AQI, UV, radar mưa và dự báo 7 ngày.',
  alternates: { canonical: '/thoi-tiet' },
}

export default function WeatherPage() {
  const popularCities = getPopularSeoCities()

  return (
    <>
      <TopBar />
      <WeatherTabsBar />
      <main className="mx-auto container space-y-8 p-4 pb-28 md:p-6">
        <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-white to-sky-50 p-5 shadow-sm dark:border-white/10 dark:from-white/10 dark:to-sky-400/10">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Thời tiết hôm nay
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Chọn tỉnh/thành để xem trang dự báo SEO server-rendered, hoặc dùng app bên dưới để tra cứu theo vị trí hiện tại.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {popularCities.map((city) => (
              <Link
                key={city.slug}
                href={`/thoi-tiet/${city.slug}`}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-sky-100 hover:text-sky-800 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-sky-400/20"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </section>

        <CitySearchLinks cities={SEO_CITIES} />
        <WeatherView />
      </main>
    </>
  )
}
