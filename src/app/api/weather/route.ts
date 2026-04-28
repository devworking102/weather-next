import { NextRequest, NextResponse } from 'next/server'
import { fetchWeather } from '@/features/weather/services/weather'
import type { TempUnit } from '@/features/weather/types'

export const revalidate = 300

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = Number(searchParams.get('lat'))
  const lon = Number(searchParams.get('lon'))
  const unit = (searchParams.get('unit') as TempUnit) ?? 'celsius'

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: 'invalid_coordinates' }, { status: 400 })
  }

  try {
    const data = await fetchWeather(lat, lon, unit)
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (e) {
    return NextResponse.json(
      { error: 'upstream_error', message: (e as Error).message },
      { status: 502 },
    )
  }
}
