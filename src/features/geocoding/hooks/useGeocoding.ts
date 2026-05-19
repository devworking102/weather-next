'use client'

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/shared/lib/fetcher'
import { useDebouncedValue } from '@/shared/hooks/useDebounce'
import type { GeoLocation, IpLocation } from '@/features/geocoding/types'

export function usePlaceAutocomplete(query: string) {
  const debounced = useDebouncedValue(query.trim(), 350)
  return useQuery<GeoLocation[]>({
    queryKey: ['geocode', debounced],
    queryFn: () => apiFetch<GeoLocation[]>(`/api/geocode?q=${encodeURIComponent(debounced)}`),
    enabled: debounced.length >= 2,
    staleTime: 60 * 60 * 1000,
  })
}

export function useReverseGeocode(lat?: number, lon?: number) {
  return useQuery<{ city?: string; country?: string; admin1?: string; countryCode?: string }>({
    queryKey: ['reverse-geocode', lat, lon],
    queryFn: () => apiFetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`),
    enabled: Number.isFinite(lat) && Number.isFinite(lon),
    staleTime: 60 * 60 * 1000,
  })
}

export function useIpLocation(enabled = true) {
  return useQuery<IpLocation | null>({
    queryKey: ['ip-location'],
    queryFn: () => apiFetch<IpLocation | null>(`/api/ip-location`),
    enabled,
    staleTime: 30 * 60 * 1000,
  })
}
