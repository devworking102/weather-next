import type { SeoCity } from '@/data/seo-cities'

export type JsonLd = Record<string, unknown>

export function buildWebsiteJsonLd(baseUrl: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Trời Hôm Nay',
    url: baseUrl,
    inLanguage: 'vi-VN',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/thoi-tiet?city={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildWeatherBreadcrumbJsonLd(baseUrl: string, city: SeoCity): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Thời tiết',
        item: `${baseUrl}/thoi-tiet`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: city.name,
        item: `${baseUrl}/thoi-tiet/${city.slug}`,
      },
    ],
  }
}

export function buildPlaceJsonLd(baseUrl: string, city: SeoCity): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: city.name,
    url: `${baseUrl}/thoi-tiet/${city.slug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city.name,
      addressCountry: 'VN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: city.lat,
      longitude: city.lon,
    },
  }
}
