import type { TempUnit } from '@/features/weather/types'

const WIND_DIRS = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc']
const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export function formatTemp(value: number, unit: TempUnit = 'celsius'): string {
  const rounded = Math.round(value)
  return `${rounded}°${unit === 'fahrenheit' ? 'F' : 'C'}`
}

export function formatWind(speedKmh: number): string {
  return `${Math.round(speedKmh)} km/h`
}

export function windDirection(deg: number): string {
  return WIND_DIRS[Math.round(deg / 45) % 8] ?? ''
}

export function formatTime(iso: string): string {
  return iso.slice(11, 16)
}

export function dayLabel(iso: string, index: number): string {
  if (index === 0) return 'Hôm nay'
  if (index === 1) return 'Ngày mai'
  return DAY_NAMES[new Date(iso).getDay()] ?? ''
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

export function formatRelativeTime(ms: number): string {
  const diff = (ms - Date.now()) / 1000
  const abs = Math.abs(diff)
  const suffix = diff < 0 ? 'trước' : 'sau'
  if (abs < 60) return `vài giây ${suffix}`
  if (abs < 3600) return `${Math.floor(abs / 60)} phút ${suffix}`
  if (abs < 86400) return `${Math.floor(abs / 3600)} giờ ${suffix}`
  return `${Math.floor(abs / 86400)} ngày ${suffix}`
}

export function uvCategory(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: 'Thấp', color: '#4ade80' }
  if (uv <= 5) return { label: 'Trung bình', color: '#facc15' }
  if (uv <= 7) return { label: 'Cao', color: '#f97316' }
  if (uv <= 10) return { label: 'Rất cao', color: '#ef4444' }
  return { label: 'Cực cao', color: '#a855f7' }
}

export function aqiCategory(aqi: number): { label: string; color: string; advice: string } {
  if (aqi <= 20) return { label: 'Tốt', color: '#4ade80', advice: 'Chất lượng tốt, hoạt động ngoài trời bình thường.' }
  if (aqi <= 40) return { label: 'Khá tốt', color: '#a3e635', advice: 'Khá tốt. Người nhạy cảm nên theo dõi sức khỏe.' }
  if (aqi <= 60) return { label: 'Trung bình', color: '#facc15', advice: 'Người nhạy cảm hạn chế hoạt động ngoài trời.' }
  if (aqi <= 80) return { label: 'Kém', color: '#f97316', advice: 'Hạn chế ngoài trời, đặc biệt trẻ em, người già.' }
  if (aqi <= 100) return { label: 'Rất kém', color: '#ef4444', advice: 'Hạn chế ra ngoài, đóng cửa sổ.' }
  return { label: 'Nguy hại', color: '#a855f7', advice: 'Tránh ra ngoài, đeo N95 nếu bắt buộc.' }
}
