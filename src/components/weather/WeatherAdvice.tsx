import type { AirQualityBundle, WeatherBundle } from '@/features/weather/types'
import { shouldCarryUmbrella } from './utils'

interface WeatherAdviceProps {
  weather: WeatherBundle
  airQuality?: AirQualityBundle | null
}

export function WeatherAdvice({ weather, airQuality }: WeatherAdviceProps) {
  const today = weather.daily[0]
  const nextHours = weather.hourly.slice(0, 8)
  const needUmbrella = shouldCarryUmbrella(weather.current, today, nextHours)
  const temp = weather.current.apparentTemperature
  const uv = Math.round(today?.uvIndexMax ?? weather.current.uvIndex)
  const aqi = airQuality?.current.europeanAqi

  const outfit =
    temp >= 32
      ? 'Nên mặc đồ thoáng, ưu tiên chất liệu thấm hút và bổ sung nước khi ra ngoài.'
      : temp >= 24
        ? 'Áo thun hoặc sơ mi mỏng là phù hợp; chuẩn bị áo khoác nhẹ nếu về muộn.'
        : 'Nên mặc thêm áo khoác mỏng, đặc biệt vào sáng sớm và buổi tối.'

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/60">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Gợi ý hôm nay nên mặc gì</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {outfit} Chỉ số UV khoảng {uv}, nên dùng kem chống nắng nếu ở ngoài trời lâu.
        </p>
        {typeof aqi === 'number' ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            AQI châu Âu hiện khoảng {Math.round(aqi)}; người nhạy cảm nên theo dõi thêm trước khi vận động mạnh.
          </p>
        ) : null}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/60">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Có nên mang ô không</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {needUmbrella
            ? 'Nên mang ô hoặc áo mưa mỏng. Dự báo trong ngày có tín hiệu mưa đáng chú ý, nhất là khi di chuyển ngoài trời.'
            : 'Chưa cần mang ô nếu chỉ di chuyển ngắn. Dù vậy, hãy kiểm tra lại trước khi ra ngoài lâu vì mưa cục bộ có thể thay đổi nhanh.'}
        </p>
      </div>
    </section>
  )
}
