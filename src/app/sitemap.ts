import type { MetadataRoute } from 'next'
import { listSeoCitySlugs } from '@/data/seo-cities'
import { getSiteUrl } from '@/shared/lib/site-url'

const STATIC = [
  '/',
  '/thoi-tiet',
  '/gio',
  '/radar-mua',
  '/chat-luong-khong-khi',
  '/suc-khoe',
  '/tin-tuc',
  '/dong-dat',
  '/lich',
  '/canh-bao',
  '/tien-ich',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl()
  const entries: MetadataRoute.Sitemap = []

  for (const path of STATIC) {
    entries.push({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: path === '/thoi-tiet' ? 'hourly' : 'daily',
      priority: path === '/' || path === '/thoi-tiet' ? 1 : 0.75,
    })
  }

  for (const slug of listSeoCitySlugs()) {
    entries.push({
      url: `${base}/thoi-tiet/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    })
    entries.push({
      url: `${base}/chat-luong-khong-khi/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.82,
    })
    entries.push({
      url: `${base}/canh-bao/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.78,
    })
  }

  return entries
}
