// WMO Weather code → i18n text, icon và gradient theme (dùng cho dynamic background).
export interface WmoInfo {
  label: string
  icon: string
  gradientDay: [string, string]
  gradientNight: [string, string]
}

const FALLBACK: WmoInfo = {
  label: 'Không rõ',
  icon: '🌡️',
  gradientDay: ['#475569', '#1e293b'],
  gradientNight: ['#0f172a', '#1e293b'],
}

export const WMO: Record<number, WmoInfo> = {
  0:  { label: 'Trời quang',       icon: '☀️', gradientDay: ['#f59e0b', '#fb923c'], gradientNight: ['#0f172a', '#1e3a8a'] },
  1:  { label: 'Phần lớn quang',   icon: '🌤️', gradientDay: ['#fb923c', '#fbbf24'], gradientNight: ['#0f172a', '#1e40af'] },
  2:  { label: 'Nhiều mây',         icon: '⛅', gradientDay: ['#60a5fa', '#3b82f6'], gradientNight: ['#1e293b', '#1e3a8a'] },
  3:  { label: 'Trời u ám',         icon: '☁️', gradientDay: ['#94a3b8', '#64748b'], gradientNight: ['#0f172a', '#334155'] },
  45: { label: 'Sương mù',          icon: '🌫️', gradientDay: ['#cbd5e1', '#94a3b8'], gradientNight: ['#1e293b', '#334155'] },
  48: { label: 'Sương mù băng',     icon: '🌫️', gradientDay: ['#cbd5e1', '#94a3b8'], gradientNight: ['#1e293b', '#334155'] },
  51: { label: 'Mưa phùn nhẹ',      icon: '🌦️', gradientDay: ['#38bdf8', '#0ea5e9'], gradientNight: ['#0f172a', '#0c4a6e'] },
  53: { label: 'Mưa phùn',          icon: '🌦️', gradientDay: ['#0ea5e9', '#0284c7'], gradientNight: ['#0f172a', '#0c4a6e'] },
  55: { label: 'Mưa phùn nặng',     icon: '🌧️', gradientDay: ['#0284c7', '#0369a1'], gradientNight: ['#0f172a', '#082f49'] },
  61: { label: 'Mưa nhẹ',           icon: '🌧️', gradientDay: ['#0284c7', '#0369a1'], gradientNight: ['#0f172a', '#082f49'] },
  63: { label: 'Mưa vừa',           icon: '🌧️', gradientDay: ['#0369a1', '#075985'], gradientNight: ['#0f172a', '#082f49'] },
  65: { label: 'Mưa to',            icon: '🌧️', gradientDay: ['#0c4a6e', '#082f49'], gradientNight: ['#030712', '#082f49'] },
  71: { label: 'Tuyết nhẹ',         icon: '🌨️', gradientDay: ['#bae6fd', '#7dd3fc'], gradientNight: ['#1e293b', '#0c4a6e'] },
  73: { label: 'Tuyết',             icon: '❄️', gradientDay: ['#7dd3fc', '#93c5fd'], gradientNight: ['#1e293b', '#0c4a6e'] },
  75: { label: 'Bão tuyết',         icon: '❄️', gradientDay: ['#93c5fd', '#bfdbfe'], gradientNight: ['#1e293b', '#1e3a8a'] },
  80: { label: 'Mưa rào nhẹ',       icon: '🌦️', gradientDay: ['#0284c7', '#0369a1'], gradientNight: ['#0f172a', '#082f49'] },
  81: { label: 'Mưa rào',           icon: '🌧️', gradientDay: ['#075985', '#0c4a6e'], gradientNight: ['#0f172a', '#082f49'] },
  82: { label: 'Mưa rào mạnh',      icon: '⛈️', gradientDay: ['#0c4a6e', '#082f49'], gradientNight: ['#030712', '#082f49'] },
  95: { label: 'Giông bão',         icon: '⛈️', gradientDay: ['#4338ca', '#312e81'], gradientNight: ['#030712', '#1e1b4b'] },
  96: { label: 'Giông + mưa đá',   icon: '⛈️', gradientDay: ['#3730a3', '#312e81'], gradientNight: ['#030712', '#1e1b4b'] },
  99: { label: 'Giông + mưa đá lớn', icon: '⛈️', gradientDay: ['#312e81', '#1e1b4b'], gradientNight: ['#030712', '#1e1b4b'] },
}

export function wmoInfo(code: number): WmoInfo {
  return WMO[code] ?? FALLBACK
}
