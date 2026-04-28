'use client'

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/shared/lib/fetcher'
import type { NewsItem } from '@/features/news/types'

export function useDisasterNews() {
  return useQuery<NewsItem[]>({
    queryKey: ['news', 'gdacs'],
    queryFn: () => apiFetch<NewsItem[]>('/api/news'),
    staleTime: 10 * 60 * 1000,
  })
}
