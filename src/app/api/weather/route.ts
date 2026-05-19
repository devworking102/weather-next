import { NextRequest, NextResponse } from 'next/server'
import { getWeatherBundleByCoords } from '@/lib/weather'
import type { TempUnit } from '@/features/weather/types'

export const revalidate = 1800

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = Number(searchParams.get('lat'))
  const lon = Number(searchParams.get('lon'))
  const unit = (searchParams.get('unit') as TempUnit) ?? 'celsius'

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: 'invalid_coordinates' }, { status: 400 })
  }

  try {
    const data = await getWeatherBundleByCoords(lat, lon, unit)
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    })
  } catch (e) {
    return NextResponse.json(
      { error: 'upstream_error', message: (e as Error).message },
      { status: 502 },
    )
  }
}
