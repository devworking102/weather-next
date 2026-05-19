import type { Metadata } from 'next'
import Link from 'next/link'
import { Activity, HeartPulse, Wind } from 'lucide-react'
import { CitySearchLinks } from '@/components/weather/CitySearchLinks'
import { SEO_CITIES, getPopularSeoCities } from '@/data/seo-cities'
import { AirQualityTab } from '@/features/weather/components/tabs/AirQualityTab'
import { TopBar } from '@/shared/ui/TopBar'

export const metadata: Metadata = {
  title: 'Chất lượng không khí hôm nay',
  description: 'Theo dõi AQI, PM2.5, PM10 và khuyến nghị sức khỏe theo tỉnh/thành tại Việt Nam.',
  alternates: { canonical: '/chat-luong-khong-khi' },
}

export default function AqiPage() {
  const popularCities = getPopularSeoCities()

  return (
    <>
      <TopBar />
      <main className="mx-auto container space-y-6 p-4 pb-28 md:p-6">
        <header className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-sm dark:border-white/10 dark:from-white/10 dark:to-emerald-400/10">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            AQI Việt Nam
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Chất lượng không khí hôm nay
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Theo dõi EU AQI, PM2.5, PM10 và nhận khuyến nghị sức khỏe dễ hiểu cho sinh hoạt hằng ngày.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {popularCities.map((city) => (
              <Link
                key={city.slug}
                href={`/chat-luong-khong-khi/${city.slug}`}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-emerald-100 hover:text-emerald-800 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-emerald-400/20"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { title: 'Tốt', text: 'Phù hợp cho hoạt động ngoài trời.', icon: Wind },
            { title: 'Trung bình', text: 'Người nhạy cảm nên theo dõi thêm.', icon: Activity },
            { title: 'Kém hoặc có hại', text: 'Giảm vận động mạnh, cân nhắc khẩu trang lọc bụi.', icon: HeartPulse },
          ].map(({ title, text, icon: Icon }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-300" aria-hidden />
              <h2 className="mt-4 font-semibold text-slate-950 dark:text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
            </div>
          ))}
        </section>

        <CitySearchLinks cities={SEO_CITIES} />
        <AirQualityTab />
      </main>
    </>
  )
}
