'use client'

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/shared/lib/fetcher'
import type { Typhoon } from '@/features/typhoons/types'

export function useTyphoons(lat?: number, lon?: number) {
  return useQuery<Typhoon[]>({
    queryKey: ['typhoons', lat, lon],
    queryFn: () => apiFetch<Typhoon[]>(`/api/typhoons?lat=${lat}&lon=${lon}`),
    enabled: Number.isFinite(lat) && Number.isFinite(lon),
    staleTime: 30 * 60 * 1000,
  })
}
