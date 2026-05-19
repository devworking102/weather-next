import type { AirQualityBundle } from '@/features/weather/types'

interface AQICardProps {
  airQuality?: AirQualityBundle | null
}

function getAqiLevel(aqi: number) {
  if (aqi <= 20) return { label: 'Tốt', className: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200' }
  if (aqi <= 40) return { label: 'Trung bình', className: 'bg-lime-50 text-lime-800 dark:bg-lime-400/10 dark:text-lime-200' }
  if (aqi <= 60) return { label: 'Kém', className: 'bg-amber-50 text-amber-900 dark:bg-amber-400/10 dark:text-amber-100' }
  if (aqi <= 80) return { label: 'Xấu', className: 'bg-orange-50 text-orange-900 dark:bg-orange-400/10 dark:text-orange-100' }
  return { label: 'Có hại', className: 'bg-rose-50 text-rose-900 dark:bg-rose-400/10 dark:text-rose-100' }
}

export function AQICard({ airQuality }: AQICardProps) {
  if (!airQuality) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/60">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Chất lượng không khí</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Chưa tải được dữ liệu AQI. Khi API phản hồi lại, khu vực này sẽ hiển thị PM2.5, PM10 và lời khuyên sức khỏe.
        </p>
      </section>
    )
  }

  const aqi = Math.round(airQuality.current.europeanAqi)
  const level = getAqiLevel(aqi)

  return (
    <section className={`rounded-2xl border border-slate-200 p-5 shadow-sm dark:border-white/10 ${level.className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Chất lượng không khí</h2>
          <p className="mt-2 text-sm opacity-80">EU AQI hiện tại</p>
          <p className="mt-1 text-5xl font-semibold tracking-tight">{aqi}</p>
        </div>
        <div className="rounded-xl bg-white/60 px-4 py-3 text-sm shadow-sm dark:bg-black/20">
          <p className="font-semibold">{level.label}</p>
          <p className="mt-1 opacity-80">PM2.5 {Math.round(airQuality.current.pm25)} µg/m³</p>
          <p className="opacity-80">PM10 {Math.round(airQuality.current.pm10)} µg/m³</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 opacity-85">
        {aqi <= 40
          ? 'Không khí nhìn chung phù hợp cho sinh hoạt ngoài trời. Người nhạy cảm vẫn nên theo dõi khi có bụi hoặc khói cục bộ.'
          : 'Người nhạy cảm nên giảm vận động mạnh ngoài trời, ưu tiên khẩu trang lọc bụi mịn khi di chuyển lâu.'}
      </p>
    </section>
  )
}
