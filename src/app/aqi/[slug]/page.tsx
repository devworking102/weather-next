import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { getSeoCity, listSeoCitySlugs } from '@/data/seo-cities'
import { fetchAirQuality } from '@/features/weather/services/air-quality'
import { getSiteUrl } from '@/shared/lib/site-url'
import { TopBar } from '@/shared/ui/TopBar'

const getCachedAirQuality = cache(fetchAirQuality)

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
  const base = getSiteUrl()
  const title = `AQI ${city.nameVi}`
  const description = `Chất lượng không khí ${city.nameVi}: EU AQI & PM2.5 trong ứng dụng Trời Hôm Nay (Open-Meteo Air Quality).`
  const ogTitle = encodeURIComponent(`AQI ${city.nameVi}`)
  const ogLine2 = encodeURIComponent('Mở app để xem chỉ số thực · dự báo 24h')
  return {
    title,
    description,
    alternates: { canonical: `${base}/chat-luong-khong-khi/${slug}` },
    openGraph: {
      title,
      description,
      url: `${base}/chat-luong-khong-khi/${slug}`,
      locale: 'vi_VN',
      type: 'website',
      images: [
        {
          url: `/api/og?type=aqi&title=${ogTitle}&line2=${ogLine2}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/og?type=aqi&title=${ogTitle}&line2=${ogLine2}`],
    },
  }
}

export default async function SeoAqiCityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const city = getSeoCity(slug)
  if (!city) notFound()

  let aq: Awaited<ReturnType<typeof fetchAirQuality>> | null = null
  try {
    aq = await getCachedAirQuality(city.lat, city.lon)
  } catch {
    aq = null
  }

  const eu = aq != null ? Math.round(aq.current.europeanAqi) : null
  const pm = aq != null ? Math.round(aq.current.pm25) : null

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `AQI tại ${city.nameVi} là gì?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            eu != null && pm != null
              ? `Chỉ số EU AQI tham chiếu khoảng ${eu} tại thời điểm tạo trang; PM2.5 khoảng ${pm} µg/m³ theo Open-Meteo.`
              : `Chỉ số EU AQI và PM2.5 cho ${city.nameVi} có trong ứng dụng Trời Hôm Nay (Open-Meteo Air Quality).`,
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
          {eu != null && pm != null ? (
            <>
              <p className="text-sm text-slate-500">EU AQI (ước lượng)</p>
              <p className="mt-1 text-5xl font-light text-slate-900 dark:text-white">{eu}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">PM2.5 ~ {pm} µg/m³</p>
            </>
          ) : (
            <div className="text-sm text-slate-600 dark:text-slate-300">
              <p className="font-medium text-slate-800 dark:text-slate-100">
                Tạm thời không tải được số liệu Open-Meteo Air Quality (giới hạn API hoặc mạng).
              </p>
              <p className="mt-2">Mở trang AQI trong app để xem EU AQI và PM2.5 theo thời gian thực.</p>
            </div>
          )}
        </div>
        <Link
          href="/chat-luong-khong-khi"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Mở trang AQI đầy đủ →
        </Link>
      </main>
    </>
  )
}
