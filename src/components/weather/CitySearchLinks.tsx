'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { SeoCity } from '@/data/seo-cities'

interface CitySearchLinksProps {
  cities: SeoCity[]
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function CitySearchLinks({ cities }: CitySearchLinksProps) {
  const [query, setQuery] = useState('')
  const visibleCities = useMemo(() => {
    const normalizedQuery = normalize(query.trim())
    if (!normalizedQuery) return cities.slice(0, 18)
    return cities
      .filter((city) => normalize(`${city.name} ${city.slug} ${city.region}`).includes(normalizedQuery))
      .slice(0, 18)
  }, [cities, query])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/60">
      <label htmlFor="city-search" className="text-sm font-semibold text-slate-900 dark:text-white">
        Tìm tỉnh/thành
      </label>
      <div className="mt-3 flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-white/10 dark:bg-white/5">
        <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
        <input
          id="city-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nhập Hà Nội, Đà Nẵng, Cần Thơ..."
          className="min-w-0 flex-1 bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
          type="search"
        />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCities.map((city) => (
          <Link
            key={city.slug}
            href={`/thoi-tiet/${city.slug}`}
            className="rounded-xl border border-slate-100 bg-white px-3 py-3 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-sky-400/40 dark:hover:bg-sky-400/10"
          >
            {city.name}
            <span className="mt-1 block text-xs font-normal text-slate-500 dark:text-slate-400">{city.region}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
