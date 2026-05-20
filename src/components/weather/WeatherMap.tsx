import Link from 'next/link'

interface WeatherMapProps {
  cityName?: string
}

export function WeatherMap({ cityName }: WeatherMapProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/60">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Radar mưa</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Xem vùng mưa quanh {cityName ?? 'vị trí của bạn'} và tua nhanh diễn biến gần nhất.
          </p>
        </div>
        <Link
          href="/radar"
          className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          Mở bản đồ
        </Link>
      </div>
    </section>
  )
}
