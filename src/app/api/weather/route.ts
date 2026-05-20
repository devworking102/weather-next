import { NextRequest, NextResponse } from 'next/server'
import { getWeatherBundleByCoords } from '@/lib/weather'
import type { ApiResponse, TempUnit, WeatherBundle } from '@/features/weather/types'

export const revalidate = 1800

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = Number(searchParams.get('lat'))
  const lon = Number(searchParams.get('lon'))
  const unit = (searchParams.get('unit') as TempUnit) ?? 'celsius'

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json<ApiResponse<WeatherBundle>>(
      {
        ok: false,
        error: {
          code: 'invalid_coordinates',
          message: 'Chưa xác định được vị trí. Hãy tìm thành phố hoặc bật vị trí hiện tại.',
        },
      },
      { status: 400 },
    )
  }

  try {
    const data = await getWeatherBundleByCoords(lat, lon, unit)
    return NextResponse.json<ApiResponse<WeatherBundle>>({ ok: true, data }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    })
  } catch {
    return NextResponse.json<ApiResponse<WeatherBundle>>(
      {
        ok: false,
        error: {
          code: 'upstream_error',
          message: 'Dữ liệu thời tiết đang gián đoạn. Bạn thử lại sau vài phút nhé.',
        },
      },
      { status: 502 },
    )
  }
}
