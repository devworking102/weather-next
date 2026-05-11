import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/shared/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl()
  let host: string | undefined
  try {
    host = new URL(base).host
  } catch {
    host = undefined
  }
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${base}/sitemap.xml`,
    ...(host ? { host } : {}),
  }
}
