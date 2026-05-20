import Link from 'next/link'
import type { SeoCity } from '@/data/seo-cities'

interface Props {
  cities: SeoCity[]
}

export function PopularCitiesCompact({ cities }: Props) {
  return (
    <section className="rounded-[24px] border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] md:p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase text-slate-400">Thành phố phổ biến</p>
          <h2 className="mt-1 text-xl font-semibold tracking-normal text-slate-950 dark:text-white">
            Xem thời tiết theo tỉnh/thành
          </h2>
        </div>
        <Link
          href="/thoi-tiet"
          className="shrink-0 rounded-full bg-slate-950 px-3 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
        >
          Xem tất cả
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {cities.slice(0, 6).map((city) => (
          <Link
            key={city.slug}
            href={`/thoi-tiet/${city.slug}`}
            className="rounded-[20px] bg-white p-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-sky-50 hover:text-sky-800 dark:bg-white/8 dark:text-slate-100 dark:hover:bg-sky-400/10"
          >
            <span className="block truncate">{city.name}</span>
            <span className="mt-1 block truncate text-[12px] font-medium text-slate-500 dark:text-slate-400">
              {city.region}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
