'use client'

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/shared/lib/fetcher'
import type { Earthquake } from '@/features/earthquakes/types'

export function useEarthquakes(lat?: number, lon?: number) {
  return useQuery<Earthquake[]>({
    queryKey: ['earthquakes', lat, lon],
    queryFn: () => apiFetch<Earthquake[]>(`/api/earthquakes?lat=${lat}&lon=${lon}`),
    enabled: Number.isFinite(lat) && Number.isFinite(lon),
    staleTime: 10 * 60 * 1000,
  })
}
