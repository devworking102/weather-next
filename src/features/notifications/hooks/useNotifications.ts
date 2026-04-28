'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useUiStore } from '@/shared/store/ui-store'
import type { WeatherBundle, AirQualityBundle } from '@/features/weather/types'
import type { Earthquake } from '@/features/earthquakes/types'

type Perm = 'default' | 'granted' | 'denied' | 'unsupported'

const SEEN_KEY = 'weather-notify-seen'
const COOLDOWN_MS = 3 * 60 * 60 * 1000

interface SeenMap {
  [key: string]: number
}

function loadSeen(): SeenMap {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveSeen(m: SeenMap) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(m))
  } catch {}
}

function currentPermission(): Perm {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission as Perm
}

export function useNotifications() {
  const enabled = useUiStore((s) => s.notifyEnabled)
  const setEnabled = useUiStore((s) => s.setNotifyEnabled)
  const [permission, setPermission] = useState<Perm>('default')

  useEffect(() => {
    setPermission(currentPermission())
  }, [])

  const request = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      setPermission('unsupported')
      return false
    }
    const res = await Notification.requestPermission()
    setPermission(res as Perm)
    if (res === 'granted') setEnabled(true)
    return res === 'granted'
  }, [setEnabled])

  const disable = useCallback(() => setEnabled(false), [setEnabled])

  const notify = useCallback(
    async (tag: string, title: string, body: string) => {
      if (!enabled) return
      if (typeof Notification === 'undefined') return
      if (Notification.permission !== 'granted') return
      const seen = loadSeen()
      const now = Date.now()
      if (seen[tag] && now - seen[tag]! < COOLDOWN_MS) return
      seen[tag] = now
      saveSeen(seen)
      const options: NotificationOptions = {
        body,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag,
      }
      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready
          reg.showNotification(title, options)
        } else {
          new Notification(title, options)
        }
      } catch {
        try {
          new Notification(title, options)
        } catch {}
      }
    },
    [enabled],
  )

  return { enabled, permission, request, disable, notify, setEnabled }
}

// Hook để chủ động check dữ liệu và bắn thông báo khi thoả ngưỡng.
export function useNotificationScanner(
  weather: WeatherBundle | undefined,
  aqi: AirQualityBundle | undefined,
  quakes: Earthquake[] | undefined,
  locName: string | undefined,
) {
  const { enabled, notify } = useNotifications()
  const lastSigRef = useRef<string>('')

  useEffect(() => {
    if (!enabled || !locName) return
    // Chỉ chạy khi có thay đổi đáng kể để tránh spam
    const sig = `${weather?.current.time ?? ''}|${aqi?.current.europeanAqi ?? ''}|${quakes?.[0]?.id ?? ''}`
    if (sig === lastSigRef.current) return
    lastSigRef.current = sig

    if (weather) {
      const h = weather.hourly
      const nowMs = Date.now()
      const startIdx = Math.max(
        0,
        h.findIndex((p) => new Date(p.time).getTime() >= nowMs),
      )
      // Giông trong 6h tới
      for (let i = 0; i < 6 && startIdx + i < h.length; i++) {
        if (h[startIdx + i]!.weatherCode >= 95) {
          notify(
            'storm',
            '⛈️ Cảnh báo giông bão',
            `Sắp có giông bão tại ${locName} trong ${i === 0 ? 'giờ tới' : i + ' giờ tới'}.`,
          )
          break
        }
      }
      // Mưa to 3h tới
      for (let i = 0; i < 3 && startIdx + i < h.length; i++) {
        const p = h[startIdx + i]!
        if (p.precipitationProbability >= 80 || p.precipitation >= 5) {
          notify(
            'rain',
            '🌧️ Sắp mưa to',
            `${locName}: khả năng mưa ${Math.round(p.precipitationProbability)}% (~${p.precipitation.toFixed(1)}mm).`,
          )
          break
        }
      }
      // Gió mạnh 6h tới
      for (let i = 0; i < 6 && startIdx + i < h.length; i++) {
        const p = h[startIdx + i]!
        if (p.windSpeed >= 60) {
          notify(
            'wind',
            '🌪️ Gió mạnh',
            `${locName}: sắp có gió mạnh ~${Math.round(p.windSpeed)} km/h.`,
          )
          break
        }
      }
      // Nhiệt cực đoan
      const tMax = weather.daily[0]?.tempMax
      const tMin = weather.daily[0]?.tempMin
      if (typeof tMax === 'number' && tMax >= 38) {
        notify(
          'heat',
          '🥵 Nắng nóng gay gắt',
          `${locName}: cao nhất hôm nay ${Math.round(tMax)}°. Hạn chế ra ngoài trưa.`,
        )
      }
      if (typeof tMin === 'number' && tMin <= 5) {
        notify(
          'cold',
          '🥶 Rét đậm',
          `${locName}: thấp nhất hôm nay ${Math.round(tMin)}°. Giữ ấm cẩn thận.`,
        )
      }
      const uv = weather.daily[0]?.uvIndexMax
      if (typeof uv === 'number' && uv >= 9) {
        notify('uv', '☀️ Tia UV cực cao', `${locName}: UV hôm nay ${uv}. Che chắn kỹ.`)
      }
    }
    if (aqi?.current?.europeanAqi != null && aqi.current.europeanAqi >= 80) {
      notify(
        'aqi',
        '😷 Chất lượng không khí kém',
        `${locName}: AQI ${Math.round(aqi.current.europeanAqi)}. Hạn chế ngoài trời.`,
      )
    }
    if (quakes?.length) {
      const recent = quakes.find(
        (q) => q.magnitude >= 4.5 && Date.now() - q.time < 24 * 60 * 60 * 1000,
      )
      if (recent) {
        notify(
          `quake_${recent.id}`,
          '🌍 Cảnh báo động đất',
          `M${recent.magnitude.toFixed(1)} — ${recent.place}`,
        )
      }
    }
  }, [enabled, weather, aqi, quakes, locName, notify])
}
