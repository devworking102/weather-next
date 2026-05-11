import { wmoInfo } from '@/features/weather/utils/wmo'

interface Props {
  weatherCode: number
  isDay: boolean
  className?: string
}

type AtmoMood = 'sunny' | 'cloudy' | 'rain' | 'storm' | 'fog' | 'snow' | 'night' | 'night-rain'

function getMood(code: number, isDay: boolean): AtmoMood {
  if (!isDay) return code >= 51 ? 'night-rain' : 'night'
  if (code === 0 || code === 1) return 'sunny'
  if (code === 2 || code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 95) return 'storm'
  if (code >= 71 && code <= 77) return 'snow'
  if (code >= 51) return 'rain'
  return 'cloudy'
}

export function DynamicBackground({ weatherCode, isDay, className = '' }: Props) {
  const info = wmoInfo(weatherCode)
  const [from, to] = isDay ? info.gradientDay : info.gradientNight
  const mood = getMood(weatherCode, isDay)

  return (
    <div
      className={`absolute inset-0 -z-10 overflow-hidden transition-colors duration-700 ${className}`}
      aria-hidden
    >
      {/* Base gradient */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{ backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
      />

      {/* Atmospheric mood overlays — subtle, performant CSS-only */}
      {mood === 'sunny' && (
        <div
          className="absolute inset-0 atmo-sunny-pulse"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 75% 55% at 65% 15%, rgba(255,220,60,0.45) 0%, transparent 72%)',
          }}
        />
      )}

      {(mood === 'rain' || mood === 'night-rain') && (
        <div
          className="absolute inset-0 atmo-rain-fall"
          style={{
            backgroundImage:
              'repeating-linear-gradient(105deg, transparent 0px, transparent 4px, rgba(255,255,255,0.07) 4px, rgba(255,255,255,0.07) 5px)',
            backgroundSize: '60px 120px',
          }}
        />
      )}

      {mood === 'storm' && (
        <>
          <div
            className="absolute inset-0 atmo-storm-flicker"
            style={{
              backgroundImage:
                'radial-gradient(ellipse at 50% 110%, rgba(120,60,220,0.35) 0%, transparent 65%)',
            }}
          />
          {/* subtle top-left lightning tint */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'radial-gradient(ellipse at 20% 10%, rgba(200,200,255,0.5) 0%, transparent 40%)',
            }}
          />
        </>
      )}

      {mood === 'fog' && (
        <div
          className="absolute inset-0 atmo-fog-drift"
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 60%, transparent 100%)',
          }}
        />
      )}

      {mood === 'night' && (
        <div
          className="absolute inset-0 atmo-night-shimmer"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 60% 50% at 75% 15%, rgba(100,120,220,0.28) 0%, transparent 70%)',
          }}
        />
      )}

      {mood === 'snow' && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 50% 0%, rgba(220,240,255,0.6) 0%, transparent 60%)',
          }}
        />
      )}

      {/* Universal bottom vignette for text legibility */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, transparent 40%, rgba(0,0,0,0.22) 100%)',
        }}
      />
    </div>
  )
}
