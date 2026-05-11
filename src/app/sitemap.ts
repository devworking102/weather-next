import type { MetadataRoute } from 'next'
import { listSeoCitySlugs } from '@/data/seo-cities'
import { getSiteUrl } from '@/shared/lib/site-url'

const STATIC = [
  '/',
  '/weather',
  '/wind',
  '/radar',
  '/aqi',
  '/health',
  '/news',
  '/earthquakes',
  '/calendar',
  '/alerts',
  '/widget',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl()
  const entries: MetadataRoute.Sitemap = []

  for (const path of STATIC) {
    entries.push({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: path === '/weather' ? 'hourly' : 'daily',
      priority: path === '/' || path === '/weather' ? 1 : 0.75,
    })
  }

  for (const slug of listSeoCitySlugs()) {
    entries.push({
      url: `${base}/weather/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    })
    entries.push({
      url: `${base}/aqi/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.82,
    })
    entries.push({
      url: `${base}/alerts/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.78,
    })
  }

  return entries
}
