import type { SeoCity } from '@/data/seo-cities'
import type { AirQualityBundle, WeatherBundle } from '@/features/weather/types'

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

export function buildCityFaq(city: SeoCity, weather?: WeatherBundle | null, aqi?: AirQualityBundle | null) {
  const rain = Math.round(weather?.daily?.[0]?.precipitationProbability ?? 0)
  const tempMax = Math.round(weather?.daily?.[0]?.tempMax ?? weather?.current?.temperature ?? 0)
  const aqiValue = aqi?.current?.europeanAqi

  return [
    {
      question: `Hôm nay ${city.name} có mưa không?`,
      answer: weather
        ? `Khả năng mưa hôm nay tại ${city.name} khoảng ${rain}%. Nếu ra ngoài lâu, bạn nên kiểm tra thêm khung giờ mưa trong phần dự báo theo giờ.`
        : `Dữ liệu mưa tại ${city.name} có thể thay đổi trong ngày. Khi chưa tải được dự báo mới, bạn nên kiểm tra lại trước khi ra ngoài.`,
    },
    {
      question: `Thời tiết ${city.name} hôm nay có ảnh hưởng sức khỏe không?`,
      answer: weather
        ? `Nhiệt độ cao nhất khoảng ${tempMax}°C. Nếu trời nắng gắt, trẻ nhỏ, người lớn tuổi và người nhạy cảm nên tránh hoạt động ngoài trời giữa trưa.`
        : `Trang sẽ hiển thị nhiệt độ, UV và gợi ý sức khỏe khi có dữ liệu mới cho ${city.name}.`,
    },
    {
      question: `AQI tại ${city.name} có đáng lo không?`,
      answer:
        typeof aqiValue === 'number'
          ? `AQI châu Âu hiện khoảng ${Math.round(aqiValue)}. Người nhạy cảm nên giảm vận động mạnh ngoài trời khi chỉ số tăng cao.`
          : `AQI tại ${city.name} có thể chưa sẵn sàng ở thời điểm này. Bạn vẫn có thể xem nhiệt độ, mưa và gió để lên kế hoạch.`,
    },
    {
      question: `Nên xem dự báo ${city.name} theo giờ hay 7 ngày?`,
      answer: `Nếu chuẩn bị ra ngoài hôm nay, hãy xem dự báo theo giờ. Nếu lên lịch đi làm, đi học hoặc du lịch, phần 7 ngày giúp bạn chọn ngày ít mưa và dễ chịu hơn.`,
    },
  ]
}

export function buildFaqJsonLd(faq: ReturnType<typeof buildCityFaq>): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function buildWeatherForecastJsonLd(baseUrl: string, city: SeoCity, weather?: WeatherBundle | null): JsonLd | null {
  if (!weather?.daily?.length) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `Dự báo thời tiết ${city.name} 7 ngày`,
    url: `${baseUrl}/thoi-tiet/${city.slug}`,
    inLanguage: 'vi-VN',
    spatialCoverage: {
      '@type': 'Place',
      name: city.name,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: city.lat,
        longitude: city.lon,
      },
    },
    variableMeasured: ['Nhiệt độ', 'Khả năng mưa', 'UV', 'Gió'],
    temporalCoverage: `${weather.daily[0]?.date}/${weather.daily[weather.daily.length - 1]?.date}`,
  }
}
