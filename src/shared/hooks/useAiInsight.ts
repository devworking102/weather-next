'use client'

import { useQuery } from '@tanstack/react-query'

/**
 * Generic hook for POST-based AI insight endpoints.
 * Caches result 10 minutes. Returns null when payload is not ready.
 */
export function useAiInsight<TPayload, TResponse>(
  endpoint: string,
  payload: TPayload | null,
  queryKey: unknown[],
) {
  return useQuery<TResponse>({
    queryKey: [endpoint, ...queryKey],
    queryFn: async () => {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload!),
      })
      if (!res.ok) throw new Error('insight_failed')
      return res.json() as Promise<TResponse>
    },
    enabled: payload !== null,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}
