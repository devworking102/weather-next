import type { NewsItem } from '@/features/news/types'

interface Rss2JsonResponse {
  status: string
  items?: {
    guid: string
    title: string
    link: string
    pubDate: string
    thumbnail?: string
    description: string
  }[]
}

const FEED = 'https://www.gdacs.org/xml/rss.xml'

export async function fetchDisasterNews(limit = 20): Promise<NewsItem[]> {
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(FEED)}`
  const res = await fetch(url, { next: { revalidate: 900 } })
  if (!res.ok) throw new Error(`GDACS feed error: ${res.status}`)
  const data = (await res.json()) as Rss2JsonResponse
  if (data.status !== 'ok' || !data.items) return []
  return data.items
    .slice(0, limit)
    .map((item) => ({
      id: item.guid,
      title: item.title,
      url: item.link,
      publishedAt: item.pubDate,
      thumbnail: item.thumbnail,
      description: item.description
        .replace(/<[^>]*>?/gm, '')
        .split('More information available at')[0]!
        .trim(),
    }))
}
