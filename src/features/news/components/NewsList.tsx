'use client'

import { Clock, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { useDisasterNews } from '@/features/news/hooks/useNews'
import { Card } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'

function formatDate(s: string) {
  if (!s) return ''
  const d = new Date(s)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function NewsList() {
  const { data, isLoading, isError } = useDisasterNews()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="text-center text-sm text-rose-600">Không tải được dữ liệu tin tức.</Card>
    )
  }

  if (!data?.length) {
    return <Card className="text-center text-sm text-slate-500">Chưa có tin tức mới.</Card>
  }

  return (
    <ul className="space-y-3">
      {data.map((n) => (
        <li key={n.id}>
          <a
            href={n.url}
            target="_blank"
            rel="noopener"
            className="group flex gap-4 rounded-2xl border border-black/5 bg-white p-3 shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50/40 dark:border-white/5 dark:bg-slate-900/60 dark:hover:border-sky-500/30 dark:hover:bg-sky-500/10"
          >
            {n.thumbnail ? (
              <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                <Image
                  src={n.thumbnail}
                  alt=""
                  fill
                  sizes="128px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : null}
            <div className="flex min-w-0 flex-col gap-1.5 py-1">
              <h4 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-sky-700 dark:group-hover:text-sky-300">
                {n.title}
              </h4>
              <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{n.description}</p>
              <div className="mt-auto flex items-center gap-3 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Clock size={11} />
                  {formatDate(n.publishedAt)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 font-bold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                  GDACS
                </span>
                <ExternalLink size={11} className="ml-auto" />
              </div>
            </div>
          </a>
        </li>
      ))}
    </ul>
  )
}
