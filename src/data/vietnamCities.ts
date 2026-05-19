import { SEO_CITIES } from './seo-cities'

export interface VietnamCity {
  slug: string
  name: string
  latitude: number
  longitude: number
  region: string
  priority: number
}

const priorityBySlug = new Map<string, number>([
  ['ha-noi', 1],
  ['ho-chi-minh', 1],
  ['da-nang', 1],
  ['hai-phong', 2],
  ['can-tho', 2],
  ['nha-trang', 2],
  ['da-lat', 2],
  ['hue', 2],
  ['vung-tau', 2],
  ['khanh-hoa', 2],
  ['lam-dong', 2],
  ['thua-thien-hue', 2],
  ['ba-ria-vung-tau', 2],
])

export const VIETNAM_CITIES: VietnamCity[] = SEO_CITIES.map((city) => ({
  slug: city.slug,
  name: city.name,
  latitude: city.lat,
  longitude: city.lon,
  region: city.region,
  priority: priorityBySlug.get(city.slug) ?? 3,
}))

export function getVietnamCity(slug: string): VietnamCity | undefined {
  return VIETNAM_CITIES.find((city) => city.slug === slug)
}

export function getTopVietnamCities(limit = 12): VietnamCity[] {
  return [...VIETNAM_CITIES]
    .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name, 'vi'))
    .slice(0, limit)
}
