import type { CSSProperties } from 'react'
import { fetchWeather } from '@/features/weather/services/weather'
import { wmoInfo } from '@/features/weather/utils/wmo'
import type { TempUnit } from '@/features/weather/types'

type SP = Promise<{ lat?: string; lon?: string; name?: string; theme?: string; units?: string }>

function windDir(deg: number) {
  const dirs = ['B', 'ĐB', 'Đ', 'ĐN', 'N', 'TN', 'T', 'TB']
  return dirs[Math.round(deg / 45) % 8]
}

const CENTER: CSSProperties = {
  display: 'flex',
  height: '100vh',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
}

export default async function WidgetEmbedPage({ searchParams }: { searchParams: SP }) {
  const params = await searchParams
  const lat = Number(params.lat)
  const lon = Number(params.lon)
  const name = decodeURIComponent(params.name ?? 'Widget')
  const theme = params.theme ?? 'auto'
  const units: TempUnit = params.units === 'fahrenheit' ? 'fahrenheit' : 'celsius'
  const unit = units === 'fahrenheit' ? '°F' : '°C'

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return <div style={{ ...CENTER, color: '#94a3b8' }}>Chưa chọn vị trí</div>
  }

  let weather
  try {
    weather = await fetchWeather(lat, lon, units)
  } catch {
    return <div style={{ ...CENTER, color: '#f87171' }}>Không tải được dữ liệu</div>
  }

  const info = wmoInfo(weather.current.weatherCode)
  const temp = Math.round(weather.current.temperature)
  const feels = Math.round(weather.current.apparentTemperature)
  const humidity = weather.current.humidity
  const windSpeed = Math.round(weather.current.windSpeed)
  const windDeg = weather.current.windDirection
  const tomorrow = weather.daily[1]
  const [g1, g2] = weather.current.isDay ? info.gradientDay : info.gradientNight

  const isGradient = theme !== 'light' && theme !== 'dark'
  const isDark = theme === 'dark'

  const outerBg =
    isDark ? 'linear-gradient(135deg, #0f172a, #1e293b)'
    : isGradient ? `linear-gradient(135deg, ${g1}, ${g2})`
    : 'linear-gradient(135deg, #f8fafc, #e2e8f0)'

  const fgColor = isGradient || isDark ? '#ffffff' : '#0f172a'
  const mutedColor = isGradient || isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.55)'
  const dividerColor = isGradient || isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'
  const shadow = isGradient ? '0 1px 4px rgba(0,0,0,0.5)' : 'none'

  const content: CSSProperties = {
    position: 'relative',
    zIndex: 1,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 16,
    color: fgColor,
    boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: outerBg, position: 'relative', overflow: 'hidden' }}>
      {/* dark overlay to ensure text contrast on bright day gradients */}
      {isGradient && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)', pointerEvents: 'none' }} />
      )}

      <div style={content}>
        {/* Top: icon + temp | name + condition */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 40, lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))' }}>
              {info.icon}
            </span>
            <div>
              <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, letterSpacing: -1, textShadow: shadow }}>
                {temp}{unit}
              </div>
              <div style={{ fontSize: 11, marginTop: 3, color: mutedColor, textShadow: shadow }}>
                cảm giác {feels}{unit}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: shadow }}>
              {name}
            </div>
            <div style={{ fontSize: 11, marginTop: 3, color: mutedColor, textShadow: shadow }}>
              {info.label}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: `1px solid ${dividerColor}` }} />

        {/* Bottom stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: mutedColor }}>
          <span style={{ textShadow: shadow }}>💧 {humidity}%</span>
          <span style={{ textShadow: shadow }}>💨 {windSpeed} km/h {windDir(windDeg)}</span>
          {tomorrow && (
            <span style={{ textShadow: shadow }}>
              📅 {Math.round(tomorrow.tempMin)}–{Math.round(tomorrow.tempMax)}{unit}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
