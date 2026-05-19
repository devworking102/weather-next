import type { Metadata } from 'next'
import Link from 'next/link'
import { Bell, CloudRain, MapPinned, Navigation, Newspaper, Search, Wind } from 'lucide-react'
import { CitySearchLinks } from '@/components/weather/CitySearchLinks'
import { getPopularSeoCities, SEO_CITIES } from '@/data/seo-cities'
import { TopBar } from '@/shared/ui/TopBar'

export const metadata: Metadata = {
  title: 'Trời Hôm Nay - Dự báo thời tiết Việt Nam',
  description:
    'Xem thời tiết hôm nay tại các tỉnh thành Việt Nam: nhiệt độ, mưa, AQI, UV, gió, radar mưa và dự báo 7 ngày.',
  alternates: { canonical: '/' },
}

const featureCards = [
  {
    href: '/radar-mua',
    title: 'Radar mưa',
    description: 'Theo dõi vùng mưa và diễn biến gần nhất trên bản đồ.',
    icon: CloudRain,
  },
  {
    href: '/chat-luong-khong-khi',
    title: 'Chất lượng không khí',
    description: 'AQI, PM2.5, PM10 và lời khuyên sức khỏe theo vị trí.',
    icon: Wind,
  },
  {
    href: '/canh-bao',
    title: 'Cảnh báo thời tiết',
    description: 'Theo dõi mưa lớn, dông, gió mạnh và rủi ro trong ngày.',
    icon: Bell,
  },
  {
    href: '/tin-tuc',
    title: 'Tin thời tiết',
    description: 'Tin thiên tai, bão, mưa lớn và diễn biến đáng chú ý.',
    icon: Newspaper,
  },
]

export default function HomePage() {
  const popularCities = getPopularSeoCities()
  const trendingCities = SEO_CITIES.slice(0, 24)

  return (
    <>
      <TopBar />
      <main className="bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
        <section className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-6xl content-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1 text-sm font-medium text-sky-700 shadow-sm dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-200">
              <MapPinned className="h-4 w-4" aria-hidden />
              Thời tiết Việt Nam, tối ưu cho mobile
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
              Dự báo thời tiết hôm nay rõ ràng, nhanh và dễ tin cậy.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
              Tra cứu thời tiết theo tỉnh/thành, xem dự báo theo giờ, 7 ngày, AQI, UV, radar mưa và gợi ý sinh hoạt
              bằng tiếng Việt tự nhiên.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/thoi-tiet/ha-noi"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                <Search className="h-4 w-4" aria-hidden />
                Xem thời tiết hôm nay
              </Link>
              <Link
                href="/thoi-tiet"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <Navigation className="h-4 w-4" aria-hidden />
                Tìm tỉnh/thành
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
            <CitySearchLinks cities={trendingCities} />
            <div className="mt-4 grid grid-cols-2 gap-3">
              {popularCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/thoi-tiet/${city.slug}`}
                  className="rounded-2xl bg-slate-50 p-4 transition hover:bg-sky-50 dark:bg-white/5 dark:hover:bg-sky-400/10"
                >
                  <p className="font-semibold text-slate-950 dark:text-white">{city.name}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{city.region}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map(({ href, title, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md dark:border-white/10 dark:bg-white/5"
              >
                <Icon className="h-5 w-5 text-sky-600 dark:text-sky-300" aria-hidden />
                <h2 className="mt-4 font-semibold text-slate-950 dark:text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
