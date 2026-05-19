import type { Metadata } from 'next'
import Link from 'next/link'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { CurrentWeatherCard } from '@/components/weather/CurrentWeatherCard'
import { DailyForecast } from '@/components/weather/DailyForecast'
import { HourlyForecast } from '@/components/weather/HourlyForecast'
import { WeatherAdvice } from '@/components/weather/WeatherAdvice'
import { WeatherStats } from '@/components/weather/WeatherStats'
import { buildWeatherSummary } from '@/components/weather/utils'
import { getSeoCity, listSeoCitySlugs } from '@/data/seo-cities'
import {
  getAirQualityByCoords,
  getWeatherBundleByCoords,
} from '@/lib/weather'
import { buildPlaceJsonLd, buildWeatherBreadcrumbJsonLd, buildWebsiteJsonLd } from '@/lib/seo'
import { getSiteUrl } from '@/shared/lib/site-url'
import { TopBar } from '@/shared/ui/TopBar'

export const revalidate = 1800

const getCachedWeatherBundle = cache(getWeatherBundleByCoords)
const getCachedAirQuality = cache(getAirQualityByCoords)

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return listSeoCitySlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const city = getSeoCity(slug)
  if (!city) notFound()

  const base = getSiteUrl()
  const title = `Thời tiết ${city.name} hôm nay - Dự báo 7 ngày | Trời Hôm Nay`
  const description = `Cập nhật thời tiết ${city.name} hôm nay, nhiệt độ, khả năng mưa, độ ẩm, gió, chỉ số UV và dự báo 7 ngày chính xác.`
  const image = `/api/og?type=weather&title=${encodeURIComponent(`Thời tiết ${city.name}`)}&line2=${encodeURIComponent(
    'Dự báo hôm nay và 7 ngày',
  )}`

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${base}/thoi-tiet/${city.slug}` },
    openGraph: {
      title,
      description,
      url: `${base}/thoi-tiet/${city.slug}`,
      siteName: 'Trời Hôm Nay',
      locale: 'vi_VN',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: `Thời tiết ${city.name}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function WeatherCityPage({ params }: PageProps) {
  const { slug } = await params
  const city = getSeoCity(slug)
  if (!city) notFound()

  const base = getSiteUrl()
  const jsonLd = [
    buildWebsiteJsonLd(base),
    buildWeatherBreadcrumbJsonLd(base, city),
    buildPlaceJsonLd(base, city),
  ]

  const [weatherResult, airQuality] = await Promise.allSettled([
    getCachedWeatherBundle(city.lat, city.lon),
    getCachedAirQuality(city.lat, city.lon),
  ])

  const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : null
  const current = weather?.current
  const forecast = weather
  const aqi = airQuality.status === 'fulfilled' ? airQuality.value : null
  const today = forecast?.daily[0]
  const summary = current
    ? buildWeatherSummary(city.name, current, today)
    : `Chưa tải được dữ liệu thời tiết ${city.name}. Bạn vẫn có thể xem thông tin tỉnh/thành và thử lại sau ít phút.`

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TopBar />
      <main className="bg-slate-50 pb-16 text-slate-950 dark:bg-slate-950 dark:text-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <nav className="mb-5 text-sm text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-sky-700 dark:hover:text-sky-300">
              Trang chủ
            </Link>
            <span className="mx-2">/</span>
            <Link href="/thoi-tiet" className="hover:text-sky-700 dark:hover:text-sky-300">
              Thời tiết
            </Link>
            <span className="mx-2">/</span>
            <span>{city.name}</span>
          </nav>

          <header className="rounded-3xl bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-500 p-5 text-white shadow-lg sm:p-8">
            <p className="text-sm font-medium uppercase tracking-wide text-white/80">{city.region}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Thời tiết {city.name} hôm nay</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/90 sm:text-lg">{summary}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/thoi-tiet"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-sky-800 shadow-sm transition hover:bg-sky-50"
              >
                Tìm thành phố khác
              </Link>
              <Link
                href="/radar-mua"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Xem radar mưa
              </Link>
            </div>
          </header>

          {weather && current && forecast ? (
            <div className="mt-6 space-y-5">
              <CurrentWeatherCard cityName={city.name} current={current} today={today} />
              <HourlyForecast hourly={forecast.hourly} />
              <DailyForecast daily={forecast.daily} />
              <WeatherAdvice weather={weather} airQuality={aqi} />
              <WeatherStats weather={weather} airQuality={aqi} />
            </div>
          ) : (
            <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
              <h2 className="text-lg font-semibold">Dữ liệu thời tiết tạm thời gián đoạn</h2>
              <p className="mt-2 text-sm leading-6">
                Máy chủ chưa lấy được dữ liệu dự báo cho {city.name}. Trang vẫn được lập chỉ mục với nội dung địa
                phương; hãy thử tải lại sau hoặc mở ứng dụng thời tiết để xem dữ liệu theo vị trí hiện tại.
              </p>
            </section>
          )}
        </div>
      </main>
    </>
  )
}
