import { wmoInfo } from '@/features/weather/utils/wmo'

interface Props {
  weatherCode: number
  isDay: boolean
  className?: string
}

export function DynamicBackground({ weatherCode, isDay, className = '' }: Props) {
  const info = wmoInfo(weatherCode)
  const [from, to] = isDay ? info.gradientDay : info.gradientNight
  return (
    <div
      className={`absolute inset-0 -z-10 transition-colors duration-700 ${className}`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
      }}
      aria-hidden
    />
  )
}
