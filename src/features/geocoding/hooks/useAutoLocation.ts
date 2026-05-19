'use client'

import { useEffect, useRef, useState } from 'react'
import { useIpLocation, useReverseGeocode } from './useGeocoding'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import type { GeoLocation } from '@/features/geocoding/types'

function browserGeolocate(timeoutMs = 4000): Promise<GeolocationCoordinates | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      () => resolve(null),
      { timeout: timeoutMs, maximumAge: 60_000 },
    )
  })
}

const DEFAULT_FALLBACK: GeoLocation = {
  id: 1,
  name: 'Hà Nội',
  latitude: 21.0285,
  longitude: 105.8542,
  country: 'Việt Nam',
  admin1: 'Hà Nội',
  countryCode: 'VN',
}

type GeoStep = 'pending' | 'browser-ok' | 'browser-failed' | 'done'

// Tự dò vị trí:
// 1. Nếu user đã pin location → giữ nguyên
// 2. Browser geolocation (4s timeout)
// 3. IP lookup từ server route (đợi RQ resolve xong, không đọc .data giữa chừng)
// 4. Fallback cứng (Hà Nội) nếu IP fail
// 5. Background upgrade tên (reverse geocode tiếng Việt)
export function useAutoLocation() {
  const current = useLocationStore((s) => s.current)
  const pinned = useLocationStore((s) => s.pinned)
  const setCurrent = useLocationStore((s) => s.setCurrent)
  const [step, setStep] = useState<GeoStep>('pending')
  const geoRanRef = useRef(false)

  const ipQuery = useIpLocation(step === 'browser-failed')

  // Step 1: browser geolocation (chạy đúng 1 lần)
  useEffect(() => {
    if (geoRanRef.current) return
    if (pinned && current) {
      geoRanRef.current = true
      queueMicrotask(() => setStep('done'))
      return
    }
    geoRanRef.current = true

    if (!current) {
      setCurrent(DEFAULT_FALLBACK)
    }

    let cancelled = false
    void (async () => {
      const coords = await browserGeolocate(2500)
      if (cancelled) return
      if (coords) {
        setCurrent({
          id: Date.now(),
          name: 'Vị trí hiện tại',
          latitude: coords.latitude,
          longitude: coords.longitude,
          country: '',
        })
        setStep('browser-ok')
      } else {
        setStep('browser-failed')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [pinned, current, setCurrent])

  // Step 2: IP fallback — đợi React Query resolve xong, không đọc data giữa chừng
  useEffect(() => {
    if (step !== 'browser-failed') return
    if (ipQuery.isLoading || ipQuery.isFetching) return

    const ip = ipQuery.data
    if (ip && Number.isFinite(ip.latitude) && Number.isFinite(ip.longitude)) {
      setCurrent({
        id: Date.now(),
        name: ip.city || 'Vị trí',
        latitude: ip.latitude,
        longitude: ip.longitude,
        country: ip.country,
        admin1: ip.region,
        countryCode: ip.countryCode,
      })
    } else {
      // Fallback cứng để UI luôn có dữ liệu hiển thị
      setCurrent(DEFAULT_FALLBACK)
    }
    queueMicrotask(() => setStep('done'))
  }, [step, ipQuery.isLoading, ipQuery.isFetching, ipQuery.data, setCurrent])

  // Background upgrade tên qua reverse geocode nếu vị trí hiện tại còn tên mặc định.
  const needsUpgrade =
    !!current &&
    (current.name === 'Vị trí hiện tại' || current.name === 'Vị trí' || !current.country)
  const rev = useReverseGeocode(
    needsUpgrade ? current?.latitude : undefined,
    needsUpgrade ? current?.longitude : undefined,
  )

  useEffect(() => {
    if (!needsUpgrade || !rev.data || !current) return
    const { city, country, admin1 } = rev.data
    if (!city && !country) return
    setCurrent({
      ...current,
      name: city || current.name,
      country: country || current.country,
      admin1: admin1 ?? current.admin1,
    })
  }, [needsUpgrade, rev.data, current, setCurrent])

  return { current, pinned }
}
