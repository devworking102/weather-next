import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSeoCity, listSeoCitySlugs } from '@/data/seo-cities'
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
  const base = getSiteUrl()
  const title = `Cảnh báo thời tiết ${city.nameVi}`
  const description = `Theo dõi nắng nóng, mưa dông, gió mạnh và chất lượng không khí tại ${city.nameVi}. Luôn kèm cảnh báo chính thức của cơ quan nhà nước.`
  const ogTitle = encodeURIComponent(title)
  const ogLine2 = encodeURIComponent(`Trời Hôm Nay · ${city.nameVi}`)
  return {
    title,
    description,
    alternates: { canonical: `${base}/alerts/${slug}` },
    openGraph: {
      title,
      description,
      url: `${base}/alerts/${slug}`,
      locale: 'vi_VN',
      type: 'website',
      images: [{ url: `/api/og?type=weather&title=${ogTitle}&line2=${ogLine2}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/og?type=weather&title=${ogTitle}&line2=${ogLine2}`],
    },
  }
}

export default async function SeoAlertsCityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const city = getSeoCity(slug)
  if (!city) notFound()

  const webLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Cảnh báo thời tiết ${city.nameVi}`,
    description: 'Trang tham khảo cảnh báo thời tiết — không thay thế cảnh báo chính thức.',
    inLanguage: 'vi',
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webLd) }} />
      <TopBar />
      <main className="mx-auto container max-w-2xl space-y-6 p-4 pb-28 md:pb-10">
        <article>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Cảnh báo thời tiết — {city.nameVi}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Trang SEO giúp bạn mở nhanh cảnh báo trong app cho khu vực {city.nameEn}. Dữ liệu tham khảo; khi có
            thiên tai, hãy làm theo chỉ đạo của chính quyền và đài truyền hình địa phương.
          </p>
        </article>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/alerts"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-amber-700"
          >
            Mở cảnh báo đầy đủ →
          </Link>
          <Link
            href={`/weather/${slug}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-white/15 dark:bg-slate-900/40 dark:text-white dark:hover:bg-slate-800/60"
          >
            Dự báo {city.nameVi} →
          </Link>
        </div>
      </main>
    </>
  )
}
