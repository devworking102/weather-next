import type { Metadata } from 'next'
import Link from 'next/link'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { getSeoCity, listSeoCitySlugs } from '@/data/seo-cities'
import { fetchWeather } from '@/features/weather/services/weather'
import { wmoInfo } from '@/features/weather/utils/wmo'
import { getSiteUrl } from '@/shared/lib/site-url'
import { TopBar } from '@/shared/ui/TopBar'

const getCachedWeather = cache(fetchWeather)

export function generateStaticParams() {
  return listSeoCitySlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const city = getSeoCity(slug)
  if (!city) return {}
  const w = await getCachedWeather(city.lat, city.lon, 'celsius')
  const label = wmoInfo(w.current.weatherCode).label
  const t = Math.round(w.current.temperature)
  const base = getSiteUrl()
  const title = `Thời tiết ${city.nameVi}`
  const description = `${city.nameVi}: hiện tại ${t}°C, ${label}. Dự báo theo giờ & nhiều ngày.`
  return {
    title,
    description,
    alternates: { canonical: `${base}/weather/${slug}` },
    openGraph: {
      title,
      description,
      url: `${base}/weather/${slug}`,
      locale: 'vi_VN',
      type: 'website',
    },
  }
}

export default async function SeoWeatherCityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const city = getSeoCity(slug)
  if (!city) notFound()

  const w = await getCachedWeather(city.lat, city.lon, 'celsius')
  const info = wmoInfo(w.current.weatherCode)
  const tcur = Math.round(w.current.temperature)
  const tmax = w.daily[0] ? Math.round(w.daily[0].tempMax) : tcur
  const tmin = w.daily[0] ? Math.round(w.daily[0].tempMin) : tcur
  const rain = w.daily[0] ? Math.round(w.daily[0].precipitationProbability) : 0

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Dữ liệu thời tiết trang này từ đâu?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Dự báo từ mô hình Open-Meteo (API công khai), được máy chủ Weather Next chuẩn hóa.',
        },
      },
      {
        '@type': 'Question',
        name: 'Có thay thế cảnh báo chính thức không?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Không. Khi có dông, bão, hay lệnh sơ tán, hãy làm theo cơ quan nhà nước và đài địa phương.',
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <TopBar />
      <main className="mx-auto container max-w-2xl space-y-6 p-4 pb-28 md:pb-10">
        <article>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Thời tiết {city.nameVi}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Cập nhật theo mô hình dự báo — tham khảo nhanh cho {city.nameEn}.
          </p>
          <dl className="mt-8 grid gap-4 rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-slate-900/40">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Hiện tại</dt>
              <dd className="text-4xl font-light text-slate-900 dark:text-white">{tcur}°C</dd>
              <dd className="text-sm text-slate-600 dark:text-slate-300">{info.label}</dd>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-400">Cao / Thấp hôm nay</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">
                  {tmax}° / {tmin}°
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Khả năng mưa (hôm nay)</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">{rain}%</dd>
              </div>
            </div>
          </dl>
        </article>
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Câu hỏi thường gặp</h2>
          <ul className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong className="text-slate-800 dark:text-slate-100">Dữ liệu từ đâu?</strong>
              <p className="mt-1">Open-Meteo — không thu thập vị trí trên trang SEO tĩnh này.</p>
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-100">Độ chính xác?</strong>
              <p className="mt-1">Dự báo có sai số; dùng thêm radar và cảnh báo địa phương khi trời xấu.</p>
            </li>
          </ul>
        </section>
        <div>
          <Link
            href="/weather"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-sky-700"
          >
            Mở đầy đủ trong app →
          </Link>
        </div>
      </main>
    </>
  )
}
