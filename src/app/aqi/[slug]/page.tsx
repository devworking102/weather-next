import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSeoCity, listSeoCitySlugs } from '@/data/seo-cities'
import { fetchAirQuality } from '@/features/weather/services/air-quality'
import { getSiteUrl } from '@/shared/lib/site-url'
import { TopBar } from '@/shared/ui/TopBar'

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
  const aq = await fetchAirQuality(city.lat, city.lon)
  const eu = Math.round(aq.current.europeanAqi)
  const base = getSiteUrl()
  const title = `AQI ${city.nameVi}`
  const description = `Chất lượng không khí ${city.nameVi}: chỉ số EU AQI khoảng ${eu}. PM2.5 & dự báo trong app.`
  return {
    title,
    description,
    alternates: { canonical: `${base}/aqi/${slug}` },
    openGraph: {
      title,
      description,
      url: `${base}/aqi/${slug}`,
      locale: 'vi_VN',
      type: 'website',
    },
  }
}

export default async function SeoAqiCityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const city = getSeoCity(slug)
  if (!city) notFound()

  const aq = await fetchAirQuality(city.lat, city.lon)
  const eu = Math.round(aq.current.europeanAqi)
  const pm = Math.round(aq.current.pm25)

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `AQI tại ${city.nameVi} là gì?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Chỉ số EU AQI tham chiếu khoảng ${eu} tại thời điểm tạo trang; PM2.5 khoảng ${pm} µg/m³ theo Open-Meteo.`,
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <TopBar />
      <main className="mx-auto container max-w-2xl space-y-6 p-4 pb-28 md:pb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Chất lượng không khí — {city.nameVi}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Số liệu tham chiếu từ Open-Meteo Air Quality API (EU AQI).
        </p>
        <div className="rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-slate-900/40">
          <p className="text-sm text-slate-500">EU AQI (ước lượng)</p>
          <p className="mt-1 text-5xl font-light text-slate-900 dark:text-white">{eu}</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">PM2.5 ~ {pm} µg/m³</p>
        </div>
        <Link
          href="/aqi"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Mở trang AQI đầy đủ →
        </Link>
      </main>
    </>
  )
}
