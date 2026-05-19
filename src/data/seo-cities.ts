export type VietnamRegion = 'Bắc Bộ' | 'Bắc Trung Bộ' | 'Duyên hải Nam Trung Bộ' | 'Tây Nguyên' | 'Nam Bộ'

export interface SeoCity {
  slug: string
  name: string
  nameVi: string
  nameEn?: string
  lat: number
  lon: number
  region: VietnamRegion
}

export const SEO_CITIES: SeoCity[] = [
  { slug: 'ha-noi', name: 'Hà Nội', nameVi: 'Hà Nội', nameEn: 'Hanoi', lat: 21.0285, lon: 105.8542, region: 'Bắc Bộ' },
  { slug: 'ho-chi-minh', name: 'TP.HCM', nameVi: 'TP.HCM', nameEn: 'Ho Chi Minh City', lat: 10.7769, lon: 106.7009, region: 'Nam Bộ' },
  { slug: 'da-nang', name: 'Đà Nẵng', nameVi: 'Đà Nẵng', nameEn: 'Da Nang', lat: 16.0544, lon: 108.2022, region: 'Duyên hải Nam Trung Bộ' },
  { slug: 'hai-phong', name: 'Hải Phòng', nameVi: 'Hải Phòng', nameEn: 'Haiphong', lat: 20.8449, lon: 106.6881, region: 'Bắc Bộ' },
  { slug: 'can-tho', name: 'Cần Thơ', nameVi: 'Cần Thơ', nameEn: 'Can Tho', lat: 10.0452, lon: 105.7469, region: 'Nam Bộ' },
  { slug: 'nha-trang', name: 'Nha Trang', nameVi: 'Nha Trang', nameEn: 'Nha Trang', lat: 12.2388, lon: 109.1967, region: 'Duyên hải Nam Trung Bộ' },
  { slug: 'da-lat', name: 'Đà Lạt', nameVi: 'Đà Lạt', nameEn: 'Da Lat', lat: 11.9404, lon: 108.4583, region: 'Tây Nguyên' },
  { slug: 'hue', name: 'Huế', nameVi: 'Huế', nameEn: 'Hue', lat: 16.4637, lon: 107.5909, region: 'Bắc Trung Bộ' },
  { slug: 'vung-tau', name: 'Vũng Tàu', nameVi: 'Vũng Tàu', nameEn: 'Vung Tau', lat: 10.346, lon: 107.0843, region: 'Nam Bộ' },
  { slug: 'an-giang', name: 'An Giang', nameVi: 'An Giang', lat: 10.5216, lon: 105.1259, region: 'Nam Bộ' },
  { slug: 'ba-ria-vung-tau', name: 'Bà Rịa - Vũng Tàu', nameVi: 'Bà Rịa - Vũng Tàu', lat: 10.5417, lon: 107.2429, region: 'Nam Bộ' },
  { slug: 'bac-giang', name: 'Bắc Giang', nameVi: 'Bắc Giang', lat: 21.2731, lon: 106.1946, region: 'Bắc Bộ' },
  { slug: 'bac-kan', name: 'Bắc Kạn', nameVi: 'Bắc Kạn', lat: 22.147, lon: 105.8348, region: 'Bắc Bộ' },
  { slug: 'bac-lieu', name: 'Bạc Liêu', nameVi: 'Bạc Liêu', lat: 9.294, lon: 105.7216, region: 'Nam Bộ' },
  { slug: 'bac-ninh', name: 'Bắc Ninh', nameVi: 'Bắc Ninh', lat: 21.1861, lon: 106.0763, region: 'Bắc Bộ' },
  { slug: 'ben-tre', name: 'Bến Tre', nameVi: 'Bến Tre', lat: 10.2434, lon: 106.3756, region: 'Nam Bộ' },
  { slug: 'binh-dinh', name: 'Bình Định', nameVi: 'Bình Định', lat: 13.782, lon: 109.219, region: 'Duyên hải Nam Trung Bộ' },
  { slug: 'binh-duong', name: 'Bình Dương', nameVi: 'Bình Dương', lat: 10.9804, lon: 106.6519, region: 'Nam Bộ' },
  { slug: 'binh-phuoc', name: 'Bình Phước', nameVi: 'Bình Phước', lat: 11.7512, lon: 106.7235, region: 'Nam Bộ' },
  { slug: 'binh-thuan', name: 'Bình Thuận', nameVi: 'Bình Thuận', lat: 10.9333, lon: 108.1, region: 'Duyên hải Nam Trung Bộ' },
  { slug: 'ca-mau', name: 'Cà Mau', nameVi: 'Cà Mau', lat: 9.1768, lon: 105.1524, region: 'Nam Bộ' },
  { slug: 'cao-bang', name: 'Cao Bằng', nameVi: 'Cao Bằng', lat: 22.6666, lon: 106.263, region: 'Bắc Bộ' },
  { slug: 'dak-lak', name: 'Đắk Lắk', nameVi: 'Đắk Lắk', lat: 12.7101, lon: 108.2378, region: 'Tây Nguyên' },
  { slug: 'dak-nong', name: 'Đắk Nông', nameVi: 'Đắk Nông', lat: 12.0042, lon: 107.6907, region: 'Tây Nguyên' },
  { slug: 'dien-bien', name: 'Điện Biên', nameVi: 'Điện Biên', lat: 21.386, lon: 103.016, region: 'Bắc Bộ' },
  { slug: 'dong-nai', name: 'Đồng Nai', nameVi: 'Đồng Nai', lat: 10.9574, lon: 106.8427, region: 'Nam Bộ' },
  { slug: 'dong-thap', name: 'Đồng Tháp', nameVi: 'Đồng Tháp', lat: 10.4938, lon: 105.6882, region: 'Nam Bộ' },
  { slug: 'gia-lai', name: 'Gia Lai', nameVi: 'Gia Lai', lat: 13.9833, lon: 108.0, region: 'Tây Nguyên' },
  { slug: 'ha-giang', name: 'Hà Giang', nameVi: 'Hà Giang', lat: 22.8026, lon: 104.9784, region: 'Bắc Bộ' },
  { slug: 'ha-nam', name: 'Hà Nam', nameVi: 'Hà Nam', lat: 20.5835, lon: 105.9229, region: 'Bắc Bộ' },
  { slug: 'ha-tinh', name: 'Hà Tĩnh', nameVi: 'Hà Tĩnh', lat: 18.3559, lon: 105.8877, region: 'Bắc Trung Bộ' },
  { slug: 'hai-duong', name: 'Hải Dương', nameVi: 'Hải Dương', lat: 20.9373, lon: 106.3146, region: 'Bắc Bộ' },
  { slug: 'hau-giang', name: 'Hậu Giang', nameVi: 'Hậu Giang', lat: 9.7579, lon: 105.6413, region: 'Nam Bộ' },
  { slug: 'hoa-binh', name: 'Hòa Bình', nameVi: 'Hòa Bình', lat: 20.8172, lon: 105.3376, region: 'Bắc Bộ' },
  { slug: 'hung-yen', name: 'Hưng Yên', nameVi: 'Hưng Yên', lat: 20.8526, lon: 106.0169, region: 'Bắc Bộ' },
  { slug: 'khanh-hoa', name: 'Khánh Hòa', nameVi: 'Khánh Hòa', lat: 12.2388, lon: 109.1967, region: 'Duyên hải Nam Trung Bộ' },
  { slug: 'kien-giang', name: 'Kiên Giang', nameVi: 'Kiên Giang', lat: 10.0125, lon: 105.0809, region: 'Nam Bộ' },
  { slug: 'kon-tum', name: 'Kon Tum', nameVi: 'Kon Tum', lat: 14.3545, lon: 108.0076, region: 'Tây Nguyên' },
  { slug: 'lai-chau', name: 'Lai Châu', nameVi: 'Lai Châu', lat: 22.3964, lon: 103.4582, region: 'Bắc Bộ' },
  { slug: 'lam-dong', name: 'Lâm Đồng', nameVi: 'Lâm Đồng', lat: 11.9404, lon: 108.4583, region: 'Tây Nguyên' },
  { slug: 'lang-son', name: 'Lạng Sơn', nameVi: 'Lạng Sơn', lat: 21.8537, lon: 106.7615, region: 'Bắc Bộ' },
  { slug: 'lao-cai', name: 'Lào Cai', nameVi: 'Lào Cai', lat: 22.4809, lon: 103.9755, region: 'Bắc Bộ' },
  { slug: 'long-an', name: 'Long An', nameVi: 'Long An', lat: 10.6956, lon: 106.2431, region: 'Nam Bộ' },
  { slug: 'nam-dinh', name: 'Nam Định', nameVi: 'Nam Định', lat: 20.4388, lon: 106.1621, region: 'Bắc Bộ' },
  { slug: 'nghe-an', name: 'Nghệ An', nameVi: 'Nghệ An', lat: 18.6796, lon: 105.6813, region: 'Bắc Trung Bộ' },
  { slug: 'ninh-binh', name: 'Ninh Bình', nameVi: 'Ninh Bình', lat: 20.2506, lon: 105.9745, region: 'Bắc Bộ' },
  { slug: 'ninh-thuan', name: 'Ninh Thuận', nameVi: 'Ninh Thuận', lat: 11.5643, lon: 108.9886, region: 'Duyên hải Nam Trung Bộ' },
  { slug: 'phu-tho', name: 'Phú Thọ', nameVi: 'Phú Thọ', lat: 21.3227, lon: 105.402, region: 'Bắc Bộ' },
  { slug: 'phu-yen', name: 'Phú Yên', nameVi: 'Phú Yên', lat: 13.0955, lon: 109.3209, region: 'Duyên hải Nam Trung Bộ' },
  { slug: 'quang-binh', name: 'Quảng Bình', nameVi: 'Quảng Bình', lat: 17.4689, lon: 106.6223, region: 'Bắc Trung Bộ' },
  { slug: 'quang-nam', name: 'Quảng Nam', nameVi: 'Quảng Nam', lat: 15.5394, lon: 108.0191, region: 'Duyên hải Nam Trung Bộ' },
  { slug: 'quang-ngai', name: 'Quảng Ngãi', nameVi: 'Quảng Ngãi', lat: 15.1214, lon: 108.8044, region: 'Duyên hải Nam Trung Bộ' },
  { slug: 'quang-ninh', name: 'Quảng Ninh', nameVi: 'Quảng Ninh', lat: 20.9712, lon: 107.0448, region: 'Bắc Bộ' },
  { slug: 'quang-tri', name: 'Quảng Trị', nameVi: 'Quảng Trị', lat: 16.7943, lon: 107.045, region: 'Bắc Trung Bộ' },
  { slug: 'soc-trang', name: 'Sóc Trăng', nameVi: 'Sóc Trăng', lat: 9.6025, lon: 105.9739, region: 'Nam Bộ' },
  { slug: 'son-la', name: 'Sơn La', nameVi: 'Sơn La', lat: 21.3256, lon: 103.9188, region: 'Bắc Bộ' },
  { slug: 'tay-ninh', name: 'Tây Ninh', nameVi: 'Tây Ninh', lat: 11.3352, lon: 106.1099, region: 'Nam Bộ' },
  { slug: 'thai-binh', name: 'Thái Bình', nameVi: 'Thái Bình', lat: 20.4463, lon: 106.3366, region: 'Bắc Bộ' },
  { slug: 'thai-nguyen', name: 'Thái Nguyên', nameVi: 'Thái Nguyên', lat: 21.5672, lon: 105.8252, region: 'Bắc Bộ' },
  { slug: 'thanh-hoa', name: 'Thanh Hóa', nameVi: 'Thanh Hóa', lat: 19.8075, lon: 105.7764, region: 'Bắc Trung Bộ' },
  { slug: 'thua-thien-hue', name: 'Thừa Thiên Huế', nameVi: 'Thừa Thiên Huế', lat: 16.4637, lon: 107.5909, region: 'Bắc Trung Bộ' },
  { slug: 'tien-giang', name: 'Tiền Giang', nameVi: 'Tiền Giang', lat: 10.4493, lon: 106.3421, region: 'Nam Bộ' },
  { slug: 'tra-vinh', name: 'Trà Vinh', nameVi: 'Trà Vinh', lat: 9.9347, lon: 106.3453, region: 'Nam Bộ' },
  { slug: 'tuyen-quang', name: 'Tuyên Quang', nameVi: 'Tuyên Quang', lat: 21.7767, lon: 105.228, region: 'Bắc Bộ' },
  { slug: 'vinh-long', name: 'Vĩnh Long', nameVi: 'Vĩnh Long', lat: 10.2537, lon: 105.9722, region: 'Nam Bộ' },
  { slug: 'vinh-phuc', name: 'Vĩnh Phúc', nameVi: 'Vĩnh Phúc', lat: 21.3089, lon: 105.6049, region: 'Bắc Bộ' },
  { slug: 'yen-bai', name: 'Yên Bái', nameVi: 'Yên Bái', lat: 21.7168, lon: 104.8986, region: 'Bắc Bộ' },
]

const bySlug = new Map(SEO_CITIES.map((city) => [city.slug, city]))

export const POPULAR_CITY_SLUGS = ['ha-noi', 'ho-chi-minh', 'da-nang', 'hai-phong', 'can-tho'] as const

export function getSeoCity(slug: string): SeoCity | undefined {
  return bySlug.get(slug)
}

export function listSeoCitySlugs(): string[] {
  return SEO_CITIES.map((city) => city.slug)
}

export function getPopularSeoCities(): SeoCity[] {
  return POPULAR_CITY_SLUGS.map((slug) => getSeoCity(slug)).filter((city): city is SeoCity => Boolean(city))
}
