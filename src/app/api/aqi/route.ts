import { NextRequest, NextResponse } from 'next/server'
import { getAirQualityByCoords } from '@/lib/weather'

export const revalidate = 1800

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = Number(searchParams.get('lat'))
  const lon = Number(searchParams.get('lon'))
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: 'invalid_coordinates' }, { status: 400 })
  }
  try {
    const data = await getAirQualityByCoords(lat, lon)
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' },
    })
  } catch (e) {
    return NextResponse.json({ error: 'upstream_error', message: (e as Error).message }, { status: 502 })
  }
}
