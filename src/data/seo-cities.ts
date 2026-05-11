/** Thành phố VN cho trang SEO — tọa độ cố định, không gọi geocode. */
export interface SeoCity {
  slug: string
  nameVi: string
  nameEn: string
  lat: number
  lon: number
}

export const SEO_CITIES: SeoCity[] = [
  { slug: 'ha-noi', nameVi: 'Hà Nội', nameEn: 'Hanoi', lat: 21.0285, lon: 105.8542 },
  { slug: 'ho-chi-minh', nameVi: 'TP. Hồ Chí Minh', nameEn: 'Ho Chi Minh City', lat: 10.7769, lon: 106.7009 },
  { slug: 'da-nang', nameVi: 'Đà Nẵng', nameEn: 'Da Nang', lat: 16.0544, lon: 108.2022 },
  { slug: 'hai-phong', nameVi: 'Hải Phòng', nameEn: 'Haiphong', lat: 20.8449, lon: 106.6881 },
  { slug: 'can-tho', nameVi: 'Cần Thơ', nameEn: 'Can Tho', lat: 10.0452, lon: 105.7469 },
  { slug: 'hue', nameVi: 'Huế', nameEn: 'Hue', lat: 16.4637, lon: 107.5909 },
  { slug: 'nha-trang', nameVi: 'Nha Trang', nameEn: 'Nha Trang', lat: 12.2388, lon: 109.1967 },
  { slug: 'da-lat', nameVi: 'Đà Lạt', nameEn: 'Da Lat', lat: 11.9404, lon: 108.4583 },
  { slug: 'vung-tau', nameVi: 'Vũng Tàu', nameEn: 'Vung Tau', lat: 10.346, lon: 107.0843 },
  { slug: 'quy-nhon', nameVi: 'Quy Nhơn', nameEn: 'Quy Nhon', lat: 13.7645, lon: 109.2191 },
  { slug: 'vinh', nameVi: 'Vinh', nameEn: 'Vinh', lat: 18.6796, lon: 105.6813 },
  { slug: 'thanh-hoa', nameVi: 'Thanh Hóa', nameEn: 'Thanh Hoa', lat: 19.8075, lon: 105.7764 },
]

const bySlug = new Map(SEO_CITIES.map((c) => [c.slug, c]))

export function getSeoCity(slug: string): SeoCity | undefined {
  return bySlug.get(slug)
}

export function listSeoCitySlugs(): string[] {
  return SEO_CITIES.map((c) => c.slug)
}
