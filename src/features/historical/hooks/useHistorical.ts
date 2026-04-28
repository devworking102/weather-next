'use client'

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/shared/lib/fetcher'
import type { HistoricalCompare } from '@/features/historical/services/archive'

export function useHistorical(lat?: number, lon?: number, todayMax?: number) {
  return useQuery<HistoricalCompare | null>({
    queryKey: ['historical', lat, lon, todayMax],
    queryFn: () =>
      apiFetch<HistoricalCompare | null>(
        `/api/historical?lat=${lat}&lon=${lon}&today_max=${todayMax}`,
      ),
    enabled:
      Number.isFinite(lat) && Number.isFinite(lon) && Number.isFinite(todayMax),
    staleTime: 60 * 60 * 1000,
  })
}
