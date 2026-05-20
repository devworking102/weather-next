import { NextRequest, NextResponse } from 'next/server'
import { getAirQualityByCoords } from '@/lib/weather'
import type { AirQualityBundle, ApiResponse } from '@/features/weather/types'

export const revalidate = 1800

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = Number(searchParams.get('lat'))
  const lon = Number(searchParams.get('lon'))
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json<ApiResponse<AirQualityBundle | null>>(
      {
        ok: false,
        error: {
          code: 'invalid_coordinates',
          message: 'Chưa xác định được vị trí để xem chất lượng không khí.',
        },
      },
      { status: 400 },
    )
  }
  try {
    const data = await getAirQualityByCoords(lat, lon)
    return NextResponse.json<ApiResponse<AirQualityBundle | null>>({ ok: true, data }, {
      headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' },
    })
  } catch {
    return NextResponse.json<ApiResponse<AirQualityBundle | null>>(
      {
        ok: false,
        error: {
          code: 'upstream_error',
          message: 'Chưa tải được AQI lúc này. Dự báo thời tiết vẫn có thể dùng bình thường.',
        },
      },
      { status: 502 },
    )
  }
}
