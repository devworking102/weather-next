import type { Metadata } from 'next'
import Link from 'next/link'
import { CitySearchLinks } from '@/components/weather/CitySearchLinks'
import { getPopularSeoCities, SEO_CITIES } from '@/data/seo-cities'
import { WeatherView } from '@/features/weather/components/WeatherView'
import { WeatherTabsBar } from '@/features/weather/components/WeatherTabsBar'
import { TopBar } from '@/shared/ui/TopBar'

export const metadata: Metadata = {
  title: 'Trợ lý thời tiết AI hôm nay tại Việt Nam',
  description:
    'Trợ lý thời tiết AI giúp bạn biết hôm nay có mưa không, nên mặc gì, có nên ra ngoài không, AQI ra sao và cần chuẩn bị gì.',
  alternates: { canonical: '/thoi-tiet' },
}

export default function WeatherPage() {
  const popularCities = getPopularSeoCities()

  return (
    <>
      <TopBar />
      <WeatherTabsBar />
      <main className="mx-auto container space-y-8 p-3 pb-32 md:p-6">
        <WeatherView />

        <section className="rounded-[2rem] border border-black/5 bg-white/65 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Trang thời tiết theo thành phố
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Các trang này sẵn sàng cho SEO theo tỉnh/thành, tóm tắt AI, schema.org và bài viết thời tiết địa phương.
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
      </main>
    </>
  )
}
